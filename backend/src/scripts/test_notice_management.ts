export {};
const BASE_URL = 'http://localhost:3000/api';

async function testNoticeManagement() {
  console.log('🧪 Starting Notice Management Verification...\n');

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

  // 1. Authenticate Admin
  const adminLogin = await req('/auth/login', {
    method: 'POST',
    body: { email: 'admin@moderncoe.edu.in', password: 'DemoPass123!' }
  });
  if (adminLogin.status !== 200) throw new Error('Admin login failed');
  const cookie = adminLogin.cookie;
  console.log('✅ 1. Admin authenticated');

  // 2. Test GET /admin/notices/:id on user active notice
  const targetNoticeId = '5b0cd8af-a242-45be-ad45-4c82f4afb981';
  const getRes = await req(`/admin/notices/${targetNoticeId}`, { cookie });
  console.log(`- GET /admin/notices/${targetNoticeId} -> Status: ${getRes.status}`);
  if (getRes.status !== 200) throw new Error(`Failed to get notice: ${getRes.status}`);
  const noticeData = getRes.data?.data || getRes.data;
  console.log(`  Title: "${noticeData.title}", Status: ${noticeData.status}, Audiences count: ${noticeData.audiences?.length || 0}`);
  if (!noticeData.audiences || noticeData.audiences.length === 0) {
    console.warn('⚠️ Notice has no audience returned');
  }

  // 3. Test Save Draft / Update on this notice
  console.log('\n2. Testing PUT /admin/notices/:id...');
  const updateRes = await req(`/admin/notices/${targetNoticeId}`, {
    method: 'PUT',
    cookie,
    body: {
      title: 'WhatsApp Image 2026-09-28 at 8.03.08 PM - Verified',
      content: noticeData.content,
      category: noticeData.category || 'EVENT',
      priority: 'HIGH',
      summary: {
        whatChanged: noticeData.summary?.whatChanged || 'NextGen Builders IoT Workshop',
        whoAffected: 'MCA Students',
        requiredAction: 'Register in Lab 4 before Saturday',
        deadline: '2026-10-15'
      },
      audience: {
        departmentId: 'MCA',
        year: 'FY',
        division: '',
        batch: ''
      }
    }
  });
  console.log(`- PUT /admin/notices/${targetNoticeId} -> Status: ${updateRes.status}`);
  if (updateRes.status !== 200) throw new Error(`PUT /admin/notices/${targetNoticeId} failed: ${updateRes.status} ${JSON.stringify(updateRes.data)}`);
  console.log('✅ Update notice succeeded');

  // 4. Test Save & Republish (POST /admin/notices/:id/publish)
  console.log('\n3. Testing POST /admin/notices/:id/publish (Re-publish with audience)...');
  const publishRes = await req(`/admin/notices/${targetNoticeId}/publish`, {
    method: 'POST',
    cookie,
    body: {
      departmentId: 'MCA',
      year: 'FY',
      division: '',
      batch: ''
    }
  });
  console.log(`- POST /admin/notices/${targetNoticeId}/publish -> Status: ${publishRes.status}`);
  if (publishRes.status !== 200) throw new Error(`POST /admin/notices/:id/publish failed: ${publishRes.status} ${JSON.stringify(publishRes.data)}`);
  console.log('✅ Publish notice succeeded without constraint or 400 error');

  // 5. Test Full Draft -> Review -> Publish Lifecycle for fresh notice
  console.log('\n4. Testing Full Lifecycle on fresh Notice...');
  const createDraft = await req('/notices', {
    method: 'POST',
    cookie,
    body: {
      title: 'Lifecycle Verification Notice ' + Date.now(),
      content: 'Important circular regarding syllabus revisions.',
      category: 'ACADEMIC',
      priority: 'NORMAL',
      status: 'DRAFT',
      summary: {
        whatChanged: 'Revised syllabus released',
        whoAffected: 'All Students',
        requiredAction: 'Review course outlines',
        deadline: '2026-10-30'
      },
      audiences: [{ departmentId: 'MCA', year: 'FY', division: null, batch: null }]
    }
  });
  const newId = createDraft.data.noticeId || createDraft.data.data?.id;
  console.log(`- Created Draft Notice ID: ${newId} (Status: ${createDraft.status})`);

  // Admin updates draft
  const draftUpdate = await req(`/admin/notices/${newId}`, {
    method: 'PUT',
    cookie,
    body: {
      title: 'Lifecycle Verification Notice (Edited)',
      content: 'Updated content.',
      category: 'ACADEMIC',
      priority: 'HIGH',
      summary: {
        whatChanged: 'Revised syllabus details updated',
        whoAffected: 'MCA FY Students',
        requiredAction: 'Download PDF',
        deadline: '2026-10-30'
      },
      audience: { departmentId: 'MCA', year: 'FY', division: 'A', batch: '' }
    }
  });
  console.log(`- Draft update -> Status: ${draftUpdate.status}`);
  if (draftUpdate.status !== 200) throw new Error(`Draft update failed: ${draftUpdate.status}`);

  // Admin publishes draft
  const draftPublish = await req(`/admin/notices/${newId}/publish`, {
    method: 'POST',
    cookie,
    body: { departmentId: 'MCA', year: 'FY', division: 'A', batch: '' }
  });
  console.log(`- Draft publish -> Status: ${draftPublish.status}`);
  if (draftPublish.status !== 200) throw new Error(`Draft publish failed: ${draftPublish.status}`);

  // Clean up
  const deleteRes = await req(`/notices/${newId}`, { method: 'DELETE', cookie });
  console.log(`- Notice cleanup -> Status: ${deleteRes.status}`);

  console.log('\n🎉 ALL NOTICE MANAGEMENT TESTS PASSED!');
}

testNoticeManagement().catch(err => {
  console.error('❌ Test Failed:', err);
  process.exit(1);
});
