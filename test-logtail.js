// Quick test to verify Logtail integration
require('dotenv').config({ path: '.env.local' });
const { logger } = require('./src/lib/logger.ts');

console.log('Testing Logtail integration...\n');

// Test different log levels
logger.info('TEST_LOGTAIL', 'Testing Logtail integration - INFO level', {
  testId: 'logtail-test-001',
  timestamp: new Date().toISOString()
});

logger.warn('TEST_LOGTAIL', 'Testing Logtail integration - WARN level', {
  testId: 'logtail-test-002',
  warningType: 'test-warning'
});

logger.error('TEST_LOGTAIL', 'Testing Logtail integration - ERROR level', {
  testId: 'logtail-test-003',
  errorType: 'test-error'
}, new Error('This is a test error'));

console.log('\n✅ Test logs sent!');
console.log('📊 Check your Logtail dashboard at: https://logs.betterstack.com/');
console.log('🔍 Search for: testId:"logtail-test-001"');
console.log('\n⏳ Logs may take a few seconds to appear...');

// Give Logtail time to send logs before exiting
setTimeout(() => {
  console.log('\n✨ Test complete! Check Logtail dashboard for logs.');
  process.exit(0);
}, 3000);

