import pkg from 'pg';
const { Client } = pkg;
import bcrypt from 'bcryptjs';
import fs from 'fs';
import path from 'path';

const connectionString = process.env.DATABASE_URL || 'postgresql://postgres:password@localhost:5432/agb_planner';

async function seed() {
  const client = new Client({ connectionString });
  
  try {
    await client.connect();
    console.log('Connected to PostgreSQL');

    // 1. Create schemas
    await client.query('CREATE SCHEMA IF NOT EXISTS auth');
    await client.query('CREATE SCHEMA IF NOT EXISTS public');

    // 2. Run migrations
    const migrationsDir = path.join(process.cwd(), 'supabase', 'migrations');
    const migrationFiles = fs.readdirSync(migrationsDir).sort();

    for (const file of migrationFiles) {
      console.log(`Running migration: ${file}`);
      const sql = fs.readFileSync(path.join(migrationsDir, file), 'utf8');
      await client.query(sql);
    }

    // 3. Create users
    const users = [
      { email: 'AGBTech.MaheshLakhe@gmail.com', password: 'Mahesh@143', name: 'Mahesh Lakhe' },
      { email: 'AGBTech.RushabhKorde@gmail.com', password: 'Rushabh@143', name: 'Rushabh Korde' },
      { email: 'AGBTech.OmkarVani@gmail.com', password: 'Omkar@143', name: 'Omkar Vani' },
      { email: 'AGBTech.MehulHotkar@gmail.com', password: 'Mehul@143', name: 'Mehul Hotkar' },
    ];

    for (const user of users) {
      console.log(`Creating user: ${user.email}`);
      const hashedPassword = await bcrypt.hash(user.password, 10);
      
      const userRes = await client.query(`
        INSERT INTO auth.users (id, email, encrypted_password, raw_user_meta_data, created_at, updated_at)
        VALUES (gen_random_uuid(), $1, $2, $3, now(), now())
        ON CONFLICT (email) DO UPDATE SET updated_at = now()
        RETURNING id
      `, [user.email, hashedPassword, JSON.stringify({ full_name: user.name })]);

      const userId = userRes.rows[0].id;

      // Profile should be created by trigger, but let's ensure it exists
      await client.query(`
        INSERT INTO public.profiles (id, full_name, email)
        VALUES ($1, $2, $3)
        ON CONFLICT (id) DO NOTHING
      `, [userId, user.name, user.email]);
    }

    // 4. Create sample data
    const firstUserId = (await client.query('SELECT id FROM public.profiles LIMIT 1')).rows[0].id;
    
    console.log('Creating sample plans and tasks...');
    const planRes = await client.query(`
      INSERT INTO public.plans (title, description, owner_id, color)
      VALUES ('AGB Tech Main Project', 'Primary tasks for AGB IT', $1, '#3b82f6')
      RETURNING id
    `, [firstUserId]);
    
    const planId = planRes.rows[0].id;

    const bucketRes = await client.query(`
      INSERT INTO public.buckets (plan_id, title, order_index)
      VALUES ($1, 'Upcoming Tasks', 0)
      RETURNING id
    `, [planId]);
    
    const bucketId = bucketRes.rows[0].id;

    for (let i = 1; i <= 10; i++) {
      const taskRes = await client.query(`
        INSERT INTO public.tasks (plan_id, bucket_id, title, description, priority, status, created_by)
        VALUES ($1, $2, $3, $4, $5, $6, $7)
        RETURNING id
      `, [
        planId, 
        bucketId, 
        `Sample Task ${i}`, 
        `This is a sample description for task ${i}`,
        i % 3 === 0 ? 'high' : 'medium',
        'not_started',
        firstUserId
      ]);

      const taskId = taskRes.rows[0].id;

      // Add checklists
      await client.query(`
        INSERT INTO public.task_checklists (task_id, title, is_completed, order_index)
        VALUES ($1, 'Checklist item 1', false, 0), ($1, 'Checklist item 2', true, 1)
      `, [taskId]);
    }

    console.log('Seeding completed successfully!');
  } catch (err) {
    console.error('Error seeding database:', err);
  } finally {
    await client.end();
  }
}

seed();
