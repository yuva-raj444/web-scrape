import { BaseScraper } from './baseScraper';
import { ScraperResponse } from '../types';

export class ImdbScraper extends BaseScraper {
  protected source = 'IMDb';
  protected url: string;

  constructor(query: string) {
    super(query);
    this.url = `https://www.imdb.com/find/?q=${encodeURIComponent(query)}&s=tt&ttype=ft`;
  }

  async scrape(): Promise<ScraperResponse> {
    try {
      const html = await this.fetchWithPuppeteer(this.url);
      const $ = this.createCheerio(html);
      
      const results = $('.find-result-item')
        .map((_, element) => {
          const title = $(element).find('.ipc-metadata-list-summary-item__t').text().trim();
          const url = 'https://www.imdb.com' + ($(element).find('a').attr('href') || '');
          const year = $(element).find('.ipc-metadata-list-summary-item__li').first().text().trim();
          const image = $(element).find('img').attr('src');
          
          if (!title || !url.includes('imdb.com')) return null;
          
          return {
            title: `${title} ${year}`,
            url,
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

export class RottenTomatoesScraper extends BaseScraper {
  protected source = 'Rotten Tomatoes';
  protected url: string;

  constructor(query: string) {
    super(query);
    this.url = `https://www.rottentomatoes.com/search?search=${encodeURIComponent(query)}`;
  }

  async scrape(): Promise<ScraperResponse> {
    try {
      const html = await this.fetchWithPuppeteer(this.url);
      const $ = this.createCheerio(html);
      
      const results = $('search-page-media-row')
        .map((_, element) => {
          const title = $(element).find('[slot="title"]').text().trim();
          const url = $(element).find('a').attr('href') || '';
          const rating = $(element).find('.tomatometer').text().trim();
          const year = $(element).find('.smaller').text().trim();
          
          if (!title || !url) return null;
          
          return {
            title: `${title} (${year})`,
            url,
            rating,
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

export class TMDbScraper extends BaseScraper {
  protected source = 'TMDb';
  protected url: string;

  constructor(query: string) {
    super(query);
    this.url = `https://www.themoviedb.org/search?query=${encodeURIComponent(query)}`;
  }

  async scrape(): Promise<ScraperResponse> {
    try {
      const html = await this.fetchWithPuppeteer(this.url);
      const $ = this.createCheerio(html);
      
      const results = $('.card')
        .map((_, element) => {
          const title = $(element).find('.title a').text().trim();
          const url = 'https://www.themoviedb.org' + ($(element).find('.title a').attr('href') || '');
          const date = $(element).find('.release_date').text().trim();
          const rating = $(element).find('.user_score_chart').attr('data-percent');
          const image = $(element).find('img.poster').attr('src') 
            ? 'https://www.themoviedb.org' + $(element).find('img.poster').attr('src')
            : undefined;
          
          if (!title || !url.includes('themoviedb.org')) return null;
          
          return {
            title: `${title} (${date})`,
            url,
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
