import { NextResponse } from 'next/server';

export function middleware() {
  // Only run this middleware in development mode
  if (process.env.NODE_ENV !== 'development') {
    return NextResponse.next();
  }

  const response = NextResponse.next();

  // Add a header that will trigger a Content-Security-Policy
  // that prevents the Next.js overlay from loading
  response.headers.set(
    'Content-Security-Policy',
    "script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline';"
  );

  return response;
}

// Only run middleware on the homepage
export const config = {
  matcher: '/',
};
