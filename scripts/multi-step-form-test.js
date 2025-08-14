const puppeteer = require('puppeteer-extra');
const StealthPlugin = require('puppeteer-extra-plugin-stealth');
const fs = require('fs').promises;
const path = require('path');

puppeteer.use(StealthPlugin());

// Form validation functions
async function validateFormCompletion(page) {
  console.log('🔍 Validating form completion...');
  
  try {
    const validationResult = await page.evaluate(() => {
      const results = {
        incompleteFields: [],
        errorMessages: [],
        validationErrors: [],
        hasErrors: false
      };
      
      // Check for fields with validation errors (red borders, aria-invalid)
      const invalidFields = document.querySelectorAll('input[aria-invalid="true"], select[aria-invalid="true"], .ant-form-item-has-error input');
      invalidFields.forEach((field, index) => {
        const label = field.closest('.ant-form-item')?.querySelector('.ant-form-item-label')?.textContent?.trim();
        results.incompleteFields.push({
          id: field.id,
          name: field.name,
          label: label || `Field ${index}`,
          type: field.tagName.toLowerCase()
        });
      });
      
      // Check for visible error messages
      const errorElements = document.querySelectorAll('.ant-form-item-explain-error, .ant-message-error, [class*="error"]');
      errorElements.forEach(error => {
        const text = error.textContent?.trim();
        if (text && text.length > 0) {
          results.errorMessages.push(text);
        }
      });
      
      // Check for empty required fields (only visible/interactive ones)
      const requiredFields = document.querySelectorAll('input[required], select[required], .ant-form-item-required input, .ant-form-item-required select');
      requiredFields.forEach(field => {
        // Only check fields that are actually visible and interactive
        const isVisible = field.offsetParent !== null && 
                          getComputedStyle(field).display !== 'none' && 
                          getComputedStyle(field).visibility !== 'hidden';
        const isInteractive = !field.disabled;
        
        if (isVisible && isInteractive && (!field.value || field.value.trim() === '')) {
          const label = field.closest('.ant-form-item')?.querySelector('.ant-form-item-label')?.textContent?.trim();
          results.incompleteFields.push({
            id: field.id,
            name: field.name,
            label: label || 'Unknown field',
            type: field.tagName.toLowerCase(),
            reason: 'empty_required'
          });
        }
      });
      
      // Check for unselected radio button groups (only visible/interactive ones)
      const radioGroups = {};
      const radioButtons = document.querySelectorAll('input[type="radio"]');
      radioButtons.forEach(radio => {
        // Only include radio buttons that are actually visible and interactive
        const isVisible = radio.offsetParent !== null && 
                          getComputedStyle(radio).display !== 'none' && 
                          getComputedStyle(radio).visibility !== 'hidden';
        const isInteractive = !radio.disabled;
        
        if (radio.name && isVisible && isInteractive) {
          if (!radioGroups[radio.name]) {
            radioGroups[radio.name] = { total: 0, selected: 0, visible: true };
          }
          radioGroups[radio.name].total++;
          if (radio.checked) {
            radioGroups[radio.name].selected++;
          }
        }
      });
      
      // Find radio groups with no selection
      Object.keys(radioGroups).forEach(groupName => {
        if (radioGroups[groupName].selected === 0 && radioGroups[groupName].total > 0) {
          results.incompleteFields.push({
            name: groupName,
            type: 'radio_group',
            reason: 'no_selection',
            totalOptions: radioGroups[groupName].total
          });
        }
      });
      
      results.hasErrors = results.incompleteFields.length > 0 || results.errorMessages.length > 0;
      
      return results;
    });
    
    if (validationResult.hasErrors) {
      console.log('❌ Form validation errors found:');
      
      if (validationResult.incompleteFields.length > 0) {
        console.log('  Incomplete fields:');
        validationResult.incompleteFields.forEach(field => {
          console.log(`    - ${field.label || field.name || field.id}: ${field.reason || 'validation error'}`);
        });
      }
      
      if (validationResult.errorMessages.length > 0) {
        console.log('  Error messages:');
        validationResult.errorMessages.forEach(msg => {
          console.log(`    - ${msg}`);
        });
      }
      
      return { isValid: false, ...validationResult };
    } else {
      console.log('✅ Form validation passed - all required fields completed');
      return { isValid: true, ...validationResult };
    }
    
  } catch (error) {
    console.log(`❌ Form validation check failed: ${error.message}`);
    return { isValid: false, error: error.message };
  }
}

async function retryFailedFields(page, validationResult) {
  console.log('🔄 Attempting to fix incomplete fields...');
  
  if (!validationResult.incompleteFields || validationResult.incompleteFields.length === 0) {
    return true;
  }
  
  let fixedCount = 0;
  
  for (const field of validationResult.incompleteFields) {
    try {
      let fieldFixed = false;
      
      // Handle radio button groups (next page fields like bringGadgets, bringItems)
      if (field.type === 'radio_group') {
        console.log(`🔧 Attempting to fix radio group: ${field.name}`);
        
        // Define default values for known radio groups
        const radioDefaults = {
          'bringGadgets': 'false',  // No electronic devices
          'bringItems': 'false',    // No goods to declare
        };
        
        const targetValue = radioDefaults[field.name];
        if (targetValue) {
          fieldFixed = await page.evaluate((groupName, value) => {
            const radios = document.querySelectorAll(`input[type="radio"][name="${groupName}"]`);
            for (let radio of radios) {
              if (radio.value === value) {
                radio.click();
                return true;
              }
            }
            return false;
          }, field.name, targetValue);
        }
        
        if (fieldFixed) {
          console.log(`✅ Fixed radio group: ${field.name} = ${targetValue}`);
          fixedCount++;
        }
      }
      
      // Handle input/select fields using comprehensive field mapping
      else if (field.type === 'input' || field.type === 'select') {
        console.log(`🔧 Attempting to fix ${field.type} field: ${field.label || field.id}`);
        
        // Find the field mapping by selector or ID
        let fieldMapping = null;
        let fieldKey = null;
        
        for (const [key, mapping] of Object.entries(allFieldMappings)) {
          if (mapping.selector === `#${field.id}` || field.id === mapping.selector.replace('#', '')) {
            fieldMapping = mapping;
            fieldKey = key;
            break;
          }
        }
        
        if (fieldMapping) {
          const expectedValue = fieldMapping.getValue(testFormData);
          console.log(`  Expected value: "${expectedValue}"`);
          
          if (fieldMapping.type === 'input') {
            fieldFixed = await safeFieldInput(page, fieldMapping.selector, expectedValue, `${fieldKey} (retry)`);
          } else if (fieldMapping.type === 'select') {
            fieldFixed = await safeDropdownSelect(page, fieldMapping.selector, expectedValue, `${fieldKey} (retry)`);
          } else if (fieldMapping.type === 'checkbox') {
            try {
              await page.waitForSelector(fieldMapping.selector, { visible: true, timeout: 3000 });
              await page.click(fieldMapping.selector);
              fieldFixed = true;
            } catch (checkboxError) {
              console.log(`  Checkbox click failed: ${checkboxError.message}`);
            }
          }
          
          if (fieldFixed) {
            console.log(`✅ Fixed field: ${field.label || field.id}`);
            fixedCount++;
          } else {
            console.log(`❌ Could not fix field: ${field.label || field.id}`);
          }
        } else {
          console.log(`⚠️ No mapping found for field: ${field.id}`);
        }
      }
      
    } catch (fieldError) {
      console.log(`❌ Error fixing field ${field.name || field.id}: ${fieldError.message}`);
    }
  }
  
  console.log(`🔧 Fixed ${fixedCount} out of ${validationResult.incompleteFields.length} incomplete fields`);
  return fixedCount > 0;
}

// QR Code extraction functions
async function extractQRCodeFromModal(page) {
  console.log('🔍 Waiting for success modal to appear...');
  
  try {
    // Wait for the modal to appear
    await page.waitForSelector('.ant-modal', { visible: true, timeout: 10000 });
    console.log('✅ Success modal appeared');
    
    // Wait for QR code container
    await page.waitForSelector('#myqrcode', { visible: true, timeout: 5000 });
    console.log('✅ QR code container found');
    
    // Extract the SVG QR code
    const qrCodeData = await page.evaluate(() => {
      const qrContainer = document.querySelector('#myqrcode .ant-qrcode svg');
      if (!qrContainer) return null;
      
      // Get SVG content
      const svgContent = qrContainer.outerHTML;
      
      // Get SVG dimensions
      const width = qrContainer.getAttribute('width') || '256';
      const height = qrContainer.getAttribute('height') || '256';
      
      return {
        svgContent,
        width: parseInt(width),
        height: parseInt(height),
        viewBox: qrContainer.getAttribute('viewBox') || '0 0 21 21'
      };
    });
    
    if (!qrCodeData) {
      throw new Error('QR code SVG not found in modal');
    }
    
    console.log('✅ QR code SVG extracted successfully');
    console.log(`   Dimensions: ${qrCodeData.width}x${qrCodeData.height}`);
    
    return qrCodeData;
    
  } catch (error) {
    console.log(`❌ Failed to extract QR code: ${error.message}`);
    return null;
  }
}

async function extractSubmissionDetails(page) {
  console.log('🔍 Extracting submission details from modal...');
  
  try {
    const submissionData = await page.evaluate(() => {
      const modal = document.querySelector('.ant-modal-body');
      if (!modal) return null;
      
      // Extract thank you message (first span)
      const messageElement = modal.querySelector('span.ant-typography');
      const message = messageElement ? messageElement.textContent?.trim() : null;
      
      // Extract port info (first h4 with text-align: center)
      const h4Elements = modal.querySelectorAll('h4.ant-typography');
      let portInfo = null;
      let registrationNumber = null;
      let customsOffice = null;
      
      // Parse h4 elements in order
      if (h4Elements.length >= 1) {
        // First h4: Port information (e.g., "SURABAYA (SUB) / JUANDA")
        const firstH4 = h4Elements[0];
        if (firstH4.style.textAlign === 'center') {
          portInfo = firstH4.textContent?.trim();
        }
      }
      
      if (h4Elements.length >= 2) {
        // Second h4: Registration number (e.g., "9NM7xW")
        const secondH4 = h4Elements[1];
        const regText = secondH4.textContent?.trim();
        // Registration numbers are typically 6 characters alphanumeric (case-insensitive)
        if (regText && /^[A-Za-z0-9]{6}$/.test(regText)) {
          registrationNumber = regText;
        }
      }
      
      if (h4Elements.length >= 3) {
        // Third h4: Customs office (e.g., "KPPBC TMP JUANDA")
        const thirdH4 = h4Elements[2];
        if (thirdH4.style.textAlign === 'center') {
          customsOffice = thirdH4.textContent?.trim();
        }
      }
      
      // Fallback: extract registration number from any h4 if not found above
      if (!registrationNumber) {
        for (let h4 of h4Elements) {
          const text = h4.textContent?.trim();
          if (text && /^[A-Za-z0-9]{6}$/.test(text)) {
            registrationNumber = text;
            break;
          }
        }
      }
      
      // Fallback: extract port info from any h4 containing parentheses
      if (!portInfo) {
        for (let h4 of h4Elements) {
          const text = h4.textContent?.trim();
          if (text && text.includes('(') && text.includes(')')) {
            portInfo = text;
            break;
          }
        }
      }
      
      // Fallback: extract customs office from any h4 containing "KPPBC" or "BEA"
      if (!customsOffice) {
        for (let h4 of h4Elements) {
          const text = h4.textContent?.trim();
          if (text && (text.includes('KPPBC') || text.includes('BEA') || text.includes('CUKAI'))) {
            customsOffice = text;
            break;
          }
        }
      }
      
      return {
        registrationNumber,
        portInfo,
        message,
        customsOffice,
        extractedAt: new Date().toISOString(),
        debugInfo: {
          h4Count: h4Elements.length,
          h4Texts: Array.from(h4Elements).map(h4 => h4.textContent?.trim())
        }
      };
    });
    
    if (submissionData) {
      console.log('✅ Submission details extracted successfully');
      console.log(`   Registration Number: ${submissionData.registrationNumber || 'Not found'}`);
      console.log(`   Port: ${submissionData.portInfo || 'Not found'}`);
      console.log(`   Customs Office: ${submissionData.customsOffice || 'Not found'}`);
      
      if (submissionData.debugInfo) {
        console.log(`   Debug: Found ${submissionData.debugInfo.h4Count} h4 elements`);
        submissionData.debugInfo.h4Texts.forEach((text, i) => {
          console.log(`     H4[${i}]: "${text}"`);
        });
      }
      
      return submissionData;
    } else {
      console.log('⚠️ Could not extract submission details from modal');
      return null;
    }
    
  } catch (error) {
    console.log(`❌ Failed to extract submission details: ${error.message}`);
    return null;
  }
}

