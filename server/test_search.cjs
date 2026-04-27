const http = require('http');

async function httpRequest(options, body = null) {
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

async function run() {
  const loginRes = await httpRequest({
    hostname: '127.0.0.1',
    port: 3000,
    path: '/auth/v1/login',
    method: 'POST',
    headers: { 'Content-Type': 'application/json' }
  }, JSON.stringify({ email: 'support@agbtechnologies.com', password: 'password123' }));
  
  const token = JSON.parse(loginRes.body).data.session.access_token;
  
  const email = 'agbtech.maheshlakhe@gmail.com';
  const encodedEmail = encodeURIComponent(`eq.${email}`);
  const path = `/rest/v1/profiles?select=*&email=${encodedEmail}`;
  
  const res = await httpRequest({
    hostname: '127.0.0.1',
    port: 3000,
    path: path,
    method: 'GET',
    headers: { 'Authorization': `Bearer ${token}` }
  });

  console.log('Status:', res.status);
  console.log('Response:', res.body);
}

run();
