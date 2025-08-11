'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { AppHeader } from '@/components/ui/AppHeader';
import { AppFooter } from '@/components/ui/AppFooter';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error('Application error:', error);
  }, [error]);

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <AppHeader />
      <main className="flex-1 flex items-center justify-center">
        <div className="max-w-md mx-auto text-center px-4">
          <div className="mb-8">
            <div className="text-6xl mb-4">⚠️</div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Something went wrong</h1>
            <p className="text-gray-600 mb-8">
              We encountered an unexpected error. Our team has been notified and is working on a fix.
            </p>
          </div>
          
          <div className="space-y-4">
            <button
              onClick={reset}
              className="inline-block bg-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors mr-4"
            >
              Try Again
            </button>
            
            <Link 
              href="/"
              className="inline-block bg-gray-100 text-gray-700 px-6 py-3 rounded-lg font-medium hover:bg-gray-200 transition-colors"
            >
              Go Home
            </Link>
          </div>
          
          {process.env.NODE_ENV === 'development' && (
            <details className="mt-8 text-left bg-red-50 p-4 rounded-lg border border-red-200">
              <summary className="cursor-pointer text-red-800 font-medium mb-2">
                Error Details (Development)
              </summary>
              <pre className="text-xs text-red-700 overflow-auto">
                {error.message}
                {error.stack && '\n\n' + error.stack}
              </pre>
            </details>
          )}
        </div>
      </main>
      <AppFooter />
    </div>
  );
}