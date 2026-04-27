const express = require('express');
const cors = require('cors');
const { PGlite } = require('@electric-sql/pglite');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const fs = require('fs');
const path = require('path');

const app = express();
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());
app.use((req, res, next) => {
  console.log(`${req.method} ${req.url}`);
  next();
});

// Initialize PGlite with persistent storage in the 'db' folder
const defaultDbPath = process.env.DB_PATH || './db_new';
let db;

async function getDb(dbPath = defaultDbPath) {
  if (!db) {
    db = new PGlite(dbPath);
  }
  return db;
}

const JWT_SECRET = process.env.JWT_SECRET || 'your-local-secret';

async function initDb(dbInstance) {
  console.log('Initializing PGLite database...');
  const db = dbInstance;
  
  try {
    await db.exec('CREATE SCHEMA IF NOT EXISTS auth;');
    await db.exec(`
      CREATE TABLE IF NOT EXISTS auth.users (
        id uuid PRIMARY KEY DEFAULT (gen_random_uuid()),
        email text UNIQUE NOT NULL,
        encrypted_password text,
        raw_user_meta_data jsonb DEFAULT '{}'::jsonb,
        created_at timestamptz DEFAULT now()
      );
    `);
    
    await db.exec('CREATE SCHEMA IF NOT EXISTS public;');
    await db.exec(`
      CREATE TABLE IF NOT EXISTS public.profiles (
        id uuid PRIMARY KEY,
        full_name text NOT NULL DEFAULT '',
        email text,
        avatar_url text,
        created_at timestamptz DEFAULT now()
      );
    `);

    await db.exec(`
      CREATE TABLE IF NOT EXISTS public.plans (
        id uuid PRIMARY KEY DEFAULT (gen_random_uuid()),
        title text NOT NULL,
        description text DEFAULT '',
        owner_id uuid NOT NULL,
        color text DEFAULT '#3b82f6',
        created_at timestamptz DEFAULT now()
      );
    `);

    await db.exec(`
      CREATE TABLE IF NOT EXISTS public.plan_members (
        id uuid PRIMARY KEY DEFAULT (gen_random_uuid()),
        plan_id uuid NOT NULL,
        user_id uuid NOT NULL,
        role text DEFAULT 'editor',
        UNIQUE(plan_id, user_id)
      );
    `);

    await db.exec(`
      CREATE TABLE IF NOT EXISTS public.buckets (
        id uuid PRIMARY KEY DEFAULT (gen_random_uuid()),
        plan_id uuid NOT NULL,
        title text NOT NULL,
        order_index integer DEFAULT 0,
        color text DEFAULT '#6b7280',
        created_at timestamptz DEFAULT now()
      );
    `);

    await db.exec(`
      CREATE TABLE IF NOT EXISTS public.task_labels (
        id uuid PRIMARY KEY DEFAULT (gen_random_uuid()),
        plan_id uuid NOT NULL,
        name text NOT NULL,
        color text NOT NULL DEFAULT '#3b82f6',
        created_at timestamptz DEFAULT now()
      );
    `);

    await db.exec(`
      CREATE TABLE IF NOT EXISTS public.tasks (
        id uuid PRIMARY KEY DEFAULT (gen_random_uuid()),
        plan_id uuid NOT NULL,
        bucket_id uuid,
        title text NOT NULL,
        description text DEFAULT '',
        priority text DEFAULT 'medium',
        status text DEFAULT 'not_started',
        due_date date,
        assigned_to uuid,
        created_by uuid NOT NULL,
        order_index integer DEFAULT 0,
        created_at timestamptz DEFAULT now(),
        completed_at timestamptz
      );
    `);

    await db.exec(`
      CREATE TABLE IF NOT EXISTS public.task_assignments (
        task_id uuid NOT NULL,
        user_id uuid NOT NULL,
        PRIMARY KEY (task_id, user_id)
      );
    `);

    await db.exec(`
      CREATE TABLE IF NOT EXISTS public.task_label_assignments (
        task_id uuid NOT NULL,
        label_id uuid NOT NULL,
        PRIMARY KEY (task_id, label_id)
      );
    `);

    await db.exec(`
      CREATE TABLE IF NOT EXISTS public.task_checklists (
        id uuid PRIMARY KEY DEFAULT (gen_random_uuid()),
        task_id uuid NOT NULL,
        title text NOT NULL,
        is_completed boolean DEFAULT false,
        order_index integer DEFAULT 0
      );
    `);

    await db.exec(`
      CREATE TABLE IF NOT EXISTS public.task_comments (
        id uuid PRIMARY KEY DEFAULT (gen_random_uuid()),
        task_id uuid NOT NULL,
        user_id uuid NOT NULL,
        content text NOT NULL,
        created_at timestamptz DEFAULT now()
      );
    `);

    // Migrations
    await db.exec('ALTER TABLE public.tasks ADD COLUMN IF NOT EXISTS completed_at timestamptz;');

    console.log('Database schema verified.');
  } catch (err) {
    console.error('Error initializing schema:', err);
    throw err; // Stop execution if we can't initialize the schema
  }

  // 2. Seed requested users (Upsert) with STABLE IDs
  console.log('Synchronizing initial users...');
  const users = [
    { id: '52c88d92-722d-41b6-8236-45680c6f0800', email: 'AGBTech.MaheshLakhe@gmail.com', password: 'Mahesh@143', name: 'Mahesh Lakhe' },
    { id: 'caf44f8c-9007-456f-9500-fa9269780e5f', email: 'AGBTech.RushabhKorde@gmail.com', password: 'Rushabh@143', name: 'Rushabh Korde' },
    { id: '00004f8c-9007-456f-9500-fa9269780e5f', email: 'AGBTech.OmkarVani@gmail.com', password: 'Omkar@143', name: 'Omkar Vani' },
    { id: '11114f8c-9007-456f-9500-fa9269780e5f', email: 'AGBTech.MehulHotkar@gmail.com', password: 'Mehul@143', name: 'Mehul Hotkar' },
    { id: '8ecd34a6-6b7c-4b01-b272-48f1b49cbce3', email: 'support@agbtechnologies.com', password: 'password123', name: 'Support Team' },
  ];

  for (const u of users) {
    const lowerEmail = u.email.toLowerCase();
    try {
      const hashedPassword = await bcrypt.hash(u.password, 10);
      await db.query(`
        INSERT INTO auth.users (id, email, encrypted_password, raw_user_meta_data) 
        VALUES ($1, $2, $3, $4) 
        ON CONFLICT (email) DO UPDATE SET id = $1, encrypted_password = $3
      `, [u.id, lowerEmail, hashedPassword, JSON.stringify({ full_name: u.name })]);

      await db.query(`
        INSERT INTO public.profiles (id, full_name, email) 
        VALUES ($1, $2, $3) 
        ON CONFLICT (id) DO UPDATE SET full_name = $2, email = $3
      `, [u.id, u.name, lowerEmail]);
    } catch (e) {
      console.error(`Error seeding user ${lowerEmail}:`, e);
    }
  }
  console.log('User synchronization complete.');
}

