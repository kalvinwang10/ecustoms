const fetch = require('node-fetch');

// Test data
const validFormData = {
  currentStep: 3,
  acceptedTerms: true,
  acceptedPrivacyPolicy: true,
  passportNumber: 'A12345678',
  portOfArrival: 'CGK',
  arrivalDate: '2024-01-15',
  fullPassportName: 'John Doe',
  dateOfBirth: '1985-06-15',
  flightVesselNumber: 'GA123',
  nationality: 'US',
  addressInIndonesia: 'Jalan Sudirman 123, Jakarta',
  numberOfLuggage: '2',
  familyMembers: [],
  hasGoodsToDeclarate: false,
  declaredGoods: [],
  hasTechnologyDevices: true,
  consentAccurate: true
};

const invalidFormData = {
  currentStep: 1,
  // Missing required fields
  passportNumber: '',
  hasGoodsToDeclarate: null
};

async function testAPIRoute() {
  console.log('🧪 Testing API Route...');
  const baseUrl = 'http://localhost:3000';

  try {
    // Test 1: Health check (GET)
    console.log('\n1. Testing health check endpoint...');
    const healthResponse = await fetch(`${baseUrl}/api/submit-customs`);
    const healthData = await healthResponse.json();
    
    if (healthResponse.ok) {
      console.log('✅ Health check passed');
      console.log(`   Status: ${healthData.status}`);
      console.log(`   Version: ${healthData.version}`);
    } else {
      console.log('❌ Health check failed');
      console.log(`   Status: ${healthResponse.status}`);
    }

    // Test 2: Valid form data submission
    console.log('\n2. Testing valid form data submission...');
    const validResponse = await fetch(`${baseUrl}/api/submit-customs`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        formData: validFormData,
        options: {
          headless: true,
          timeout: 30000
        }
      })
    });

    const validResult = await validResponse.json();
    console.log(`   Status: ${validResponse.status}`);
    console.log(`   Success: ${validResult.success}`);
    
    if (validResult.success) {
      console.log('✅ Valid submission processed');
      console.log(`   Message: ${validResult.message}`);
    } else {
      console.log('ℹ️  Expected result (not yet implemented)');
      console.log(`   Error: ${validResult.error.message}`);
      console.log(`   Fallback URL: ${validResult.fallbackUrl}`);
    }

    // Test 3: Invalid form data submission
    console.log('\n3. Testing invalid form data submission...');
    const invalidResponse = await fetch(`${baseUrl}/api/submit-customs`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        formData: invalidFormData
      })
    });

    const invalidResult = await invalidResponse.json();
    console.log(`   Status: ${invalidResponse.status}`);
    
    if (invalidResponse.status === 400 && !invalidResult.success) {
      console.log('✅ Invalid data properly rejected');
      console.log(`   Error: ${invalidResult.error.message}`);
      console.log(`   Code: ${invalidResult.error.code}`);
    } else {
      console.log('❌ Should have rejected invalid data');
    }

    // Test 4: Malformed JSON
    console.log('\n4. Testing malformed JSON...');
    const malformedResponse = await fetch(`${baseUrl}/api/submit-customs`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: '{"invalid": json}'
    });

    const malformedResult = await malformedResponse.json();
    if (malformedResponse.status === 400 && malformedResult.error.code === 'INVALID_JSON') {
      console.log('✅ Malformed JSON properly rejected');
    } else {
      console.log('❌ Should have rejected malformed JSON');
    }

  } catch (error) {
    console.error('❌ Test failed:', error.message);
    console.log('\n💡 Make sure the dev server is running: npm run dev');
  }
  
  console.log('\n🏁 API tests completed');
}

testAPIRoute();