export {};
const BASE_URL = 'http://localhost:3000/api';

async function runRbacTests() {
  console.log('🚀 Starting RBAC and Publishing Access Control Verification...\n');

  // Helper for requests with cookies
  async function makeRequest(
    endpoint: string, 
    options: { method?: string; body?: any; cookie?: string } = {}
  ) {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json'
    };
    if (options.cookie) {
      headers['Cookie'] = options.cookie;
    }

    const res = await fetch(`${BASE_URL}${endpoint}`, {
      method: options.method || 'GET',
      headers,
      body: options.body ? JSON.stringify(options.body) : undefined
    });

    const setCookie = res.headers.get('set-cookie');
    let data = null;
    try {
      data = await res.json();
    } catch (e) {
      data = null;
    }

    return {
      status: res.status,
      data,
      cookie: setCookie ? setCookie.split(';')[0] : options.cookie
    };
  }

  // 1. Authenticate Admin
  console.log('1️⃣ Authenticating Admin (admin@moderncoe.edu.in)...');
  const adminLoginRes = await makeRequest('/auth/login', {
    method: 'POST',
    body: {
      email: 'admin@moderncoe.edu.in',
      password: 'DemoPass123!'
    }
  });

  if (adminLoginRes.status !== 200) {
    throw new Error(`Admin login failed: ${adminLoginRes.status} ${JSON.stringify(adminLoginRes.data)}`);
  }
  const adminCookie = adminLoginRes.cookie;
  console.log('✅ Admin authenticated successfully (Role: ADMIN)\n');

  // 2. Authenticate Student
  console.log('2️⃣ Authenticating Student (omkar_mankar_mca@moderncoe.edu.in)...');
  const studentLoginRes = await makeRequest('/auth/login', {
    method: 'POST',
    body: {
      email: 'omkar_mankar_mca@moderncoe.edu.in',
      password: 'Pesmodern#123'
    }
  });

  if (studentLoginRes.status !== 200) {
    throw new Error(`Student login failed: ${studentLoginRes.status} ${JSON.stringify(studentLoginRes.data)}`);
  }
  const studentCookie = studentLoginRes.cookie;
  console.log('✅ Student authenticated successfully (Role: STUDENT, Dept: MCA, Year: FY)\n');

  // 3. Test Student REST API Rejection (403 Forbidden) on mutating Notice endpoints
  console.log('3️⃣ Testing REST endpoint protection on /api/notices for Student...');
  
  // POST /api/notices
  const postNoticeRes = await makeRequest('/notices', {
    method: 'POST',
    cookie: studentCookie,
    body: {
      title: 'Hacked Notice',
      content: 'Student trying to post',
      category: 'GENERAL'
    }
  });
  console.log(`- Student POST /api/notices -> Status: ${postNoticeRes.status} (Expected: 403)`);
  if (postNoticeRes.status !== 403) throw new Error(`Expected 403 for student POST /api/notices, got ${postNoticeRes.status}`);

  // PATCH /api/notices/:id
  const patchNoticeRes = await makeRequest('/notices/dummy-id', {
    method: 'PATCH',
    cookie: studentCookie,
    body: { title: 'Hacked Title' }
  });
  console.log(`- Student PATCH /api/notices/:id -> Status: ${patchNoticeRes.status} (Expected: 403)`);
  if (patchNoticeRes.status !== 403) throw new Error(`Expected 403 for student PATCH /api/notices, got ${patchNoticeRes.status}`);

  // DELETE /api/notices/:id
  const deleteNoticeRes = await makeRequest('/notices/dummy-id', {
    method: 'DELETE',
    cookie: studentCookie
  });
  console.log(`- Student DELETE /api/notices/:id -> Status: ${deleteNoticeRes.status} (Expected: 403)`);
  if (deleteNoticeRes.status !== 403) throw new Error(`Expected 403 for student DELETE /api/notices, got ${deleteNoticeRes.status}`);

  console.log('✅ Mutating Notice endpoints strictly reject Students with 403 Forbidden\n');

  // 4. Test Student REST API Rejection (403 Forbidden) on mutating Event endpoints
  console.log('4️⃣ Testing REST endpoint protection on /api/events for Student...');

  // POST /api/events
  const postEventRes = await makeRequest('/events', {
    method: 'POST',
    cookie: studentCookie,
    body: {
      title: 'Unauthorized Event',
      date: new Date(Date.now() + 86400000).toISOString(),
      venue: 'Nowhere'
    }
  });
  console.log(`- Student POST /api/events -> Status: ${postEventRes.status} (Expected: 403)`);
  if (postEventRes.status !== 403) throw new Error(`Expected 403 for student POST /api/events, got ${postEventRes.status}`);

  // PATCH /api/events/:id
  const patchEventRes = await makeRequest('/events/dummy-id', {
    method: 'PATCH',
    cookie: studentCookie,
    body: { title: 'Hacked Event Title' }
  });
  console.log(`- Student PATCH /api/events/:id -> Status: ${patchEventRes.status} (Expected: 403)`);
  if (patchEventRes.status !== 403) throw new Error(`Expected 403 for student PATCH /api/events, got ${patchEventRes.status}`);

  // DELETE /api/events/:id
  const deleteEventRes = await makeRequest('/events/dummy-id', {
    method: 'DELETE',
    cookie: studentCookie
  });
  console.log(`- Student DELETE /api/events/:id -> Status: ${deleteEventRes.status} (Expected: 403)`);
  if (deleteEventRes.status !== 403) throw new Error(`Expected 403 for student DELETE /api/events, got ${deleteEventRes.status}`);

  console.log('✅ Mutating Event endpoints strictly reject Students with 403 Forbidden\n');

  // 5. Test Draft vs Published Notice Lifecycle
  console.log('5️⃣ Testing Notice Draft vs Published Lifecycle...');
  const createDraftNoticeRes = await makeRequest('/notices', {
    method: 'POST',
    cookie: adminCookie,
    body: {
      title: 'RBAC Internal Draft Notice ' + Date.now(),
      content: 'This notice is in draft state and must remain invisible to students.',
      category: 'ACADEMIC',
      priority: 'HIGH',
      status: 'DRAFT',
      audiences: [{ departmentId: 'MCA', year: 'FY', division: null, batch: null }]
    }
  });
  console.log(`- Admin creates DRAFT notice -> Status: ${createDraftNoticeRes.status}`);
  const noticeId = createDraftNoticeRes.data.noticeId || createDraftNoticeRes.data.data?.id;

  // Student attempts to view notices feed
  const studentNoticesFeedRes = await makeRequest('/notices', { cookie: studentCookie });
  const feedNotices = studentNoticesFeedRes.data?.data || [];
  const foundInFeed = feedNotices.some((n: any) => n.id === noticeId);
  console.log(`- Student GET /api/notices -> Is draft in feed? ${foundInFeed} (Expected: false)`);
  if (foundInFeed) throw new Error('Student feed contains unpublished draft notice!');

  // Student attempts direct access to draft notice
  const studentNoticeDetailRes = await makeRequest(`/notices/${noticeId}`, { cookie: studentCookie });
  console.log(`- Student GET /api/notices/:draftId -> Status: ${studentNoticeDetailRes.status} (Expected: 404)`);
  if (studentNoticeDetailRes.status !== 404) throw new Error(`Student was able to fetch draft notice! Status: ${studentNoticeDetailRes.status}`);

  // Admin publishes notice
  const publishNoticeRes = await makeRequest(`/notices/${noticeId}/publish`, {
    method: 'POST',
    cookie: adminCookie
  });
  console.log(`- Admin publishes notice -> Status: ${publishNoticeRes.status}`);

  // Student checks again
  const studentPublishedDetailRes = await makeRequest(`/notices/${noticeId}`, { cookie: studentCookie });
  console.log(`- Student GET /api/notices/:publishedId -> Status: ${studentPublishedDetailRes.status} (Expected: 200)`);
  if (studentPublishedDetailRes.status !== 200) throw new Error(`Student failed to fetch published notice! Status: ${studentPublishedDetailRes.status}`);

  console.log('✅ Draft notices are completely invisible/404 to students, and visible once PUBLISHED\n');

  // 6. Test Targeted Audience Filtering for Student
  console.log('6️⃣ Testing Targeted Audience Filtering for Student...');
  // Notice targeted to CIVIL department (student is in MCA)
  const createCivilNoticeRes = await makeRequest('/notices', {
    method: 'POST',
    cookie: adminCookie,
    body: {
      title: 'Civil Engineering Special Workshop ' + Date.now(),
      content: 'Only for Civil Department students.',
      category: 'ACADEMIC',
      priority: 'NORMAL',
      status: 'PUBLISHED',
      audiences: [{ departmentId: 'CIVIL', year: 'FY', division: null, batch: null }]
    }
  });
  const civilNoticeId = createCivilNoticeRes.data.noticeId || createCivilNoticeRes.data.data?.id;

  const studentFeedAfterCivil = await makeRequest('/notices', { cookie: studentCookie });
  const studentAudienceNotices = studentFeedAfterCivil.data?.data || [];
  const civilInStudentFeed = studentAudienceNotices.some((n: any) => n.id === civilNoticeId);
  console.log(`- Student (MCA) checks feed for CIVIL notice -> Is CIVIL notice visible? ${civilInStudentFeed} (Expected: false)`);
  if (civilInStudentFeed) throw new Error('Audience filtering failed: Student saw notice targeted to another department!');

  console.log('✅ Audience filtering strictly isolates notices based on Student profile\n');

  // 7. Test Draft vs Published Event Lifecycle
  console.log('7️⃣ Testing Event Draft vs Published Lifecycle...');
  const futureDate = new Date(Date.now() + 7 * 86400000).toISOString();
  const createDraftEventRes = await makeRequest('/events', {
    method: 'POST',
    cookie: adminCookie,
    body: {
      title: 'Secret Draft Hackathon ' + Date.now(),
      description: 'Internal planning only.',
      date: futureDate,
      venue: 'Lab 5',
      capacity: 50,
      status: 'DRAFT'
    }
  });
  console.log(`- Admin creates DRAFT event -> Status: ${createDraftEventRes.status}`);
  const eventId = createDraftEventRes.data?.data?.id || createDraftEventRes.data?.id;

  // Student checks events feed
  const studentEventsFeedRes = await makeRequest('/events', { cookie: studentCookie });
  const studentEvents = studentEventsFeedRes.data?.data || [];
  const eventInFeed = studentEvents.some((e: any) => e.id === eventId);
  console.log(`- Student GET /api/events -> Is draft event in feed? ${eventInFeed} (Expected: false)`);
  if (eventInFeed) throw new Error('Student feed contains unpublished draft event!');

  // Student attempts direct access
  const studentEventDetailRes = await makeRequest(`/events/${eventId}`, { cookie: studentCookie });
  console.log(`- Student GET /api/events/:draftEventId -> Status: ${studentEventDetailRes.status} (Expected: 404)`);
  if (studentEventDetailRes.status !== 404) throw new Error(`Student was able to fetch draft event! Status: ${studentEventDetailRes.status}`);

  // Student attempts to register for draft event
  const studentRegisterDraftRes = await makeRequest(`/events/${eventId}/register`, {
    method: 'POST',
    cookie: studentCookie
  });
  console.log(`- Student POST /api/events/:draftEventId/register -> Status: ${studentRegisterDraftRes.status} (Expected: 400 or 404)`);
  if (studentRegisterDraftRes.status !== 400 && studentRegisterDraftRes.status !== 404) {
    throw new Error(`Student was able to register for draft event! Status: ${studentRegisterDraftRes.status}`);
  }

  // Admin publishes event
  const publishEventRes = await makeRequest(`/events/${eventId}/publish`, {
    method: 'POST',
    cookie: adminCookie
  });
  console.log(`- Admin publishes event -> Status: ${publishEventRes.status}`);

  // Student views published event
  const studentPublishedEventRes = await makeRequest(`/events/${eventId}`, { cookie: studentCookie });
  console.log(`- Student GET /api/events/:publishedEventId -> Status: ${studentPublishedEventRes.status} (Expected: 200)`);
  if (studentPublishedEventRes.status !== 200) throw new Error(`Student failed to fetch published event! Status: ${studentPublishedEventRes.status}`);

  // Student registers for published event
  const studentRegisterPublishedRes = await makeRequest(`/events/${eventId}/register`, {
    method: 'POST',
    cookie: studentCookie
  });
  console.log(`- Student registers for published event -> Status: ${studentRegisterPublishedRes.status} (Expected: 200)`);
  if (studentRegisterPublishedRes.status !== 200) throw new Error(`Registration failed for published event: ${studentRegisterPublishedRes.status}`);

  // Clean up created event & notices
  await makeRequest(`/events/${eventId}`, { method: 'DELETE', cookie: adminCookie });
  await makeRequest(`/notices/${noticeId}`, { method: 'DELETE', cookie: adminCookie });
  await makeRequest(`/notices/${civilNoticeId}`, { method: 'DELETE', cookie: adminCookie });
  console.log('✅ Cleaned up temporary test artifacts\n');

  console.log('🎉 ALL RBAC AND PUBLISHING WORKFLOW VERIFICATIONS PASSED SUCCESSFULLY!');
}

runRbacTests().catch((err) => {
  console.error('❌ RBAC Verification Failed:', err.message);
  process.exit(1);
});
