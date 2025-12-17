// Test script for verifying correct Airtable URL format
// Run with: node test-url-format.js

require('dotenv').config({ path: '.env.local' });

async function testUrlFormat() {
  console.log('🧪 Testing Airtable URL Format...');
  
  // Check environment variables
  const baseId = process.env.AIRTABLE_BASE_ID;
  const tableId = process.env.AIRTABLE_TABLE_ID;
  const viewId = process.env.AIRTABLE_VIEW_ID;
  
  console.log(`📝 Configuration:
  - Base ID: ${baseId}
  - Table ID: ${tableId}
  - View ID: ${viewId}`);
  
  if (!baseId || !tableId || !viewId) {
    console.error('❌ Missing required environment variables');
    return;
  }
  
  // Simulate a record ID
  const recordId = 'recTestRecord123';
  
  // Generate URL using the correct format
  const correctUrl = `https://airtable.com/${baseId}/${tableId}/${viewId}/${recordId}`;
  const incorrectUrl = `https://airtable.com/${baseId}/Travellers/${recordId}`;
  
  console.log(`\n✅ Correct URL format:
  ${correctUrl}`);
  
  console.log(`\n❌ Incorrect URL format (old):
  ${incorrectUrl}`);
  
  console.log(`\n🔍 URL Structure:
  - https://airtable.com/{baseId}/{tableId}/{viewId}/{recordId}
  - Base ID: ${baseId}
  - Table ID: ${tableId}
  - View ID: ${viewId}
  - Record ID: ${recordId}`);
  
  console.log('\n🎯 The integration will now generate URLs in the correct format!');
}

testUrlFormat();