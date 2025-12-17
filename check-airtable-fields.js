// Check what fields exist in the Airtable table
// Run with: node check-airtable-fields.js

require('dotenv').config({ path: '.env.local' });

async function checkAirtableFields() {
  console.log('🔍 Checking Airtable table structure...');
  
  const apiToken = process.env.AIRTABLE_API_TOKEN;
  const baseId = process.env.AIRTABLE_BASE_ID;
  const tableName = process.env.AIRTABLE_TABLE_NAME || 'Travellers';
  
  if (!apiToken || !baseId) {
    console.error('❌ Missing Airtable configuration');
    return;
  }
  
  try {
    // Get table schema
    const url = `https://api.airtable.com/v0/meta/bases/${baseId}/tables`;
    
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${apiToken}`,
      },
    });
    
    if (response.ok) {
      const result = await response.json();
      
      // Find the Travellers table
      const table = result.tables.find(t => t.name === tableName);
      
      if (table) {
        console.log(`✅ Found table: "${table.name}"`);
        console.log(`📊 Table has ${table.fields.length} fields:`);
        console.log('');
        
        table.fields.forEach((field, index) => {
          console.log(`${index + 1}. "${field.name}" (${field.type})`);
        });
        
        console.log('');
        console.log('🔍 Checking for required fields...');
        
        const requiredFields = [
          'Submission ID',
          'Payment ID',
          'Payment Amount',
          'Submission Timestamp',
          'Traveller Type',
          'Passport Number',
          'Full Passport Name',
          'Nationality'
        ];
        
        const missingFields = requiredFields.filter(required => 
          !table.fields.some(field => field.name === required)
        );
        
        if (missingFields.length === 0) {
          console.log('✅ All key fields are present!');
        } else {
          console.log('❌ Missing required fields:');
          missingFields.forEach(field => console.log(`   - "${field}"`));
        }
        
      } else {
        console.log(`❌ Table "${tableName}" not found in base`);
        console.log('Available tables:');
        result.tables.forEach(t => console.log(`   - ${t.name}`));
      }
      
    } else {
      const errorData = await response.text();
      throw new Error(`Airtable API error: ${response.status} - ${errorData}`);
    }
    
  } catch (error) {
    console.error('❌ Error checking table structure:', error.message);
    
    if (error.message.includes('403')) {
      console.log('\n💡 Your API token might not have schema access permissions.');
      console.log('Try creating a new token with full access to the base.');
    }
  }
}

checkAirtableFields();