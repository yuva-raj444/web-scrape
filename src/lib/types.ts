export type Category = 'products' | 'movies' | 'books' | 'jobs';

export interface SearchResult {
  title: string;
  url: string;
  source: string;
  // Different properties based on category
  price?: string;
  rating?: string | number;
  date?: string;
  description?: string;
  image?: string;
  // Additional fields specific to certain categories
  location?: string; // For restaurants, jobs
  company?: string; // For jobs
  author?: string; // For books, news
  publishDate?: string; // For books
  salary?: string; // For jobs
}

export interface ScraperResponse {
  results: SearchResult[];
  source: string;
}
