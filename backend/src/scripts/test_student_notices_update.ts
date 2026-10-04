export {};
const BASE_URL = 'http://localhost:3000/api';

async function verifyStudentNoticesUpdate() {
  console.log('🔍 Testing Student Side Notice Updates & Real-time Matching...\n');

  async function req(endpoint: string, options: { method?: string; body?: any; cookie?: string } = {}) {
    const headers: Record<string, string> = { 'Content-Type': 'application/json' };
    if (options.cookie) headers['Cookie'] = options.cookie;
    const res = await fetch(`${BASE_URL}${endpoint}`, {
      method: options.method || 'GET',
      headers,
      body: options.body ? JSON.stringify(options.body) : undefined
    });
    const setCookie = res.headers.get('set-cookie');
    let data = null;
    try { data = await res.json(); } catch (e) {}
    return { status: res.status, data, cookie: setCookie ? setCookie.split(';')[0] : options.cookie };
  }

  // 1. Authenticate Student
  console.log('1️⃣ Authenticating Student (omkar_mankar_mca@moderncoe.edu.in)...');
  const studentLogin = await req('/auth/login', {
    method: 'POST',
    body: { email: 'omkar_mankar_mca@moderncoe.edu.in', password: 'Pesmodern#123' }
  });
  if (studentLogin.status !== 200) throw new Error('Student login failed');
  const studentCookie = studentLogin.cookie;
  console.log('✅ Student authenticated successfully\n');

  // 2. Authenticate Admin
  console.log('2️⃣ Authenticating Admin (admin@moderncoe.edu.in)...');
  const adminLogin = await req('/auth/login', {
    method: 'POST',
    body: { email: 'admin@moderncoe.edu.in', password: 'DemoPass123!' }
  });
  if (adminLogin.status !== 200) throw new Error('Admin login failed');
  const adminCookie = adminLogin.cookie;
  console.log('✅ Admin authenticated successfully\n');

  // 3. Verify Student Dashboard contains notices
  console.log('3️⃣ Checking Student Dashboard (/api/dashboard)...');
  const dashboardRes = await req('/dashboard', { cookie: studentCookie });
  console.log(`- GET /api/dashboard -> Status: ${dashboardRes.status}`);
  if (dashboardRes.status !== 200) throw new Error('Failed to get student dashboard');
  const dashboardNotices = dashboardRes.data?.prioritySummary || dashboardRes.data?.notices || [];
  console.log(`  Notices on student dashboard: ${dashboardNotices.length}`);
  if (dashboardNotices.length === 0) throw new Error('Student dashboard returned 0 notices!');

  // 4. Verify Student Notices Feed (/api/notices)
  console.log('\n4️⃣ Checking Student Notices Feed (/api/notices)...');
  const noticesRes = await req('/notices', { cookie: studentCookie });
  console.log(`- GET /api/notices -> Status: ${noticesRes.status}`);
  if (noticesRes.status !== 200) throw new Error('Failed to get student notices feed');
  const studentFeed = noticesRes.data?.data || [];
  console.log(`  Total notices visible to Student: ${studentFeed.length}`);
  
  // Specifically check for NextGen Builders notice
  const targetNoticeId = '5b0cd8af-a242-45be-ad45-4c82f4afb981';
  const hasNextGen = studentFeed.some((n: any) => n.id === targetNoticeId);
  console.log(`  Is "NextGen Builders" (${targetNoticeId}) visible in student feed? ${hasNextGen}`);
  if (!hasNextGen) throw new Error(`Notice ${targetNoticeId} is missing from student feed!`);
  console.log('✅ Previously missing MCA notice is now actively visible to the student!\n');

  // 5. Test Live Publishing -> Student Feed Update
  console.log('5️⃣ Testing Admin Publishing a new Notice and verifying Student updates...');
  const newNoticeTitle = 'Live Academic Circular ' + Date.now();
  const createNoticeRes = await req('/notices', {
    method: 'POST',
    cookie: adminCookie,
    body: {
      title: newNoticeTitle,
      content: 'Important circular regarding project reviews.',
      category: 'ACADEMIC',
      priority: 'URGENT',
      status: 'PUBLISHED',
      summary: {
        whatChanged: newNoticeTitle,
        whoAffected: 'MCA FY Students',
        requiredAction: 'Submit report to coordinator',
        deadline: '2026-10-25'
      },
      audiences: [{ departmentId: 'MCA', year: 'FY', division: null, batch: null }]
    }
  });
  const createdNoticeId = createNoticeRes.data.noticeId || createNoticeRes.data.data?.id;
  console.log(`- Admin published notice ID: ${createdNoticeId}`);

  // Student checks feed again
  const feedAfterPublish = await req('/notices', { cookie: studentCookie });
  const isPresentInFeed = (feedAfterPublish.data?.data || []).some((n: any) => n.id === createdNoticeId);
  console.log(`- Student checks /api/notices: Is newly published notice present? ${isPresentInFeed}`);
  if (!isPresentInFeed) throw new Error('Student feed did not update with new notice!');

  // Student checks dashboard again
  const dashAfterPublish = await req('/dashboard', { cookie: studentCookie });
  const isPresentInDash = (dashAfterPublish.data?.prioritySummary || []).some((n: any) => n.id === createdNoticeId);
  console.log(`- Student checks /api/dashboard: Is notice present in dashboard? ${isPresentInDash}`);
  if (!isPresentInDash) throw new Error('Student dashboard did not update with new notice!');

  // 6. Test Admin Updating Notice -> Student sees update
  console.log('\n6️⃣ Testing Admin Updating Notice Content and verifying Student update...');
  const updatedTitle = 'UPDATED: ' + newNoticeTitle;
  await req(`/admin/notices/${createdNoticeId}`, {
    method: 'PUT',
    cookie: adminCookie,
    body: {
      title: updatedTitle,
      summary: {
        whatChanged: updatedTitle,
        whoAffected: 'MCA FY Students',
        requiredAction: 'New requirement: Submit before 5PM'
      }
    }
  });

  const studentNoticeDetail = await req(`/notices/${createdNoticeId}`, { cookie: studentCookie });
  console.log(`- Student GET /api/notices/:id title: "${studentNoticeDetail.data?.title || studentNoticeDetail.data?.data?.title}"`);
  const actualTitle = studentNoticeDetail.data?.title || studentNoticeDetail.data?.data?.title;
  if (!actualTitle.includes('UPDATED:')) throw new Error('Notice updates did not reflect on student side!');
  console.log('✅ Notice updates instantly reflected on the student side!\n');

  // 7. Cleanup
  await req(`/notices/${createdNoticeId}`, { method: 'DELETE', cookie: adminCookie });
  console.log('✅ Temporary test notice cleaned up.\n');

  console.log('🎉 ALL STUDENT NOTICE UPDATE TESTS PASSED SUCCESSFULLY!');
}

verifyStudentNoticesUpdate().catch(err => {
  console.error('❌ Verification failed:', err);
  process.exit(1);
});
