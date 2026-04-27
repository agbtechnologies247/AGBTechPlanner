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

  console.log('Fetching plans...');
  const plansRes = await fetch(`${API_URL}/rest/v1/plans`, { headers });
  const plans = await plansRes.json();
  console.log('Plans found:', plans.length);

  if (plans.length > 0) {
    const planId = plans[0].id;
    console.log(`Fetching members for plan ${planId}...`);
    const membersRes = await fetch(`${API_URL}/rest/v1/plan_members?plan_id=eq.${planId}&select=profile`, { headers });
    const members = await membersRes.json();
    console.log('Members found:', JSON.stringify(members, null, 2));
  }
}

test();