async function downloadQRCodeImage(page, downloadPath, baseFilename) {
  console.log('🔄 Downloading QR code image using download button...');
  console.log(`📁 Download path: ${downloadPath}`);
  
  try {
    // Verify download directory exists and is writable
    try {
      await fs.access(downloadPath, fs.constants.W_OK);
      console.log('✅ Download directory is writable');
    } catch (accessError) {
      console.log(`⚠️ Download directory access issue: ${accessError.message}`);
      // Try to create the directory
      await fs.mkdir(downloadPath, { recursive: true });
      console.log('✅ Download directory created');
    }
    
    // Set up download behavior with CDP
    const client = await page.target().createCDPSession();
    await client.send('Page.setDownloadBehavior', {
      behavior: 'allow',
      downloadPath: path.resolve(downloadPath)  // Use absolute path
    });
    
    console.log('✅ CDP download behavior configured');
    
    console.log('🔍 Looking for download button...');
    
    // Try multiple selectors for the download button
    const downloadButtonSelectors = [
      'button .anticon-download',           // Button containing download icon (most specific)
      'button:contains("Download")',        // Button with "Download" text  
      '.ant-modal button.ant-btn-primary',  // Primary button in modal
      '.ant-modal button[type="button"]'    // Any button in modal (fallback)
    ];
    
    let downloadButton = null;
    for (const selector of downloadButtonSelectors) {
      try {
        downloadButton = await page.waitForSelector(selector, { 
          visible: true, 
          timeout: 2000 
        });
        if (downloadButton) {
          console.log(`✅ Download button found using selector: ${selector}`);
          break;
        }
      } catch (e) {
        console.log(`   Selector "${selector}" failed: ${e.message}`);
        continue;
      }
    }
    
    if (!downloadButton) {
      throw new Error('Download button not found with any selector');
    }
    
    console.log('✅ Download button found, clicking...');
    
    // Get list of files before download to compare after
    const filesBefore = new Set();
    try {
      const existingFiles = await fs.readdir(downloadPath);
      existingFiles.forEach(file => filesBefore.add(file));
      console.log(`📋 Files before download: ${existingFiles.length}`);
    } catch (readError) {
      console.log('📋 No existing files in download directory');
    }
    
    // Set up download completion listeners
    let downloadCompleted = false;
    let downloadedFilename = null;
    
    // CDP Event listener
    client.on('Page.downloadWillBegin', (event) => {
      console.log(`📥 Download starting: ${event.suggestedFilename || 'unknown filename'}`);
      downloadedFilename = event.suggestedFilename;
    });
    
    client.on('Page.downloadProgress', (event) => {
      console.log(`📊 Download progress: ${event.state} (${event.receivedBytes || 0} bytes)`);
      if (event.state === 'completed') {
        downloadCompleted = true;
        console.log('✅ CDP reports download completed');
      }
    });
    
    console.log('🖱️ Clicking download button...');
    
    // Click the download button
    await downloadButton.click();
    
    // Wait for download to complete with dual detection (CDP + filesystem)
    const timeout = 15000; // Increased timeout
    const startTime = Date.now();
    let filesystemDetection = false;
    
    while (!downloadCompleted && !filesystemDetection && (Date.now() - startTime) < timeout) {
      await new Promise(resolve => setTimeout(resolve, 300));
      
      // Check filesystem for new files
      try {
        const currentFiles = await fs.readdir(downloadPath);
        const newFiles = currentFiles.filter(file => !filesBefore.has(file) && file.toLowerCase().endsWith('.png'));
        
        if (newFiles.length > 0) {
          filesystemDetection = true;
          downloadedFilename = newFiles[0]; // Use the first new PNG file
          console.log(`✅ Filesystem detected new file: ${downloadedFilename}`);
          break;
        }
      } catch (fsError) {
        // Continue trying
      }
    }
    
    if (!downloadCompleted && !filesystemDetection) {
      throw new Error('Download did not complete within timeout (neither CDP nor filesystem detected completion)');
    }
    
    const detectionMethod = downloadCompleted ? 'CDP' : 'filesystem';
    console.log(`✅ QR code image downloaded successfully via ${detectionMethod} detection`);
    
    return {
      success: true,
      originalFilename: downloadedFilename,
      downloadPath: downloadPath,
      detectionMethod: detectionMethod,
      format: 'png' // QR codes are typically downloaded as PNG
    };
    
  } catch (error) {
    console.log(`❌ QR code download failed: ${error.message}`);
    
    // Fallback: try to screenshot just the QR code element
    console.log('🔄 Attempting fallback: screenshot QR code element...');
    
    try {
      const qrElement = await page.$('#myqrcode .ant-qrcode');
      if (qrElement) {
        const screenshotPath = path.join(downloadPath, `${baseFilename}-fallback.png`);
        await qrElement.screenshot({ path: screenshotPath });
        console.log(`✅ Fallback screenshot saved: ${screenshotPath}`);
        
        return {
          success: true,
          fallback: true,
          screenshotPath: screenshotPath,
          format: 'png'
        };
      }
    } catch (fallbackError) {
      console.log(`❌ Fallback screenshot failed: ${fallbackError.message}`);
    }
    
    return {
      success: false,
      error: error.message
    };
  }
}

async function saveQRCodeAndMetadata(qrDownloadResult, submissionDetails, timestamp, downloadDir) {
  console.log('💾 Organizing QR code files and saving metadata...');
  console.log(`📁 Target directory: ${downloadDir}`);
  
  try {
    const baseFilename = `customs-submission-${timestamp}`;
    const finalImagePath = path.join(downloadDir, `${baseFilename}.png`);
    
    // Handle the downloaded/captured QR code image
    let imageHandled = false;
    
    if (qrDownloadResult && qrDownloadResult.success) {
      if (qrDownloadResult.fallback && qrDownloadResult.screenshotPath) {
        // Fallback screenshot was used
        console.log(`📁 Using fallback screenshot: ${qrDownloadResult.screenshotPath}`);
        
        // Copy fallback screenshot to final location with our naming convention
        try {
          await fs.copyFile(qrDownloadResult.screenshotPath, finalImagePath);
          console.log(`✅ QR code image saved: ${finalImagePath}`);
          imageHandled = true;
        } catch (copyError) {
          console.log(`❌ Failed to copy fallback screenshot: ${copyError.message}`);
        }
      } else if (qrDownloadResult.downloadPath && qrDownloadResult.originalFilename) {
        // Downloaded file was used
        const downloadedFile = path.join(qrDownloadResult.downloadPath, qrDownloadResult.originalFilename);
        console.log(`📁 Downloaded file location: ${downloadedFile}`);
        
        // Try to find and rename the downloaded file
        try {
          // The downloaded file might have a different name, try to find it
          const files = await fs.readdir(qrDownloadResult.downloadPath);
          const recentPngFiles = files.filter(f => 
            f.toLowerCase().endsWith('.png') && 
            f !== finalImagePath // Don't pick up our own file
          );
          
          if (recentPngFiles.length > 0) {
            const downloadedFilePath = path.join(qrDownloadResult.downloadPath, recentPngFiles[0]);
            await fs.copyFile(downloadedFilePath, finalImagePath);
            console.log(`✅ QR code image saved: ${finalImagePath}`);
            imageHandled = true;
            
            // Clean up the original downloaded file
            try {
              await fs.unlink(downloadedFilePath);
            } catch (cleanupError) {
              console.log(`⚠️ Could not clean up original download: ${cleanupError.message}`);
            }
          }
        } catch (renameError) {
          console.log(`❌ Failed to handle downloaded file: ${renameError.message}`);
        }
      }
    }
    
    if (!imageHandled) {
      console.log('⚠️ No QR code image was successfully saved');
    }
    
    // Save metadata as JSON
    const metadata = {
      submissionDetails,
      qrCodeInfo: qrDownloadResult ? {
        method: qrDownloadResult.fallback ? 'screenshot_fallback' : 'download_button',
        format: qrDownloadResult.format || 'png',
        success: qrDownloadResult.success,
        originalPath: qrDownloadResult.screenshotPath || qrDownloadResult.downloadPath
      } : null,
      extractedAt: new Date().toISOString(),
      filename: imageHandled ? finalImagePath : null
    };
    
    const metadataPath = path.join(downloadDir, `${baseFilename}.json`);
    await fs.writeFile(metadataPath, JSON.stringify(metadata, null, 2));
    console.log(`✅ Submission metadata saved: ${metadataPath}`);
    
    return {
      imagePath: imageHandled ? finalImagePath : null,
      metadataPath: metadataPath,
      success: imageHandled
    };
    
  } catch (error) {
    console.log(`❌ Failed to save files: ${error.message}`);
    return { success: false, error: error.message };
  }
}

async function handleQRExtractionFailure(page, timestamp, error) {
  console.log('🚨 QR extraction failed, attempting recovery...');
  
  try {
    // Take a screenshot of the current page for debugging
    const errorScreenshotPath = `qr-extraction-error-${timestamp}.png`;
    await page.screenshot({ path: errorScreenshotPath, fullPage: true });
    console.log(`📸 Error screenshot saved: ${errorScreenshotPath}`);
    
    // Try to extract any visible text from the page
    const pageText = await page.evaluate(() => {
      const body = document.body;
      return body ? body.textContent?.substring(0, 1000) : 'No page content found';
    });
    
    // Save error details and page content
    const errorData = {
      error: error.toString(),
      timestamp: new Date().toISOString(),
      pageUrl: page.url(),
      pageText: pageText,
      screenshotPath: errorScreenshotPath
    };
    
    const errorDataPath = `qr-extraction-error-${timestamp}.json`;
    await fs.writeFile(errorDataPath, JSON.stringify(errorData, null, 2));
    console.log(`📄 Error details saved: ${errorDataPath}`);
    
    // Try to find any modal or success indicators
    const modalExists = await page.$('.ant-modal').then(el => !!el);
    const hasQRCode = await page.$('#myqrcode').then(el => !!el);
    const hasSuccess = await page.evaluate(() => {
      const text = document.body.textContent || '';
      return text.includes('Terima kasih') || text.includes('sukses') || text.includes('berhasil');
    });
    
    console.log('🔍 Recovery analysis:');
    console.log(`   Modal present: ${modalExists}`);
    console.log(`   QR code container present: ${hasQRCode}`);
    console.log(`   Success indicators found: ${hasSuccess}`);
    
    return {
      recoveryAttempted: true,
      modalExists,
      hasQRCode,
      hasSuccess,
      errorScreenshotPath,
      errorDataPath
    };
    
  } catch (recoveryError) {
    console.log(`❌ Recovery attempt failed: ${recoveryError.message}`);
    return {
      recoveryAttempted: false,
      recoveryError: recoveryError.message
    };
  }
}

