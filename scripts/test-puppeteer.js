// Simple test without TypeScript imports for now
const puppeteer = require('puppeteer-extra');
const StealthPlugin = require('puppeteer-extra-plugin-stealth');

// Add stealth plugin
puppeteer.use(StealthPlugin());

async function testPuppeteerSetup() {
  console.log('🤖 Testing Puppeteer setup...');
  
  let browser = null;
  
  try {
    // Test basic browser launch
    console.log('1. Testing browser launch...');
    browser = await puppeteer.launch({ 
      headless: true,
      executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
      args: [
        '--no-sandbox', 
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-gpu'
      ]
    });
    console.log('✅ Browser launched successfully');
    
    // Test creating a page
    console.log('2. Testing page creation...');
    const page = await browser.newPage();
    
    // Set user agent to appear more human-like
    await page.setUserAgent('Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36');
    console.log('✅ Page created successfully');
    
    // Test navigation to a simple site first
    console.log('3. Testing navigation to Google...');
    await page.goto('https://www.google.com', { waitUntil: 'networkidle0', timeout: 30000 });
    const title = await page.title();
    console.log(`✅ Navigation successful. Page title: ${title}`);
    
    // Test navigation to Indonesian customs site
    console.log('4. Testing connection to Indonesian customs site...');
    try {
      const response = await page.goto('https://ecd.beacukai.go.id/', { 
        waitUntil: 'networkidle0', 
        timeout: 30000 
      });
      
      const customsTitle = await page.title();
      console.log('✅ Successfully connected to Indonesian customs site');
      console.log(`   Status: ${response.status()}`);
      console.log(`   Title: ${customsTitle}`);
      console.log(`   URL: ${page.url()}`);
    } catch (customsError) {
      console.log('❌ Failed to connect to Indonesian customs site');
      console.log(`   Error: ${customsError.message}`);
    }
    
    await page.close();
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  } finally {
    // Always close the browser
    if (browser) {
      await browser.close();
    }
    console.log('🏁 Test completed');
  }
}

// Run the test
testPuppeteerSetup().catch(console.error);