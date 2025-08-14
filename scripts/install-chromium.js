#!/usr/bin/env node

/**
 * Post-install script to set up Chromium for different environments
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🔧 Setting up Chromium for environment...');

// Detect environment
const isVercel = process.env.VERCEL || process.env.VERCEL_ENV;
const isAWSLambda = process.env.AWS_LAMBDA_FUNCTION_NAME || process.env.AWS_EXECUTION_ENV;
const isProduction = process.env.NODE_ENV === 'production';

if (isVercel) {
  console.log('📦 Detected Vercel environment');
  console.log('ℹ️  For Vercel deployment, add @sparticuz/chromium to dependencies:');
  console.log('   npm install @sparticuz/chromium');
  console.log('   Then set environment variable: CHROME_PATH=/opt/chromium');
} else if (isAWSLambda) {
  console.log('📦 Detected AWS Lambda environment');
  console.log('ℹ️  For Lambda deployment, add chrome-aws-lambda to dependencies:');
  console.log('   npm install chrome-aws-lambda');
} else if (isProduction) {
  console.log('📦 Production environment detected');
  console.log('ℹ️  Make sure Chrome/Chromium is available in your production environment');
} else {
  console.log('💻 Development environment - attempting to install Chromium locally');
  
  try {
    // Check if puppeteer can find Chrome
    const puppeteer = require('puppeteer');
    const browserFetcher = puppeteer.createBrowserFetcher();
    
    console.log('🔍 Checking for Chrome installation...');
    
    // Try to get the executable path
    try {
      const executablePath = puppeteer.executablePath();
      if (fs.existsSync(executablePath)) {
        console.log('✅ Chrome found at:', executablePath);
      } else {
        console.log('⚠️  Chrome executable not found, installing...');
        execSync('npx puppeteer browsers install chrome', { stdio: 'inherit' });
      }
    } catch (error) {
      console.log('📥 Installing Chromium via Puppeteer...');
      execSync('npx puppeteer browsers install chrome', { stdio: 'inherit' });
    }
    
    console.log('✅ Chromium setup complete');
  } catch (error) {
    console.error('⚠️  Warning: Could not set up Chromium automatically');
    console.error('   Error:', error.message);
    console.log('\n📋 Manual setup instructions:');
    console.log('   1. Install Chrome/Chromium on your system');
    console.log('   2. Or run: npx puppeteer browsers install chrome');
    console.log('   3. Or set CHROME_PATH environment variable to Chrome executable');
  }
}

// Create a browser config file with environment-specific settings
const configPath = path.join(__dirname, '..', '.browser-config.json');
const config = {
  environment: isVercel ? 'vercel' : isAWSLambda ? 'lambda' : isProduction ? 'production' : 'development',
  timestamp: new Date().toISOString(),
  recommendations: {
    vercel: '@sparticuz/chromium',
    lambda: 'chrome-aws-lambda',
    production: 'system-chromium',
    development: 'puppeteer-bundled'
  }
};

try {
  fs.writeFileSync(configPath, JSON.stringify(config, null, 2));
  console.log('📝 Browser configuration saved to .browser-config.json');
} catch (error) {
  // Silent fail - not critical
}

console.log('✨ Chromium setup process complete');