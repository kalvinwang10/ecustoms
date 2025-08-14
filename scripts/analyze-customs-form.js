const puppeteer = require('puppeteer-extra');
const StealthPlugin = require('puppeteer-extra-plugin-stealth');
const fs = require('fs');

puppeteer.use(StealthPlugin());

async function analyzeCustomsForm() {
  console.log('🔍 Analyzing Indonesian customs form structure...');
  
  let browser = null;
  
  try {
    browser = await puppeteer.launch({
      headless: false, // Let's see what we're analyzing
      executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    
    const page = await browser.newPage();
    await page.setUserAgent('Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36');
    
    console.log('🌐 Navigating to customs website...');
    await page.goto('https://ecd.beacukai.go.id/', { 
      waitUntil: 'networkidle0', 
      timeout: 30000 
    });
    
    console.log(`📄 Page title: ${await page.title()}`);
    console.log(`🔗 Current URL: ${page.url()}`);
    
    // Wait a moment to let the page fully load
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    console.log('📝 Analyzing form structure...');
    
    // Extract all form elements
    const formAnalysis = await page.evaluate(() => {
      const result = {
        forms: [],
        inputs: [],
        selects: [],
        buttons: [],
        links: [],
        possibleFormContainers: []
      };
      
      // Find all forms
      const forms = document.querySelectorAll('form');
      forms.forEach((form, index) => {
        result.forms.push({
          index,
          id: form.id || 'no-id',
          className: form.className || 'no-class',
          action: form.action || 'no-action',
          method: form.method || 'no-method',
          innerHTML: form.innerHTML.length > 500 ? form.innerHTML.substring(0, 500) + '...' : form.innerHTML
        });
      });
      
      // Find all input elements
      const inputs = document.querySelectorAll('input');
      inputs.forEach((input, index) => {
        result.inputs.push({
          index,
          type: input.type || 'text',
          name: input.name || 'no-name',
          id: input.id || 'no-id',
          className: input.className || 'no-class',
          placeholder: input.placeholder || 'no-placeholder',
          required: input.required || false,
          value: input.value || 'no-value'
        });
      });
      
      // Find all select elements
      const selects = document.querySelectorAll('select');
      selects.forEach((select, index) => {
        const options = Array.from(select.options).map(opt => ({
          value: opt.value,
          text: opt.text
        }));
        
        result.selects.push({
          index,
          name: select.name || 'no-name',
          id: select.id || 'no-id',
          className: select.className || 'no-class',
          options: options.length > 10 ? options.slice(0, 10).concat([{value: '...', text: `... and ${options.length - 10} more`}]) : options
        });
      });
      
      // Find all buttons
      const buttons = document.querySelectorAll('button, input[type="submit"], input[type="button"]');
      buttons.forEach((button, index) => {
        result.buttons.push({
          index,
          type: button.type || 'button',
          className: button.className || 'no-class',
          text: button.textContent?.trim() || button.value || 'no-text',
          id: button.id || 'no-id'
        });
      });
      
      // Find navigation links
      const links = document.querySelectorAll('a');
      links.forEach((link, index) => {
        if (link.href && (link.textContent?.includes('Form') || link.textContent?.includes('Declaration') || link.textContent?.includes('Next') || link.textContent?.includes('Continue'))) {
          result.links.push({
            index,
            href: link.href,
            text: link.textContent?.trim(),
            className: link.className || 'no-class'
          });
        }
      });
      
      // Look for possible form containers
      const containers = document.querySelectorAll('.form, .declaration, .step, [class*="form"], [id*="form"]');
      containers.forEach((container, index) => {
        if (container.children.length > 0) {
          result.possibleFormContainers.push({
            index,
            tagName: container.tagName.toLowerCase(),
            className: container.className || 'no-class',
            id: container.id || 'no-id',
            childrenCount: container.children.length
          });
        }
      });
      
      return result;
    });
    
    // Take a screenshot for reference
    await page.screenshot({ path: 'customs-form-analysis.png', fullPage: true });
    console.log('📸 Screenshot saved as customs-form-analysis.png');
    
    // Save analysis to file
    fs.writeFileSync('customs-form-analysis.json', JSON.stringify(formAnalysis, null, 2));
    console.log('💾 Analysis saved to customs-form-analysis.json');
    
    // Print summary
    console.log('\n📊 Analysis Summary:');
    console.log(`   Forms found: ${formAnalysis.forms.length}`);
    console.log(`   Input fields: ${formAnalysis.inputs.length}`);
    console.log(`   Select dropdowns: ${formAnalysis.selects.length}`);
    console.log(`   Buttons: ${formAnalysis.buttons.length}`);
    console.log(`   Navigation links: ${formAnalysis.links.length}`);
    console.log(`   Form containers: ${formAnalysis.possibleFormContainers.length}`);
    
    if (formAnalysis.inputs.length > 0) {
      console.log('\n🎯 Key Input Fields Found:');
      formAnalysis.inputs.slice(0, 10).forEach(input => {
        console.log(`   - ${input.type}: ${input.name || input.id} (${input.placeholder})`);
      });
    }
    
    if (formAnalysis.selects.length > 0) {
      console.log('\n📋 Select Dropdowns Found:');
      formAnalysis.selects.forEach(select => {
        console.log(`   - ${select.name || select.id} (${select.options.length} options)`);
      });
    }
    
    // Keep the browser open for manual inspection
    console.log('\n⏸️  Browser kept open for manual inspection. Press Ctrl+C when done.');
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

analyzeCustomsForm();