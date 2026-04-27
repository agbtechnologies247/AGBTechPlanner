/**
 * API Load Test — AGB Tech Planner
 * 
 * Tests API performance under concurrent load.
 * Run with: node scripts/load_test.js
 * 
 * Does NOT require any external packages — uses Node.js built-in http.
 */

const http = require('http');

const API_HOST = '127.0.0.1';
const API_PORT = 3000;
const CONCURRENT_USERS = 20;
const REQUESTS_PER_USER = 10;
const LOGIN_EMAIL = 'support@agbtechnologies.com';
const LOGIN_PASSWORD = 'password123';

function httpRequest(options, body = null) {
  return new Promise((resolve, reject) => {
    const start = Date.now();
    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        resolve({
          status: res.statusCode,
          latencyMs: Date.now() - start,
          body: data,
        });
      });
    });
    req.on('error', reject);
    req.setTimeout(10000, () => { req.destroy(); reject(new Error('Timeout')); });
    if (body) req.write(body);
    req.end();
  });
}

async function getToken() {
  const body = JSON.stringify({ email: LOGIN_EMAIL, password: LOGIN_PASSWORD });
  const res = await httpRequest({
    hostname: API_HOST,
    port: API_PORT,
    path: '/auth/v1/login',
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(body) },
  }, body);
  const parsed = JSON.parse(res.body);
  return parsed.data?.session?.access_token;
}

async function runUserSession(token, userId) {
  const results = [];
  const headers = {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json',
  };

  for (let i = 0; i < REQUESTS_PER_USER; i++) {
    try {
      // Alternate between different endpoints
      const endpoints = [
        '/rest/v1/plans?select=*&order=created_at.desc',
        '/rest/v1/profiles?select=*',
        '/rest/v1/tasks?select=*&order=created_at.desc',
      ];
      const path = endpoints[i % endpoints.length];
      
      const res = await httpRequest({
        hostname: API_HOST,
        port: API_PORT,
        path,
        method: 'GET',
        headers,
      });
      
      results.push({ ok: res.status < 400, latency: res.latencyMs, status: res.status });
    } catch (e) {
      results.push({ ok: false, latency: -1, status: 0, error: e.message });
    }
  }
  return results;
}

async function runLoadTest() {
  console.log(`\n🚀 AGB Tech Planner — API Load Test`);
  console.log(`   Concurrent users: ${CONCURRENT_USERS}`);
  console.log(`   Requests per user: ${REQUESTS_PER_USER}`);
  console.log(`   Total requests: ${CONCURRENT_USERS * REQUESTS_PER_USER}\n`);

  console.log('🔑 Fetching auth token...');
  let token;
  try {
    token = await getToken();
    if (!token) throw new Error('No token returned');
    console.log('   ✅ Auth successful\n');
  } catch (e) {
    console.error(`   ❌ Auth failed: ${e.message}`);
    console.error('   Make sure the server is running at http://localhost:3000');
    process.exit(1);
  }

  console.log(`⏱️  Starting ${CONCURRENT_USERS} concurrent sessions...`);
  const start = Date.now();

  const sessions = Array.from({ length: CONCURRENT_USERS }, (_, i) =>
    runUserSession(token, i)
  );

  const allResults = (await Promise.all(sessions)).flat();
  const totalTime = Date.now() - start;

  // Stats
  const succeeded = allResults.filter(r => r.ok);
  const failed = allResults.filter(r => !r.ok);
  const latencies = succeeded.map(r => r.latency).sort((a, b) => a - b);

  const p50 = latencies[Math.floor(latencies.length * 0.5)] ?? 0;
  const p95 = latencies[Math.floor(latencies.length * 0.95)] ?? 0;
  const p99 = latencies[Math.floor(latencies.length * 0.99)] ?? 0;
  const avg = latencies.length > 0 ? Math.round(latencies.reduce((a, b) => a + b, 0) / latencies.length) : 0;

  console.log('\n📊 Results:');
  console.log(`   Total requests:    ${allResults.length}`);
  console.log(`   Successful:        ${succeeded.length} (${Math.round(succeeded.length / allResults.length * 100)}%)`);
  console.log(`   Failed:            ${failed.length}`);
  console.log(`   Total duration:    ${totalTime}ms`);
  console.log(`   Throughput:        ${Math.round(allResults.length / (totalTime / 1000))} req/s`);
  console.log(`\n⚡ Latency (successful requests):`);
  console.log(`   Average:  ${avg}ms`);
  console.log(`   p50:      ${p50}ms`);
  console.log(`   p95:      ${p95}ms`);
  console.log(`   p99:      ${p99}ms`);

  if (failed.length > 0) {
    console.log(`\n⚠️  Failed requests:`);
    const errorSample = failed.slice(0, 3);
    errorSample.forEach(r => console.log(`   Status ${r.status}: ${r.error || 'API error'}`));
  }

  const grade =
    p95 < 200 ? '🟢 EXCELLENT' :
    p95 < 500 ? '🟡 GOOD' :
    p95 < 1000 ? '🟠 FAIR' :
    '🔴 NEEDS IMPROVEMENT';

  console.log(`\n🏆 Performance Grade: ${grade} (p95 = ${p95}ms)\n`);
}

runLoadTest();
