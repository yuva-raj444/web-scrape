import { BaseScraper } from './baseScraper';
import { ScraperResponse } from '../types';
import puppeteer from 'puppeteer';

export class AmazonScraper extends BaseScraper {
  protected source = 'Amazon';
  protected url: string;

  constructor(query: string) {
    super(query);
    this.url = `https://www.amazon.in/s?k=${encodeURIComponent(query)}`;
  }

  async scrape(): Promise<ScraperResponse> {
    try {
      const html = await this.fetchWithPuppeteer(this.url);
      const $ = this.createCheerio(html);
      
      const results: any[] = [];
      
      // Find all product containers, using multiple possible selectors
      const productElements = [
        '.s-result-item[data-component-type="s-search-result"]',
        '.sg-col-inner .a-section.a-spacing-base',
        '.s-asin',
        '.s-card-container',
        '.a-cardui._cDEzb_grid-cell_1tgdX'
      ];
      
      // Try each selector
      for (const selector of productElements) {
        const items = $(selector);
        
        if (items.length > 0) {
          console.log(`Amazon found ${items.length} items with selector: ${selector}`);
          
          items.each((_, item) => {
            const title = $(item).find('h2 a span, h2 span, .a-text-normal, .a-size-medium, .a-size-base-plus, .a-size-mini').first().text().trim();
            const rawPrice = $(item).find('.a-price .a-offscreen, .a-price-whole, .a-color-price, .a-price').first().text().trim();
            const price = rawPrice ? (rawPrice.includes('₹') ? rawPrice : `₹${rawPrice}`) : "Not available";
            const link = $(item).find('h2 a, a.a-link-normal').attr('href') || '';
            const fullLink = link.startsWith('http') ? link : `https://www.amazon.in${link}`;
            
            const imgElement = $(item).find('img.s-image, img[data-image-latency="s-product-image"], img[data-a-hires]');
            const image = imgElement.attr('src') || imgElement.attr('data-a-hires') || '';
            
            const ratingText = $(item).find('.a-icon-star-small .a-icon-alt, .a-icon-star .a-icon-alt, .a-star-medium-4, .a-star-medium-4-5').text();
            const rating = ratingText ? ratingText.replace('out of 5 stars', '').trim() : "";
            
            if (title && fullLink) {
              results.push({
                title,
                price,
                url: fullLink,
                image,
                rating,
                source: 'Amazon'
              });
            }
          });
          
          // If we found at least 5 products, stop trying other selectors
          if (results.length >= 5) break;
        }
      }
      
      console.log(`Amazon found ${results.length} total results`);
      
      return {
        results: results.slice(0, 10),
        source: this.source
      };
    } catch (error) {
      console.error(`Error scraping ${this.source}:`, error);
      return { results: [], source: this.source };
    }
  }
}

export class FlipkartScraper extends BaseScraper {
  protected source = 'Flipkart';
  protected url: string;

  constructor(query: string) {
    super(query);
    this.url = `https://www.flipkart.com/search?q=${encodeURIComponent(query)}`;
  }

  async scrape(): Promise<ScraperResponse> {
    try {
      // Using the method from testme.js
      const products = await this.scrapeFlipkart(this.query);
      
      const results = products.map(product => ({
        title: product.title,
        price: product.price,
        url: product.link,
        image: product.image,
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

  // Direct implementation from testme.js
  private async scrapeFlipkart(query: string): Promise<Array<{title: string, price: string, link: string, image: string}>> {
    const browser = await puppeteer.launch({ 
      headless: true,
      args: [
        '--no-sandbox', 
        '--disable-setuid-sandbox',
        '--disable-web-security',
        '--disable-features=IsolateOrigins,site-per-process',
        '--disable-blink-features=AutomationControlled'
      ]
    });
    const page = await browser.newPage();

    // Set user-agent to avoid bot detection
    await page.setUserAgent(
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
    );

    const url = `https://www.flipkart.com/search?q=${encodeURIComponent(query)}`;
    await page.goto(url, { waitUntil: "domcontentloaded" });

    // Wait for the product container to load
    await page.waitForSelector("div._1AtVbE, div._75nlfW", { timeout: 10000 });

    // Extract products - using textContent instead of innerText for TypeScript compatibility
    const products = await page.$$eval("div._1AtVbE, div._75nlfW", (cards) =>
      cards
        .map((card) => {
          const title = card.querySelector("div.KzDlHZ")?.textContent || "";
          const price = card.querySelector("div.Nx9bqj._4b5DiR")?.textContent || "Not available";
          const relativeLink = card.querySelector("a.CGtC98")?.getAttribute("href") || "";
          // Convert relative links to absolute URLs
          const link = relativeLink.startsWith("http") ? relativeLink : `https://www.flipkart.com${relativeLink}`;
          const image = card.querySelector("img.DByuf4")?.getAttribute("src") || "";
          if (!title || !relativeLink) return null; // Skip if no title or link
          return { title, price, link, image };
        })
        .filter((product): product is {title: string, price: string, link: string, image: string} => product !== null)
        .slice(0, 10) // Get top 10 products
    );

    await browser.close();
    return products;
  }
}
