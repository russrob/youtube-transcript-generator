import Link from 'next/link';
import { AppHeader } from '@/components/ui/AppHeader';
import { AppFooter } from '@/components/ui/AppFooter';

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <AppHeader />
      <main className="flex-1 flex items-center justify-center">
        <div className="max-w-md mx-auto text-center px-4">
          <div className="mb-8">
            <div className="text-8xl font-bold text-blue-600 mb-4">404</div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Page Not Found</h1>
            <p className="text-gray-600 mb-8">
              The page you're looking for doesn't exist or has been moved.
            </p>
          </div>
          
          <div className="space-y-4">
            <Link 
              href="/"
              className="inline-block bg-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors"
            >
              Go Home
            </Link>
            
            <div className="text-sm text-gray-500">
              Or try one of these pages:
            </div>
            
            <div className="flex flex-col sm:flex-row gap-2 justify-center text-sm">
              <Link href="/studio" className="text-blue-600 hover:text-blue-800 transition-colors">
                Create Script
              </Link>
              <span className="hidden sm:inline text-gray-400">•</span>
              <Link href="/about" className="text-blue-600 hover:text-blue-800 transition-colors">
                About Us
              </Link>
              <span className="hidden sm:inline text-gray-400">•</span>
              <Link href="/contact" className="text-blue-600 hover:text-blue-800 transition-colors">
                Contact
              </Link>
            </div>
          </div>
        </div>
      </main>
      <AppFooter />
    </div>
  );
}