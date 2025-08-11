"use client";

import { useState } from 'react';
import { useUser } from '@clerk/nextjs';

export default function TestPremiumPage() {
  const { user } = useUser();
  const [upgrading, setUpgrading] = useState(false);
  const [message, setMessage] = useState('');

  const handleUpgrade = async (tier: string) => {
    setUpgrading(true);
    setMessage('');

    try {
      const response = await fetch('/api/admin/upgrade-test', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ tier })
      });

      const data = await response.json();

      if (response.ok) {
        setMessage(`✅ Success! Account upgraded to ${tier}. Refresh the page to see changes.`);
        // Refresh the page after a short delay
        setTimeout(() => window.location.reload(), 2000);
      } else {
        setMessage(`❌ Error: ${data.error || 'Failed to upgrade'}`);
      }
    } catch (error: any) {
      setMessage(`❌ Error: ${error.message}`);
    } finally {
      setUpgrading(false);
    }
  };

  if (!user) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="text-center">
          <p className="text-gray-600">Please sign in to test premium features.</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="max-w-4xl mx-auto py-12 px-4">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">🧪 Test Premium Features</h1>
          <p className="text-gray-600 mb-8">
            Temporarily upgrade your account to test premium features in the Studio.
          </p>

          <div className="space-y-6">
            {/* Current Status */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h3 className="font-semibold text-blue-900 mb-2">Current User</h3>
              <p className="text-blue-800">
                <strong>Email:</strong> {user.emailAddresses[0]?.emailAddress}
              </p>
              <p className="text-blue-800">
                <strong>User ID:</strong> {user.id}
              </p>
            </div>

            {/* Message Display */}
            {message && (
              <div className={`p-4 rounded-lg ${
                message.includes('✅') 
                  ? 'bg-green-50 border border-green-200 text-green-800'
                  : 'bg-red-50 border border-red-200 text-red-800'
              }`}>
                {message}
              </div>
            )}

            {/* Upgrade Options */}
            <div>
              <h3 className="font-semibold text-gray-900 mb-4">Test Account Tiers</h3>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                {[
                  { tier: 'FREE', label: 'Free Tier', description: 'Basic features only' },
                  { tier: 'PRO', label: 'Pro Tier', description: 'All enhanced features' },
                  { tier: 'BUSINESS', label: 'Business Tier', description: 'Team features' },
                  { tier: 'ENTERPRISE', label: 'Enterprise Tier', description: 'Unlimited usage' }
                ].map(({ tier, label, description }) => (
                  <div key={tier} className="border border-gray-200 rounded-lg p-4">
                    <h4 className="font-semibold text-gray-900">{label}</h4>
                    <p className="text-sm text-gray-600 mb-4">{description}</p>
                    <button
                      onClick={() => handleUpgrade(tier)}
                      disabled={upgrading}
                      className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-sm"
                    >
                      {upgrading ? 'Upgrading...' : `Set to ${tier}`}
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Testing Instructions */}
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <h3 className="font-semibold text-yellow-900 mb-2">🧪 How to Test</h3>
              <ol className="text-yellow-800 text-sm space-y-1 list-decimal list-inside">
                <li>Click "Set to PRO" above to upgrade your test account</li>
                <li>Go to the <a href="/studio" className="underline text-blue-600">Studio page</a></li>
                <li>Import any YouTube video (or use the demo transcript)</li>
                <li>In Step 3, you'll see "✨ Enhanced Features" section</li>
                <li>Enable checkboxes for: Hook Generation, Title & Thumbnail Pack, CTA Integration</li>
                <li>Try advanced script styles: Persuasive, Narrative, Academic</li>
                <li>Generate script and see the enhanced results with hooks, titles, and thumbnails!</li>
              </ol>
            </div>

            {/* Premium Features List */}
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
              <h3 className="font-semibold text-gray-900 mb-2">✨ Premium Features to Test</h3>
              <ul className="text-gray-700 text-sm space-y-1 list-disc list-inside">
                <li><strong>Hook Generation:</strong> 3-5 different opening hook variations</li>
                <li><strong>Title Pack:</strong> 5 high-clickability titles with scores</li>
                <li><strong>Thumbnail Concepts:</strong> 3 visual premises with elements</li>
                <li><strong>Advanced Styles:</strong> Persuasive, Narrative, Academic scripts</li>
                <li><strong>CTA Integration:</strong> Native call-to-action embedding</li>
                <li><strong>Relink Outros:</strong> Bridge to next video</li>
                <li><strong>Click Confirmation:</strong> Title promise confirmation</li>
                <li><strong>Payout Structure:</strong> Valuable insights at section ends</li>
              </ul>
            </div>

            {/* Quick Links */}
            <div className="flex space-x-4">
              <a
                href="/studio"
                className="bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 text-sm"
              >
                → Go to Studio
              </a>
              <a
                href="/subscription"
                className="bg-gray-600 text-white py-2 px-4 rounded-md hover:bg-gray-700 text-sm"
              >
                → View Subscription
              </a>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}