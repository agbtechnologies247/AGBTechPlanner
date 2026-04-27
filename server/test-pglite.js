const { PGlite } = require('@electric-sql/pglite');
async function test() {
  console.log('Testing PGlite in memory...');
  try {
    const db = new PGlite();
    await db.exec('SELECT 1');
    console.log('Success in memory!');
    await db.close();
  } catch (err) {
    console.error('Failed in memory:', err);
  }
}
test();
