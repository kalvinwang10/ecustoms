import puppeteer from 'puppeteer-extra';
import StealthPlugin from 'puppeteer-extra-plugin-stealth';
import { Browser, Page } from 'puppeteer';

// Add stealth plugin to avoid detection
puppeteer.use(StealthPlugin());

export interface BrowserConfig {
  headless: boolean;
  args: string[];
  defaultViewport: {
    width: number;
    height: number;
  };
  userDataDir?: string;
}

export const defaultBrowserConfig: BrowserConfig = {
  headless: true,
  args: [
    '--no-sandbox',
    '--disable-setuid-sandbox',
    '--disable-dev-shm-usage',
    '--disable-accelerated-2d-canvas',
    '--no-first-run',
    '--no-zygote',
    '--single-process', // This flag is required for Vercel
    '--disable-gpu',
    '--window-size=1920,1080',
    '--user-agent=Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
  ],
  defaultViewport: {
    width: 1920,
    height: 1080,
  },
};

export class PuppeteerManager {
  private browser: Browser | null = null;

  async launch(config: BrowserConfig = defaultBrowserConfig) {
    try {
      // Use system Chrome if available, fallback to environment variable for production
      const executablePath = process.env.CHROME_EXECUTABLE_PATH || 
                             '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
      
      this.browser = await puppeteer.launch({
        ...config,
        executablePath,
      });
      
      console.log('Browser launched successfully');
      return this.browser;
    } catch (error) {
      console.error('Failed to launch browser:', error);
      throw new Error(`Failed to launch browser: ${error}`);
    }
  }

  async createPage(): Promise<Page> {
    if (!this.browser) {
      throw new Error('Browser not launched. Call launch() first.');
    }

    const page = await this.browser.newPage();
    
    // Set additional page configurations
    await page.setUserAgent('Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36');
    await page.setViewport({ width: 1920, height: 1080 });
    
    // Add extra headers to appear more human-like
    await page.setExtraHTTPHeaders({
      'Accept-Language': 'en-US,en;q=0.9,id;q=0.8',
      'Accept-Encoding': 'gzip, deflate, br',
      'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8',
      'Connection': 'keep-alive',
      'Upgrade-Insecure-Requests': '1',
    });

    return page;
  }

  async closeBrowser() {
    if (this.browser) {
      await this.browser.close();
      this.browser = null;
      console.log('Browser closed successfully');
    }
  }

  async testConnection(url: string = 'https://ecd.beacukai.go.id/') {
    let page = null;
    try {
      if (!this.browser) {
        await this.launch();
      }
      
      page = await this.createPage();
      
      console.log(`Testing connection to: ${url}`);
      const response = await page.goto(url, { 
        waitUntil: 'networkidle0', 
        timeout: 30000 
      });
      
      console.log(`Response status: ${response?.status()}`);
      console.log(`Page title: ${await page.title()}`);
      
      return {
        success: true,
        status: response?.status(),
        title: await page.title(),
        url: page.url(),
      };
    } catch (error) {
      console.error('Connection test failed:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    } finally {
      if (page) {
        await page.close();
      }
    }
  }
}

export default PuppeteerManager;