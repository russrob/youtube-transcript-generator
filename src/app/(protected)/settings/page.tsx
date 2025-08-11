import { requireUser } from '@/lib/auth/require-user';
import { UserProfile } from '@clerk/nextjs';

export default async function SettingsPage() {
  const { clerkUser, dbUser } = await requireUser();

  return (
    <>
      
      <div className="max-w-4xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Account Settings</h1>
          <p className="mt-2 text-gray-600">
            Manage your profile, security, and subscription settings
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Profile Section */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow">
              <UserProfile 
                appearance={{
                  elements: {
                    rootBox: "w-full",
                    card: "shadow-none border-0",
                    navbar: "hidden",
                    pageScrollBox: "p-0",
                    headerTitle: "hidden",
                    headerSubtitle: "hidden"
                  }
                }}
              />
            </div>
          </div>

          {/* Quick Stats & Actions */}
          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Account Stats</h3>
              <div className="space-y-4">
                <div>
                  <div className="text-sm text-gray-600">Total Scripts</div>
                  <div className="text-2xl font-bold text-gray-900">0</div>
                </div>
                <div>
                  <div className="text-sm text-gray-600">This Month</div>
                  <div className="text-2xl font-bold text-gray-900">0</div>
                </div>
                <div>
                  <div className="text-sm text-gray-600">Plan</div>
                  <div className="text-lg font-medium text-blue-600">Free</div>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
              <div className="space-y-3">
                <button className="w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors">
                  Upgrade Plan
                </button>
                <button className="w-full px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors">
                  Export Data
                </button>
                <button className="w-full px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors">
                  API Keys
                </button>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Support</h3>
              <div className="space-y-3">
                <a 
                  href="mailto:support@example.com"
                  className="block text-blue-600 hover:text-blue-800"
                >
                  📧 Contact Support
                </a>
                <a 
                  href="/docs" 
                  className="block text-blue-600 hover:text-blue-800"
                >
                  📚 Documentation
                </a>
                <a 
                  href="/changelog" 
                  className="block text-blue-600 hover:text-blue-800"
                >
                  📋 Changelog
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}