const API_URL = 'http://localhost:3000';
const OWNER_EMAIL = 'support@agbtechnologies.com';
const PASSWORD = 'password123';

async function seed() {
  console.log('Logging in...');
  const loginRes = await fetch(`${API_URL}/auth/v1/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: OWNER_EMAIL, password: PASSWORD })
  });
  const loginData = await loginRes.json();
  const token = loginData.data.session.access_token;
  const headers = { 
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}` 
  };

  console.log('Fetching plans...');
  const plansRes = await fetch(`${API_URL}/rest/v1/plans`, { headers });
  const plans = await plansRes.json();

  console.log('Fetching profiles...');
  const profilesRes = await fetch(`${API_URL}/rest/v1/profiles`, { headers });
  const profiles = await profilesRes.json();

  for (const plan of plans) {
    console.log(`Adding members to plan: ${plan.title}`);
    for (const profile of profiles) {
      await fetch(`${API_URL}/rest/v1/plan_members`, {
        method: 'POST',
        headers,
        body: JSON.stringify({
          plan_id: plan.id,
          user_id: profile.id,
          role: 'editor'
        })
      });
    }
  }
  console.log('Member seeding completed!');
}

seed();