// Test data
const today = new Date();
const tomorrow = new Date(today);
tomorrow.setDate(tomorrow.getDate() + 1);

const testFormData = {
  passportNumber: 'A12345678',
  portOfArrival: 'CGK',
  arrivalDate: tomorrow.toISOString().split('T')[0], // Tomorrow's date in YYYY-MM-DD format
  fullPassportName: 'John Doe Test',
  dateOfBirth: '1985-12-15', // Changed to December (month 12) for debugging
  flightVesselNumber: 'GA123',
  nationality: 'US',
  numberOfLuggage: '2',
  addressInIndonesia: 'Jl. Sudirman No. 123, Jakarta Pusat', // Address in Indonesia
  consentAccurate: true,
  
  // Family members traveling together
  familyMembers: [
    {
      id: 'family1',
      passportNumber: 'B87654321',
      name: 'Jane Doe Test',
      nationality: 'US' // Will use same mapping as main form: 'US - UNITED STATES'
    },
    {
      id: 'family2', 
      passportNumber: 'C11223344',
      name: 'Jimmy Doe Test',
      nationality: 'CA' // Will map to 'CA - CANADA'  
    }
  ],
  
  // Goods declaration
  hasGoodsToDeclarate: true,
  declaredGoods: [
    {
      id: 'goods1',
      description: 'Electronics - Camera',
      quantity: '1',
      value: '500',
      currency: 'USD'
    },
    {
      id: 'goods2',
      description: 'Personal Items - Jewelry', 
      quantity: '2',
      value: '200',
      currency: 'USD'
    }
  ],
  hasTechnologyDevices: true
};

// Comprehensive field mappings with types and expected values
const allFieldMappings = {
  passportNumber: {
    selector: '#paspor',
    type: 'input',
    getValue: (testData) => testData.passportNumber
  },
  portOfArrival: {
    selector: '#lokasiKedatangan',
    type: 'select',
    getValue: (testData) => {
      const portMap = {
        'CGK': 'JAKARTA (CGK) / SOEKARNO HATTA',
        'DPS': 'BALI (DPS) / NGURAH RAI',
        'JOG': 'YOGYAKARTA (JOG) / ADISUTCIPTO',
        'MLG': 'MALANG (MLG) / ABDUL RACHMAN SALEH',
        'SOC': 'SOLO (SOC) / ADISUMARMO',
        'BDO': 'BANDUNG (BDO) / HUSEIN SASTRANEGARA'
      };
      return portMap[testData.portOfArrival] || testData.portOfArrival;
    }
  },
  arrivalDate: {
    selector: '#tanggalKedatangan',
    type: 'select',
    getValue: (testData) => {
      const date = new Date(testData.arrivalDate);
      const day = date.getDate().toString().padStart(2, '0');
      const month = (date.getMonth() + 1).toString().padStart(2, '0');
      const year = date.getFullYear().toString();
      return `${day}-${month}-${year}`;
    }
  },
  fullPassportName: {
    selector: '#nama',
    type: 'input',
    getValue: (testData) => testData.fullPassportName
  },
  dateOfBirthDay: {
    selector: '#tanggalLahirTgl',
    type: 'select',
    getValue: (testData) => testData.dateOfBirth.split('-')[2]
  },
  dateOfBirthMonth: {
    selector: '#tanggalLahirBln',
    type: 'select',
    getValue: (testData) => testData.dateOfBirth.split('-')[1]
  },
  dateOfBirthYear: {
    selector: '#tanggalLahirThn',
    type: 'select',
    getValue: (testData) => testData.dateOfBirth.split('-')[0]
  },
  flightVesselNumber: {
    selector: '#nomorPengangkut',
    type: 'input',
    getValue: (testData) => testData.flightVesselNumber
  },
  nationality: {
    selector: '#kodeNegara',
    type: 'select',
    getValue: (testData) => {
      const countryMap = {
        'US': 'US - UNITED STATES',
        'GB': 'GB - UNITED KINGDOM', 
        'AU': 'AU - AUSTRALIA',
        'SG': 'SG - SINGAPORE',
        'MY': 'MY - MALAYSIA',
        'TH': 'TH - THAILAND',
        'CA': 'CA - CANADA',
        'NZ': 'NZ - NEW ZEALAND',
        'DE': 'DE - GERMANY',
        'FR': 'FR - FRANCE',
        'NL': 'NL - NETHERLANDS',
        'JP': 'JP - JAPAN',
        'KR': 'KR - KOREA, REPUBLIC OF',
        'CN': 'CN - CHINA',
        'IN': 'IN - INDIA'
      };
      return countryMap[testData.nationality] || `${testData.nationality} - ${testData.nationality}`;
    }
  },
  numberOfLuggage: {
    selector: '#bagasiDibawa',
    type: 'input',
    getValue: (testData) => testData.numberOfLuggage
  },
  addressInIndonesia: {
    selector: '#domisiliJalan',
    type: 'input',
    getValue: (testData) => testData.addressInIndonesia
  },
  consentAccurate: {
    selector: '#accept',
    type: 'checkbox',
    getValue: (testData) => testData.consentAccurate
  }
};

async function safeFieldInput(page, selector, value, fieldName) {
  try {
    // Wait for the element to be available
    await page.waitForSelector(selector, { visible: true, timeout: 5000 });
    
    // Focus on the field
    await page.focus(selector);
    
    // Clear existing content
    await page.evaluate((sel) => {
      const el = document.querySelector(sel);
      if (el) {
        el.value = '';
        el.dispatchEvent(new Event('input', { bubbles: true }));
      }
    }, selector);
    
    // Type the new value
    await page.type(selector, value, { delay: 50 });
    
    // Trigger events for Ant Design
    await page.evaluate((sel) => {
      const el = document.querySelector(sel);
      if (el) {
        el.dispatchEvent(new Event('change', { bubbles: true }));
        el.dispatchEvent(new Event('blur', { bubbles: true }));
      }
    }, selector);
    
    console.log(`✅ ${fieldName}: "${value}"`);
    return true;
    
  } catch (error) {
    console.log(`❌ ${fieldName} failed: ${error.message}`);
    return false;
  }
}