app.use((req, res, next) => {
  console.log(`[Backend Debug] ${req.method} ${req.url}`);
  if (req.body && typeof req.body === 'object' && Object.keys(req.body).length > 0) {
    console.log(`[Backend Debug] Body:`, JSON.stringify(req.body, null, 2));
  }
  next();
});

const parseFilterValue = (val) => {
  if (typeof val !== 'string') return val;
  const prefixes = ['eq.', 'neq.', 'gt.', 'lt.', 'gte.', 'lte.', 'like.', 'ilike.', 'is.', 'in.'];
  for (const prefix of prefixes) {
    if (val.startsWith(prefix)) {
      const actualVal = val.substring(prefix.length);
      if (prefix === 'is.' && actualVal === 'null') return null;
      if (prefix === 'in.') return actualVal.replace('(', '').replace(')', '').split(',');
      return actualVal;
    }
  }
  return val;
};

// Auth Middleware
const authenticate = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'Unauthorized' });
  try {
    req.user = jwt.verify(token, JWT_SECRET);
    next();
  } catch (err) {
    res.status(401).json({ error: 'Invalid token' });
  }
};

// Routes
app.post('/auth/v1/signup', async (req, res) => {
  const { email, password, data } = req.body;
  const hashedPassword = await bcrypt.hash(password, 10);
  try {
    const result = await db.query(
      'INSERT INTO auth.users (email, encrypted_password, raw_user_meta_data) VALUES ($1, $2, $3) RETURNING id, email',
      [email, hashedPassword, JSON.stringify(data)]
    );
    const user = result.rows[0];
    
    // Create profile in public.profiles
    await db.query(
      'INSERT INTO public.profiles (id, full_name, email) VALUES ($1, $2, $3)',
      [user.id, data?.full_name || '', email]
    );

    const token = jwt.sign({ id: user.id, email: user.email }, JWT_SECRET);
    const session = { access_token: token, user };
    res.json({ data: { user, session }, error: null });
  } catch (err) {
    console.error('Signup error:', err);
    res.status(400).json({ error: err.message });
  }
});

