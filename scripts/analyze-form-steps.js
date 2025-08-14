const puppeteer = require('puppeteer-extra');
const StealthPlugin = require('puppeteer-extra-plugin-stealth');

puppeteer.use(StealthPlugin());

async function analyzeFormSteps() {
  console.log('🔍 Analyzing multi-step form structure...');
  
  let browser = null;
  
  try {
    browser = await puppeteer.launch({
      headless: false,
      executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
      args: ['--no-sandbox', '--disable-setuid-sandbox'],
      slowMo: 500
    });
    
    const page = await browser.newPage();
    await page.setUserAgent('Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36');
    
    console.log('🌐 Navigating to customs website...');
    await page.goto('https://ecd.beacukai.go.id/', { 
      waitUntil: 'networkidle0', 
      timeout: 30000 
    });
    
    // Wait for page to load
    await page.waitForSelector('body', { timeout: 10000 });
    
    // Analyze initial page structure
    console.log('\n📋 Step 1 - Initial page analysis:');
    
    const initialAnalysis = await page.evaluate(() => {
      const analysis = {
        steps: [],
        buttons: [],
        forms: [],
        inputs: [],
        selects: [],
        stepIndicators: []
      };
      
      // Look for step indicators
      const stepElements = document.querySelectorAll('.ant-steps-item, .step, [class*="step"]');
      stepElements.forEach((el, index) => {
        analysis.stepIndicators.push({
          index,
          text: el.textContent?.trim(),
          className: el.className,
          active: el.classList.contains('ant-steps-item-active') || el.classList.contains('active')
        });
      });
      
      // Look for navigation buttons
      const buttons = document.querySelectorAll('button, .ant-btn');
      buttons.forEach((btn, index) => {
        const text = btn.textContent?.trim().toLowerCase();
        if (text.includes('next') || text.includes('back') || text.includes('previous') || 
            text.includes('lanjut') || text.includes('kembali') || text.includes('selanjutnya')) {
          analysis.buttons.push({
            index,
            text: btn.textContent?.trim(),
            className: btn.className,
            selector: btn.id ? `#${btn.id}` : `.${btn.className.split(' ')[0]}`,
            disabled: btn.disabled
          });
        }
      });
      
      // Look for form elements
      const forms = document.querySelectorAll('form, .ant-form');
      analysis.forms = Array.from(forms).map((form, index) => ({
        index,
        className: form.className,
        visible: getComputedStyle(form).display !== 'none'
      }));
      
      // Look for input fields
      const inputs = document.querySelectorAll('input[type="text"], input[type="search"], .ant-input');
      analysis.inputs = Array.from(inputs).map((input, index) => ({
        index,
        id: input.id,
        placeholder: input.placeholder,
        visible: getComputedStyle(input).display !== 'none' && getComputedStyle(input).visibility !== 'hidden'
      }));
      
      // Look for select/dropdown elements
      const selects = document.querySelectorAll('select, .ant-select');
      analysis.selects = Array.from(selects).map((select, index) => ({
        index,
        id: select.id || select.querySelector('input')?.id,
        className: select.className,
        visible: getComputedStyle(select).display !== 'none'
      }));
      
      return analysis;
    });
    
    console.log('Step indicators found:', initialAnalysis.stepIndicators.length);
    initialAnalysis.stepIndicators.forEach(step => {
      console.log(`  - Step ${step.index}: "${step.text}" ${step.active ? '(ACTIVE)' : ''}`);
    });
    
    console.log('\nNavigation buttons found:', initialAnalysis.buttons.length);
    initialAnalysis.buttons.forEach(btn => {
      console.log(`  - "${btn.text}" (${btn.disabled ? 'disabled' : 'enabled'})`);
    });
    
    console.log('\nVisible input fields:', initialAnalysis.inputs.filter(i => i.visible).length);
    console.log('Visible select fields:', initialAnalysis.selects.filter(s => s.visible).length);
    
    // Look for Next button and try to navigate to step 2
    console.log('\n➡️ Attempting to navigate to step 2...');
    
    const nextButtons = await page.$$('button');
    let nextButtonFound = false;
    
    for (let button of nextButtons) {
      const text = await button.evaluate(el => el.textContent?.trim().toLowerCase());
      if (text && (text.includes('lanjut') || text.includes('next') || text.includes('selanjutnya'))) {
        try {
          const isEnabled = await button.evaluate(el => !el.disabled);
          if (isEnabled) {
            console.log(`Found Next button: "${text}"`);
            await button.click();
            nextButtonFound = true;
            break;
          }
        } catch (error) {
          console.log(`Could not click button "${text}": ${error.message}`);
        }
      }
    }
    
    if (nextButtonFound) {
      // Wait for navigation to complete
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      console.log('\n📋 Step 2 - After navigation:');
      
      const step2Analysis = await page.evaluate(() => {
        const analysis = {
          inputs: [],
          selects: [],
          activeStep: null
        };
        
        // Check active step
        const activeStep = document.querySelector('.ant-steps-item-active, .step.active');
        if (activeStep) {
          analysis.activeStep = activeStep.textContent?.trim();
        }
        
        // Get visible form elements
        const inputs = document.querySelectorAll('input[type="text"], input[type="search"], .ant-input');
        analysis.inputs = Array.from(inputs)
          .filter(input => getComputedStyle(input).display !== 'none' && getComputedStyle(input).visibility !== 'hidden')
          .map((input, index) => ({
            index,
            id: input.id,
            placeholder: input.placeholder
          }));
        
        const selects = document.querySelectorAll('select, .ant-select');
        analysis.selects = Array.from(selects)
          .filter(select => getComputedStyle(select).display !== 'none')
          .map((select, index) => ({
            index,
            id: select.id || select.querySelector('input')?.id,
            className: select.className.split(' ')[0]
          }));
        
        return analysis;
      });
      
      console.log(`Active step: ${step2Analysis.activeStep || 'Unknown'}`);
      console.log(`Visible inputs on step 2: ${step2Analysis.inputs.length}`);
      console.log(`Visible selects on step 2: ${step2Analysis.selects.length}`);
      
      step2Analysis.inputs.forEach(input => {
        console.log(`  - Input: #${input.id} (${input.placeholder || 'no placeholder'})`);
      });
      
      step2Analysis.selects.forEach(select => {
        console.log(`  - Select: #${select.id}`);
      });
    } else {
      console.log('❌ No enabled Next button found on step 1');
    }
    
    // Take screenshot
    await page.screenshot({ path: 'form-steps-analysis.png', fullPage: true });
    console.log('\n📸 Analysis screenshot saved');
    
    console.log('\n⏸️ Analysis complete. Press Ctrl+C when ready.');
    await new Promise(resolve => {
      process.on('SIGINT', resolve);
    });
    
  } catch (error) {
    console.error('❌ Analysis failed:', error.message);
  } finally {
    if (browser) {
      await browser.close();
    }
  }
}

analyzeFormSteps();