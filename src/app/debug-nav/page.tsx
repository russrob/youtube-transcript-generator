'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

export default function DebugNavPage() {
  const router = useRouter();
  const [testResult, setTestResult] = useState('');

  const handleManualNavigation = () => {
    setTestResult('Attempting router.push...');
    try {
      router.push('/sign-up');
      setTestResult('Router.push executed successfully');
    } catch (error) {
      setTestResult(`Router.push failed: ${error}`);
    }
  };

  const handleWindowLocation = () => {
    setTestResult('Attempting window.location...');
    window.location.href = '/sign-up';
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-8">
      <div className="max-w-md mx-auto space-y-6 bg-white p-8 rounded-lg shadow">
        <h1 className="text-2xl font-bold text-center">Navigation Debug</h1>
        
        <div className="space-y-4">
          <div>
            <h3 className="font-semibold mb-2">Test 1: Next.js Link</h3>
            <Link 
              href="/sign-up" 
              className="block w-full bg-blue-600 text-white text-center py-2 px-4 rounded hover:bg-blue-700"
            >
              Link to Sign Up
            </Link>
          </div>

          <div>
            <h3 className="font-semibold mb-2">Test 2: Router Push</h3>
            <button 
              onClick={handleManualNavigation}
              className="block w-full bg-green-600 text-white py-2 px-4 rounded hover:bg-green-700"
            >
              Router Push to Sign Up
            </button>
          </div>

          <div>
            <h3 className="font-semibold mb-2">Test 3: Window Location</h3>
            <button 
              onClick={handleWindowLocation}
              className="block w-full bg-orange-600 text-white py-2 px-4 rounded hover:bg-orange-700"
            >
              Window Location to Sign Up
            </button>
          </div>

          <div>
            <h3 className="font-semibold mb-2">Test 4: Regular HTML Link</h3>
            <a 
              href="/sign-up" 
              className="block w-full bg-purple-600 text-white text-center py-2 px-4 rounded hover:bg-purple-700"
            >
              HTML Link to Sign Up
            </a>
          </div>
        </div>

        {testResult && (
          <div className="mt-4 p-3 bg-gray-100 rounded text-sm">
            <strong>Result:</strong> {testResult}
          </div>
        )}

        <div className="mt-6 text-center">
          <Link href="/" className="text-blue-600 hover:underline">
            ← Back to Home
          </Link>
        </div>
      </div>
    </div>
  );
}