async function safeDropdownSelect(page, selector, value, fieldName, maxRetries = 3) {
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      console.log(`🔄 ${fieldName} (attempt ${attempt}/${maxRetries}): Trying to select "${value}"`);
      
      // Map field names to their specific dropdown list IDs
      const dropdownListMap = {
        'dateOfBirthDay': 'tanggalLahirTgl_list',
        'dateOfBirthMonth': 'tanggalLahirBln_list', 
        'dateOfBirthYear': 'tanggalLahirThn_list',
        'portOfArrival': 'lokasiKedatangan_list',
        'arrivalDate': 'tanggalKedatangan_list',
        'nationality': 'kodeNegara_list'
      };
      
      // First, close any open dropdowns to prevent interference
      await page.evaluate(() => {
        // Click elsewhere to close any open dropdowns
        document.body.click();
      });
      
      // Wait longer for arrival date field (often problematic after date fields)
      const waitTime = fieldName === 'arrivalDate' ? 1000 : 500;
      await new Promise(resolve => setTimeout(resolve, waitTime));
      
      // Wait for dropdown container
      await page.waitForSelector(selector, { visible: true, timeout: 5000 });
      
      // Try different methods to click and open dropdown
      let dropdownOpened = false;
      
      // Method 1: Click on the selector itself
      try {
        await page.click(selector);
        await new Promise(resolve => setTimeout(resolve, 800));
        const dropdown = await page.$('.ant-select-dropdown:not(.ant-select-dropdown-hidden)');
        if (dropdown) dropdownOpened = true;
      } catch (e) {
        console.log(`  Method 1 failed for ${fieldName}: ${e.message}`);
      }
      
      // Method 2: Click on the ant-select container that contains our input
      if (!dropdownOpened) {
        try {
          const selectContainer = await page.evaluate((sel) => {
            const input = document.querySelector(sel);
            if (!input) return null;
            
            // Walk up the DOM to find the .ant-select container
            let element = input;
            while (element && element.parentElement) {
              element = element.parentElement;
              if (element.classList && element.classList.contains('ant-select')) {
                element.click();
                return true;
              }
            }
            return false;
          }, selector);
          
          if (selectContainer) {
            await new Promise(resolve => setTimeout(resolve, 800));
            const dropdown = await page.$('.ant-select-dropdown:not(.ant-select-dropdown-hidden)');
            if (dropdown) dropdownOpened = true;
          }
        } catch (e) {
          console.log(`  Method 2 failed for ${fieldName}: ${e.message}`);
        }
      }
      
      // Method 3: Force click using JavaScript (especially useful for arrival date)
      if (!dropdownOpened && fieldName === 'arrivalDate') {
        try {
          console.log(`  Trying JavaScript force click for ${fieldName}...`);
          await page.evaluate((sel) => {
            const input = document.querySelector(sel);
            if (input) {
              // Try multiple approaches
              input.focus();
              input.click();
              
              // Find and click the parent ant-select
              let parent = input.parentElement;
              while (parent) {
                if (parent.classList && parent.classList.contains('ant-select')) {
                  parent.click();
                  break;
                }
                parent = parent.parentElement;
              }
              
              // Dispatch click events
              input.dispatchEvent(new MouseEvent('click', { bubbles: true }));
              input.dispatchEvent(new MouseEvent('mousedown', { bubbles: true }));
              input.dispatchEvent(new MouseEvent('mouseup', { bubbles: true }));
            }
          }, selector);
          
          await new Promise(resolve => setTimeout(resolve, 1200));
          const dropdown = await page.$('.ant-select-dropdown:not(.ant-select-dropdown-hidden)');
          if (dropdown) {
            dropdownOpened = true;
            console.log(`  Method 3 (JS force click) succeeded for ${fieldName}`);
          }
        } catch (e) {
          console.log(`  Method 3 failed for ${fieldName}: ${e.message}`);
        }
      }
      
      // Method 4: Alternative selector approach for arrival date
      if (!dropdownOpened && fieldName === 'arrivalDate') {
        try {
          console.log(`  Trying alternative selector approach for ${fieldName}...`);
          const altSelectors = [
            '#tanggalKedatangan .ant-select-selector',
            '.ant-form-item:has(#tanggalKedatangan) .ant-select',
            '[id*="tanggalKedatangan"]',
            '.ant-select:has(#tanggalKedatangan)'
          ];
          
          for (const altSel of altSelectors) {
            try {
              const element = await page.$(altSel);
              if (element) {
                await element.click();
                await new Promise(resolve => setTimeout(resolve, 800));
                const dropdown = await page.$('.ant-select-dropdown:not(.ant-select-dropdown-hidden)');
                if (dropdown) {
                  dropdownOpened = true;
                  console.log(`  Alternative selector "${altSel}" worked for ${fieldName}`);
                  break;
                }
              }
            } catch (e) {
              continue;
            }
          }
        } catch (e) {
          console.log(`  Method 4 failed for ${fieldName}: ${e.message}`);
        }
      }
      
      if (!dropdownOpened) {
        console.log(`  ❌ Attempt ${attempt}: Could not open ${fieldName} dropdown`);
        if (attempt < maxRetries) {
          console.log(`  ⏳ Waiting before retry...`);
          await new Promise(resolve => setTimeout(resolve, 1500)); // Wait before retry
          continue; // Try again
        } else {
          console.log(`❌ ${fieldName}: Failed to open dropdown after ${maxRetries} attempts`);
          return false;
        }
      }
      
      // Wait for dropdown options to appear - extra time for certain dropdowns
      const optionsWaitTime = fieldName.includes('Month') ? 1000 : 500; // Extra wait for month dropdowns
      await new Promise(resolve => setTimeout(resolve, optionsWaitTime));
      
      // Add specific debugging for month dropdown
      if (fieldName === 'dateOfBirthMonth') {
        console.log(`🔍 MONTH DEBUG: Looking for value "${value}"`);
        
        // Log all available options in the dropdown using field-specific selector
        try {
          const dropdownListId = dropdownListMap[fieldName];
          const specificSelector = dropdownListId ? `#${dropdownListId} .ant-select-item` : '.ant-select-dropdown .ant-select-item';
          console.log(`🔍 MONTH DEBUG: Using selector: ${specificSelector}`);
          
          const allOptions = await page.$$(specificSelector);
          console.log(`🔍 MONTH DEBUG: Found ${allOptions.length} options in month dropdown:`);
          
          for (let i = 0; i < Math.min(allOptions.length, 15); i++) {
            const option = allOptions[i];
            const title = await option.evaluate(el => el.getAttribute('title'));
            const text = await option.evaluate(el => el.textContent?.trim());
            console.log(`  Option ${i}: title="${title}", text="${text}"`);
          }
        } catch (e) {
          console.log(`🔍 MONTH DEBUG: Could not read options: ${e.message}`);
        }
      }
      
      // Try different option selection strategies using field-specific selectors
      let optionFound = false;
      const dropdownListId = dropdownListMap[fieldName];
      const baseSelector = dropdownListId ? `#${dropdownListId}` : '.ant-select-dropdown';
      
      // Strategy 1: Look for exact title match in specific dropdown
      try {
        const optionSelector1 = `${baseSelector} .ant-select-item[title="${value}"]`;
        const option = await page.$(optionSelector1);
        if (option) {
          await option.click();
          optionFound = true;
          console.log(`  → Strategy 1 (exact title): Found "${value}"`);
        } else if (fieldName === 'dateOfBirthMonth') {
          console.log(`🔍 MONTH DEBUG: Strategy 1 failed - no element with title="${value}" in ${baseSelector}`);
        }
      } catch (e) {
        if (fieldName === 'dateOfBirthMonth') {
          console.log(`🔍 MONTH DEBUG: Strategy 1 error: ${e.message}`);
        }
      }
      
      // Strategy 2: Look for partial title match in specific dropdown
      if (!optionFound) {
        try {
          const optionSelector2 = `${baseSelector} .ant-select-item[title*="${value}"]`;
          const option = await page.$(optionSelector2);
          if (option) {
            await option.click();
            optionFound = true;
            console.log(`  → Strategy 2 (partial title): Found "${value}"`);
          }
        } catch (e) {
          // Try next strategy
        }
      }
      
      // Strategy 3: Look for text content match in specific dropdown (exact and partial)
      if (!optionFound) {
        try {
          const options = await page.$$(`${baseSelector} .ant-select-item`);
          for (let option of options) {
            const text = await option.evaluate(el => el.textContent?.trim());
            if (text && (text === value || text.includes(value))) {
              await option.click();
              optionFound = true;
              console.log(`  → Strategy 3 (text content): Found "${text}" for "${value}"`);
              break;
            }
          }
        } catch (e) {
          // Try next strategy  
        }
      }
      
      // Strategy 4: For nationality, try searching by country code only
      if (!optionFound && fieldName === 'nationality') {
        try {
          const countryCode = value.split(' - ')[0]; // Extract "US" from "US - UNITED STATES"
          const options = await page.$$(`${baseSelector} .ant-select-item`);
          for (let option of options) {
            const text = await option.evaluate(el => el.textContent?.trim());
            if (text && text.startsWith(countryCode + ' -')) {
              await option.click();
              optionFound = true;
              console.log(`  → Strategy 4 (country code): Found "${text}" for code "${countryCode}"`);
              break;
            }
          }
        } catch (e) {
          // Try next strategy
        }
      }
      
      // Strategy 5: For date fields, try numeric matching and loose matching
      if (!optionFound && (fieldName.includes('date') || fieldName.includes('Date') || fieldName.includes('Month') || fieldName.includes('Day') || fieldName.includes('Year'))) {
        try {
          const options = await page.$$(`${baseSelector} .ant-select-item`);
          for (let option of options) {
            const text = await option.evaluate(el => el.textContent?.trim());
            // Try exact match first, then partial match
            if (text && (text === value || text.includes(value) || value.includes(text))) {
              await option.click();
              optionFound = true;
              console.log(`  → Strategy 5 (date field): Found "${text}" for "${value}"`);
              break;
            }
          }
        } catch (e) {
          // Last resort failed
        }
      }
      
      if (optionFound) {
        console.log(`✅ ${fieldName}: "${value}" selected successfully on attempt ${attempt}`);
        
        // Close the dropdown after selection to prevent interference with next dropdown
        await new Promise(resolve => setTimeout(resolve, 300));
        await page.evaluate(() => {
          document.body.click(); // Click elsewhere to close dropdown
        });
        await new Promise(resolve => setTimeout(resolve, 200));
        
        return true; // Success - exit retry loop
      } else {
        console.log(`  ❌ Attempt ${attempt}: Option "${value}" not found in ${fieldName} dropdown`);
        
        // Close the dropdown even if selection failed
        await page.evaluate(() => {
          document.body.click();
        });
        
        if (attempt < maxRetries) {
          console.log(`  ⏳ Waiting before retry...`);
          await new Promise(resolve => setTimeout(resolve, 1500)); // Wait before retry
          continue; // Try again
        } else {
          console.log(`❌ ${fieldName}: Failed to find option "${value}" after ${maxRetries} attempts`);
          return false;
        }
      }
      
    } catch (error) {
      console.log(`  ❌ Attempt ${attempt} failed for ${fieldName}: ${error.message}`);
      
      if (attempt < maxRetries) {
        console.log(`  ⏳ Waiting before retry...`);
        await new Promise(resolve => setTimeout(resolve, 1500)); // Wait before retry
        continue; // Try again
      } else {
        console.log(`❌ ${fieldName}: Failed after ${maxRetries} attempts - ${error.message}`);
        return false;
      }
    }
  }
}

async function safeDropdownSelectFamily(page, rowIndex, value, fieldName, maxRetries = 3) {
  console.log(`👨‍👩‍👧‍👦 ${fieldName}: Attempting family nationality selection for row ${rowIndex}`);
  
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      console.log(`🔄 ${fieldName} (attempt ${attempt}/${maxRetries}): Trying to select "${value}"`);
      
      // Close any open dropdowns first
      await page.evaluate(() => {
        document.body.click();
      });
      
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Build the specific selectors for this family member row
      const inputSelector = `#dataKeluarga_${rowIndex}_kodeNegara`;
      const dropdownListId = `dataKeluarga_${rowIndex}_kodeNegara_list`;
      
      console.log(`🎯 Using input selector: ${inputSelector}`);
      console.log(`🎯 Expected dropdown list ID: ${dropdownListId}`);
      
      // Wait for the input field to be available
      await page.waitForSelector(inputSelector, { visible: true, timeout: 5000 });
      
      // Try different methods to open the dropdown
      let dropdownOpened = false;
      
      // Method 1: Click on the input directly
      try {
        await page.click(inputSelector);
        await new Promise(resolve => setTimeout(resolve, 800));
        const dropdown = await page.$('.ant-select-dropdown:not(.ant-select-dropdown-hidden)');
        if (dropdown) {
          dropdownOpened = true;
          console.log(`✅ Method 1 (direct input click) opened dropdown`);
        }
      } catch (e) {
        console.log(`  Method 1 failed: ${e.message}`);
      }
      
      // Method 2: Find and click the parent .ant-select container
      if (!dropdownOpened) {
        try {
          const selectContainer = await page.evaluate((inputSel) => {
            const input = document.querySelector(inputSel);
            if (!input) return false;
            
            // Walk up to find the .ant-select container
            let element = input;
            while (element && element.parentElement) {
              element = element.parentElement;
              if (element.classList && element.classList.contains('ant-select')) {
                element.click();
                return true;
              }
            }
            return false;
          }, inputSelector);
          
          if (selectContainer) {
            await new Promise(resolve => setTimeout(resolve, 800));
            const dropdown = await page.$('.ant-select-dropdown:not(.ant-select-dropdown-hidden)');
            if (dropdown) {
              dropdownOpened = true;
              console.log(`✅ Method 2 (parent container click) opened dropdown`);
            }
          }
        } catch (e) {
          console.log(`  Method 2 failed: ${e.message}`);
        }
      }
      
      // Method 3: Force JavaScript click
      if (!dropdownOpened) {
        try {
          await page.evaluate((inputSel) => {
            const input = document.querySelector(inputSel);
            if (input) {
              input.focus();
              input.click();
              
              // Find parent ant-select and click it too
              let parent = input.parentElement;
              while (parent) {
                if (parent.classList && parent.classList.contains('ant-select')) {
                  parent.click();
                  break;
                }
                parent = parent.parentElement;
              }
            }
          }, inputSelector);
          
          await new Promise(resolve => setTimeout(resolve, 1000));
          const dropdown = await page.$('.ant-select-dropdown:not(.ant-select-dropdown-hidden)');
          if (dropdown) {
            dropdownOpened = true;
            console.log(`✅ Method 3 (JavaScript force click) opened dropdown`);
          }
        } catch (e) {
          console.log(`  Method 3 failed: ${e.message}`);
        }
      }
      
      if (!dropdownOpened) {
        console.log(`❌ Attempt ${attempt}: Could not open family nationality dropdown`);
        if (attempt < maxRetries) {
          await new Promise(resolve => setTimeout(resolve, 1500));
          continue;
        } else {
          console.log(`❌ Failed to open family nationality dropdown after ${maxRetries} attempts`);
          return false;
        }
      }
      
      // Wait for options to appear
      await new Promise(resolve => setTimeout(resolve, 800));
      
      // Try different selection strategies for family nationality
      let optionFound = false;
      
      // Strategy 1: Look for option by title attribute using specific dropdown list ID
      try {
        const optionSelector = `#${dropdownListId} .ant-select-item[title="${value}"]`;
        console.log(`🎯 Strategy 1: Looking for selector: ${optionSelector}`);
        
        const option = await page.$(optionSelector);
        if (option) {
          await option.click();
          optionFound = true;
          console.log(`✅ Strategy 1 (exact title match): Found and clicked "${value}"`);
        } else {
          console.log(`⚠️ Strategy 1: No option found with title="${value}" in ${dropdownListId}`);
        }
      } catch (e) {
        console.log(`❌ Strategy 1 error: ${e.message}`);
      }
      
      // Strategy 2: Look for option by text content in specific dropdown
      if (!optionFound) {
        try {
          console.log(`🎯 Strategy 2: Looking in ${dropdownListId} for text content`);
          
          const options = await page.$$(`#${dropdownListId} .ant-select-item`);
          console.log(`   Found ${options.length} options in family dropdown list`);
          
          for (let option of options) {
            const text = await option.evaluate(el => el.textContent?.trim());
            const title = await option.evaluate(el => el.getAttribute('title'));
            
            if (text === value || title === value) {
              await option.click();
              optionFound = true;
              console.log(`✅ Strategy 2 (text/title match): Found "${text}" with title "${title}"`);
              break;
            }
          }
        } catch (e) {
          console.log(`❌ Strategy 2 error: ${e.message}`);
        }
      }
      
      // Strategy 3: Generic dropdown fallback (search in any visible dropdown)
      if (!optionFound) {
        try {
          console.log(`🎯 Strategy 3: Fallback to generic dropdown search`);
          
          const options = await page.$$('.ant-select-dropdown:not(.ant-select-dropdown-hidden) .ant-select-item');
          console.log(`   Found ${options.length} options in visible dropdown`);
          
          for (let option of options) {
            const text = await option.evaluate(el => el.textContent?.trim());
            const title = await option.evaluate(el => el.getAttribute('title'));
            
            if (text === value || title === value || (title && title.includes(value))) {
              await option.click();
              optionFound = true;
              console.log(`✅ Strategy 3 (generic fallback): Found "${text}" with title "${title}"`);
              break;
            }
          }
        } catch (e) {
          console.log(`❌ Strategy 3 error: ${e.message}`);
        }
      }
      
      if (optionFound) {
        // Wait a moment for the selection to register
        await new Promise(resolve => setTimeout(resolve, 500));
        
        // Verify the selection was successful
        const selectedValue = await page.evaluate((inputSel) => {
          const input = document.querySelector(inputSel);
          return input ? input.value : null;
        }, inputSelector);
        
        console.log(`✅ Family nationality selected successfully: "${selectedValue}"`);
        return true;
      } else {
        console.log(`❌ Attempt ${attempt}: No matching option found for "${value}"`);
        if (attempt < maxRetries) {
          await new Promise(resolve => setTimeout(resolve, 1500));
          continue;
        }
      }
      
    } catch (error) {
      console.log(`❌ Attempt ${attempt} failed: ${error.message}`);
      if (attempt < maxRetries) {
        await new Promise(resolve => setTimeout(resolve, 1500));
        continue;
      }
    }
  }
  
  console.log(`❌ ${fieldName}: Failed to select family nationality after ${maxRetries} attempts`);
  return false;
}

