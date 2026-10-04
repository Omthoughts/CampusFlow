
const BASE_URL = 'http://localhost:3000';

async function loginUser(email: string, pass: string) {
  const res = await fetch(`${BASE_URL}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password: pass })
  });
  const data: any = await res.json();
  const rawCookie = res.headers.get('set-cookie');
  let tokenCookie = '';
  if (rawCookie) {
    const match = rawCookie.match(/token=([^;]+)/);
    if (match) tokenCookie = `token=${match[1]}`;
  }
  return { status: res.status, data, cookie: tokenCookie };
}

async function runTests() {
  console.log('=== Running Student Role Restriction Tests ===\n');

  // 1. Authenticate users
  const adminAuth = await loginUser('admin@moderncoe.edu.in', 'DemoPass123!');
  console.log(`[1] Admin Login: status=${adminAuth.status}, role=${adminAuth.data?.user?.role}`);

  const facultyAuth = await loginUser('faculty_mca@moderncoe.edu.in', 'DemoPass123!');
  console.log(`[2] Faculty Login: status=${facultyAuth.status}, role=${facultyAuth.data?.user?.role}`);

  const studentAuth = await loginUser('omkar_mankar_mca@moderncoe.edu.in', 'Pesmodern#123');
  console.log(`[3] Student Login: status=${studentAuth.status}, role=${studentAuth.data?.user?.role}`);

  if (!adminAuth.cookie || !facultyAuth.cookie || !studentAuth.cookie) {
    console.error('Failed to obtain cookies for all test users.');
    process.exit(1);
  }

  // Create a dedicated test event with future date & deadline to test student registration
  const createEvRes = await fetch(`${BASE_URL}/api/admin/events`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Cookie': adminAuth.cookie },
    body: JSON.stringify({
      title: 'Student Role Verification Event ' + Date.now(),
      description: 'Verifying student-only RSVP access control',
      date: new Date(Date.now() + 86400000 * 5).toISOString(),
      registrationDeadline: new Date(Date.now() + 86400000 * 3).toISOString(),
      venue: 'Main Auditorium Hall B',
      capacity: 50,
      status: 'PUBLISHED'
    })
  });
  const createdEvData: any = await createEvRes.json();
  const testEventId = createdEvData?.data?.id || createdEvData?.id;
  console.log(`[Event Setup] Created testEventId=${testEventId}`);

  // 2. Test Admin attempting to register for an event (MUST BE 403)
  const adminRegisterRes = await fetch(`${BASE_URL}/api/events/${testEventId}/register`, {
    method: 'POST',
    headers: { 'Cookie': adminAuth.cookie }
  });
  const adminRegisterData: any = await adminRegisterRes.json();
  console.log(`[4] Admin POST /events/${testEventId}/register: status=${adminRegisterRes.status}`, adminRegisterData);
  if (adminRegisterRes.status !== 403) {
    console.error(`FAILED: Expected 403 Forbidden for Admin registering, got ${adminRegisterRes.status}`);
    process.exit(1);
  }

  // 3. Test Admin attempting to cancel registration (MUST BE 403)
  const adminCancelRes = await fetch(`${BASE_URL}/api/events/${testEventId}/register`, {
    method: 'DELETE',
    headers: { 'Cookie': adminAuth.cookie }
  });
  const adminCancelData: any = await adminCancelRes.json();
  console.log(`[5] Admin DELETE /events/${testEventId}/register: status=${adminCancelRes.status}`, adminCancelData);
  if (adminCancelRes.status !== 403) {
    console.error(`FAILED: Expected 403 Forbidden for Admin cancelling, got ${adminCancelRes.status}`);
    process.exit(1);
  }

  // 4. Test Faculty attempting to register for an event (MUST BE 403)
  const facultyRegisterRes = await fetch(`${BASE_URL}/api/events/${testEventId}/register`, {
    method: 'POST',
    headers: { 'Cookie': facultyAuth.cookie }
  });
  const facultyRegisterData: any = await facultyRegisterRes.json();
  console.log(`[6] Faculty POST /events/${testEventId}/register: status=${facultyRegisterRes.status}`, facultyRegisterData);
  if (facultyRegisterRes.status !== 403) {
    console.error(`FAILED: Expected 403 Forbidden for Faculty registering, got ${facultyRegisterRes.status}`);
    process.exit(1);
  }

  // 5. Test Faculty attempting to cancel registration (MUST BE 403)
  const facultyCancelRes = await fetch(`${BASE_URL}/api/events/${testEventId}/register`, {
    method: 'DELETE',
    headers: { 'Cookie': facultyAuth.cookie }
  });
  const facultyCancelData: any = await facultyCancelRes.json();
  console.log(`[7] Faculty DELETE /events/${testEventId}/register: status=${facultyCancelRes.status}`, facultyCancelData);
  if (facultyCancelRes.status !== 403) {
    console.error(`FAILED: Expected 403 Forbidden for Faculty cancelling, got ${facultyCancelRes.status}`);
    process.exit(1);
  }

  // 6. Test Student registering for an event (MUST SUCCEED 200 or 409 already registered)
  const studentRegisterRes = await fetch(`${BASE_URL}/api/events/${testEventId}/register`, {
    method: 'POST',
    headers: { 'Cookie': studentAuth.cookie }
  });
  const studentRegisterData: any = await studentRegisterRes.json();
  console.log(`[8] Student POST /events/${testEventId}/register: status=${studentRegisterRes.status}`, studentRegisterData);
  if (studentRegisterRes.status !== 200 && studentRegisterRes.status !== 409) {
    console.error(`FAILED: Expected 200/409 for Student registering, got ${studentRegisterRes.status}`);
    process.exit(1);
  }

  // 7. Test Student cancelling registration (MUST SUCCEED 200)
  const studentCancelRes = await fetch(`${BASE_URL}/api/events/${testEventId}/register`, {
    method: 'DELETE',
    headers: { 'Cookie': studentAuth.cookie }
  });
  const studentCancelData: any = await studentCancelRes.json();
  console.log(`[9] Student DELETE /events/${testEventId}/register: status=${studentCancelRes.status}`, studentCancelData);
  if (studentCancelRes.status !== 200) {
    console.error(`FAILED: Expected 200 for Student cancelling, got ${studentCancelRes.status}`);
    process.exit(1);
  }

  console.log('\n ALL STUDENT ROLE RESTRICTION TESTS PASSED SUCCESSFULLY! ');
}

runTests().catch(err => {
  console.error('Unhandled error in test runner:', err);
  process.exit(1);
});
