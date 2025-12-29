// Test script for Airtable integration
// Run with: node test-airtable.js

require('dotenv').config({ path: '.env.local' });

// Simple test data matching the FormData structure
const testFormData = {
  // Personal Information
  passportNumber: 'TEST123456',
  fullPassportName: 'John Doe',
  nationality: 'UNITED STATES',
  dateOfBirth: '01/01/1990',
  countryOfBirth: 'UNITED STATES',
  gender: 'male',
  passportExpiryDate: '01/01/2030',
  mobileNumber: '+1234567890',
  email: 'john.doe@test.com',
  citizenshipType: 'foreign',
  
  // Travel Details
  arrivalDate: '2024-01-15',
  departureDate: '2024-01-25',
  hasVisaOrKitas: false,
  visaOrKitasNumber: '',
  
  // Transportation
  modeOfTransport: 'AIR',
  purposeOfTravel: 'TOURIST',
  placeOfArrival: 'SOEKARNO-HATTA INTERNATIONAL AIRPORT',
  typeOfAirTransport: 'SCHEDULED',
  flightName: 'GARUDA INDONESIA',
  flightNumber: 'GA123',
  typeOfVessel: '',
  vesselName: '',
  
  // Address
  residenceType: 'HOTEL',
  addressInIndonesia: 'Test Hotel, Jakarta',
  
  // Health Declaration
  hasSymptoms: false,
  selectedSymptoms: [],
  countriesVisited: ['UNITED STATES'],
  
  // Customs Declaration
  hasQuarantineItems: false,
  hasGoodsToDeclarate: false,
  declaredGoods: [],
  hasTechnologyDevices: true,
  baggageCount: '2',
  
  // Family members (empty for test)
  familyMembers: []
};

async function testAirtableIntegration() {
  console.log('🧪 Testing Airtable Integration...');
  
  // Check environment variables
  const apiToken = process.env.AIRTABLE_API_TOKEN;
  const baseId = process.env.AIRTABLE_BASE_ID;
  const tableName = process.env.AIRTABLE_TABLE_NAME;
  
  if (!apiToken) {
    console.error('❌ AIRTABLE_API_TOKEN is not configured in .env.local');
    console.log('Please get your API token from: https://airtable.com/create/tokens');
    return;
  }
  
  if (!baseId) {
    console.error('❌ AIRTABLE_BASE_ID is not configured in .env.local');
    console.log('Please get your base ID from the Airtable URL: https://airtable.com/{BASE_ID}/...');
    return;
  }
  
  console.log(`📝 Configuration:
  - API Token: ${apiToken.substring(0, 10)}...
  - Base ID: ${baseId}
  - Table Name: ${tableName || 'Travellers'}`);

  try {
    // Test direct API call to Airtable instead of using the module
    const url = `https://api.airtable.com/v0/${baseId}/${encodeURIComponent(tableName || 'Travellers')}`;
    
    // Test payment info
    const paymentInfo = {
      paymentId: 'test_payment_' + Date.now(),
      submissionId: 'TEST_SUBMISSION_' + Date.now()
    };
    
    // Create a simple test record
    const testRecord = {
      records: [{
        fields: {
          'Submission ID': paymentInfo.submissionId,
          'Payment ID': paymentInfo.paymentId,
          'Traveller Type': 'Primary',
          'Passport Number': testFormData.passportNumber,
          'Full Passport Name': testFormData.fullPassportName,
          'Nationality': testFormData.nationality,
          'Date of Birth': testFormData.dateOfBirth,
          'Country of Birth': testFormData.countryOfBirth,
          'Gender': testFormData.gender,
          'Passport Expiry Date': testFormData.passportExpiryDate,
          'Mobile Number': testFormData.mobileNumber,
          'Email': testFormData.email,
          'Citizenship Type': testFormData.citizenshipType,
          'Arrival Date': testFormData.arrivalDate,
          'Departure Date': testFormData.departureDate,
          'Has Visa or KITAS': testFormData.hasVisaOrKitas,
          'Visa or KITAS Number': testFormData.visaOrKitasNumber,
          'Mode of Transport': testFormData.modeOfTransport,
          'Purpose of Travel': testFormData.purposeOfTravel,
          'Place of Arrival': testFormData.placeOfArrival,
          'Type of Air Transport': testFormData.typeOfAirTransport,
          'Flight Name': testFormData.flightName,
          'Flight Number': testFormData.flightNumber,
          'Residence Type': testFormData.residenceType,
          'Address in Indonesia': testFormData.addressInIndonesia,
          'Has Symptoms': testFormData.hasSymptoms,
          'Selected Symptoms': testFormData.selectedSymptoms.join(', '),
          'Countries Visited': testFormData.countriesVisited.join(', '),
          'Has Quarantine Items': testFormData.hasQuarantineItems,
          'Has Goods to Declare': testFormData.hasGoodsToDeclarate,
          'Declared Goods (JSON)': JSON.stringify(testFormData.declaredGoods),
          'Has Technology Devices': testFormData.hasTechnologyDevices,
          'Baggage Count': testFormData.baggageCount
        }
      }]
    };
    
    console.log('\n📤 Storing test traveller data...');
    
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(testRecord),
    });
    
    if (response.ok) {
      const result = await response.json();
      console.log('✅ Test traveller data stored successfully in Airtable!');
      console.log(`📝 Created record ID: ${result.records[0].id}`);
      console.log('Check your Airtable base for the new record.');
    } else {
      const errorData = await response.text();
      throw new Error(`Airtable API error: ${response.status} - ${errorData}`);
    }
    
  } catch (error) {
    console.error('❌ Error during test:', error.message);
    
    if (error.message.includes('422')) {
      console.log('\n💡 This might be due to:');
      console.log('- Field names in Airtable not matching the expected names');
      console.log('- Missing required fields in your Airtable table');
      console.log('- Field types not matching (e.g., text vs number)');
    }
    
    if (error.message.includes('404')) {
      console.log('\n💡 This might be due to:');
      console.log('- Incorrect base ID');
      console.log('- Incorrect table name');
      console.log('- Base or table not accessible with your API token');
    }
    
    if (error.message.includes('401')) {
      console.log('\n💡 This might be due to:');
      console.log('- Incorrect API token');
      console.log('- API token does not have access to the base');
    }
  }
}

testAirtableIntegration();