async function safeDropdownSelectGoods(page, rowIndex, value, fieldName, maxRetries = 3) {
  console.log(`📦 ${fieldName}: Attempting goods currency selection for row ${rowIndex}`);
  
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      console.log(`🔄 ${fieldName} (attempt ${attempt}/${maxRetries}): Trying to select "${value}"`);
      
      // Close any open dropdowns first
      await page.evaluate(() => {
        document.body.click();
      });
      
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Build the specific selectors for this goods row
      const inputSelector = `#dataBarang_${rowIndex}_kodeMataUang`;
      const dropdownListId = `dataBarang_${rowIndex}_kodeMataUang_list`;
      
      console.log(`🎯 Using input selector: ${inputSelector}`);
      console.log(`🎯 Expected dropdown list ID: ${dropdownListId}`);
      
      // Wait for the input field to be available
      await page.waitForSelector(inputSelector, { visible: true, timeout: 5000 });
      
      // Try different methods to open the dropdown
      let dropdownOpened = false;
      
      // Method 1: Click on the input directly
      try {
        await page.click(inputSelector);
        await new Promise(resolve => setTimeout(resolve, 800));
        const dropdown = await page.$('.ant-select-dropdown:not(.ant-select-dropdown-hidden)');
        if (dropdown) {
          dropdownOpened = true;
          console.log(`✅ Method 1 (direct input click) opened dropdown`);
        }
      } catch (e) {
        console.log(`  Method 1 failed: ${e.message}`);
      }
      
      // Method 2: Find and click the parent .ant-select container
      if (!dropdownOpened) {
        try {
          const selectContainer = await page.evaluate((inputSel) => {
            const input = document.querySelector(inputSel);
            if (!input) return false;
            
            // Walk up to find the .ant-select container
            let element = input;
            while (element && element.parentElement) {
              element = element.parentElement;
              if (element.classList && element.classList.contains('ant-select')) {
                element.click();
                return true;
              }
            }
            return false;
          }, inputSelector);
          
          if (selectContainer) {
            await new Promise(resolve => setTimeout(resolve, 800));
            const dropdown = await page.$('.ant-select-dropdown:not(.ant-select-dropdown-hidden)');
            if (dropdown) {
              dropdownOpened = true;
              console.log(`✅ Method 2 (parent container click) opened dropdown`);
            }
          }
        } catch (e) {
          console.log(`  Method 2 failed: ${e.message}`);
        }
      }
      
      // Method 3: Force JavaScript click
      if (!dropdownOpened) {
        try {
          await page.evaluate((inputSel) => {
            const input = document.querySelector(inputSel);
            if (input) {
              input.focus();
              input.click();
              
              // Find parent ant-select and click it too
              let parent = input.parentElement;
              while (parent) {
                if (parent.classList && parent.classList.contains('ant-select')) {
                  parent.click();
                  break;
                }
                parent = parent.parentElement;
              }
            }
          }, inputSelector);
          
          await new Promise(resolve => setTimeout(resolve, 1000));
          const dropdown = await page.$('.ant-select-dropdown:not(.ant-select-dropdown-hidden)');
          if (dropdown) {
            dropdownOpened = true;
            console.log(`✅ Method 3 (JavaScript force click) opened dropdown`);
          }
        } catch (e) {
          console.log(`  Method 3 failed: ${e.message}`);
        }
      }
      
      if (!dropdownOpened) {
        console.log(`❌ Attempt ${attempt}: Could not open goods currency dropdown`);
        if (attempt < maxRetries) {
          await new Promise(resolve => setTimeout(resolve, 1500));
          continue;
        } else {
          console.log(`❌ Failed to open goods currency dropdown after ${maxRetries} attempts`);
          return false;
        }
      }
      
      // Wait for options to appear
      await new Promise(resolve => setTimeout(resolve, 800));
      
      // Try different selection strategies for goods currency
      let optionFound = false;
      
      // Strategy 1 (Default): Generic dropdown search (works best with full currency names)
      try {
        console.log(`🎯 Strategy 1: Searching in visible dropdown for "${value}"`);
        
        const options = await page.$$('.ant-select-dropdown:not(.ant-select-dropdown-hidden) .ant-select-item');
        console.log(`   Found ${options.length} options in visible dropdown`);
        
        for (let option of options) {
          const text = await option.evaluate(el => el.textContent?.trim());
          const title = await option.evaluate(el => el.getAttribute('title'));
          
          // Check if option matches value (exact match or contains the currency code)
          if (text === value || title === value || 
              (title && title.includes(value)) || 
              (text && text.startsWith(value + ' -'))) {
            await option.click();
            optionFound = true;
            console.log(`✅ Strategy 1 (default): Found and selected "${title || text}"`);
            break;
          }
        }
      } catch (e) {
        console.log(`❌ Strategy 1 error: ${e.message}`);
      }
      
      // Strategy 2: Look for option by exact title in specific dropdown list
      if (!optionFound) {
        try {
          const optionSelector = `#${dropdownListId} .ant-select-item[title="${value}"]`;
          console.log(`🎯 Strategy 2: Looking for exact match: ${optionSelector}`);
          
          const option = await page.$(optionSelector);
          if (option) {
            await option.click();
            optionFound = true;
            console.log(`✅ Strategy 2 (exact title match): Found and clicked "${value}"`);
          } else {
            console.log(`⚠️ Strategy 2: No exact match found for "${value}"`);
          }
        } catch (e) {
          console.log(`❌ Strategy 2 error: ${e.message}`);
        }
      }
      
      // Strategy 3: Look for option by text content in specific dropdown list
      if (!optionFound) {
        try {
          console.log(`🎯 Strategy 3: Looking in ${dropdownListId} for text content`);
          
          const options = await page.$$(`#${dropdownListId} .ant-select-item`);
          console.log(`   Found ${options.length} options in specific dropdown list`);
          
          for (let option of options) {
            const text = await option.evaluate(el => el.textContent?.trim());
            const title = await option.evaluate(el => el.getAttribute('title'));
            
            if (text === value || title === value) {
              await option.click();
              optionFound = true;
              console.log(`✅ Strategy 3 (text/title match): Found "${text}" with title "${title}"`);
              break;
            }
          }
        } catch (e) {
          console.log(`❌ Strategy 3 error: ${e.message}`);
        }
      }
      
      if (optionFound) {
        // Wait a moment for the selection to register
        await new Promise(resolve => setTimeout(resolve, 500));
        
        // Verify the selection was successful
        const selectedValue = await page.evaluate((inputSel) => {
          const input = document.querySelector(inputSel);
          return input ? input.value : null;
        }, inputSelector);
        
        console.log(`✅ Goods currency selected successfully: "${selectedValue}"`);
        return true;
      } else {
        console.log(`❌ Attempt ${attempt}: No matching option found for "${value}"`);
        if (attempt < maxRetries) {
          await new Promise(resolve => setTimeout(resolve, 1500));
          continue;
        }
      }
      
    } catch (error) {
      console.log(`❌ Attempt ${attempt} failed: ${error.message}`);
      if (attempt < maxRetries) {
        await new Promise(resolve => setTimeout(resolve, 1500));
        continue;
      }
    }
  }
  
  console.log(`❌ ${fieldName}: Failed to select goods currency after ${maxRetries} attempts`);
  return false;
}

async function checkForValidationErrors(page) {
  console.log('🔍 Checking for validation errors...');
  
  try {
    const errors = await page.evaluate(() => {
      const result = {
        hasErrors: false,
        errorMessages: [],
        invalidFields: [],
        alertMessages: []
      };
      
      // Check for validation error fields
      const errorFields = document.querySelectorAll('.ant-form-item-has-error, input[aria-invalid="true"], .ant-form-item-explain-error');
      if (errorFields.length > 0) {
        result.hasErrors = true;
        errorFields.forEach(field => {
          const fieldName = field.id || field.name || 'unknown field';
          const errorMsg = field.closest('.ant-form-item')?.querySelector('.ant-form-item-explain-error')?.textContent;
          result.invalidFields.push({
            field: fieldName,
            error: errorMsg || 'validation error'
          });
        });
      }
      
      // Check for alert messages
      const alerts = document.querySelectorAll('.ant-alert-error, .ant-message-error, .ant-notification-error');
      alerts.forEach(alert => {
        result.hasErrors = true;
        result.alertMessages.push(alert.textContent?.trim());
      });
      
      // Check for error messages in form
      const errorTexts = document.querySelectorAll('.ant-form-item-explain-error, .ant-form-item-extra');
      errorTexts.forEach(errorText => {
        const text = errorText.textContent?.trim();
        if (text && text.length > 0) {
          result.hasErrors = true;
          result.errorMessages.push(text);
        }
      });
      
      // Check if modal appeared (indicates successful submission)
      const modal = document.querySelector('.ant-modal:not(.ant-modal-hidden)');
      result.modalAppeared = !!modal;
      
      // Check if QR code is visible (strong indicator of success)
      const qrCode = document.querySelector('#myqrcode');
      result.qrCodeVisible = !!qrCode;
      
      return result;
    });
    
    return errors;
  } catch (error) {
    console.log(`❌ Error checking validation: ${error.message}`);
    return { hasErrors: false, errorMessages: [] };
  }
}

async function navigateToNextStep(page, currentStep) {
  try {
    console.log(`\n➡️ Navigating from step ${currentStep} to step ${currentStep + 1}...`);
    
    // Look for Next button (various possible text values)
    const nextButtonSelectors = [
      'button:contains("Next")',
      'button:contains("Lanjut")', 
      'button:contains("Selanjutnya")',
      '.ant-btn:contains("Next")',
      '.ant-btn:contains("Lanjut")'
    ];
    
    let navigationSuccess = false;
    
    // Try different approaches to find and click Next button
    const buttons = await page.$$('button');
    for (let button of buttons) {
      const buttonText = await button.evaluate(el => el.textContent?.trim().toLowerCase());
      
      if (buttonText && (buttonText.includes('next') || buttonText.includes('lanjut') || buttonText.includes('selanjutnya'))) {
        const isEnabled = await button.evaluate(el => !el.disabled);
        
        if (isEnabled) {
          console.log(`Found Next button: "${buttonText}"`);
          await button.click();
          navigationSuccess = true;
          break;
        } else {
          console.log(`Next button found but disabled: "${buttonText}"`);
        }
      }
    }
    
    if (navigationSuccess) {
      // Wait for page transition
      await new Promise(resolve => setTimeout(resolve, 2000));
      console.log(`✅ Successfully navigated to step ${currentStep + 1}`);
      return true;
    } else {
      console.log(`❌ No enabled Next button found on step ${currentStep}`);
      return false;
    }
    
  } catch (error) {
    console.log(`❌ Navigation failed: ${error.message}`);
    return false;
  }
}

