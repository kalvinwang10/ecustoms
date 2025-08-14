/**
 * Serverless-compatible Puppeteer wrapper
 * Handles Chrome setup for Vercel, AWS Lambda, and other serverless platforms
 */

import { Browser, LaunchOptions } from 'puppeteer';

interface ServerlessChrome {
  puppeteer: any;
  executablePath: () => Promise<string>;
}

/**
 * Get the appropriate Puppeteer instance and Chrome path for serverless
 */
export async function getServerlessPuppeteer(): Promise<{
  puppeteer: any;
  executablePath?: string;
  args: string[];
}> {
  const isVercel = process.env.VERCEL || process.env.VERCEL_ENV;
  const isAWSLambda = process.env.AWS_LAMBDA_FUNCTION_NAME || process.env.AWS_EXECUTION_ENV;
  const isProduction = process.env.NODE_ENV === 'production';

  // Common args for serverless environments
  const args = [
    '--no-sandbox',
    '--disable-setuid-sandbox',
    '--disable-dev-shm-usage',
    '--single-process',
    '--no-zygote',
    '--disable-gpu',
    '--disable-web-security',
    '--disable-features=IsolateOrigins,site-per-process',
    '--disable-blink-features=AutomationControlled',
  ];

  // Try to use serverless-optimized Chrome if available
  if (isVercel) {
    try {
      // For Vercel, try @sparticuz/chromium
      const chromium = await import('@sparticuz/chromium').catch(() => null);
      if (chromium) {
        return {
          puppeteer: await import('puppeteer-core'),
          executablePath: await chromium.executablePath(),
          args: [...chromium.args, ...args],
        };
      }
    } catch (error) {
      console.warn('⚠️ @sparticuz/chromium not found, falling back to bundled Puppeteer');
    }
  }

  if (isAWSLambda) {
    try {
      // For AWS Lambda, try chrome-aws-lambda
      const chromium = await import('chrome-aws-lambda').catch(() => null);
      if (chromium) {
        return {
          puppeteer: chromium.puppeteer,
          executablePath: await chromium.executablePath,
          args: [...chromium.args, ...args],
        };
      }
    } catch (error) {
      console.warn('⚠️ chrome-aws-lambda not found, falling back to bundled Puppeteer');
    }
  }

  // Check for custom Chrome path in environment
  if (process.env.CHROME_PATH) {
    const puppeteer = await import('puppeteer-core');
    return {
      puppeteer,
      executablePath: process.env.CHROME_PATH,
      args,
    };
  }

  // Fallback to bundled Puppeteer
  const puppeteer = await import('puppeteer');
  return {
    puppeteer,
    args,
  };
}

/**
 * Launch browser with serverless-optimized settings
 */
export async function launchServerlessBrowser(options: Partial<LaunchOptions> = {}): Promise<Browser> {
  const { puppeteer, executablePath, args } = await getServerlessPuppeteer();
  
  const launchOptions: LaunchOptions = {
    headless: true,
    args,
    defaultViewport: {
      width: 1920,
      height: 1080,
    },
    ignoreHTTPSErrors: true,
    ...options,
  };

  if (executablePath) {
    launchOptions.executablePath = executablePath;
  }

  // Add timeout for serverless environments
  if (process.env.NODE_ENV === 'production') {
    launchOptions.timeout = 30000;
  }

  try {
    const browser = await puppeteer.launch(launchOptions);
    console.log('✅ Browser launched successfully in serverless mode');
    return browser;
  } catch (error) {
    console.error('❌ Failed to launch browser:', error);
    
    // Provide helpful error messages
    if (error instanceof Error && error.message.includes('Could not find Chrome')) {
      const platform = process.env.VERCEL ? 'Vercel' : 
                      process.env.AWS_LAMBDA_FUNCTION_NAME ? 'AWS Lambda' : 
                      'your platform';
      
      throw new Error(
        `Chrome/Chromium not found in ${platform}.\n` +
        `Solutions:\n` +
        `1. Install platform-specific Chrome package (see documentation)\n` +
        `2. Set CHROME_PATH environment variable\n` +
        `3. Use a Docker image with Chrome pre-installed\n` +
        `Original error: ${error.message}`
      );
    }
    
    throw error;
  }
}