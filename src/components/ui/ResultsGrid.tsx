'use client';

import { SearchResult } from '@/lib/types';
import { ResultCard } from './ResultCard';
import { motion } from 'framer-motion';
import { Info } from 'lucide-react';

interface ResultsGridProps {
  results: SearchResult[];
  category: string;
  isLoading: boolean;
}

export function ResultsGrid({ results, category, isLoading }: ResultsGridProps) {
  if (isLoading) {
    return (
      <div className="flex flex-col justify-center items-center py-20 space-y-4">
        <div className="animate-spin rounded-full h-10 w-10 border-2 border-gray-300 border-t-blue-600"></div>
        <p className="text-gray-500 dark:text-gray-400 text-sm">Aggregating data from multiple sources...</p>
      </div>
    );
  }

  if (results.length === 0) {
    return (
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="text-center py-12 max-w-md mx-auto"
      >
        <div className="bg-gray-50 dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-md p-6">
          <div className="flex justify-center mb-4">
            <div className="p-2 bg-gray-100 dark:bg-gray-800 rounded-full">
              <Info className="text-gray-500 dark:text-gray-400" size={24} />
            </div>
          </div>
          <h3 className="text-lg font-medium text-gray-800 dark:text-gray-200 mb-2">
            No matching results found
          </h3>
          <p className="text-gray-500 dark:text-gray-400 text-sm">
            Please try modifying your search criteria or selecting a different category.
          </p>
        </div>
      </motion.div>
    );
  }

  return (
    <div className="py-4">
      <div className="mb-4 px-4 max-w-7xl mx-auto">
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Showing {results.length} results from multiple sources
        </p>
      </div>
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 max-w-7xl mx-auto p-4"
      >
        {results.map((result, index) => (
          <motion.div
            key={`${result.source}-${index}`}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: index * 0.05 }}
          >
            <ResultCard result={result} category={category} />
          </motion.div>
        ))}
      </motion.div>
    </div>
  );
}
