'use client';

import { useState } from 'react';
import { SearchForm } from '@/components/ui/SearchForm';
import { ResultsGrid } from '@/components/ui/ResultsGrid';
import { ThemeToggle } from '@/components/ui/ThemeToggle';
import { Category, SearchResult } from '@/lib/types';
import { motion } from 'framer-motion';

export default function Home() {
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [currentCategory, setCurrentCategory] = useState<Category>('products');
  const [hasSearched, setHasSearched] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSearch = async (category: Category, query: string, location?: string) => {
    setIsLoading(true);
    setError(null);
    setCurrentCategory(category);
    
    try {
      let searchUrl = `/api/search?category=${category}&query=${encodeURIComponent(query)}`;
      if (location && category === 'jobs') {
        searchUrl += `&location=${encodeURIComponent(location)}`;
      }
      
      const response = await fetch(searchUrl);
      
      if (!response.ok) {
        throw new Error('Failed to fetch results');
      }
      
      const data = await response.json();
      setResults(data.results);
      setHasSearched(true);
    } catch {
      setError('An error occurred while fetching results. Please try again.');
      setResults([]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen transition-colors duration-300">
      <ThemeToggle />
      
      <header className="py-8 md:py-12 text-center border-b border-gray-100 dark:border-gray-800">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="max-w-7xl mx-auto px-4"
        >
          <h1 className="text-3xl md:text-4xl font-semibold text-gray-800 dark:text-gray-100 mb-3">
            Just Scrape Me
          </h1>
          <p className="text-gray-500 dark:text-gray-400 max-w-2xl mx-auto text-base">
            Real-time aggregation from multiple trusted sources across various categories
          </p>
        </motion.div>
      </header>

      <main className="pb-20 max-w-7xl mx-auto">
        <SearchForm onSearch={handleSearch} isLoading={isLoading} />
        
        {error && (
          <div className="max-w-3xl mx-auto p-4 mt-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 rounded-md">
            {error}
          </div>
        )}
        
        {hasSearched && (
          <ResultsGrid 
            results={results} 
            category={currentCategory} 
            isLoading={isLoading} 
          />
        )}
        
        {!hasSearched && !isLoading && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="flex flex-col items-center justify-center mt-12 space-y-6 text-center px-4"
          >
            {/* search illustration removed */}
            <h2 className="text-xl font-medium text-gray-800 dark:text-gray-200">
              Comprehensive data from industry-leading sources
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-x-6 gap-y-3 max-w-2xl mx-auto mt-4">
              <div className="text-gray-600 dark:text-gray-300 text-sm font-medium">Amazon</div>
              <div className="text-gray-600 dark:text-gray-300 text-sm font-medium">Flipkart</div>
              <div className="text-gray-600 dark:text-gray-300 text-sm font-medium">IMDb</div>
              <div className="text-gray-600 dark:text-gray-300 text-sm font-medium">Goodreads</div>
              <div className="text-gray-600 dark:text-gray-300 text-sm font-medium">LinkedIn</div>
              <div className="text-gray-600 dark:text-gray-300 text-sm font-medium">Rotten Tomatoes</div>
              <div className="text-gray-600 dark:text-gray-300 text-sm font-medium"> themoviedb</div>
              <div className="text-gray-600 dark:text-gray-300 text-sm font-medium">Goodreads</div>
            </div>
          </motion.div>
        )}
      </main>

      <footer className="py-6 border-t border-gray-100 dark:border-gray-800 text-center text-gray-500 dark:text-gray-400 text-sm max-w-7xl mx-auto">
        <p>© {new Date().getFullYear()} Just Scrape Me. All rights reserved.</p>
      </footer>
    </div>
  );
}
