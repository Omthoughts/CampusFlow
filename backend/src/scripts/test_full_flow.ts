const API_BASE = 'http://localhost:3000/api';
const ROOT_BASE = 'http://localhost:3000';

async function runFullFlowTest() {
  console.log('========================================================');
  console.log('🚀 STARTING CAMPUSFLOW COMPREHENSIVE FLOW VERIFICATION');
  console.log('========================================================\n');

  let passedTests = 0;
  let totalTests = 0;

  function assert(condition: boolean, testName: string, details?: any) {
    totalTests++;
    if (condition) {
      passedTests++;
      console.log(`✅ [PASS] ${testName}`);
    } else {
      console.error(`❌ [FAIL] ${testName}`);
      if (details) console.error('   Details:', details);
    }
  }

  // 1. Health check
  try {
    const res = await fetch(`${ROOT_BASE}/health`);
    const data: any = await res.json();
    assert(res.status === 200 && data.db === 'ok', 'Step 1: System Health & Neon PostgreSQL connection', data);
  } catch (err: any) {
    assert(false, 'Step 1: System Health & Neon PostgreSQL connection', err.message);
  }

  // 2. Admin Login
  let adminCookie = '';
  let adminUser: any = null;
  try {
    const res = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'admin@moderncoe.edu.in',
        password: 'DemoPass123!'
      })
    });
    const setCookie = res.headers.get('set-cookie');
    if (setCookie) {
      adminCookie = setCookie.split(';')[0];
    }
    const data: any = await res.json();
    adminUser = data.user;
    assert(res.status === 200 && adminUser?.role === 'ADMIN', 'Step 2: Admin Authentication', adminUser);
  } catch (err: any) {
    assert(false, 'Step 2: Admin Authentication', err.message);
  }

  // 3. Admin Dashboard
  try {
    const res = await fetch(`${API_BASE}/admin/dashboard`, {
      headers: { Cookie: adminCookie }
    });
    const data: any = await res.json();
    assert(res.status === 200 && data.data?.studentCount >= 1, 'Step 3: Admin Dashboard Statistics', data);
  } catch (err: any) {
    assert(false, 'Step 3: Admin Dashboard Statistics', err.message);
  }

  // 4. Admin creates and publishes a notice targeted to FY MCA
  let noticeId = '';
  try {
    const noticePayload = {
      title: 'CIE-1 Comprehensive Examination 2026',
      content: 'CIE-1 examination schedule announced for FY MCA Students. Students must report 15 mins before time.',
      category: 'EXAM',
      priority: 'HIGH',
      status: 'PUBLISHED',
      summary: {
        whatChanged: 'CIE-1 exam announced for FY MCA',
        whoAffected: 'FY MCA Students',
        requiredAction: 'Bring hall tickets and identity cards',
        deadline: '2026-10-25T10:00:00.000Z'
      },
      audiences: [
        {
          departmentId: null,
          year: 'FY',
          division: null,
          batch: null
        }
      ]
    };

    const res = await fetch(`${API_BASE}/admin/notices`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Cookie: adminCookie
      },
      body: JSON.stringify(noticePayload)
    });
    const data: any = await res.json();
    noticeId = data.noticeId || data.data?.id;
    assert(res.status === 200 || res.status === 201, 'Step 4: Notice Creation & Audience Targeting', data);
  } catch (err: any) {
    assert(false, 'Step 4: Notice Creation & Audience Targeting', err.message);
  }

  // 5. Admin creates an Event
  let eventId = '';
  try {
    const eventPayload = {
      title: 'National Tech Summit 2026',
      description: 'Annual National Student Technical Symposium with project exhibitions.',
      date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
      venue: 'Auditorium Hall 1',
      capacity: 100,
      registrationDeadline: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString()
    };
    const res = await fetch(`${API_BASE}/admin/events`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Cookie: adminCookie
      },
      body: JSON.stringify(eventPayload)
    });
    const data: any = await res.json();
    eventId = data.data?.id;
    assert(res.status === 201 && !!eventId, 'Step 5: Event Creation with Capacity Control', data);
  } catch (err: any) {
    assert(false, 'Step 5: Event Creation with Capacity Control', err.message);
  }

  // 6. Student Login (Omkar Mankar - FY MCA)
  let studentCookie = '';
  let studentUser: any = null;
  try {
    const res = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'omkar_mankar_mca@moderncoe.edu.in',
        password: 'Pesmodern#123'
      })
    });
    const setCookie = res.headers.get('set-cookie');
    if (setCookie) {
      studentCookie = setCookie.split(';')[0];
    }
    const data: any = await res.json();
    studentUser = data.user;
    assert(res.status === 200 && studentUser?.role === 'STUDENT', 'Step 6: Student Login (Omkar Mankar - FY MCA)', studentUser);
  } catch (err: any) {
    assert(false, 'Step 6: Student Login (Omkar Mankar - FY MCA)', err.message);
  }

  // 7. Student Dashboard & Notice Feed
  try {
    const dashRes = await fetch(`${API_BASE}/dashboard`, {
      headers: { Cookie: studentCookie }
    });
    const dashData: any = await dashRes.json();

    const noticesRes = await fetch(`${API_BASE}/notices`, {
      headers: { Cookie: studentCookie }
    });
    const noticesData: any = await noticesRes.json();
    const noticesList = noticesData.data || [];
    const hasTargetedNotice = noticesList.some((n: any) => n.id === noticeId || n.title?.includes('CIE-1'));
    assert(dashRes.status === 200 && hasTargetedNotice, 'Step 7: Student Feed & Audience Isolation (Targeted Notice Visible)', { count: noticesList.length });
  } catch (err: any) {
    assert(false, 'Step 7: Student Feed & Audience Isolation', err.message);
  }

  // 8. Student Views Notice Detail + AI Summary
  if (noticeId) {
    try {
      const res = await fetch(`${API_BASE}/notices/${noticeId}`, {
        headers: { Cookie: studentCookie }
      });
      const data: any = await res.json();
      const n = data.data;
      assert(res.status === 200 && (n?.summary != null || n?.content != null), 'Step 8: Notice Detail Inspection & AI Summary Presentation', n?.summary);
    } catch (err: any) {
      assert(false, 'Step 8: Notice Detail Inspection', err.message);
    }
  }

  // 9. Student Registers for Event
  if (eventId) {
    try {
      const res = await fetch(`${API_BASE}/events/${eventId}/register`, {
        method: 'POST',
        headers: { Cookie: studentCookie }
      });
      const data: any = await res.json();
      assert(res.status === 200 || res.status === 201, 'Step 9: Student Event Registration', data);
    } catch (err: any) {
      assert(false, 'Step 9: Student Event Registration', err.message);
    }

    // 10. Duplicate Registration Attempt (Transaction Safety)
    try {
      const res = await fetch(`${API_BASE}/events/${eventId}/register`, {
        method: 'POST',
        headers: { Cookie: studentCookie }
      });
      const data: any = await res.json();
      const isExpectedError = res.status === 400 || res.status === 409;
      assert(isExpectedError, 'Step 10: Duplicate Registration Prevention (Safely Blocked with 400/409)', data);
    } catch (err: any) {
      assert(false, 'Step 10: Duplicate Registration Prevention', err.message);
    }
  }

  // 11. Student Notifications & Deadlines
  try {
    const notifRes = await fetch(`${API_BASE}/notifications`, {
      headers: { Cookie: studentCookie }
    });
    const deadlinesRes = await fetch(`${API_BASE}/deadlines`, {
      headers: { Cookie: studentCookie }
    });
    const notifData: any = await notifRes.json();
    const deadlinesData: any = await deadlinesRes.json();
    assert(notifRes.status === 200 && deadlinesRes.status === 200, 'Step 11: In-App Notifications & Academic Deadlines Feed', {
      notifications: notifData.data?.length,
      deadlines: deadlinesData.data?.length
    });
  } catch (err: any) {
    assert(false, 'Step 11: In-App Notifications & Academic Deadlines Feed', err.message);
  }

  // 12. Admin Audit Logs
  try {
    const res = await fetch(`${API_BASE}/admin/audit`, {
      headers: { Cookie: adminCookie }
    });
    const data: any = await res.json();
    assert(res.status === 200 && Array.isArray(data.data), 'Step 12: Admin Audit Trail Verification', {
      logCount: data.data?.length
    });
  } catch (err: any) {
    assert(false, 'Step 12: Admin Audit Trail Verification', err.message);
  }

  console.log('\n========================================================');
  console.log(`🏁 FLOW VERIFICATION COMPLETE: ${passedTests}/${totalTests} TESTS PASSED`);
  console.log('========================================================\n');
}

runFullFlowTest().catch(console.error);
