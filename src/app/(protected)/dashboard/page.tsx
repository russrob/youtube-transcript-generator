import { requireUser } from '@/lib/auth/require-user';
import { AppHeader } from '@/components/ui/AppHeader';

export default async function DashboardPage() {
  const { clerkUser, dbUser } = await requireUser();

  return (
    <div className="min-h-screen bg-gray-50">
      <AppHeader />
      
      <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            Welcome back, {clerkUser.firstName || 'User'}!
          </h1>
          <p className="mt-2 text-gray-600">
            Transform YouTube videos into professional transcripts and scripts.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Quick Actions */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-4">Quick Actions</h2>
            <div className="space-y-3">
              <button className="w-full text-left px-4 py-3 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors">
                <div className="font-medium text-blue-900">New Transcript</div>
                <div className="text-sm text-blue-700">Generate from YouTube URL</div>
              </button>
              <button className="w-full text-left px-4 py-3 bg-green-50 hover:bg-green-100 rounded-lg transition-colors">
                <div className="font-medium text-green-900">Studio Mode</div>
                <div className="text-sm text-green-700">Advanced editing tools</div>
              </button>
            </div>
          </div>

          {/* Recent Transcripts */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-4">Recent Transcripts</h2>
            <div className="text-gray-500 text-center py-8">
              <p>No transcripts yet</p>
              <p className="text-sm mt-1">Create your first transcript to get started</p>
            </div>
          </div>

          {/* Usage Stats */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-4">Usage</h2>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between text-sm">
                  <span>Transcripts this month</span>
                  <span className="font-medium">0 / 10</span>
                </div>
                <div className="mt-2 bg-gray-200 rounded-full h-2">
                  <div className="bg-blue-600 h-2 rounded-full" style={{width: '0%'}}></div>
                </div>
              </div>
              <button className="w-full px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg text-sm font-medium transition-colors">
                Upgrade Plan
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}