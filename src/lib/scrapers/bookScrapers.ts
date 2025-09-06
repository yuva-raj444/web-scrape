import { BaseScraper } from './baseScraper';
import { ScraperResponse } from '../types';

export class GoodreadsScraper extends BaseScraper {
  protected source = 'Goodreads';
  protected url: string;

  constructor(query: string) {
    super(query);
    this.url = `https://www.goodreads.com/search?q=${encodeURIComponent(query)}`;
  }

  async scrape(): Promise<ScraperResponse> {
    try {
      const html = await this.fetchWithPuppeteer(this.url);
      const $ = this.createCheerio(html);
      
      const results = $('tr[itemscope]')
        .map((_, element) => {
          const title = $(element).find('a.bookTitle').text().trim();
          const url = 'https://www.goodreads.com' + ($(element).find('a.bookTitle').attr('href') || '');
          const author = $(element).find('a.authorName').text().trim();
          const rating = $(element).find('span.minirating').text().trim();
          const image = $(element).find('img').attr('src');
          
          if (!title || !url.includes('goodreads.com')) return null;
          
          return {
            title,
            url,
            author,
            rating,
            image,
            source: this.source
          };
        })
        .get()
        .filter(Boolean)
        .slice(0, 10);

      return {
        results,
        source: this.source
      };
    } catch (error) {
      console.error(`Error scraping ${this.source}:`, error);
      return { results: [], source: this.source };
    }
  }
}

export class OpenLibraryScraper extends BaseScraper {
  protected source = 'Open Library';
  protected url: string;

  constructor(query: string) {
    super(query);
    this.url = `https://openlibrary.org/search?q=${encodeURIComponent(query)}&mode=everything`;
  }

  async scrape(): Promise<ScraperResponse> {
    try {
      const html = await this.fetchHTML(this.url);
      const $ = this.createCheerio(html);
      
      const results = $('.searchResultItem')
        .map((_, element) => {
          const title = $(element).find('.bookTitle').text().trim();
          const url = 'https://openlibrary.org' + ($(element).find('.bookTitle').attr('href') || '');
          const author = $(element).find('.bookAuthor').text().trim();
          const publishDate = $(element).find('.publishedYear').text().trim();
          const image = $(element).find('img.cover').attr('src');
          
          if (!title || !url.includes('openlibrary.org')) return null;
          
          return {
            title,
            url,
            author,
            publishDate,
            image: image ? `https:${image}` : undefined,
            source: this.source
          };
        })
        .get()
        .filter(Boolean)
        .slice(0, 10);

      return {
        results,
        source: this.source
      };
    } catch (error) {
      console.error(`Error scraping ${this.source}:`, error);
      return { results: [], source: this.source };
    }
  }
}

export class GoogleBooksScraper extends BaseScraper {
  protected source = 'Google Books';
  protected url: string;

  constructor(query: string) {
    super(query);
    this.url = `https://www.google.com/search?tbm=bks&q=${encodeURIComponent(query)}`;
  }

  async scrape(): Promise<ScraperResponse> {
    try {
      const html = await this.fetchWithPuppeteer(this.url);
      const $ = this.createCheerio(html);
      
      const results = $('.Yr5TG')
        .map((_, element) => {
          const title = $(element).find('h3').text().trim();
          const url = $(element).find('a').attr('href') || '';
          const details = $(element).find('.fG8Fp').text().trim();
          const author = details.split('·')[0]?.trim() || '';
          
          if (!title || !url) return null;
          
          return {
            title,
            url,
            author,
            description: $(element).find('.LLeaf').text().trim(),
            source: this.source
          };
        })
        .get()
        .filter(Boolean)
        .slice(0, 10);

      return {
        results,
        source: this.source
      };
    } catch (error) {
      console.error(`Error scraping ${this.source}:`, error);
      return { results: [], source: this.source };
    }
  }
}
