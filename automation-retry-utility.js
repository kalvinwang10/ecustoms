/**
 * Automation Retry Utility for ecustoms
 * 
 * This utility allows you to manually retry the automation with existing or custom formData
 * without having to repeatedly fill out the form.
 * 
 * HOW TO USE:
 * 1. Open your browser and go to your ecustoms site
 * 2. Open the browser console (F12 -> Console tab)
 * 3. Copy and paste this entire file into the console
 * 4. Use one of the provided functions below:
 *    - retryWithLastFormData() - uses the last form submission
 *    - retryWithCustomData(customFormData) - uses your custom data
 *    - createTestData() - creates sample test data
 */

// Function to retry automation with the last used formData
async function retryWithLastFormData() {
  console.log('🔄 Retrying automation with last form data...');
  
  try {
    // Try to get formData from localStorage
    const storedFormData = localStorage.getItem('ecustoms_form_data');
    
    if (!storedFormData) {
      console.log('❌ No stored form data found. Use createTestData() to create sample data.');
      return;
    }
    
    const formData = JSON.parse(storedFormData);
    console.log('📝 Found stored form data:', formData.passportNumber, formData.nationality);
    
    return await callAutomationAPI(formData);
    
  } catch (error) {
    console.error('❌ Error retrying with last form data:', error);
  }
}

// Function to retry automation with custom formData
async function retryWithCustomData(customFormData) {
  console.log('🔄 Retrying automation with custom form data...');
  
  if (!customFormData) {
    console.log('❌ No form data provided. Please provide formData object.');
    return;
  }
  
  return await callAutomationAPI(customFormData);
}

// Function to create sample test data
function createTestData() {
  const testData = {
    passportNumber: "32018323",
    fullPassportName: "TEST USER",
    nationality: "AUSTRALIA",
    dateOfBirth: "01/01/1990",
    countryOfBirth: "AUSTRALIA", 
    gender: "male",
    passportExpiryDate: "01/01/2030",
    mobileNumber: "+61 400000000",
    email: "test@example.com",
    arrivalDate: "25/12/2024",
    departureDate: "05/01/2025",
    hasVisaOrKitas: false,
    visaOrKitasNumber: "",
    modeOfTransport: "AIR",
    purposeOfTravel: "TOURISM",
    residenceType: "HOTEL",
    addressInIndonesia: "Test Hotel, Jakarta",
    placeOfArrival: "SOEKARNO HATTA INTERNATIONAL AIRPORT",
    typeOfAirTransport: "SCHEDULED COMMERCIAL FLIGHT",
    flightName: "GARUDA INDONESIA",
    flightNumber: "GA123",
    hasGoodsToDeclarate: false,
    hasTechnologyDevices: false,
    hasSymptoms: false,
    hasQuarantineItems: false,
    baggageCount: 1,
    consentAccurate: true,
    countriesVisited: ["AUSTRALIA"],
    familyMembers: [
      {
        passportNumber: "87654321",
        fullPassportName: "FAMILY MEMBER",
        nationality: "AUSTRALIA",
        dateOfBirth: "02/02/1992",
        countryOfBirth: "AUSTRALIA",
        gender: "female",
        passportExpiryDate: "02/02/2032",
        mobileNumber: "+61 400000001",
        email: "family@example.com",
        hasVisaOrKitas: false,
        visaOrKitasNumber: ""
      }
    ],
    declaredGoods: []
  };
  
  console.log('📋 Sample test data created. Use retryWithCustomData(testData) to run automation.');
  console.log('📝 You can modify any fields before running:', testData);
  
  // Store it globally for easy access
  window.testData = testData;
  
  return testData;
}

// Core function to call the automation API
async function callAutomationAPI(formData) {
  console.log('🚀 Calling automation API...');
  console.log('📊 Form data summary:');
  console.log(`  • Passport: ${formData.passportNumber}`);
  console.log(`  • Name: ${formData.fullPassportName}`);
  console.log(`  • Nationality: ${formData.nationality}`);
  console.log(`  • Family members: ${formData.familyMembers?.length || 0}`);
  console.log(`  • Arrival: ${formData.placeOfArrival} on ${formData.arrivalDate}`);
  
  try {
    const response = await fetch('/api/submit-customs', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        formData: formData,
        options: {
          headless: false, // Set to true for faster execution
          timeout: 60000,
          retries: 3
        }
      }),
    });
    
    const result = await response.json();
    
    if (result.success) {
      console.log('✅ Automation completed successfully!');
      console.log('📋 Result:', result);
      
      // Display QR code if available
      if (result.qrCode?.imageData) {
        console.log('🔲 QR Code generated successfully!');
        // You could display the QR code in a modal here if needed
      }
      
      return result;
      
    } else {
      console.log('❌ Automation failed:', result.error?.message);
      console.log('🔍 Error details:', result.error);
      
      if (result.fallbackUrl) {
        console.log(`🔗 Fallback URL: ${result.fallbackUrl}`);
      }
      
      return result;
    }
    
  } catch (error) {
    console.error('💥 Network or API error:', error);
    return { success: false, error: { message: error.message } };
  }
}

// Quick test function for group scenarios
function createGroupTestData() {
  const groupData = createTestData();
  
  // Add more family members for testing group functionality
  groupData.familyMembers.push({
    passportNumber: "11111111",
    fullPassportName: "SECOND FAMILY MEMBER",
    nationality: "AUSTRALIA", 
    dateOfBirth: "03/03/1985",
    countryOfBirth: "AUSTRALIA",
    gender: "male",
    passportExpiryDate: "03/03/2030",
    mobileNumber: "+61 400000002",
    email: "second@example.com",
    hasVisaOrKitas: false,
    visaOrKitasNumber: ""
  });
  
  console.log('👨‍👩‍👧‍👦 Group test data created with 2 family members');
  window.groupTestData = groupData;
  
  return groupData;
}

// Utility to monitor automation progress (if running in background)
function monitorAutomation() {
  console.log('👀 Monitoring automation progress...');
  console.log('Check the Network tab for real-time API calls and responses');
  console.log('Or check the application console for detailed logs');
}

// Display instructions
console.log(`
🔧 AUTOMATION RETRY UTILITY LOADED

Available functions:
• retryWithLastFormData() - Retry with stored form data
• retryWithCustomData(data) - Retry with custom data
• createTestData() - Generate sample test data  
• createGroupTestData() - Generate group test data (family scenario)
• monitorAutomation() - Tips for monitoring progress

Quick start:
1. const testData = createTestData();
2. retryWithCustomData(testData);

For group testing:
1. const groupData = createGroupTestData();
2. retryWithCustomData(groupData);
`);