const API_URL = 'http://localhost:3000';
const OWNER_EMAIL = 'support@agbtechnologies.com';
const PASSWORD = 'password123';

const OTHER_USERS = [
  'agbtech.maheshlakhe@gmail.com',
  'agbtech.rushabhkorde@gmail.com',
  'agbtech.omkarvani@gmail.com',
  'agbtech.mehulhotkar@gmail.com'
];

async function seed() {
  console.log('Logging in...');
  const loginRes = await fetch(`${API_URL}/auth/v1/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: OWNER_EMAIL, password: PASSWORD })
  });
  const loginData = await loginRes.json();
  const token = loginData.data.session.access_token;
  const ownerId = loginData.data.user.id;
  const headers = { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` };

  console.log('Fetching profile IDs...');
  const profilesRes = await fetch(`${API_URL}/rest/v1/profiles`, { headers });
  const profiles = await profilesRes.json();
  const profileMap = Object.fromEntries(profiles.map(p => [p.email.toLowerCase(), p.id]));
  const otherUserIds = OTHER_USERS.map(email => profileMap[email]).filter(Boolean);

  for (let p = 1; p <= 2; p++) {
    console.log(`Creating Plan ${p}...`);
    const planRes = await fetch(`${API_URL}/rest/v1/plans`, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        title: `Test Plan ${p}`,
        description: `Full test suite for plan ${p}`,
        owner_id: ownerId,
        color: p === 1 ? '#3b82f6' : '#10b981'
      })
    });
    const plan = await planRes.json();
    const planId = plan.id;

    console.log(`Adding members to Plan ${p}...`);
    for (const profile of profiles) {
      await fetch(`${API_URL}/rest/v1/plan_members`, {
        method: 'POST',
        headers,
        body: JSON.stringify({ plan_id: planId, user_id: profile.id, role: 'editor' })
      });
    }

    const bucketRes = await fetch(`${API_URL}/rest/v1/buckets`, {
      method: 'POST',
      headers,
      body: JSON.stringify({ plan_id: planId, title: 'Development', order_index: 0 })
    });
    const bucket = await bucketRes.json();
    const bucketId = bucket.id;

    for (let t = 1; t <= 10; t++) {
      console.log(`  Task ${t} of Plan ${p}...`);
      const assignedTo = profiles[t % profiles.length].id;
      const taskRes = await fetch(`${API_URL}/rest/v1/tasks`, {
        method: 'POST',
        headers,
        body: JSON.stringify({
          plan_id: planId,
          bucket_id: bucketId,
          title: `Task ${t} of Plan ${p}`,
          priority: ['low', 'medium', 'high', 'urgent'][t % 4],
          status: 'not_started',
          created_by: ownerId,
          assigned_to: assignedTo,
          order_index: t
        })
      });
      const task = await taskRes.json();
      const taskId = task.id;

      await fetch(`${API_URL}/rest/v1/task_assignments`, {
        method: 'POST',
        headers,
        body: JSON.stringify({ task_id: taskId, user_id: assignedTo })
      });

      for (let c = 1; c <= 20; c++) {
        await fetch(`${API_URL}/rest/v1/task_checklists`, {
          method: 'POST',
          headers,
          body: JSON.stringify({
            task_id: taskId,
            title: `Requirement ${c}`,
            is_completed: Math.random() > 0.7,
            order_index: c
          })
        });
      }
    }
  }
  console.log('Seeding completed!');
}

seed();
