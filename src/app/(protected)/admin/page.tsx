"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { useUser } from '@clerk/nextjs';

export default function AdminTestPage() {
  const { user } = useUser();
  const [testMode, setTestMode] = useState(false);
  const [adminStatus, setAdminStatus] = useState<{
    isAdmin: boolean;
    adminPrivileges: string | null;
  }>({ isAdmin: false, adminPrivileges: null });

  useEffect(() => {
    // Check admin status on page load
    const checkAdminStatus = async () => {
      try {
        const response = await fetch('/api/subscription/current');
        const data = await response.json();
        if (data.success && (data.isAdmin || data.testMode)) {
          setAdminStatus({
            isAdmin: data.isAdmin || false,
            adminPrivileges: data.adminPrivileges || null
          });
        }
      } catch (error) {
        console.error('Failed to check admin status:', error);
      }
    };

    if (user) {
      checkAdminStatus();
    }
  }, [user]);

  const enableTestMode = () => {
    // Add test mode parameters to localStorage so other pages can use them
    localStorage.setItem('admin-test-mode', 'true');
    localStorage.setItem('admin-test-key', 'test123');
    setTestMode(true);
  };

  const disableTestMode = () => {
    localStorage.removeItem('admin-test-mode');
    localStorage.removeItem('admin-test-key');
    setTestMode(false);
  };

  const getTestLink = (path: string) => {
    return `${path}?test=premium&admin=test123`;
  };

  return (
    <div className="bg-sketch-bg min-h-screen">
      <div className="max-w-sketch-content mx-auto px-sketch-6 py-sketch-12">
        <div className="max-w-4xl mx-auto">
          
          {/* Header */}
          <div className="mb-sketch-12">
            <h1 className="font-sketch-serif text-5xl text-sketch-text leading-tight mb-sketch-4">
              🔧 Admin Test Panel
            </h1>
            <p className="text-sketch-body text-sketch-text-muted">
              Test premium features and functionality without requiring a real subscription.
              This is for development and testing purposes only.
            </p>
          </div>

          {/* Admin Status & Test Mode */}
          <div className="bg-white rounded-sketch-md border border-sketch-border p-sketch-8 shadow-sketch-soft mb-sketch-8">
            <h2 className="text-sketch-h2 font-semibold text-sketch-text mb-sketch-4">
              Admin Status & Test Mode
            </h2>
            
            {/* Admin Status */}
            <div className="mb-sketch-6">
              <h3 className="font-semibold text-sketch-text mb-sketch-3">Admin Privileges</h3>
              <div className="flex items-center gap-sketch-4 mb-sketch-4">
                <div className={`px-3 py-1 rounded-full text-sm font-medium ${
                  adminStatus.isAdmin
                    ? 'bg-purple-100 text-purple-800 border border-purple-200' 
                    : 'bg-gray-100 text-gray-800 border border-gray-200'
                }`}>
                  {adminStatus.isAdmin ? '👑 Master Admin Access' : '👤 Regular User'}
                </div>
                {adminStatus.adminPrivileges && (
                  <div className="px-2 py-1 bg-blue-50 text-blue-700 text-xs rounded border border-blue-200">
                    {adminStatus.adminPrivileges}
                  </div>
                )}
              </div>
              {adminStatus.isAdmin && (
                <p className="text-sketch-small text-purple-700 bg-purple-50 p-3 rounded border border-purple-200">
                  <strong>Master Admin:</strong> You have automatic access to all premium features 
                  (ENTERPRISE tier) without needing URL test parameters.
                </p>
              )}
            </div>

            {/* Test Mode */}
            <div>
              <h3 className="font-semibold text-sketch-text mb-sketch-3">URL Test Mode</h3>
              <div className="flex items-center gap-sketch-4 mb-sketch-6">
                <div className={`px-3 py-1 rounded-full text-sm font-medium ${
                  testMode 
                    ? 'bg-green-100 text-green-800 border border-green-200' 
                    : 'bg-gray-100 text-gray-800 border border-gray-200'
                }`}>
                  {testMode ? '🟢 Premium Test Mode Active' : '🔴 Normal Mode'}
                </div>
              </div>
            </div>

            <div className="flex gap-sketch-4">
              <Button 
                onClick={enableTestMode}
                disabled={testMode || adminStatus.isAdmin}
                className="bg-green-600 hover:bg-green-700 text-white disabled:opacity-50"
              >
                Enable Premium Test Mode
              </Button>
              <Button 
                onClick={disableTestMode}
                disabled={!testMode}
                variant="outline"
              >
                Disable Test Mode
              </Button>
            </div>
            
            {adminStatus.isAdmin && (
              <p className="text-sketch-small text-gray-600 mt-3">
                Test mode not needed - you already have master admin access to all features.
              </p>
            )}
          </div>

          {/* Premium Features Testing Links */}
          <div className="bg-white rounded-sketch-md border border-sketch-border p-sketch-8 shadow-sketch-soft mb-sketch-8">
            <h2 className="text-sketch-h2 font-semibold text-sketch-text mb-sketch-4">
              🚀 Premium Features Testing
            </h2>
            <p className="text-sketch-body text-sketch-text-muted mb-sketch-6">
              Use these links to test premium features with simulated PRO account access:
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-sketch-6">
              
              {/* Studio Testing */}
              <div className="border border-sketch-border rounded-sketch-md p-sketch-6">
                <h3 className="font-semibold text-sketch-text mb-sketch-3">🎬 Studio (Premium)</h3>
                <p className="text-sketch-small text-sketch-text-muted mb-sketch-4">
                  Test all premium script generation features
                </p>
                <Link 
                  href={getTestLink('/studio')}
                  className="inline-block"
                >
                  <Button size="sm" className="bg-blue-600 hover:bg-blue-700 text-white">
                    Test Studio Premium
                  </Button>
                </Link>
              </div>

              {/* Subscription Page */}
              <div className="border border-sketch-border rounded-sketch-md p-sketch-6">
                <h3 className="font-semibold text-sketch-text mb-sketch-3">💳 Subscription</h3>
                <p className="text-sketch-small text-sketch-text-muted mb-sketch-4">
                  View subscription as PRO user
                </p>
                <Link 
                  href={getTestLink('/subscription')}
                  className="inline-block"
                >
                  <Button size="sm" variant="outline">
                    Test Subscription View
                  </Button>
                </Link>
              </div>

              {/* Scripts Page */}
              <div className="border border-sketch-border rounded-sketch-md p-sketch-6">
                <h3 className="font-semibold text-sketch-text mb-sketch-3">📝 Scripts</h3>
                <p className="text-sketch-small text-sketch-text-muted mb-sketch-4">
                  Access scripts with premium features
                </p>
                <Link 
                  href={getTestLink('/scripts')}
                  className="inline-block"
                >
                  <Button size="sm" variant="outline">
                    Test Scripts Premium
                  </Button>
                </Link>
              </div>

              {/* Dashboard */}
              <div className="border border-sketch-border rounded-sketch-md p-sketch-6">
                <h3 className="font-semibold text-sketch-text mb-sketch-3">📊 Dashboard</h3>
                <p className="text-sketch-small text-sketch-text-muted mb-sketch-4">
                  Dashboard with premium limits
                </p>
                <Link 
                  href={getTestLink('/dashboard')}
                  className="inline-block"
                >
                  <Button size="sm" variant="outline">
                    Test Dashboard Premium
                  </Button>
                </Link>
              </div>

            </div>
          </div>

          {/* Premium Features List */}
          <div className="bg-white rounded-sketch-md border border-sketch-border p-sketch-8 shadow-sketch-soft">
            <h2 className="text-sketch-h2 font-semibold text-sketch-text mb-sketch-4">
              ✨ Premium Features to Test
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-sketch-6">
              <div>
                <h3 className="font-semibold text-sketch-text mb-sketch-3">Studio Features:</h3>
                <ul className="text-sketch-small text-sketch-text-muted space-y-1">
                  <li>• ✨ Hook Generation (3-5 variants)</li>
                  <li>• ✨ Title & Thumbnail Pack (5+3)</li>
                  <li>• ✨ Advanced Script Styles (Persuasive, Narrative, Academic)</li>
                  <li>• ✨ CTA Integration & Relink Outros</li>
                  <li>• ✨ Payout Structure & Mini Re-hooks</li>
                  <li>• 🆕 Key Points Integration (PRO+)</li>
                  <li>• 🆕 Custom Instructions (PRO+)</li>
                  <li>• 🆕 Script Remixing (PRO+)</li>
                  <li>• 🆕 Creativity Controls (PRO+)</li>
                  <li>• Priority Processing</li>
                  <li>• Watermark-free Scripts</li>
                </ul>
              </div>
              
              <div>
                <h3 className="font-semibold text-sketch-text mb-sketch-3">Account Benefits:</h3>
                <ul className="text-sketch-small text-sketch-text-muted space-y-1">
                  <li>• 50 scripts per month (vs 2 free)</li>
                  <li>• Priority Email Support</li>
                  <li>• API Access</li>
                  <li>• Priority Processing</li>
                  <li>• No watermarks on scripts</li>
                </ul>
                
                <h3 className="font-semibold text-sketch-text mb-sketch-3 mt-sketch-4">Business+ Features:</h3>
                <ul className="text-sketch-small text-sketch-text-muted space-y-1">
                  <li>• 🚀 Batch Generation (BUSINESS+)</li>
                  <li>• 🧪 A/B Testing (BUSINESS+)</li>
                  <li>• 📚 Template Library (ENTERPRISE)</li>
                  <li>• 200+ scripts/month (BUSINESS)</li>
                  <li>• Unlimited scripts (ENTERPRISE)</li>
                </ul>
              </div>
            </div>
            
            <div className="mt-sketch-6 p-sketch-4 bg-yellow-50 border border-yellow-200 rounded-sketch-md">
              <p className="text-sketch-small text-yellow-800">
                <strong>Note:</strong> {adminStatus.isAdmin ? 
                  'As a Master Admin, you automatically have ENTERPRISE tier access to all features including script remixing, batch generation, A/B testing, and template library.' :
                  'URL test mode simulates PRO tier access. In the Studio page, you\'ll see all premium features including the new remix capabilities: Key Points Integration, Custom Instructions, Script Remixing, and Creativity Controls become available for testing.'
                }
              </p>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}