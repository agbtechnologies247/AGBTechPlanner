
const API_URL = 'http://localhost:3000';
const OWNER_EMAIL = 'support@agbtechnologies.com';
const PASSWORD = 'password123';

const INDUSTRIES = [
  "Manufacturing", "Wholesale Distribution", "Logistics & Supply Chain", "Industrial Equipment", 
  "Construction & Infrastructure", "Chemicals & Petrochemicals", "Mining & Metals", "Oil & Gas Services",
  "Automotive Components", "Textiles & Apparel Manufacturing", "SaaS", "IT Services & Consulting",
  "Cloud Computing Services", "Cybersecurity Services", "Data Analytics & BI", "AI & Machine Learning",
  "Accounting & Auditing Firms", "Legal Services", "HR & Recruitment Services", "Digital Marketing Agencies",
  "Medical Equipment Suppliers", "Pharmaceutical Manufacturing", "E-commerce Enablement", "Renewable Energy Solutions",
  "Supermarkets & Grocery Stores", "Fashion Retail", "Electronics Retail", "Furniture Stores", "Restaurants",
  "Salons & Spas", "Fitness Centers & Gyms", "Hospitals", "Clinics", "Schools", "Colleges", "Real Estate Brokers"
];

async function seed() {
  console.log('🚀 Starting Massive Seeding...');
  
  const loginRes = await fetch(`${API_URL}/auth/v1/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: OWNER_EMAIL, password: PASSWORD })
  });
  const loginData = await loginRes.json();
  const token = loginData.data.session.access_token;
  const ownerId = loginData.data.user.id;
  const headers = { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` };

  const profilesRes = await fetch(`${API_URL}/rest/v1/profiles`, { headers });
  const profiles = await profilesRes.json();

  for (const industry of INDUSTRIES) {
    console.log(`Creating Plan for: ${industry}`);
    const planRes = await fetch(`${API_URL}/rest/v1/plans`, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        title: `${industry} Operations`,
        description: `Strategic planning for ${industry} sector`,
        owner_id: ownerId,
        color: `#${Math.floor(Math.random()*16777215).toString(16)}`
      })
    });
    const plan = await planRes.json();
    const planId = plan.id;

    // Create 3 buckets per plan
    const bucketTitles = ['To Do', 'In Progress', 'Done'];
    for (let i = 0; i < bucketTitles.length; i++) {
      const bRes = await fetch(`${API_URL}/rest/v1/buckets`, {
        method: 'POST',
        headers,
        body: JSON.stringify({ plan_id: planId, title: bucketTitles[i], order_index: i })
      });
      const bucket = await bRes.json();
      
      // Create 5-10 tasks per bucket
      const taskCount = 5 + Math.floor(Math.random() * 5);
      for (let t = 1; t <= taskCount; t++) {
        const assignedTo = profiles[Math.floor(Math.random() * profiles.length)].id;
        const taskRes = await fetch(`${API_URL}/rest/v1/tasks`, {
          method: 'POST',
          headers,
          body: JSON.stringify({
            plan_id: planId,
            bucket_id: bucket.id,
            title: `${industry} Task ${t}`,
            priority: ['low', 'medium', 'high', 'urgent'][Math.floor(Math.random() * 4)],
            status: i === 2 ? 'completed' : (i === 1 ? 'in_progress' : 'not_started'),
            created_by: ownerId,
            assigned_to: assignedTo,
            order_index: t
          })
        });
        const task = await taskRes.json();
        
        // Checklist items
        for (let c = 1; c <= 3; c++) {
          await fetch(`${API_URL}/rest/v1/task_checklists`, {
            method: 'POST',
            headers,
            body: JSON.stringify({
              task_id: task.id,
              title: `Step ${c} for ${industry}`,
              is_completed: Math.random() > 0.5,
              order_index: c
            })
          });
        }
      }
    }
  }

  console.log('✅ Massive Seeding Completed!');
}

seed();
