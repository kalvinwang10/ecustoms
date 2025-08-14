import puppeteer from 'puppeteer';

/**
 * Get the appropriate Chrome executable path based on the environment
 */
export function getChromePath(): string | undefined {
  // In production/serverless environments, we need to use chrome-aws-lambda
  if (process.env.NODE_ENV === 'production') {
    // Common paths for serverless Chrome
    const possiblePaths = [
      '/opt/chromium',
      '/tmp/chromium',
      '/var/task/chrome/chromium',
      process.env.CHROME_PATH,
    ].filter(Boolean);

    for (const path of possiblePaths) {
      if (path) {
        return path;
      }
    }
  }
  
  // In development, let Puppeteer find Chrome automatically
  return undefined;
}

/**
 * Get browser launch options optimized for serverless environments
 */
export async function getBrowserOptions(options: { headless?: boolean } = {}) {
  const isServerless = process.env.VERCEL || process.env.AWS_LAMBDA_FUNCTION_NAME;
  
  // Base args for all environments
  const baseArgs = [
    '--no-sandbox',
    '--disable-setuid-sandbox',
    '--disable-dev-shm-usage',
    '--no-first-run',
    '--no-zygote',
    '--single-process', // Important for serverless
    '--disable-web-security',
    '--disable-features=IsolateOrigins,site-per-process',
    '--disable-blink-features=AutomationControlled',
  ];

  // Additional args for production/serverless
  const serverlessArgs = isServerless ? [
    '--disable-gpu',
    '--disable-background-networking',
    '--disable-background-timer-throttling',
    '--disable-backgrounding-occluded-windows',
    '--disable-renderer-backgrounding',
    '--disable-features=TranslateUI',
    '--disable-ipc-flooding-protection',
    '--disable-extensions',
    '--disable-plugins',
    '--disable-images',
    '--disable-javascript-harmony-shipping',
    '--no-experiments',
    '--disable-hang-monitor',
    '--disable-prompt-on-repost',
    '--disable-sync',
    '--memory-pressure-off',
    '--disable-accelerated-2d-canvas',
    '--disable-logging',
    '--aggressive-cache-discard',
  ] : [];

  const chromePath = getChromePath();
  
  return {
    headless: options.headless ?? true,
    args: [...baseArgs, ...serverlessArgs],
    ...(chromePath && { executablePath: chromePath }),
    // Serverless environments often have limited resources
    ...(isServerless && {
      timeout: 30000,
      ignoreHTTPSErrors: true,
      defaultViewport: {
        width: 1920,
        height: 1080,
      },
    }),
  };
}

/**
 * Check if Chrome is available in the current environment
 */
export async function checkChromeAvailability(): Promise<{
  available: boolean;
  message: string;
  suggestions?: string[];
}> {
  try {
    const options = await getBrowserOptions();
    
    // Try to launch browser with minimal timeout
    const browser = await puppeteer.launch({
      ...options,
      timeout: 5000,
    });
    
    await browser.close();
    
    return {
      available: true,
      message: 'Chrome is available and working',
    };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    
    const suggestions = [
      'For local development: Install Chrome or Chromium',
      'For Vercel: Use @sparticuz/chromium package',
      'For AWS Lambda: Use chrome-aws-lambda package',
      'For Docker: Install chromium-browser in Dockerfile',
      'Set CHROME_PATH environment variable to Chrome executable path',
    ];
    
    return {
      available: false,
      message: `Chrome is not available: ${errorMessage}`,
      suggestions,
    };
  }
}