app.post('/auth/v1/login', async (req, res) => {
  const { email, password } = req.body;
  const lowerEmail = email.toLowerCase();
  console.log(`[Auth] Login attempt: ${lowerEmail}`);
  try {
    const result = await db.query('SELECT * FROM auth.users WHERE LOWER(email) = $1', [lowerEmail]);
    const user = result.rows[0];
    
    if (!user) {
      console.log(`[Auth] User not found: ${lowerEmail}`);
      return res.status(401).json({ data: null, error: 'Invalid credentials' });
    }

    const isMatch = await bcrypt.compare(password, user.encrypted_password);
    console.log(`Password match for ${email}: ${isMatch}`);

    if (isMatch) {
      const token = jwt.sign({ id: user.id, email: user.email }, JWT_SECRET);
      const session = { access_token: token, user };
      res.json({ data: { user, session }, error: null });
    } else {
      res.status(401).json({ data: null, error: 'Invalid credentials' });
    }
  } catch (err) {
    console.error(`Login error:`, err);
    res.status(400).json({ data: null, error: err.message });
  }
});

app.get('/rest/v1/:table', authenticate, async (req, res) => {
  const { table } = req.params;
  const { select, order, ...filters } = req.query;
  
  // Custom logic for profiles email search (case-insensitive)
  if (table === 'profiles' && filters.email) {
    const emailVal = parseFilterValue(filters.email);
    console.log(`[Backend Debug] Searching profile for email: "${emailVal}" (from filter: "${filters.email}")`);
    const result = await db.query('SELECT * FROM public.profiles WHERE LOWER(email) = LOWER($1)', [emailVal]);
    console.log(`[Backend Debug] Found ${result.rows.length} profiles`);
    return res.json(result.rows);
  }
  if (table === 'tasks' && select && select.includes('checklists')) {
    const planId = parseFilterValue(filters.plan_id);
    const result = await db.query(`
      SELECT 
        t.*,
        (SELECT json_agg(c) FROM (SELECT * FROM public.task_checklists WHERE task_id = t.id ORDER BY order_index) c) as checklists,
        (SELECT json_agg(ta) FROM (SELECT * FROM public.task_assignments WHERE task_id = t.id) ta) as assignments,
        (SELECT row_to_json(p) FROM (SELECT id, full_name, avatar_url FROM public.profiles WHERE id = t.assigned_to) p) as assignee,
        (SELECT json_agg(la) FROM (
          SELECT tla.*, row_to_json(tl) as label 
          FROM public.task_label_assignments tla
          JOIN public.task_labels tl ON tla.label_id = tl.id
          WHERE tla.task_id = t.id
        ) la) as labels,
        (SELECT json_agg(com) FROM (
          SELECT c.*, row_to_json(pr) as user 
          FROM public.task_comments c 
          JOIN public.profiles pr ON c.user_id = pr.id 
          WHERE c.task_id = t.id 
          ORDER BY c.created_at ASC
        ) com) as comments
      FROM public.tasks t
      WHERE t.plan_id = $1
      ORDER BY t.order_index ASC
    `, [planId]);
    return res.json(result.rows);
  }

  if (table === 'plan_members' && select && select.includes('profile')) {
    const planId = parseFilterValue(filters.plan_id);
    console.log(`[Server] Fetching members for plan: ${planId}`);
    const result = await db.query(`
      SELECT 
        pm.*,
        row_to_json(p) as profile
      FROM public.plan_members pm
      JOIN public.profiles p ON pm.user_id = p.id
      WHERE pm.plan_id = $1
    `, [planId]);
    console.log(`[Server] Found ${result.rows.length} members`);
    return res.json(result.rows);
  }
  
  let sql = `SELECT * FROM public.${table}`;
  const values = [];
  
  const filterKeys = Object.keys(filters);
  const whereClauses = [];

  if (filters.or) {
    const orContent = filters.or.replace('(', '').replace(')', '');
    const conditions = orContent.split(',');
    const orClauses = conditions.map(condition => {
      const [col, rest] = condition.split('.');
      const op = condition.split('.')[1];
      const val = condition.split('.').slice(2).join('.');
      
      values.push(val);
      const placeholder = `$${values.length}`;
      
      if (op === 'eq') return `${col} = ${placeholder}`;
      if (op === 'neq') return `${col} != ${placeholder}`;
      if (op === 'gt') return `${col} > ${placeholder}`;
      if (op === 'lt') return `${col} < ${placeholder}`;
      return `${col} = ${placeholder}`;
    });
    whereClauses.push(`(${orClauses.join(' OR ')})`);
    delete filters.or;
  }

  const remainingKeys = Object.keys(filters);
  remainingKeys.forEach(k => {
    values.push(parseFilterValue(filters[k]));
    whereClauses.push(`${k} = $${values.length}`);
  });

  if (whereClauses.length > 0) {
    sql += ' WHERE ' + whereClauses.join(' AND ');
  }
  
  if (order) {
    const [col, dir] = order.split('.');
    sql += ` ORDER BY ${col} ${dir === 'desc' ? 'DESC' : 'ASC'}`;
  }
  
  try {
    const result = await db.query(sql, values);
    res.json(result.rows);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

app.post('/rest/v1/:table', authenticate, async (req, res) => {
  const { table } = req.params;
  const { select } = req.query;
  const isArray = Array.isArray(req.body);
  const rows = isArray ? req.body : [req.body];
  
  if (rows.length === 0) return res.json([]);
  
  const keys = Object.keys(rows[0]);
  const values = [];
  const valuePlaceholders = rows.map((row, rowIndex) => {
    const rowPlaceholders = keys.map((key, keyIndex) => {
      values.push(row[key]);
      return `$${rowIndex * keys.length + keyIndex + 1}`;
    });
    return `(${rowPlaceholders.join(', ')})`;
  }).join(', ');

  const sql = `INSERT INTO public.${table} (${keys.join(', ')}) VALUES ${valuePlaceholders} RETURNING *`;
  
  try {
    const result = await db.query(sql, values);
    const returnedRows = result.rows;
    
    // For single inserts, we might want to return the expanded object
    if (!isArray && table === 'tasks' && select && select.includes('checklists')) {
      const row = returnedRows[0];
      const fullTask = await db.query(`
        SELECT t.*,
          (SELECT json_agg(c) FROM (SELECT * FROM public.task_checklists WHERE task_id = t.id ORDER BY order_index) c) as checklists,
          (SELECT json_agg(ta) FROM (SELECT * FROM public.task_assignments WHERE task_id = t.id) ta) as assignments,
          (SELECT row_to_json(p) FROM (SELECT id, full_name, avatar_url FROM public.profiles WHERE id = t.assigned_to) p) as assignee,
          (SELECT json_agg(la) FROM (
            SELECT tla.*, row_to_json(tl) as label 
            FROM public.task_label_assignments tla
            JOIN public.task_labels tl ON tla.label_id = tl.id
            WHERE tla.task_id = t.id
          ) la) as labels,
          (SELECT json_agg(com) FROM (
            SELECT c.*, row_to_json(pr) as user 
            FROM public.task_comments c 
            JOIN public.profiles pr ON c.user_id = pr.id 
            WHERE c.task_id = t.id 
            ORDER BY c.created_at ASC
          ) com) as comments
        FROM public.tasks t WHERE t.id = $1
      `, [row.id]);
      return res.json(fullTask.rows[0]);
    }
    
    res.json(isArray ? returnedRows : returnedRows[0]);
  } catch (err) {
    console.error(`POST ${table} error:`, err);
    res.status(400).json({ error: err.message });
  }
});

app.patch('/rest/v1/:table', authenticate, async (req, res) => {
  const { table } = req.params;
  const { select } = req.query;
  const filters = { ...req.query };
  delete filters.select;
  
  const filterKeys = Object.keys(filters);
  const keys = Object.keys(req.body);
  const values = Object.values(req.body);
  
  if (filterKeys.length === 0) {
    return res.status(400).json({ error: 'At least one filter is required for PATCH' });
  }

  try {
    const setClause = keys.map((k, i) => `${k} = $${i + 1}`).join(', ');
    const whereClause = filterKeys.map((k, i) => `${k} = $${keys.length + i + 1}`).join(' AND ');
    const filterValues = filterKeys.map(k => parseFilterValue(filters[k]));
    
    const sql = `UPDATE public.${table} SET ${setClause} WHERE ${whereClause} RETURNING *`;
    const result = await db.query(sql, [...values, ...filterValues]);
    const row = result.rows[0];
    
    if (!row) return res.status(404).json({ error: 'Record not found' });

    if (table === 'tasks' && select && select.includes('checklists')) {
      const fullTask = await db.query(`
        SELECT t.*,
          (SELECT json_agg(c) FROM (SELECT * FROM public.task_checklists WHERE task_id = t.id ORDER BY order_index) c) as checklists,
          (SELECT json_agg(ta) FROM (SELECT * FROM public.task_assignments WHERE task_id = t.id) ta) as assignments,
          (SELECT row_to_json(p) FROM (SELECT id, full_name, avatar_url FROM public.profiles WHERE id = t.assigned_to) p) as assignee,
          (SELECT json_agg(la) FROM (
            SELECT tla.*, row_to_json(tl) as label 
            FROM public.task_label_assignments tla
            JOIN public.task_labels tl ON tla.label_id = tl.id
            WHERE tla.task_id = t.id
          ) la) as labels
        FROM public.tasks t WHERE t.id = $1
      `, [row.id]);
      return res.json(fullTask.rows[0]);
    }

    res.json(row);
  } catch (err) {
    console.error(`PATCH ${table} error:`, err);
    res.status(400).json({ error: err.message });
  }
});

app.delete('/rest/v1/:table', authenticate, async (req, res) => {
  const { table } = req.params;
  const filters = { ...req.query };
  delete filters.select;
  
  const filterKeys = Object.keys(filters);
  if (filterKeys.length === 0) {
    return res.status(400).json({ error: 'At least one filter is required for DELETE' });
  }

  try {
    const values = filterKeys.map(k => parseFilterValue(filters[k]));
    const whereClause = filterKeys.map((k, i) => `${k} = $${i + 1}`).join(' AND ');
    const sql = `DELETE FROM public.${table} WHERE ${whereClause}`;
    
    await db.query(sql, values);
    res.status(204).send();
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

app.use((err, req, res, next) => {
  console.error('Global Error Handler:', err);
  res.status(500).json({ error: err.message });
});

// Global Error Handlers to prevent silent crashes
process.on('uncaughtException', (err) => {
  console.error('UNCAUGHT EXCEPTION:', err);
});
process.on('unhandledRejection', (reason, promise) => {
  console.error('UNHANDLED REJECTION:', reason);
});

async function runServer(dbPath) {
  try {
    const dbInstance = await getDb(dbPath);
    await initDb(dbInstance);
    return new Promise((resolve) => {
      const server = app.listen(3000, '127.0.0.1', () => {
        console.log('🚀 Server is permanently running on http://127.0.0.1:3000 (Local PGLite)');
        resolve(server);
      });
    });
  } catch (err) {
    console.error('Failed to start server:', err);
  }
}

if (require.main === module) {
  runServer();
}

module.exports = { app, runServer };
