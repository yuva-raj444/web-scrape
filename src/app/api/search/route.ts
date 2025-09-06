import { NextRequest, NextResponse } from 'next/server';
import { ScraperFactory } from '@/lib/scrapers/scraperFactory';
import { Category, SearchResult } from '@/lib/types';

// Use Node.js runtime for the API route that does web scraping
export const config = {
  runtime: 'nodejs',
};

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const category = searchParams.get('category') as Category;
    const query = searchParams.get('query');
    const location = searchParams.get('location') || '';

    if (!category) {
      return NextResponse.json(
        { error: 'Category parameter is required' },
        { status: 400 }
      );
    }

    if (!query) {
      return NextResponse.json(
        { error: 'Query parameter is required' },
        { status: 400 }
      );
    }

    // Validate category
    const validCategories: Category[] = ['products', 'movies', 'books', 'jobs'];
    if (!validCategories.includes(category)) {
      return NextResponse.json(
        { error: `Invalid category. Must be one of: ${validCategories.join(', ')}` },
        { status: 400 }
      );
    }

    // Get scrapers for the category
    const scrapers = ScraperFactory.getScrapers(category, query, location);

    // Run all scrapers in parallel
    const scraperPromises = scrapers.map(scraper => scraper.scrape());
    const results = await Promise.all(scraperPromises);

    // Combine results from all sources
    let allResults: SearchResult[] = [];
    results.forEach(result => {
      allResults = [...allResults, ...result.results];
    });

    // Return results
    return NextResponse.json({ 
      results: allResults,
      sources: results.map(r => r.source),
      totalResults: allResults.length,
      category,
      query,
      location: location || undefined
    });
  } catch (error) {
    console.error('Search API error:', error);
    return NextResponse.json(
      { error: 'An error occurred while processing your request' },
      { status: 500 }
    );
  }
}
