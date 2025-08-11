import { requireUser } from '@/lib/auth/require-user';
import { getUserSubscription, getSubscriptionLimits } from '@/lib/subscription/subscription-service';
import { UsageLimits } from '@/components/ui/UsageLimits';
import { prisma } from '@/lib/prisma';
import Link from 'next/link';
import { SubscriptionTier } from '@prisma/client';

export default async function DashboardPage() {
  const { clerkUser, dbUser } = await requireUser();

  // Load subscription data
  const subscription = await getUserSubscription(clerkUser.id);
  const limits = getSubscriptionLimits(subscription.tier);

  // Load recent scripts
  const recentScripts = await prisma.script.findMany({
    where: {
      video: {
        userId: clerkUser.id
      }
    },
    include: {
      video: {
        select: {
          id: true,
          youtubeId: true,
          title: true,
          thumbnailUrl: true,
          createdAt: true
        }
      }
    },
    orderBy: {
      createdAt: 'desc'
    },
    take: 3
  });

  // Calculate stats
  const totalScripts = await prisma.script.count({
    where: {
      video: {
        userId: clerkUser.id
      }
    }
  });

  const thisMonth = await prisma.script.count({
    where: {
      video: {
        userId: clerkUser.id
      },
      createdAt: {
        gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1)
      }
    }
  });

  const isPremium = subscription.tier !== SubscriptionTier.FREE;

  return (
    <>
      
      <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        {/* Header Section */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Welcome back, {clerkUser.firstName || 'User'}!
              </h1>
              <p className="mt-2 text-gray-600">
                Transform YouTube videos into professional scripts with AI.
              </p>
            </div>
            <div className="flex items-center space-x-3">
              <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                subscription.tier === SubscriptionTier.FREE 
                  ? 'bg-gray-100 text-gray-800'
                  : subscription.tier === SubscriptionTier.PRO
                  ? 'bg-blue-100 text-blue-800'
                  : subscription.tier === SubscriptionTier.BUSINESS
                  ? 'bg-purple-100 text-purple-800'
                  : 'bg-yellow-100 text-yellow-800'
              }`}>
                {subscription.tier.charAt(0) + subscription.tier.slice(1).toLowerCase()}
              </span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          {/* Usage Stats - Fixed Calculator */}
          <div className="lg:col-span-1">
            <UsageLimits 
              usage={{
                used: subscription.usage.used,
                limit: subscription.usage.limit,
                remaining: subscription.usage.remaining,
                resetDate: subscription.usage.resetDate,
                canGenerate: subscription.usage.canGenerate,
                isUnlimited: subscription.usage.limit === -1
              }}
              tier={subscription.tier}
            />
          </div>

          {/* Quick Stats */}
          <div className="lg:col-span-2 grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white rounded-lg border border-gray-200 p-4">
              <div className="text-sm font-medium text-gray-600">Total Scripts</div>
              <div className="text-2xl font-bold text-blue-600">{totalScripts}</div>
            </div>
            <div className="bg-white rounded-lg border border-gray-200 p-4">
              <div className="text-sm font-medium text-gray-600">This Month</div>
              <div className="text-2xl font-bold text-green-600">{thisMonth}</div>
            </div>
            <div className="bg-white rounded-lg border border-gray-200 p-4">
              <div className="text-sm font-medium text-gray-600">Tier</div>
              <div className="text-lg font-semibold text-purple-600 capitalize">
                {subscription.tier.toLowerCase()}
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Quick Actions */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-xl font-semibold mb-4">Quick Actions</h2>
            <div className="space-y-3">
              <Link href="/studio" className="block">
                <div className="w-full text-left px-4 py-3 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors cursor-pointer">
                  <div className="font-medium text-blue-900">✨ Create Script</div>
                  <div className="text-sm text-blue-700">Generate from YouTube URL</div>
                </div>
              </Link>
              <Link href="/scripts" className="block">
                <div className="w-full text-left px-4 py-3 bg-green-50 hover:bg-green-100 rounded-lg transition-colors cursor-pointer">
                  <div className="font-medium text-green-900">📄 View Scripts</div>
                  <div className="text-sm text-green-700">Manage your creations</div>
                </div>
              </Link>
              {!isPremium && (
                <Link href="/subscription" className="block">
                  <div className="w-full text-left px-4 py-3 bg-yellow-50 hover:bg-yellow-100 rounded-lg transition-colors cursor-pointer">
                    <div className="font-medium text-yellow-900">⭐ Upgrade Pro</div>
                    <div className="text-sm text-yellow-700">Unlock premium features</div>
                  </div>
                </Link>
              )}
            </div>
          </div>

          {/* Recent Scripts */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold">Recent Scripts</h2>
              {recentScripts.length > 0 && (
                <Link href="/scripts" className="text-sm text-blue-600 hover:text-blue-800">
                  View all →
                </Link>
              )}
            </div>
            {recentScripts.length > 0 ? (
              <div className="space-y-3">
                {recentScripts.map((script) => (
                  <div key={script.id} className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                    {script.video.thumbnailUrl && (
                      <img 
                        src={script.video.thumbnailUrl} 
                        alt={script.video.title}
                        className="w-12 h-9 rounded object-cover"
                      />
                    )}
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium text-gray-900 truncate">
                        {script.title}
                      </div>
                      <div className="text-xs text-gray-500">
                        {script.style} • {script.durationMin}min
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-gray-500 text-center py-8">
                <p>No scripts yet</p>
                <p className="text-sm mt-1">Create your first script to get started</p>
                <Link href="/studio" className="inline-block mt-3 text-blue-600 hover:text-blue-800 text-sm font-medium">
                  Get Started →
                </Link>
              </div>
            )}
          </div>

          {/* Premium Features Highlight */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-xl font-semibold mb-4">
              {isPremium ? '✨ Premium Features' : '🚀 Unlock Premium'}
            </h2>
            {isPremium ? (
              <div className="space-y-3">
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span className="text-sm text-gray-700">Hook Generation</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span className="text-sm text-gray-700">Title & Thumbnail Pack</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span className="text-sm text-gray-700">Advanced Styles</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span className="text-sm text-gray-700">CTA Integration</span>
                </div>
                <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                  <p className="text-xs text-blue-800">You have full access to all premium features!</p>
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-gray-300 rounded-full"></div>
                  <span className="text-sm text-gray-500">Hook Generation (3-5 variants)</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-gray-300 rounded-full"></div>
                  <span className="text-sm text-gray-500">Title & Thumbnail Pack</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-gray-300 rounded-full"></div>
                  <span className="text-sm text-gray-500">Advanced Script Styles</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-gray-300 rounded-full"></div>
                  <span className="text-sm text-gray-500">50 scripts/month</span>
                </div>
                <Link href="/subscription">
                  <button className="w-full mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium">
                    Upgrade to Pro - $19/mo
                  </button>
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}