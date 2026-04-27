const http = require('http');

const LOGIN_EMAIL = 'support@agbtechnologies.com';
const LOGIN_PASSWORD = 'password123';

function httpRequest(options, body = null) {
  return new Promise((resolve, reject) => {
    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => resolve({ status: res.statusCode, body: data }));
    });
    req.on('error', reject);
    if (body) req.write(body);
    req.end();
  });
}

async function runTest() {
  console.log('🔑 Logging in...');
  const loginRes = await httpRequest({
    hostname: '127.0.0.1',
    port: 3000,
    path: '/auth/v1/login',
    method: 'POST',
    headers: { 'Content-Type': 'application/json' }
  }, JSON.stringify({ email: LOGIN_EMAIL, password: LOGIN_PASSWORD }));
  
  const token = JSON.parse(loginRes.body).data.session.access_token;
  console.log('✅ Token obtained');

  const complexPath = '/rest/v1/tasks?select=*,assignee:assigned_to(id,full_name,avatar_url),labels:task_label_assignments(label:task_labels(*)),checklists:task_checklists(*),comments:task_comments(*,user:profiles(*))';
  
  console.log('Testing Complex GET /tasks...');
  const res = await httpRequest({
    hostname: '127.0.0.1',
    port: 3000,
    path: complexPath,
    method: 'GET',
    headers: { 'Authorization': `Bearer ${token}` }
  });

  console.log('Status:', res.status);
  if (res.status === 200) {
    console.log('✅ Success! Data length:', JSON.parse(res.body).length);
  } else {
    console.error('❌ FAILED with', res.status);
    console.error('Error body:', res.body);
  }
}

runTest();
