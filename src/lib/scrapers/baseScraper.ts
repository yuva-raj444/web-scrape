import axios from 'axios';
import * as cheerio from 'cheerio';
import puppeteer from 'puppeteer';
import { ScraperResponse } from '../types';

export abstract class BaseScraper {
  protected abstract source: string;
  protected abstract url: string;
  
  constructor(protected query: string) {}

  protected async fetchHTML(url: string): Promise<string> {
    try {
      const { data } = await axios.get(url, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
          'Accept-Language': 'en-US,en;q=0.5',
        },
      });
      return data;
    } catch (error) {
      console.error(`Error fetching ${url}:`, error);
      return '';
    }
  }

  protected async fetchWithPuppeteer(url: string): Promise<string> {
    let browser;
    try {
      const launchOptions: any = {
        headless: true,
        args: ['--no-sandbox', '--disable-setuid-sandbox']
      };

      if (process.env.PUPPETEER_EXECUTABLE_PATH) {
        launchOptions.executablePath = process.env.PUPPETEER_EXECUTABLE_PATH;
      }

      browser = await puppeteer.launch(launchOptions);
      const page = await browser.newPage();
      
      // Set a more realistic user agent
      await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36');
      
      // Set viewport to appear like a real browser
      await page.setViewport({ width: 1366, height: 768 });
      
      // Hide webdriver
      await page.evaluateOnNewDocument(() => {
        // Pass webdriver checks
        Object.defineProperty(navigator, 'webdriver', {
          get: () => false,
        });
        
        // Pass chrome checks
        // @ts-expect-error - Adding chrome object to window for bot detection
        window.chrome = {
          runtime: {},
          // etc.
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
      
      // Additional headers to appear more like a real browser
      await page.setExtraHTTPHeaders({
        'Accept-Language': 'en-US,en;q=0.9',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8',
        'Accept-Encoding': 'gzip, deflate, br',
        'Connection': 'keep-alive',
        'Upgrade-Insecure-Requests': '1',
        'Cache-Control': 'max-age=0',
        'sec-ch-ua': '"Google Chrome";v="120", "Chromium";v="120", "Not-A.Brand";v="8"',
        'sec-ch-ua-mobile': '?0',
        'sec-ch-ua-platform': '"Windows"'
      });
      
      // Enable JavaScript
      await page.setJavaScriptEnabled(true);
      
      // Navigate with longer timeout
      await page.goto(url, { 
        waitUntil: 'networkidle2',
        timeout: 60000
      });
      
      // Wait a bit more for dynamic content to load
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      // Scroll multiple times to trigger lazy loading
      await page.evaluate(() => {
        window.scrollBy(0, 500);
        return new Promise(resolve => setTimeout(resolve, 500));
      });
      
      await page.evaluate(() => {
        window.scrollBy(0, 1000);
        return new Promise(resolve => setTimeout(resolve, 500));
      });
      
      await page.evaluate(() => {
        window.scrollTo(0, document.body.scrollHeight / 2);
        return new Promise(resolve => setTimeout(resolve, 500));
      });
      
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Get the page content
      const content = await page.content();
      return content;
    } catch (error) {
      console.error(`Error fetching with Puppeteer ${url}:`, error);
      return '';
    } finally {
      if (browser) await browser.close();
    }
  }

  protected createCheerio(html: string) {
    return cheerio.load(html);
  }

  abstract scrape(): Promise<ScraperResponse>;
}
