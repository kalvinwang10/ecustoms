/**
 * Serverless-compatible Puppeteer wrapper
 * Handles Chrome setup for Vercel, AWS Lambda, and other serverless platforms
 */

import { Browser, LaunchOptions } from 'puppeteer';

/**
 * Get the appropriate Puppeteer instance and Chrome path for serverless
 */
export async function getServerlessPuppeteer(): Promise<{
  puppeteer: typeof import('puppeteer');
  executablePath?: string;
  args: string[];
}> {
  const isVercel = process.env.VERCEL || process.env.VERCEL_ENV;
  const isAWSLambda = process.env.AWS_LAMBDA_FUNCTION_NAME || process.env.AWS_EXECUTION_ENV;

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
  if (isVercel || isAWSLambda) {
    try {
      // For Vercel and AWS Lambda, try @sparticuz/chromium
      // Use require.resolve to check if package exists before importing
      try {
        require.resolve('@sparticuz/chromium');
        const chromium = await import('@sparticuz/chromium');
        const puppeteerCore = await import('puppeteer-core');
        return {
          puppeteer: puppeteerCore as unknown as typeof import('puppeteer'),
          executablePath: await chromium.default.executablePath(),
          args: [...chromium.default.args, ...args],
        };
      } catch {
        // Package not installed, continue
      }
    } catch {
      console.warn('⚠️ @sparticuz/chromium not found, falling back to bundled Puppeteer');
    }
  }

  // Check for custom Chrome path in environment
  if (process.env.CHROME_PATH) {
    const puppeteer = await import('puppeteer-core');
    return {
      puppeteer: puppeteer as unknown as typeof import('puppeteer'),
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