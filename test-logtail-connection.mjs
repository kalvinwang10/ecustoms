// Test Better Stack HTTP API connection
import * as dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load .env.local
dotenv.config({ path: join(__dirname, '.env.local') });

console.log('🔍 Better Stack HTTP API Connection Test\n');
console.log('='.repeat(50));

// Check if token exists
const token = process.env.BETTERSTACK_API_TOKEN;
console.log('\n1️⃣ Checking environment variable...');
if (!token) {
  console.error('❌ BETTERSTACK_API_TOKEN not found in .env.local');
  console.log('   Make sure .env.local contains:');
  console.log('   BETTERSTACK_API_TOKEN=your_telemetry_api_token_here');
  console.log('\n   Get your token from:');
  console.log('   https://betterstack.com/docs/logs/api/getting-started/');
  process.exit(1);
}

console.log(`✅ Token found (length: ${token.length} characters)`);
console.log(`   First 10 chars: ${token.substring(0, 10)}...`);

// Test sending logs via HTTP API
console.log('\n2️⃣ Sending test logs via HTTP API...');
const testId = `test-${Date.now()}`;
const endpoint = process.env.BETTERSTACK_ENDPOINT || 'https://in.logs.betterstack.com';
console.log(`   Using endpoint: ${endpoint}`);

try {
  // Send INFO log
  const infoResponse = await fetch(endpoint, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      dt: new Date().toISOString(),
      level: 'info',
      message: '🧪 Test INFO log from HTTP API',
      testId,
      source: 'test-script'
    }),
  });

  if (!infoResponse.ok) {
    const errorText = await infoResponse.text();
    throw new Error(`HTTP ${infoResponse.status}: ${errorText}`);
  }
  console.log('✅ INFO log sent successfully');

  // Send WARN log
  const warnResponse = await fetch(endpoint, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      dt: new Date().toISOString(),
      level: 'warn',
      message: '⚠️ Test WARN log from HTTP API',
      testId,
      source: 'test-script'
    }),
  });

  if (!warnResponse.ok) {
    const errorText = await warnResponse.text();
    throw new Error(`HTTP ${warnResponse.status}: ${errorText}`);
  }
  console.log('✅ WARN log sent successfully');

  // Send ERROR log
  const errorResponse = await fetch(endpoint, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      dt: new Date().toISOString(),
      level: 'error',
      message: '❌ Test ERROR log from HTTP API',
      testId,
      source: 'test-script',
      error: {
        name: 'TestError',
        message: 'This is a simulated error for testing'
      }
    }),
  });

  if (!errorResponse.ok) {
    const errorText = await errorResponse.text();
    throw new Error(`HTTP ${errorResponse.status}: ${errorText}`);
  }
  console.log('✅ ERROR log sent successfully');

  console.log('\n' + '='.repeat(50));
  console.log('✨ Test completed successfully!\n');
  console.log('📊 Check your Better Stack dashboard:');
  console.log('   URL: https://logs.betterstack.com/');
  console.log(`   Search for: testId:"${testId}"`);
  console.log('\n⏳ Logs may take 5-30 seconds to appear...');
  console.log('🔄 Refresh the dashboard if you don\'t see them immediately.');
  
  process.exit(0);
} catch (error) {
  console.error('\n❌ Error sending logs to Better Stack:');
  console.error('   Error:', error.message);
  
  console.log('\n💡 Troubleshooting tips:');
  console.log('   1. Get Telemetry API token (not Source token) from:');
  console.log('      https://betterstack.com/docs/logs/api/getting-started/');
  console.log('   2. Make sure token has "Telemetry" permissions');
  console.log('   3. Check https://logs.betterstack.com/ for logs');
  console.log('   4. Verify token in .env.local is correct');
  
  process.exit(1);
}

