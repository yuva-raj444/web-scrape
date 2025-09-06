import Image from 'next/image';
import { SearchResult } from '@/lib/types';
import { ExternalLink, Star, MapPin, Calendar, Briefcase, DollarSign, IndianRupee } from 'lucide-react';

interface ResultCardProps {
  result: SearchResult;
  category: string;
}

export function ResultCard({ result, category }: ResultCardProps) {
  return (
    <div className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-md shadow-sm overflow-hidden transition-all duration-300 hover:shadow-md">
      <div className="p-5">
        {result.image && (
          <div className="relative w-full h-40 mb-4 bg-gray-50 dark:bg-gray-800 rounded overflow-hidden">
            <Image 
              src={result.image} 
              alt={result.title} 
              fill
              className="object-cover"
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.style.display = 'none';
              }}
            />
          </div>
        )}
        
        <div className="flex items-start justify-between gap-3">
          <h3 className="text-base font-medium text-gray-800 dark:text-gray-100 line-clamp-2">{result.title}</h3>
          <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300 whitespace-nowrap">
            {result.source}
          </span>
        </div>
        
        {/* Conditional rendering based on category */}
        {category === 'products' && result.price && (
          <div className="flex items-center mt-2.5">
            <IndianRupee size={14} className="text-gray-500 dark:text-gray-400 mr-1.5" />
            <p className="text-gray-800 dark:text-gray-200 font-medium">{result.price}</p>
          </div>
        )}
        
        {(category === 'products' || category === 'movies' || category === 'books' || category === 'restaurants') && result.rating && (
          <div className="flex items-center mt-2">
            <Star size={14} className="text-amber-500 mr-1.5" />
            <p className="text-gray-600 dark:text-gray-400 text-sm">{result.rating}</p>
          </div>
        )}
        
        {(category === 'books' || category === 'news') && result.author && (
          <p className="mt-2 text-gray-600 dark:text-gray-400 text-sm">By: {result.author}</p>
        )}
        
        {(category === 'restaurants' || category === 'jobs') && result.location && (
          <div className="flex items-center mt-2">
            <MapPin size={14} className="text-gray-500 dark:text-gray-400 mr-1.5" />
            <p className="text-gray-600 dark:text-gray-400 text-sm">{result.location}</p>
          </div>
        )}
        
        {category === 'jobs' && result.company && (
          <div className="flex items-center mt-2">
            <Briefcase size={14} className="text-gray-500 dark:text-gray-400 mr-1.5" />
            <p className="text-gray-700 dark:text-gray-300 text-sm">{result.company}</p>
          </div>
        )}
        
        {category === 'jobs' && result.salary && (
          <div className="flex items-center mt-2">
            <IndianRupee size={14} className="text-emerald-600 dark:text-emerald-500 mr-1.5" />
            <p className="text-emerald-600 dark:text-emerald-500 text-sm font-medium">{result.salary}</p>
          </div>
        )}
        
        {(category === 'news' || category === 'books') && result.description && (
          <p className="mt-3 text-gray-500 dark:text-gray-400 text-sm line-clamp-2">{result.description}</p>
        )}
        
        {result.date && (
          <div className="flex items-center mt-2">
            <Calendar size={14} className="text-gray-500 dark:text-gray-400 mr-1.5" />
            <p className="text-gray-500 dark:text-gray-400 text-xs">{result.date}</p>
          </div>
        )}
        
        <div className="mt-4 pt-3 border-t border-gray-100 dark:border-gray-800">
          <a 
            href={result.url} 
            target="_blank" 
            rel="noopener noreferrer" 
            className="inline-flex items-center justify-center px-4 py-2 border border-gray-200 dark:border-gray-700 text-sm font-medium rounded text-gray-800 dark:text-gray-200 bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 focus:outline-none focus:ring-1 focus:ring-gray-300 dark:focus:ring-gray-600 transition-colors duration-200 w-full"
          >
            <ExternalLink size={14} className="mr-1.5" />
            View Source
          </a>
        </div>
      </div>
    </div>
  );
}
