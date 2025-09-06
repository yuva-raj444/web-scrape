import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  serverExternalPackages: ['puppeteer'],
  // Disable development indicators
  devIndicators: {
    buildActivity: false,
    buildActivityPosition: 'bottom-left',
  },
  // Disable React strict mode warnings in production
  reactStrictMode: process.env.NODE_ENV === 'development',
  webpack: (config, { isServer }) => {
    if (isServer) {
      config.externals.push('puppeteer');
    }
    return config;
  },
  images: {
    domains: [
      // Product sites
      'www.amazon.in', 'm.media-amazon.com', 'images-eu.ssl-images-amazon.com', 'images-na.ssl-images-amazon.com',
      'www.flipkart.com', 'rukminim1.flixcart.com', 'rukminim2.flixcart.com',
      'www.snapdeal.com', 'n1.sdlcdn.com', 'n2.sdlcdn.com', 'n3.sdlcdn.com', 'n4.sdlcdn.com',
      
      // Movie sites
      'image.tmdb.org', 'm.media-amazon.com', 'www.imdb.com',
      
      // Book sites
      'i.gr-assets.com', 'covers.openlibrary.org', 'books.google.com', 
      
      // News sites
      'ichef.bbci.co.uk', 'www.ndtv.com', 'static.toiimg.com',
      
      // Restaurant sites
      'b.zmtcdn.com', 's3-media0.fl.yelpcdn.com', 'dynamic-media-cdn.tripadvisor.com',
      
      // Job sites
      'www.indeed.com', 'media.naukri.com', 'media.glassdoor.com',
    ],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
    ],
  },
};

export default nextConfig;
