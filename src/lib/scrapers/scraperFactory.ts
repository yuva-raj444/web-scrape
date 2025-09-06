import { Category } from '../types';
import { AmazonScraper, FlipkartScraper } from './productScrapers';
import { ImdbScraper, RottenTomatoesScraper, TMDbScraper } from './movieScrapers';
import { GoodreadsScraper, OpenLibraryScraper, GoogleBooksScraper } from './bookScrapers';
import { LinkedInScraper } from './linkedInScraper';

export class ScraperFactory {
  static getScrapers(category: Category, query: string, location: string = '') {
    switch (category) {
      case 'products':
        return [
          new AmazonScraper(query),
          new FlipkartScraper(query)
        ];
      case 'movies':
        return [
          new ImdbScraper(query),
          new RottenTomatoesScraper(query),
          new TMDbScraper(query)
        ];
      case 'books':
        return [
          new GoodreadsScraper(query),
          new OpenLibraryScraper(query),
          new GoogleBooksScraper(query)
        ];
      case 'jobs':
        return [
          new LinkedInScraper(query, location)
        ];
      default:
        throw new Error(`Invalid category: ${category}`);
    }
  }
}
