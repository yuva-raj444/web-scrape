'use client';

import { useState, FormEvent } from 'react';
import { Category } from '@/lib/types';
import { Search, ShoppingBag, Film, BookOpen, Briefcase } from 'lucide-react';
import { motion } from 'framer-motion';

interface SearchFormProps {
  onSearch: (category: Category, query: string, location?: string) => void;
  isLoading: boolean;
}

export function SearchForm({ onSearch, isLoading }: SearchFormProps) {
  const [category, setCategory] = useState<Category>('products');
  const [query, setQuery] = useState('');
  const [location, setLocation] = useState('');
  const [showLocationField, setShowLocationField] = useState(false);

  const handleCategoryChange = (newCategory: Category) => {
    setCategory(newCategory);
    setShowLocationField(newCategory === 'jobs');
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      onSearch(category, query, location);
    }
  };

  const categories: { value: Category; label: string; icon: React.ReactNode }[] = [
    { value: 'products', label: 'Products', icon: <ShoppingBag size={18} /> },
    { value: 'movies', label: 'Movies', icon: <Film size={18} /> },
    { value: 'books', label: 'Books', icon: <BookOpen size={18} /> },
    { value: 'jobs', label: 'Jobs', icon: <Briefcase size={18} /> },
  ];

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="w-full max-w-4xl mx-auto p-4 py-8"
    >
      <form onSubmit={handleSubmit} className="bg-white dark:bg-gray-900 rounded-md shadow-md border border-gray-100 dark:border-gray-800 p-6">
        <div className="flex flex-col space-y-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
            {categories.map((cat) => (
              <button
                key={cat.value}
                type="button"
                onClick={() => handleCategoryChange(cat.value)}
                className={`flex items-center justify-center py-2.5 px-3 rounded-md transition-all duration-200 ${
                  category === cat.value
                    ? 'bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white font-medium border border-gray-200 dark:border-gray-700 shadow-sm'
                    : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800/70'
                }`}
              >
                <span className={`mr-2 ${category === cat.value ? 'text-blue-600 dark:text-blue-400' : 'text-gray-500 dark:text-gray-400'}`}>
                  {cat.icon}
                </span>
                <span className="text-sm">{cat.label}</span>
              </button>
            ))}
          </div>

          <div className="flex items-center w-full">
            <div className="relative flex-1">
              <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-gray-400 dark:text-gray-500">
                <Search size={18} />
              </div>
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder={`Search ${category}...`}
                className="w-full pl-10 pr-4 py-2.5 border border-gray-200 dark:border-gray-700 rounded-l-md text-gray-800 dark:text-gray-100 bg-white dark:bg-gray-900 focus:ring-1 focus:ring-blue-500 focus:border-blue-500 outline-none text-sm"
                required
              />
            </div>
            {showLocationField && (
              <input
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder={category === 'jobs' ? "Location (e.g. remote, chennai)" : "Location"}
                className="w-1/3 px-4 py-2.5 border-t border-b border-gray-200 dark:border-gray-700 text-gray-800 dark:text-gray-100 bg-white dark:bg-gray-900 focus:ring-1 focus:ring-blue-500 focus:border-blue-500 outline-none text-sm"
              />
            )}
            <button
              type="submit"
              disabled={isLoading || !query.trim()}
              className={`px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-r-md focus:outline-none focus:ring-1 focus:ring-blue-500 focus:ring-offset-1 transition-colors ${
                isLoading || !query.trim() ? 'opacity-70 cursor-not-allowed' : ''
              }`}
            >
              {isLoading ? 'Searching...' : 'Search'}
            </button>
          </div>
        </div>
      </form>
    </motion.div>
  );
}