async function fillFormStep(page, stepName, stepFields, stepNumber) {
  console.log(`\n📝 Filling ${stepName} (Step ${stepNumber}):`);
  
  let successCount = 0;
  let totalFields = Object.keys(stepFields).length;
  
  for (const [fieldKey, selector] of Object.entries(stepFields)) {
    // Wait a bit between fields
    await new Promise(resolve => setTimeout(resolve, 300));
    
    let value = testFormData[fieldKey];
    
    // Handle special cases
    if (fieldKey === 'dateOfBirthDay') {
      value = testFormData.dateOfBirth.split('-')[2]; // Day
    } else if (fieldKey === 'dateOfBirthMonth') {
      value = testFormData.dateOfBirth.split('-')[1]; // Month  
    } else if (fieldKey === 'dateOfBirthYear') {
      value = testFormData.dateOfBirth.split('-')[0]; // Year
    } else if (fieldKey === 'consentAccurate') {
      // Handle checkbox
      try {
        await page.waitForSelector(selector, { visible: true, timeout: 5000 });
        await page.click(selector);
        console.log(`✅ Consent checkbox: checked`);
        successCount++;
        continue;
      } catch (error) {
        console.log(`❌ Consent checkbox failed: ${error.message}`);
        continue;
      }
    }
    
    // Try dropdown first, then text input
    if (selector.includes('Kedatangan') || selector.includes('Negara') || selector.includes('Lahir')) {
      if (await safeDropdownSelect(page, selector, value, fieldKey)) {
        successCount++;
      }
    } else {
      if (await safeFieldInput(page, selector, value, fieldKey)) {
        successCount++;
      }
    }
  }
  
  console.log(`📊 Step ${stepNumber} completion: ${successCount}/${totalFields} fields filled`);
  return successCount === totalFields;
}

// Function to fill declared goods
async function fillDeclaredGoods(page, declaredGoods) {
  console.log(`📋 Adding ${declaredGoods.length} declared goods items...`);
  
  try {
    for (let i = 0; i < declaredGoods.length; i++) {
      const item = declaredGoods[i];
      console.log(`📦 Adding goods item ${i + 1}: ${item.description}`);
      
      // Find the add button fresh for each goods item (DOM may have changed)
      let currentAddButton = null;
      
      // Look for the specific Tambah button with plus-circle icon
      // Note: Avoid :has() pseudo-selector as it may not work reliably with Puppeteer
      const addButtonSelectors = [
        'button.ant-btn-primary',  // Primary button (likely the Tambah button)
        'button[type="button"].ant-btn-primary',
        '.ant-btn-primary.ant-btn-color-primary',
        'button span:contains("Tambah")',  // Button containing Tambah text
        'button[type="button"]'  // Generic button fallback
      ];
      
      // Try to find the button using various methods
      for (const selector of addButtonSelectors) {
        try {
          // For goods table, look for primary buttons that contain Tambah
          if (selector === 'button.ant-btn-primary' || selector.includes('ant-btn-primary')) {
            const buttons = await page.$$(selector);
            for (let btn of buttons) {
              const buttonInfo = await btn.evaluate(el => ({
                text: el.textContent?.toLowerCase().trim(),
                hasPlus: !!el.querySelector('.anticon-plus-circle'),
                isVisible: el.offsetParent !== null,
                isDisabled: el.disabled,
                isDanger: el.classList.contains('ant-btn-dangerous')
              }));
              
              // Look for visible, enabled button with "tambah" text or plus icon
              if (buttonInfo.isVisible && !buttonInfo.isDisabled && !buttonInfo.isDanger) {
                if (buttonInfo.text?.includes('tambah') || buttonInfo.hasPlus) {
                  currentAddButton = btn;
                  console.log(`✅ Found goods add button: text="${buttonInfo.text}", hasPlus=${buttonInfo.hasPlus}`);
                  break;
                }
              }
            }
            if (currentAddButton) break;
          } else {
            currentAddButton = await page.$(selector);
            if (currentAddButton) {
              console.log(`✅ Found goods add button with selector: ${selector}`);
              break;
            }
          }
        } catch (error) {
          // Continue to next selector
        }
      }
      
      // Fallback: look for any button containing "tambah"
      if (!currentAddButton) {
        const allButtons = await page.$$('button');
        for (let button of allButtons) {
          const buttonInfo = await button.evaluate(el => ({
            text: el.textContent?.toLowerCase().trim(),
            isVisible: el.offsetParent !== null,
            isDisabled: el.disabled,
            isDanger: el.classList.contains('ant-btn-dangerous'),
            hasDelete: !!el.querySelector('.anticon-delete')
          }));
          
          if (buttonInfo.text?.includes('tambah') && 
              buttonInfo.isVisible && 
              !buttonInfo.isDisabled && 
              !buttonInfo.isDanger && 
              !buttonInfo.hasDelete) {
            currentAddButton = button;
            console.log(`✅ Found goods add button (fallback): "${buttonInfo.text}"`);
            break;
          }
        }
      }
      
      if (!currentAddButton) {
        console.log(`❌ Could not find add button for goods item ${i + 1}`);
        continue; // Skip this item but continue with others
      }
      
      // Click the freshly found add button
      try {
        await currentAddButton.click();
        console.log(`✅ Clicked add button for goods item ${i + 1}`);
        await new Promise(resolve => setTimeout(resolve, 1000));
      } catch (clickError) {
        console.log(`❌ Failed to click add button for goods item ${i + 1}: ${clickError.message}`);
        continue; // Skip this item but continue with others
      }
      
      // Use correct field patterns based on actual HTML structure
      const rowIndex = i;
      let itemSuccess = 0;
      
      // Define the correct field selectors for this row (Indonesian field names)
      const descriptionSelector = `#dataBarang_${rowIndex}_uraian`;
      const quantitySelector = `#dataBarang_${rowIndex}_jumlahSatuan`;
      const valueSelector = `#dataBarang_${rowIndex}_hargaSatuan`;
      const currencySelector = `#dataBarang_${rowIndex}_kodeMataUang`;
      
      // Wait for the row to be created and fields to be available
      try {
        await page.waitForSelector(descriptionSelector, { visible: true, timeout: 3000 });
        console.log(`✅ Goods item ${i + 1} row created successfully`);
      } catch (rowError) {
        console.log(`❌ Goods item ${i + 1} row not created: ${rowError.message}`);
        continue; // Skip this goods item but continue with others
      }
      
      // Fill description field
      try {
        if (await safeFieldInput(page, descriptionSelector, item.description, `Goods ${i + 1} description`)) {
          itemSuccess++;
        }
      } catch (error) {
        console.log(`❌ Goods ${i + 1} description failed: ${error.message}`);
      }
      
      // Fill quantity field
      try {
        if (await safeFieldInput(page, quantitySelector, item.quantity, `Goods ${i + 1} quantity`)) {
          itemSuccess++;
        }
      } catch (error) {
        console.log(`❌ Goods ${i + 1} quantity failed: ${error.message}`);
      }
      
      // Fill value field
      try {
        if (await safeFieldInput(page, valueSelector, item.value, `Goods ${i + 1} value`)) {
          itemSuccess++;
        }
      } catch (error) {
        console.log(`❌ Goods ${i + 1} value failed: ${error.message}`);
      }
      
      // Fill currency field (dropdown) using goods-specific function
      try {
        if (await safeDropdownSelectGoods(page, rowIndex, item.currency, `Goods ${i + 1} currency`)) {
          itemSuccess++;
        }
      } catch (error) {
        console.log(`❌ Goods ${i + 1} currency failed: ${error.message}`);
      }
      
      console.log(`📦 Goods item ${i + 1}: ${itemSuccess}/4 fields completed`);
    }
    
    console.log(`✅ Declared goods added: ${declaredGoods.length} items`);
    return true;
    
  } catch (error) {
    console.log(`❌ Declared goods filling failed: ${error.message}`);
    return false;
  }
}

// Function to fill family members
async function fillFamilyMembers(page, familyMembers) {
  console.log(`👨‍👩‍👧‍👦 Adding ${familyMembers.length} family members...`);
  
  try {
    
    // Add each family member
    for (let i = 0; i < familyMembers.length; i++) {
      const member = familyMembers[i];
      console.log(`👤 Adding family member ${i + 1}: ${member.name}`);
      
      // Find the add button fresh for each family member (DOM may have changed)
      let currentAddButton = null;
      
      // First try the specific selectors
      const addButtonSelectors = [
        'button[title*="Tambah"]',
        'button[title*="Add"]', 
        '.add-family',
        '.tambah-keluarga',
        'button:has-text("Tambah")',
        'button:has-text("Add")'
      ];
      
      for (const selector of addButtonSelectors) {
        try {
          currentAddButton = await page.$(selector);
          if (currentAddButton) {
            console.log(`✅ Found fresh add button with selector: ${selector}`);
            break;
          }
        } catch (error) {
          // Continue to next selector
        }
      }
      
      // If no specific add button found, look for any button containing "tambah" or "add"
      if (!currentAddButton) {
        const allButtons = await page.$$('button');
        for (let button of allButtons) {
          const buttonText = await button.evaluate(el => el.textContent?.toLowerCase().trim());
          if (buttonText && (buttonText.includes('tambah') || buttonText.includes('add'))) {
            currentAddButton = button;
            console.log(`✅ Found fresh add button with text: "${buttonText}"`);
            break;
          }
        }
      }
      
      if (!currentAddButton) {
        console.log(`❌ Could not find add button for family member ${i + 1}`);
        continue; // Skip this family member but continue with others
      }
      
      // Click the freshly found add button
      try {
        await currentAddButton.click();
        console.log(`✅ Clicked add button for family member ${i + 1}`);
        await new Promise(resolve => setTimeout(resolve, 1000));
      } catch (clickError) {
        console.log(`❌ Failed to click add button for family member ${i + 1}: ${clickError.message}`);
        continue; // Skip this family member but continue with others
      }
      
      // Fill family member fields (look for dynamic selectors)
      const rowIndex = i; // Assuming 0-based indexing
      
      // Define the field selectors for this row
      const passportSelector = `#dataKeluarga_${rowIndex}_paspor`;
      const nameSelector = `#dataKeluarga_${rowIndex}_nama`;  
      const nationalitySelector = `#dataKeluarga_${rowIndex}_kodeNegara`;
      
      // Wait for the row to be created and fields to be available
      try {
        await page.waitForSelector(passportSelector, { visible: true, timeout: 3000 });
        console.log(`✅ Family member ${i + 1} row created successfully`);
      } catch (rowError) {
        console.log(`❌ Family member ${i + 1} row not created: ${rowError.message}`);
        continue; // Skip this family member but continue with others
      }
      
      let memberSuccess = 0;
      
      // Fill passport number
      try {
        if (await safeFieldInput(page, passportSelector, member.passportNumber, `Family ${i + 1} passport`)) {
          memberSuccess++;
        }
      } catch (error) {
        console.log(`❌ Family ${i + 1} passport failed: ${error.message}`);
      }
      
      // Fill name
      try {
        if (await safeFieldInput(page, nameSelector, member.name, `Family ${i + 1} name`)) {
          memberSuccess++;
        }
      } catch (error) {
        console.log(`❌ Family ${i + 1} name failed: ${error.message}`);
      }
      
      // Fill nationality (use exact format from the family member dropdown)
      const familyCountryMap = {
        'US': 'US - UNITED STATES',
        'GB': 'GB - UNITED KINGDOM', 
        'AU': 'AU - AUSTRALIA',
        'SG': 'SG - SINGAPORE',
        'MY': 'MY - MALAYSIA',
        'TH': 'TH - THAILAND',
        'CA': 'CA - CANADA',
        'NZ': 'NZ - NEW ZEALAND',
        'DE': 'DE - GERMANY',
        'FR': 'FR - FRANCE',
        'NL': 'NL - NETHERLANDS',
        'JP': 'JP - JAPAN',
        'KR': 'KR - KOREA, REPUBLIC OF',
        'CN': 'CN - CHINA',
        'IN': 'IN - INDIA'
      };
      const nationalityValue = familyCountryMap[member.nationality] || `${member.nationality} - ${member.nationality}`;
      
      console.log(`🔍 Looking for nationality option: "${nationalityValue}" for member: ${member.name}`);
      
      try {
        // Based on the HTML structure, find the parent .ant-select that contains our input
        // The structure is: td > div.ant-form-item > ... > div.ant-select > div.ant-select-selector > input#dataKeluarga_0_kodeNegara
        
        // Use the new family-specific dropdown selection function
        const nationalitySuccess = await safeDropdownSelectFamily(page, rowIndex, nationalityValue, `Family ${i + 1} nationality`);
        
        if (nationalitySuccess) {
          memberSuccess++;
          console.log(`✅ Family ${i + 1} nationality selected successfully`);
        } else {
          console.log(`❌ Family ${i + 1} nationality selection failed`);
        }
      } catch (error) {
        console.log(`❌ Family ${i + 1} nationality failed: ${error.message}`);
      }
      
      console.log(`👤 Family member ${i + 1}: ${memberSuccess}/3 fields completed`);
    }
    
    console.log(`✅ Family members added: ${familyMembers.length} members`);
    return true;
    
  } catch (error) {
    console.log(`❌ Family member filling failed: ${error.message}`);
    return false;
  }
}

