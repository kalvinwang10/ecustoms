// Test script for complete integration with Airtable record links in Slack
// Run with: node test-integration.js

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

async function testCompleteIntegration() {
  console.log('🧪 Testing Complete Integration (Airtable + Slack with Links)...');
  
  // Check environment variables
  const airtableToken = process.env.AIRTABLE_API_TOKEN;
  const airtableBaseId = process.env.AIRTABLE_BASE_ID;
  const slackWebhook = process.env.SLACK_WEBHOOK_URL;
  
  if (!airtableToken || !airtableBaseId) {
    console.error('❌ Missing Airtable configuration');
    return;
  }
  
  if (!slackWebhook) {
    console.error('❌ Missing Slack configuration');
    return;
  }
  
  console.log('📝 Configuration check passed!');
  
  try {
    console.log('\n📊 Step 1: Creating Airtable record...');
    
    // Test payment info
    const paymentInfo = {
      paymentId: 'test_payment_' + Date.now(),
      submissionId: 'TEST_SUBMISSION_' + Date.now()
    };
    
    // Create Airtable record using direct API call (simulating the integration)
    const airtableUrl = `https://api.airtable.com/v0/${airtableBaseId}/Travellers`;
    
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
    
    const airtableResponse = await fetch(airtableUrl, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${airtableToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(testRecord),
    });
    
    if (!airtableResponse.ok) {
      throw new Error(`Airtable error: ${airtableResponse.status}`);
    }
    
    const airtableResult = await airtableResponse.json();
    const recordId = airtableResult.records[0].id;
    const tableId = process.env.AIRTABLE_TABLE_ID;
    const viewId = process.env.AIRTABLE_VIEW_ID;
    const recordUrl = `https://airtable.com/${airtableBaseId}/${tableId}/${viewId}/${recordId}`;
    
    console.log(`✅ Airtable record created: ${recordId}`);
    console.log(`🔗 Record URL: ${recordUrl}`);
    
    console.log('\n💬 Step 2: Sending Slack notification with Airtable link...');
    
    // Send Slack notification with Airtable link
    const slackMessage = {
      text: 'New customs submission completed',
      blocks: [
        {
          type: 'header',
          text: {
            type: 'plain_text',
            text: '✅ Customs Submission Complete',
            emoji: true,
          },
        },
        {
          type: 'section',
          fields: [
            {
              type: 'mrkdwn',
              text: `*Submission ID:*\n${paymentInfo.submissionId}`,
            },
            {
              type: 'mrkdwn',
              text: `*Passenger:*\n${testFormData.fullPassportName}`,
            },
            {
              type: 'mrkdwn',
              text: `*Passport:*\n${testFormData.passportNumber}`,
            },
            {
              type: 'mrkdwn',
              text: `*Nationality:*\n${testFormData.nationality}`,
            },
          ],
        },
        {
          type: 'section',
          text: {
            type: 'mrkdwn',
            text: `💳 *Payment ID:* ${paymentInfo.paymentId}`,
          },
        },
        {
          type: 'section',
          text: {
            type: 'mrkdwn',
            text: `📊 *Airtable Record:* <${recordUrl}|View Details>`,
          },
        },
        {
          type: 'context',
          elements: [
            {
              type: 'mrkdwn',
              text: `Timestamp: ${new Date().toLocaleString()} | Test Integration`,
            },
          ],
        },
      ],
    };
    
    const slackResponse = await fetch(slackWebhook, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(slackMessage),
    });
    
    if (!slackResponse.ok) {
      throw new Error(`Slack error: ${slackResponse.status}`);
    }
    
    console.log('✅ Slack notification sent successfully!');
    console.log('🎉 Complete integration test successful!');
    console.log('\n📋 Summary:');
    console.log(`- Airtable record: ${recordId}`);
    console.log(`- Record URL: ${recordUrl}`);
    console.log('- Slack notification sent with clickable Airtable link');
    console.log('\n👀 Check your Slack channel for the notification with the Airtable link!');
    
  } catch (error) {
    console.error('❌ Integration test failed:', error.message);
  }
}

testCompleteIntegration();