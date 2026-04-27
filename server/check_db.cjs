const { PGlite } = require('@electric-sql/pglite');

async function check() {
  const db = new PGlite('./db_new');
  const profiles = await db.query('SELECT * FROM public.profiles');
  console.log('Profiles in DB:', profiles.rows.map(p => p.email));
  await db.close();
}

check();