async function testCustomsForm() {
  console.log('🚀 Testing customs form automation...');
  
  let browser = null;
  
  try {
    // Set up download directory
    const downloadDir = path.resolve(process.cwd(), 'downloads');
    
    // Ensure download directory exists
    try {
      await fs.mkdir(downloadDir, { recursive: true });
      console.log(`📁 Download directory created/verified: ${downloadDir}`);
    } catch (dirError) {
      console.log(`⚠️ Could not create download directory: ${dirError.message}`);
    }
    
    browser = await puppeteer.launch({
      headless: false,
      executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
      args: [
        '--no-sandbox', 
        '--disable-setuid-sandbox',
        `--download-default-directory=${downloadDir}`,
        '--disable-features=VizDisplayCompositor',
        '--disable-web-security',
        '--allow-running-insecure-content'
      ],
      slowMo: 100
    });
    
    const page = await browser.newPage();
    await page.setUserAgent('Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36');
    
    console.log('🌐 Navigating to customs website...');
    await page.goto('https://ecd.beacukai.go.id/', { 
      waitUntil: 'domcontentloaded', 
      timeout: 15000 
    });
    
    // Wait for initial page to load completely
    await page.waitForSelector('body', { timeout: 10000 });
    console.log('✅ Initial page loaded');
    
    // Wait for page content to fully render
    await page.waitForFunction(() => document.readyState === 'complete');
    await new Promise(resolve => setTimeout(resolve, 3000)); // Extra wait for dynamic content
    console.log('✅ Page content fully loaded');
    
    // Click the first "Next" button to access the form
    console.log('\n🚀 Navigating to form entry...');
    
    // Wait for Next button to be available
    await page.waitForSelector('button', { timeout: 10000 });
    
    const buttons = await page.$$('button');
    let entrySuccess = false;
    
    for (let button of buttons) {
      const buttonText = await button.evaluate(el => el.textContent?.trim().toLowerCase());
      if (buttonText && (buttonText.includes('next') || buttonText.includes('lanjut'))) {
        console.log(`Clicking entry button: "${buttonText}"`);
        // Wait for button to be clickable
        await page.waitForFunction(() => !document.querySelector('button').disabled);
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
    
    // Fill all form fields
    console.log('\n📝 Filling customs declaration form:');
    
    let successCount = 0;
    let totalFields = Object.keys(allFieldMappings).length;
    
    for (const [fieldKey, fieldConfig] of Object.entries(allFieldMappings)) {
      const selector = fieldConfig.selector;
      // Wait between fields
      await new Promise(resolve => setTimeout(resolve, 300));
      
      // Get the expected value using the field configuration
      const value = fieldConfig.getValue(testFormData);
      
      // Skip consent checkbox - will be handled on next page
      if (fieldKey === 'consentAccurate') {
        console.log(`⏭️ Skipping consent checkbox - will be handled on agreement page`);
        continue;
      }
      
      // Use the appropriate filling method based on field type
      if (fieldConfig.type === 'select') {
        if (await safeDropdownSelect(page, selector, value, fieldKey)) {
          successCount++;
        }
      } else if (fieldConfig.type === 'input') {
        if (await safeFieldInput(page, selector, value, fieldKey)) {
          successCount++;
        }
      } else if (fieldConfig.type === 'checkbox') {
        try {
          await page.waitForSelector(selector, { visible: true, timeout: 5000 });
          await page.click(selector);
          console.log(`✅ ${fieldKey}: checked`);
          successCount++;
        } catch (error) {
          console.log(`❌ ${fieldKey} checkbox failed: ${error.message}`);
        }
      }
    }
    
    console.log(`\n📊 Form completion: ${successCount}/${totalFields - 1} form fields filled`); // -1 because consent is on next page
    
    // Fill family members if any are provided
    if (testFormData.familyMembers && testFormData.familyMembers.length > 0) {
      console.log('\n👨‍👩‍👧‍👦 Adding family members...');
      await fillFamilyMembers(page, testFormData.familyMembers);
    }
    
    // Validate form before navigation
    console.log('\n🔍 Validating form before navigation...');
    const validationResult = await validateFormCompletion(page);
    
    if (!validationResult.isValid) {
      console.log('⚠️ Form validation failed, attempting to fix issues...');
      const fixAttempted = await retryFailedFields(page, validationResult);
      
      if (fixAttempted) {
        // Re-validate after fixes
        console.log('🔄 Re-validating form after fixes...');
        const reValidation = await validateFormCompletion(page);
        if (!reValidation.isValid) {
          console.log('❌ Form validation still failing after fixes - may cause navigation issues');
        } else {
          console.log('✅ Form validation passed after fixes');
        }
      } else {
        console.log('⚠️ Could not fix validation issues - proceeding anyway (may cause navigation failure)');
      }
    }
    
    // Function to verify actual page navigation occurred
    async function verifyPageNavigation(page, targetPage = 'consent') {
      try {
        console.log('🔍 Verifying page navigation...');
        
        if (targetPage === 'consent') {
          // Check for consent page indicators
          const consentIndicators = await page.evaluate(() => {
            // Look for radio buttons (goods declaration questions)
            const radioButtons = document.querySelectorAll('input[type="radio"]');
            const visibleRadios = Array.from(radioButtons).filter(radio => {
              return radio.offsetParent !== null && 
                     getComputedStyle(radio).display !== 'none' && 
                     getComputedStyle(radio).visibility !== 'hidden';
            });
            
            // Look for form fields from page 1 (should be absent)
            const page1Fields = document.querySelectorAll('#paspor, #nama, #nomorPengangkut');
            const visiblePage1Fields = Array.from(page1Fields).filter(field => {
              return field.offsetParent !== null && 
                     getComputedStyle(field).display !== 'none' && 
                     getComputedStyle(field).visibility !== 'hidden';
            });
            
            return {
              radioButtonsFound: visibleRadios.length,
              page1FieldsFound: visiblePage1Fields.length,
              currentUrl: window.location.href
            };
          });
          
          console.log(`  Radio buttons found: ${consentIndicators.radioButtonsFound}`);
          console.log(`  Page 1 fields still visible: ${consentIndicators.page1FieldsFound}`);
          console.log(`  Current URL: ${consentIndicators.currentUrl}`);
          
          // Navigation successful if we have radio buttons and no page 1 fields
          const navigationSuccess = consentIndicators.radioButtonsFound > 0 && consentIndicators.page1FieldsFound === 0;
          
          if (navigationSuccess) {
            console.log('✅ Page navigation verified - successfully reached consent page');
            return true;
          } else {
            console.log('❌ Page navigation failed - still on page 1 or unknown page state');
            return false;
          }
        }
        
        return false;
      } catch (error) {
        console.log(`❌ Navigation verification error: ${error.message}`);
        return false;
      }
    }
    
    // Navigate to next step for consent checkbox with verification
    console.log('\n➡️ Navigating to consent/agreement page...');
    let actualNavigationSuccess = false;
    const maxNavigationAttempts = 3;
    
    for (let attempt = 1; attempt <= maxNavigationAttempts; attempt++) {
      console.log(`🔄 Navigation attempt ${attempt}/${maxNavigationAttempts}`);
      
      // Find and click Next button
      let buttonClicked = false;
      const nextButtons = await page.$$('button');
      for (let button of nextButtons) {
        const buttonText = await button.evaluate(el => el.textContent?.trim().toLowerCase());
        if (buttonText && (buttonText.includes('next') || buttonText.includes('lanjut') || buttonText.includes('selanjutnya'))) {
          console.log(`Found Next button: "${buttonText}"`);
          await button.click();
          buttonClicked = true;
          break;
        }
      }
      
      if (!buttonClicked) {
        console.log('❌ No Next button found');
        break;
      }
      
      // Wait for potential page change
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Verify if navigation actually succeeded
      const navigationVerified = await verifyPageNavigation(page, 'consent');
      
      if (navigationVerified) {
        actualNavigationSuccess = true;
        break;
      } else {
        console.log(`❌ Navigation attempt ${attempt} failed - trying validation fixes`);
        
        // Re-run form validation and fixing before retry
        if (attempt < maxNavigationAttempts) {
          console.log('🔄 Re-running form validation before retry...');
          const retryValidation = await validateFormCompletion(page);
          if (!retryValidation.isValid) {
            await retryFailedFields(page, retryValidation);
          }
          await new Promise(resolve => setTimeout(resolve, 1000));
        }
      }
    }
    
    if (actualNavigationSuccess) {
      console.log('✅ Successfully navigated to consent/agreement page');
      
      // Handle goods declaration radio buttons first
      console.log('\n📋 Handling goods declaration questions...');
      
      // Function to select radio button by looking for "Tidak" (No) options
      async function selectRadioButton(page, questionText, choice = 'Tidak') {
        try {
          // Look for radio buttons with the specified choice
          const radioButtons = await page.$$('input[type="radio"]');
          
          for (let radio of radioButtons) {
            const radioValue = await radio.evaluate(el => el.value);
            const radioLabel = await radio.evaluate(el => {
              // Find the associated label or parent text
              const parentElement = el.closest('label') || el.parentElement;
              return parentElement ? parentElement.textContent?.trim() : '';
            });
            
            if (radioLabel.includes(choice) || radioValue === choice) {
              await radio.click();
              console.log(`✅ Selected "${choice}" for radio button`);
              return true;
            }
          }
          return false;
        } catch (error) {
          console.log(`❌ Radio button selection failed: ${error.message}`);
          return false;
        }
      }
      
      // Handle goods declaration based on test data
      const declareGoods = testFormData.hasGoodsToDeclarate;
      const choice = declareGoods ? 'Ya' : 'Tidak';
      console.log(`📦 Goods declaration: Selecting "${choice}" (${declareGoods ? 'Yes' : 'No'})...`);
      let goodsDeclarationSuccess = false;
      
      try {
        // Look for radio buttons with the appropriate choice
        const targetValue = declareGoods ? 'Ya' : 'Tidak';
        const radioButtons = await page.$$(`input[type="radio"][value="${targetValue}"], input[type="radio"][value="${targetValue.toLowerCase()}"]`);
        
        if (radioButtons.length > 0) {
          // Click the first matching radio button for main goods declaration
          await radioButtons[0].click();
          console.log(`✅ Main goods declaration: Selected "${choice}" (${declareGoods ? 'Yes' : 'No'})`);
          goodsDeclarationSuccess = true;
        } else {
          console.log(`⚠️ No "${choice}" radio buttons found, trying alternative approach...`);
          
          // Alternative approach - look for any radio buttons and select based on position
          const allRadios = await page.$$('input[type="radio"]');
          if (allRadios.length >= 2) {
            // Typically: first button is "Ya" (Yes), second is "Tidak" (No)
            const radioIndex = declareGoods ? 0 : 1;
            await allRadios[radioIndex].click();
            console.log(`✅ Selected ${declareGoods ? 'first' : 'second'} radio button option (${choice})`);
            goodsDeclarationSuccess = true;
          }
        }
        
        // If goods are declared, fill the goods table
        if (goodsDeclarationSuccess && declareGoods && testFormData.declaredGoods && testFormData.declaredGoods.length > 0) {
          console.log('\n📋 Filling declared goods...');
          await new Promise(resolve => setTimeout(resolve, 1000)); // Wait for goods table to appear
          await fillDeclaredGoods(page, testFormData.declaredGoods);
        }
        
      } catch (error) {
        console.log(`❌ Goods declaration selection failed: ${error.message}`);
      }
      
      // Handle technology devices radio button based on test data
      const hasTechnologyDevices = testFormData.hasTechnologyDevices;
      const techChoice = hasTechnologyDevices ? 'true' : 'false';
      const techLabel = hasTechnologyDevices ? 'Ya' : 'Tidak';
      console.log(`📱 Technology devices declaration: Selecting "${techLabel}" (${hasTechnologyDevices ? 'Yes' : 'No'})...`);
      let cellularRadioSuccess = false;
      
      try {
        // Look specifically for radio buttons with name="bringGadgets"
        const bringGadgetsRadios = await page.$$('input[type="radio"][name="bringGadgets"]');
        console.log(`Found ${bringGadgetsRadios.length} bringGadgets radio buttons`);
        
        if (bringGadgetsRadios.length > 0) {
          // Look for the appropriate value radio button based on test data
          for (let radio of bringGadgetsRadios) {
            const radioValue = await radio.evaluate(el => el.value);
            console.log(`bringGadgets radio found: value="${radioValue}"`);
            
            if (radioValue === techChoice) {
              await radio.click();
              console.log(`✅ Technology devices radio (bringGadgets): Selected "${techChoice}" (${techLabel}/${hasTechnologyDevices ? 'Yes' : 'No'})`);
              cellularRadioSuccess = true;
              break;
            }
          }
        }
        
        // If specific selector didn't work, try alternative approach
        if (!cellularRadioSuccess) {
          console.log('🔄 Trying alternative technology devices radio selection...');
          
          // Try using the ID selector for the radio group
          const radioGroup = await page.$('#bringGadgets');
          if (radioGroup) {
            console.log('Found bringGadgets radio group by ID');
            
            // Look for the appropriate value radio button within this group
            const targetRadio = await radioGroup.$(`input[value="${techChoice}"]`);
            if (targetRadio) {
              await targetRadio.click();
              console.log(`✅ Technology devices radio (bringGadgets): Selected "${techChoice}" via radio group`);
              cellularRadioSuccess = true;
            } else {
              console.log(`❌ Could not find "${techChoice}" value radio in bringGadgets group`);
            }
          } else {
            console.log('❌ Could not find #bringGadgets radio group');
          }
        }
        
      } catch (error) {
        console.log(`❌ Technology devices radio selection failed: ${error.message}`);
      }
      
      if (!cellularRadioSuccess) {
        console.log('⚠️ Could not find or select technology devices radio button');
      }
      
      // Wait a moment before proceeding to checkbox
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Now try to find and check the consent checkbox
      console.log('\n📋 Looking for consent checkbox on agreement page...');
      const possibleSelectors = ['#accept', '#checkbox', '#consent', '.ant-checkbox-input', 'input[type="checkbox"]'];
      let checkboxFound = false;
      
      for (const checkboxSelector of possibleSelectors) {
        try {
          await page.waitForSelector(checkboxSelector, { visible: true, timeout: 3000 });
          await page.click(checkboxSelector);
          console.log(`✅ Consent checkbox: checked using selector "${checkboxSelector}"`);
          successCount++;
          checkboxFound = true;
          break;
        } catch (error) {
          // Try next selector
        }
      }
      
      if (!checkboxFound) {
        console.log(`❌ Consent checkbox: No valid checkbox selector found on agreement page`);
      }
      
      console.log(`\n🎉 Final completion: ${successCount}/${totalFields} fields completed!`);
      
      if (checkboxFound) {
        // Look for final submit button and proceed to completion
        console.log('\n🔍 Looking for final "Kirim" submit button...');
        const submitButtons = await page.$$('button');
        
        for (let button of submitButtons) {
          const buttonText = await button.evaluate(el => el.textContent?.trim().toLowerCase());
          if (buttonText && (buttonText.includes('kirim') || buttonText.includes('submit') || buttonText.includes('selesai'))) {
            console.log(`Found submit button: "${buttonText}"`);
            
            // Proceed with form submission by clicking Kirim
            console.log('🚀 Proceeding to complete form submission by clicking "Kirim"...');
            await button.click();
            
            // Wait for submission to process
            await new Promise(resolve => setTimeout(resolve, 3000));
            console.log('⏳ Checking submission status...');
            
            // Check for validation errors after submission
            const validationCheck = await checkForValidationErrors(page);
            
            if (validationCheck.hasErrors) {
              console.log('❌ Form submission failed due to validation errors:');
              
              if (validationCheck.invalidFields.length > 0) {
                console.log('📋 Invalid fields:');
                validationCheck.invalidFields.forEach(field => {
                  console.log(`   - ${field.field}: ${field.error}`);
                });
              }
              
              if (validationCheck.errorMessages.length > 0) {
                console.log('⚠️ Error messages:');
                validationCheck.errorMessages.forEach(msg => {
                  console.log(`   - ${msg}`);
                });
              }
              
              if (validationCheck.alertMessages.length > 0) {
                console.log('🚨 Alert messages:');
                validationCheck.alertMessages.forEach(msg => {
                  console.log(`   - ${msg}`);
                });
              }
              
              // Take screenshot of validation errors
              const errorScreenshot = `validation-errors-${new Date().toISOString().replace(/[:.]/g, '-')}.png`;
              await page.screenshot({ path: errorScreenshot, fullPage: true });
              console.log(`📸 Validation error screenshot saved: ${errorScreenshot}`);
              
              console.log('\n❌ Form submission failed. Please fix the validation errors and try again.');
              break; // Exit the button loop since submission failed
            } else if (validationCheck.modalAppeared || validationCheck.qrCodeVisible) {
              console.log('✅ Form submitted successfully!');
              console.log('✅ Success modal appeared with QR code');
            } else {
              console.log('⚠️ Form submitted but no clear success indicator found');
              console.log('⏳ Waiting for submission confirmation...');
            }
            
            // Extract QR code and submission details
            console.log('\n🎯 Starting QR code extraction process...');
            
            const timestamp = new Date().toISOString().replace(/[:.]/g, '-').replace('T', '_').split('.')[0];
            let extractionResults = {
              qrCode: null,
              submissionDetails: null,
              files: null,
              success: false
            };
            
            try {
              // Extract QR code from success modal first
              const qrCodeData = await extractQRCodeFromModal(page);
              
              if (qrCodeData) {
                console.log('✅ QR code modal detected, proceeding with download...');
                
                // Download QR code using the download button
                const downloadDir = path.resolve(process.cwd(), 'downloads');
                const qrDownloadResult = await downloadQRCodeImage(page, downloadDir, `customs-submission-${timestamp}`);
                
                // Extract submission details
                const submissionDetails = await extractSubmissionDetails(page);
                
                // Save QR code and metadata to files
                const saveResults = await saveQRCodeAndMetadata(qrDownloadResult, submissionDetails, timestamp, downloadDir);
                
                extractionResults = {
                  qrCode: qrDownloadResult,
                  submissionDetails,
                  files: saveResults,
                  success: saveResults.success
                };
                
                if (extractionResults.success) {
                  console.log('\n🎉 QR code extraction completed successfully!');
                  console.log(`📁 Files saved:`);
                  if (saveResults.imagePath) {
                    console.log(`   Image: ${saveResults.imagePath}`);
                  }
                  console.log(`   Metadata: ${saveResults.metadataPath}`);
                  if (submissionDetails && submissionDetails.registrationNumber) {
                    console.log(`📋 Registration Number: ${submissionDetails.registrationNumber}`);
                  }
                  if (submissionDetails && submissionDetails.portInfo) {
                    console.log(`🛬 Port: ${submissionDetails.portInfo}`);
                  }
                } else {
                  console.log('\n⚠️ QR code extraction completed with some issues');
                }
              } else {
                console.log('\n❌ QR code extraction failed - no QR code data found');
              }
              
            } catch (extractionError) {
              console.log(`\n❌ QR code extraction failed: ${extractionError.message}`);
              
              // Attempt recovery and save error details
              const recoveryResults = await handleQRExtractionFailure(page, timestamp, extractionError);
              
              extractionResults = {
                qrCode: null,
                submissionDetails: null,
                files: null,
                success: false,
                error: extractionError.message,
                recovery: recoveryResults
              };
              
              if (recoveryResults.hasSuccess) {
                console.log('⚠️ Form submission appears successful despite QR extraction failure');
              }
            }
            
            break;
          }
        }
      }
    } else {
      console.log('❌ Navigation to consent page failed after all attempts');
      console.log('📋 Possible causes:');
      console.log('  - Required form fields still not properly filled');
      console.log('  - Form validation blocking navigation');
      console.log('  - Website behavior changed');
      console.log('  - Network/timing issues');
      
      // Take diagnostic screenshot
      await page.screenshot({ path: 'navigation-failure-debug.png', fullPage: true });
      console.log('📸 Navigation failure screenshot saved as navigation-failure-debug.png');
      
      // Show current page state for debugging
      const debugInfo = await page.evaluate(() => {
        const radioButtons = document.querySelectorAll('input[type="radio"]');
        const page1Fields = document.querySelectorAll('#paspor, #nama, #nomorPengangkut');
        const nextButtons = document.querySelectorAll('button');
        
        return {
          url: window.location.href,
          radioButtons: radioButtons.length,
          page1FieldsVisible: Array.from(page1Fields).filter(f => f.offsetParent !== null).length,
          totalButtons: nextButtons.length,
          nextButtonTexts: Array.from(nextButtons).map(btn => btn.textContent?.trim()).filter(t => t)
        };
      });
      
      console.log('🔍 Debug Info:');
      console.log(`  Current URL: ${debugInfo.url}`);
      console.log(`  Radio buttons: ${debugInfo.radioButtons}`);
      console.log(`  Page 1 fields still visible: ${debugInfo.page1FieldsVisible}`);
      console.log(`  Total buttons: ${debugInfo.totalButtons}`);
      console.log(`  Button texts: ${debugInfo.nextButtonTexts.join(', ')}`);
      
      console.log('\n🛑 Form automation stopped due to navigation failure');
      console.log('💡 Recommendation: Review form validation and field completion');
    }
    
    // Take final screenshot (including success modal if visible)
    await page.screenshot({ path: 'multi-step-form-test.png', fullPage: true });
    console.log('\n📸 Final screenshot saved');
    
    console.log('\n⏸️ Test complete. Press Ctrl+C when done reviewing.');
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

testCustomsForm();