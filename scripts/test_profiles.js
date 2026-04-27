const API_URL = 'http://localhost:3000';
const OWNER_EMAIL = 'support@agbtechnologies.com';
const PASSWORD = 'password123';

async function test() {
  console.log('Logging in...');
  const loginRes = await fetch(`${API_URL}/auth/v1/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: OWNER_EMAIL, password: PASSWORD })
  });
  const loginData = await loginRes.json();
  const token = loginData.data.session.access_token;
  const headers = { 'Authorization': `Bearer ${token}` };

  console.log('Fetching profiles...');
  const res = await fetch(`${API_URL}/rest/v1/profiles`, { headers });
  const data = await res.json();
  console.log('Profiles found:', data.length);
  console.log(JSON.stringify(data, null, 2));
}

test();
