'use client'

import { useEffect, useState } from 'react'

export default function ClerkCheckPage() {
  const [frontendApi, setFrontendApi] = useState<string>('Loading...')
  const [clerkLoaded, setClerkLoaded] = useState<boolean>(false)

  useEffect(() => {
    const checkClerk = () => {
      if (typeof window !== 'undefined') {
        const clerk = (window as any).Clerk
        if (clerk) {
          setFrontendApi(clerk.frontendApi || 'undefined')
          setClerkLoaded(true)
        } else {
          setFrontendApi('Clerk not loaded')
        }
      }
    }

    // Check immediately
    checkClerk()

    // Check again after a delay to ensure Clerk has loaded
    const timer = setTimeout(checkClerk, 2000)

    return () => clearTimeout(timer)
  }, [])

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-3xl mx-auto px-4">
        <div className="bg-white rounded-lg shadow p-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-6">
            🐛 Clerk Debug Check
          </h1>
          
          <div className="space-y-4">
            <div className="p-4 bg-gray-100 rounded">
              <strong>Environment Variables:</strong>
              <pre className="mt-2 text-sm text-gray-700">
                NEXT_PUBLIC_CLERK_FRONTEND_API: {process.env.NEXT_PUBLIC_CLERK_FRONTEND_API || 'undefined'}
              </pre>
            </div>

            <div className="p-4 bg-blue-100 rounded">
              <strong>Clerk Frontend API (from window.Clerk):</strong>
              <pre className="mt-2 text-sm text-gray-700">
                {frontendApi}
              </pre>
            </div>

            <div className="p-4 bg-green-100 rounded">
              <strong>Clerk Loaded:</strong>
              <pre className="mt-2 text-sm text-gray-700">
                {clerkLoaded ? 'Yes' : 'No'}
              </pre>
            </div>

            <div className="p-4 bg-yellow-100 rounded">
              <strong>Expected Pattern:</strong>
              <pre className="mt-2 text-sm text-gray-700">
                Should be: clerk-{'<hash>'}.clerk.accounts.dev
                Should NOT be: clerk.scriptforgeai.co
              </pre>
            </div>
          </div>

          <div className="mt-8">
            <button
              onClick={() => window.location.reload()}
              className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
            >
              Refresh Page
            </button>
          </div>

          <div className="mt-6 text-sm text-gray-600">
            <p><strong>Note:</strong> This is a temporary debug page. Remove before going to production.</p>
          </div>
        </div>
      </div>
    </div>
  )
}