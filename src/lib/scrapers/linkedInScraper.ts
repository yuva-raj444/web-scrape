import { BaseScraper } from './baseScraper';
import { ScraperResponse } from '../types';
import puppeteer from 'puppeteer';

export class LinkedInScraper extends BaseScraper {
  protected source = 'LinkedIn';
  protected url: string;
  protected location: string;

  constructor(query: string, location: string = '') {
    super(query);
    this.location = location || 'remote'; // Default to remote if location not provided
    this.url = `https://www.linkedin.com/jobs/${encodeURIComponent(query)}-jobs-${encodeURIComponent(this.location)}?position=1&pageNum=0`;
  }

  async scrape(): Promise<ScraperResponse> {
    try {
      // Using the exact method from linkedin.js
      const jobs = await this.scrapeLinkedInJobs(this.query, this.location);
      
      const results = jobs.map(job => ({
        title: job.title,
        url: job.link,
        company: job.company,
        location: job.location,
        source: this.source
      }));

      return {
        results,
        source: this.source
      };
    } catch (error) {
      console.error(`Error scraping ${this.source}:`, error);
      return { results: [], source: this.source };
    }
  }

  // Direct implementation of your original function with enhanced stealth
  private async scrapeLinkedInJobs(jobRole: string, location: string) {
    const url = `https://www.linkedin.com/jobs/${encodeURIComponent(jobRole)}-jobs-${encodeURIComponent(location)}?position=1&pageNum=0`;

    const launchOptions: any = {
      headless: true,
      args: [
        '--no-sandbox', 
        '--disable-setuid-sandbox',
        '--disable-web-security',
        '--disable-features=IsolateOrigins,site-per-process',
        '--disable-blink-features=AutomationControlled',
        '--disable-dev-shm-usage',
        '--no-first-run',
        '--disable-extensions'
      ]
    };

    if (process.env.PUPPETEER_EXECUTABLE_PATH) {
      launchOptions.executablePath = process.env.PUPPETEER_EXECUTABLE_PATH;
    }

    const browser = await puppeteer.launch(launchOptions);
    const page = await browser.newPage();

    // Enhanced stealth configuration
    await page.setUserAgent(
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
    );

    // Set viewport to appear like a real browser
    await page.setViewport({ width: 1366, height: 768 });

    // Hide webdriver properties
    await page.evaluateOnNewDocument(() => {
      // Pass webdriver checks
      Object.defineProperty(navigator, 'webdriver', {
        get: () => false,
      });
      
      // Pass chrome checks
      // @ts-expect-error - Adding chrome object to window for bot detection
      window.chrome = {
        runtime: {},
      };
      
      // Pass notifications checks
      const originalQuery = window.navigator.permissions.query;
      // @ts-expect-error - Overriding permissions query for bot detection
      window.navigator.permissions.query = (parameters) => (
        parameters.name === 'notifications' ?
          Promise.resolve({ state: Notification.permission }) :
          originalQuery(parameters)
      );
    });

    // Additional headers
    await page.setExtraHTTPHeaders({
      'Accept-Language': 'en-US,en;q=0.9',
      'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8',
    });

    await page.goto(url, { waitUntil: "networkidle2", timeout: 60000 });

    // Scroll to load lazy content
    await page.evaluate(() => {
      window.scrollBy(0, window.innerHeight * 3);
    });

    // Wait a bit for content to load
    await new Promise(resolve => setTimeout(resolve, 3000));

    // Wait for job cards
    await page.waitForSelector(".base-card__full-link", { timeout: 15000 });

    // Extract top 10 jobs - using textContent instead of innerText for TypeScript compatibility
    const jobs = await page.$$eval(".base-card__full-link", (cards) =>
      cards.slice(0, 10).map((card) => {
        const title = card.querySelector(".base-search-card__title")?.textContent || "";
        const company = card.querySelector(".base-search-card__subtitle")?.textContent || "";
        const location = card.querySelector(".job-search-card__location")?.textContent || "";
        const link = card.getAttribute("href") || "";
        return { title, company, location, link };
      })
    );

    await browser.close();
    return jobs;
  }
}
