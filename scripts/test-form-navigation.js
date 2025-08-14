const puppeteer = require('puppeteer-extra');
const StealthPlugin = require('puppeteer-extra-plugin-stealth');

puppeteer.use(StealthPlugin());

// Test data
const testFormData = {
  passportNumber: 'A12345678',
  portOfArrival: 'CGK',
  arrivalDate: '2024-01-16', // Tomorrow
  fullPassportName: 'John Doe Test',
  dateOfBirth: '1985-06-15',
  flightVesselNumber: 'GA123',
  nationality: 'US',
  numberOfLuggage: '2',
  consentAccurate: true
};

// Field mappings from our analysis
const fieldMappings = {
  passportNumber: '#paspor',
  portOfArrival: '#lokasiKedatangan',
  arrivalDate: '#tanggalKedatangan', 
  fullPassportName: '#nama',
  dateOfBirthDay: '#tanggalLahirTgl',
  dateOfBirthMonth: '#tanggalLahirBln',
  dateOfBirthYear: '#tanggalLahirThn',
  flightVesselNumber: '#nomorPengangkut',
  nationality: '#kodeNegara',
  numberOfLuggage: '#bagasiDibawa',
  consentAccurate: '#accept'
};

async function testFormNavigation() {
  console.log('🧪 Testing form navigation and field mapping...');
  
  let browser = null;
  
  try {
    browser = await puppeteer.launch({
      headless: false, // Keep visible for debugging
      executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
      args: ['--no-sandbox', '--disable-setuid-sandbox'],
      slowMo: 100 // Slow down actions to see what's happening
    });
    
    const page = await browser.newPage();
    await page.setUserAgent('Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36');
    
    console.log('🌐 Navigating to customs website...');
    await page.goto('https://ecd.beacukai.go.id/', { 
      waitUntil: 'networkidle0', 
      timeout: 30000 
    });
    
    // Wait for initial page to load
    await page.waitForSelector('body', { timeout: 10000 });
    console.log('✅ Initial page loaded');
    
    // Click the first "Next" button to access the form
    console.log('\n🚀 Navigating to form entry...');
    const buttons = await page.$$('button');
    let entrySuccess = false;
    
    for (let button of buttons) {
      const buttonText = await button.evaluate(el => el.textContent?.trim().toLowerCase());
      if (buttonText && (buttonText.includes('next') || buttonText.includes('lanjut'))) {
        console.log(`Clicking entry button: "${buttonText}"`);
        await button.click();
        entrySuccess = true;
        break;
      }
    }
    
    if (!entrySuccess) {
      console.log('❌ Could not find entry button');
      return;
    }
    
    // Wait for form fields to appear
    await new Promise(resolve => setTimeout(resolve, 2000));
    console.log('✅ Form fields now accessible');
    
    // Test each field mapping
    console.log('\n🔍 Testing field mappings...');
    
    for (const [fieldName, selector] of Object.entries(fieldMappings)) {
      try {
        const element = await page.$(selector);
        if (element) {
          console.log(`✅ ${fieldName}: ${selector} - Found`);
          
          // Get element info
          const elementInfo = await page.evaluate((sel) => {
            const el = document.querySelector(sel);
            if (!el) return null;
            return {
              tagName: el.tagName.toLowerCase(),
              type: el.type || 'none',
              className: el.className,
              placeholder: el.placeholder || 'none',
              disabled: el.disabled,
              required: el.required,
              value: el.value
            };
          }, selector);
          
          console.log(`     Type: ${elementInfo.tagName}/${elementInfo.type}, Class: ${elementInfo.className.substring(0, 50)}...`);
          
        } else {
          console.log(`❌ ${fieldName}: ${selector} - Not found`);
        }
      } catch (error) {
        console.log(`❌ ${fieldName}: ${selector} - Error: ${error.message}`);
      }
    }
    
    // Test basic form interaction
    console.log('\n🎯 Testing form interactions...');
    
    try {
      // Test passport number field
      const passportField = await page.$(fieldMappings.passportNumber);
      if (passportField) {
        await passportField.click();
        await passportField.type(testFormData.passportNumber, { delay: 100 });
        console.log('✅ Passport number field - Interactive');
      }
    } catch (error) {
      console.log('❌ Passport number field interaction failed:', error.message);
    }
    
    try {
      // Test name field
      const nameField = await page.$(fieldMappings.fullPassportName);
      if (nameField) {
        await nameField.click();
        await nameField.type(testFormData.fullPassportName, { delay: 100 });
        console.log('✅ Name field - Interactive');
      }
    } catch (error) {
      console.log('❌ Name field interaction failed:', error.message);
    }
    
    try {
      // Test flight number field
      const flightField = await page.$(fieldMappings.flightVesselNumber);
      if (flightField) {
        await flightField.click();
        await flightField.type(testFormData.flightVesselNumber, { delay: 100 });
        console.log('✅ Flight number field - Interactive');
      }
    } catch (error) {
      console.log('❌ Flight number field interaction failed:', error.message);
    }
    
    try {
      // Test luggage number field
      const luggageField = await page.$(fieldMappings.numberOfLuggage);
      if (luggageField) {
        await luggageField.click();
        await luggageField.type(testFormData.numberOfLuggage, { delay: 100 });
        console.log('✅ Luggage number field - Interactive');
      }
    } catch (error) {
      console.log('❌ Luggage number field interaction failed:', error.message);
    }
    
    // Look for dropdowns and buttons
    console.log('\n🔍 Checking for interactive elements...');
    
    const dropdowns = await page.$$('.ant-select');
    console.log(`   Ant Design dropdowns found: ${dropdowns.length}`);
    
    const allButtons = await page.$$('button');
    console.log(`   Buttons found: ${allButtons.length}`);
    
    const submitButtons = await page.$$('button[type="submit"], .ant-btn-primary');
    console.log(`   Submit buttons found: ${submitButtons.length}`);
    
    // Take a screenshot of current state
    await page.screenshot({ path: 'form-interaction-test.png', fullPage: true });
    console.log('📸 Form interaction screenshot saved');
    
    console.log('\n⏸️  Form ready for manual inspection. Press Ctrl+C when done.');
    await new Promise(resolve => {
      process.on('SIGINT', resolve);
    });
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  } finally {
    if (browser) {
      await browser.close();
    }
  }
}

testFormNavigation();