import { requireUser } from '@/lib/auth/require-user';
import { getUserSubscription, getSubscriptionLimits, getEffectiveSubscriptionTier } from '@/lib/subscription/subscription-service';
import { UsageLimits } from '@/components/ui/UsageLimits';
import { prisma } from '@/lib/prisma';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { SubscriptionTier } from '@prisma/client';

export default async function DashboardPage() {
  const { clerkUser, dbUser } = await requireUser();

  // Load subscription data
  const subscription = await getUserSubscription(clerkUser.id);
  const userEmail = clerkUser.emailAddresses[0]?.emailAddress || '';
  
  // Get effective tier (includes master admin detection)
  const effectiveTier = getEffectiveSubscriptionTier(
    subscription.tier,
    userEmail,
    clerkUser.id
  );
  
  const limits = getSubscriptionLimits(effectiveTier);
  
  // Update subscription object with effective tier for display
  const displaySubscription = {
    ...subscription,
    tier: effectiveTier
  };

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

  const isPremium = effectiveTier !== SubscriptionTier.FREE;

  return (
    <div className="bg-sketch-bg min-h-screen">
      <div className="max-w-sketch-content mx-auto py-sketch-12 px-sketch-6">
        {/* Header Section */}
        <div className="mb-sketch-12">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="font-sketch-serif text-5xl text-sketch-text mb-4 leading-tight">
                Welcome back, {clerkUser.firstName || 'Creator'}!
              </h1>
              <p className="mt-sketch-3 text-sketch-body text-sketch-text-muted">
                Transform YouTube videos into professional scripts with AI.
              </p>
            </div>
            <div className="flex items-center space-x-sketch-3">
              <span className={`inline-flex items-center px-sketch-4 py-sketch-2 rounded-full text-sketch-small font-semibold ${
                effectiveTier === SubscriptionTier.FREE 
                  ? 'bg-sketch-surface text-sketch-text border border-sketch-border'
                  : effectiveTier === SubscriptionTier.PRO
                  ? 'bg-blue-100 text-blue-800 border border-blue-200'
                  : effectiveTier === SubscriptionTier.BUSINESS
                  ? 'bg-purple-100 text-purple-800 border border-purple-200'
                  : 'bg-yellow-100 text-yellow-800 border border-yellow-200'
              }`}>
                {effectiveTier.charAt(0) + effectiveTier.slice(1).toLowerCase()}
              </span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-sketch-8 mb-sketch-12">
          {/* Usage Stats - Fixed Calculator */}
          <div className="lg:col-span-1">
            <UsageLimits 
              usage={{
                used: subscription.usage.used,
                limit: limits.monthlyScripts === -1 ? -1 : subscription.usage.limit,
                remaining: limits.monthlyScripts === -1 ? -1 : subscription.usage.remaining,
                resetDate: subscription.usage.resetDate,
                canGenerate: limits.monthlyScripts === -1 ? true : subscription.usage.canGenerate,
                isUnlimited: limits.monthlyScripts === -1
              }}
              tier={effectiveTier}
            />
          </div>

          {/* Quick Stats */}
          <div className="lg:col-span-2 grid grid-cols-1 md:grid-cols-3 gap-sketch-6">
            <div className="bg-white rounded-sketch-md border border-sketch-border p-sketch-6 shadow-sketch-soft hover:shadow-sketch-card transition-shadow">
              <div className="text-sketch-small font-medium text-sketch-text-muted">Total Scripts</div>
              <div className="text-sketch-h2 font-bold text-sketch-text mt-sketch-2">{totalScripts}</div>
            </div>
            <div className="bg-white rounded-sketch-md border border-sketch-border p-sketch-6 shadow-sketch-soft hover:shadow-sketch-card transition-shadow">
              <div className="text-sketch-small font-medium text-sketch-text-muted">This Month</div>
              <div className="text-sketch-h2 font-bold text-sketch-text mt-sketch-2">{thisMonth}</div>
            </div>
            <div className="bg-white rounded-sketch-md border border-sketch-border p-sketch-6 shadow-sketch-soft hover:shadow-sketch-card transition-shadow">
              <div className="text-sketch-small font-medium text-sketch-text-muted">Current Tier</div>
              <div className="text-sketch-h3 font-semibold text-sketch-accent mt-sketch-2 capitalize">
                {effectiveTier.toLowerCase()}
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-sketch-8">
          {/* Quick Actions */}
          <div className="bg-white rounded-sketch-md shadow-sketch-soft border border-sketch-border p-sketch-8">
            <h2 className="text-sketch-h2 font-semibold mb-sketch-6 text-sketch-text tracking-sketch-tight">Quick Actions</h2>
            <div className="space-y-sketch-4">
              <Link href="/studio" className="block">
                <div className="w-full text-left p-sketch-6 bg-sketch-accent/10 hover:bg-sketch-accent/15 rounded-sketch-md transition-colors cursor-pointer border border-sketch-accent/20">
                  <div className="font-semibold text-sketch-text">Create Script</div>
                  <div className="text-sketch-small text-sketch-text-muted mt-1">Generate from YouTube URL</div>
                </div>
              </Link>
              <Link href="/scripts" className="block">
                <div className="w-full text-left p-sketch-6 bg-sketch-surface hover:bg-gray-100 rounded-sketch-md transition-colors cursor-pointer border border-sketch-border">
                  <div className="font-semibold text-sketch-text">View Scripts</div>
                  <div className="text-sketch-small text-sketch-text-muted mt-1">Manage your creations</div>
                </div>
              </Link>
              {!isPremium && (
                <Link href="/subscription" className="block">
                  <div className="w-full text-left p-sketch-6 bg-sketch-accent/10 hover:bg-sketch-accent/15 rounded-sketch-md transition-colors cursor-pointer border border-sketch-accent/20">
                    <div className="font-semibold text-sketch-text">Upgrade to Pro</div>
                    <div className="text-sketch-small text-sketch-text-muted mt-1">Unlock premium features</div>
                  </div>
                </Link>
              )}
            </div>
          </div>

          {/* Recent Scripts */}
          <div className="bg-white rounded-sketch-md shadow-sketch-soft border border-sketch-border p-sketch-6">
            <div className="flex items-center justify-between mb-sketch-4">
              <h2 className="text-sketch-h2 font-semibold text-sketch-text tracking-sketch-tight">Recent Scripts</h2>
              {recentScripts.length > 0 && (
                <Link href="/scripts" className="text-sketch-small text-sketch-accent hover:text-sketch-text font-medium">
                  View all →
                </Link>
              )}
            </div>
            {recentScripts.length > 0 ? (
              <div className="space-y-sketch-3">
                {recentScripts.map((script) => (
                  <div key={script.id} className="flex items-center space-x-sketch-3 p-sketch-3 bg-sketch-surface rounded-sketch-sm border border-sketch-border/50">
                    {script.video.thumbnailUrl && (
                      <img 
                        src={script.video.thumbnailUrl} 
                        alt={script.video.title}
                        className="w-12 h-9 rounded object-cover"
                      />
                    )}
                    <div className="flex-1 min-w-0">
                      <div className="text-sketch-small font-medium text-sketch-text truncate">
                        {script.title}
                      </div>
                      <div className="text-sketch-small text-sketch-text-muted">
                        {script.style} • {script.durationMin}min
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-sketch-text-muted text-center py-sketch-8">
                <p className="text-sketch-body">No scripts yet</p>
                <p className="text-sketch-small mt-1">Create your first script to get started</p>
                <Link href="/studio" className="inline-block mt-sketch-3 text-sketch-accent hover:text-sketch-text text-sketch-small font-medium">
                  Get Started →
                </Link>
              </div>
            )}
          </div>

          {/* Premium Features Highlight */}
          <div className="bg-white rounded-sketch-md shadow-sketch-soft border border-sketch-border p-sketch-6">
            <h2 className="text-sketch-h2 font-semibold text-sketch-text tracking-sketch-tight mb-sketch-4">
              {isPremium ? '✨ Premium Features' : '🚀 Unlock Premium'}
            </h2>
            {isPremium ? (
              <div className="space-y-sketch-3">
                <div className="flex items-center space-x-sketch-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span className="text-sketch-small text-sketch-text">Hook Generation</span>
                </div>
                <div className="flex items-center space-x-sketch-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span className="text-sketch-small text-sketch-text">Title & Thumbnail Pack</span>
                </div>
                <div className="flex items-center space-x-sketch-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span className="text-sketch-small text-sketch-text">Advanced Styles</span>
                </div>
                <div className="flex items-center space-x-sketch-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span className="text-sketch-small text-sketch-text">CTA Integration</span>
                </div>
                <div className="mt-sketch-4 p-sketch-3 bg-sketch-surface rounded-sketch-sm border border-sketch-border">
                  <p className="text-sketch-small text-sketch-text font-medium">You have full access to all premium features!</p>
                </div>
              </div>
            ) : (
              <div className="space-y-sketch-3">
                <div className="flex items-center space-x-sketch-2">
                  <div className="w-2 h-2 bg-sketch-border rounded-full"></div>
                  <span className="text-sketch-small text-sketch-text-muted">Hook Generation (3-5 variants)</span>
                </div>
                <div className="flex items-center space-x-sketch-2">
                  <div className="w-2 h-2 bg-sketch-border rounded-full"></div>
                  <span className="text-sketch-small text-sketch-text-muted">Title & Thumbnail Pack</span>
                </div>
                <div className="flex items-center space-x-sketch-2">
                  <div className="w-2 h-2 bg-sketch-border rounded-full"></div>
                  <span className="text-sketch-small text-sketch-text-muted">Advanced Script Styles</span>
                </div>
                <div className="flex items-center space-x-sketch-2">
                  <div className="w-2 h-2 bg-sketch-border rounded-full"></div>
                  <span className="text-sketch-small text-sketch-text-muted">50 scripts/month</span>
                </div>
                <Link href="/subscription">
                  <Button className="w-full mt-sketch-4" size="sm">
                    Upgrade to Pro - $19/mo
                  </Button>
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}