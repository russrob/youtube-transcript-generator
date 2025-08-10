import { requireUser } from '@/lib/auth/require-user';
import { AppHeader } from '@/components/ui/AppHeader';
import { getUserSubscription, getSubscriptionLimits } from '@/lib/subscription/subscription-service';
import { UsageLimits } from '@/components/ui/UsageLimits';
import { UpgradeButton } from '@/components/stripe/UpgradeButton';
import { SubscriptionTier } from '@prisma/client';

const tierFeatures = {
  FREE: [
    '2 scripts per month',
    'Basic script styles',
    'Standard processing',
    'Community support',
    'Watermarked scripts'
  ],
  PRO: [
    '50 scripts per month',
    'All script styles including Pro styles',
    'Priority processing',
    'Email support',
    'Watermark-free scripts',
    'API access'
  ],
  BUSINESS: [
    '200 scripts per month',
    'All Pro features',
    'Team collaboration (5 members)',
    'Priority support',
    'Advanced analytics',
    'Custom integrations'
  ],
  ENTERPRISE: [
    'Unlimited scripts',
    'All Business features',
    'Unlimited team members',
    'Dedicated support',
    'Custom training',
    'White-label options'
  ]
};

const tierPricing = {
  FREE: { price: 0, period: 'forever' },
  PRO: { price: 19, period: 'month' },
  BUSINESS: { price: 49, period: 'month' },
  ENTERPRISE: { price: 199, period: 'month' }
};

export default async function SubscriptionPage() {
  const { clerkUser } = await requireUser();
  
  let subscription;
  try {
    subscription = await getUserSubscription(clerkUser.id);
  } catch (error) {
    console.error('Failed to get subscription:', error);
    // Return a fallback page or redirect
    return (
      <div className="min-h-screen bg-gray-50">
        <AppHeader />
        <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <p className="text-red-700">Unable to load subscription information. Please try again.</p>
          </div>
        </div>
      </div>
    );
  }

  const currentTier = subscription.tier;
  const currentLimits = getSubscriptionLimits(currentTier);

  return (
    <div className="min-h-screen bg-gray-50">
      <AppHeader />
      
      <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Subscription & Usage</h1>
          <p className="mt-2 text-gray-600">
            Manage your subscription and track your usage
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Current Subscription & Usage */}
          <div className="lg:col-span-1">
            <div className="space-y-6">
              {/* Usage Limits */}
              <UsageLimits 
                usage={{
                  used: subscription.usage.used,
                  limit: subscription.usage.limit,
                  remaining: subscription.usage.remaining,
                  resetDate: subscription.usage.resetDate,
                  canGenerate: subscription.usage.canGenerate,
                  isUnlimited: subscription.usage.limit === -1
                }}
                tier={currentTier}
              />

              {/* Current Plan */}
              <div className="bg-white rounded-lg border border-gray-200 p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900">Current Plan</h3>
                  <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                    currentTier === SubscriptionTier.FREE 
                      ? 'bg-gray-100 text-gray-800'
                      : currentTier === SubscriptionTier.PRO
                      ? 'bg-blue-100 text-blue-800'
                      : currentTier === SubscriptionTier.BUSINESS
                      ? 'bg-purple-100 text-purple-800'
                      : 'bg-gold-100 text-gold-800'
                  }`}>
                    {currentTier.charAt(0) + currentTier.slice(1).toLowerCase()}
                  </span>
                </div>

                <div className="space-y-3">
                  {tierFeatures[currentTier].map((feature, index) => (
                    <div key={index} className="flex items-center space-x-2">
                      <div className="w-1.5 h-1.5 bg-green-500 rounded-full" />
                      <span className="text-sm text-gray-600">{feature}</span>
                    </div>
                  ))}
                </div>

                {subscription.subscriptionEnd && (
                  <div className="mt-4 pt-4 border-t border-gray-100">
                    <p className="text-xs text-gray-500">
                      {subscription.status === 'ACTIVE' ? 'Renews' : 'Expires'} on{' '}
                      {subscription.subscriptionEnd.toLocaleDateString()}
                    </p>
                  </div>
                )}
              </div>

              {/* Total Usage Stats */}
              <div className="bg-white rounded-lg border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">All Time Stats</h3>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Total Scripts Generated</span>
                    <span className="text-sm font-medium text-gray-900">{subscription.totalScripts}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Member Since</span>
                    <span className="text-sm font-medium text-gray-900">
                      {subscription.subscriptionStart 
                        ? subscription.subscriptionStart.toLocaleDateString()
                        : 'N/A'
                      }
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Subscription Tiers */}
          <div className="lg:col-span-2">
            <div className="mb-6">
              <h2 className="text-xl font-semibold text-gray-900">Choose Your Plan</h2>
              <p className="text-gray-600">Upgrade or downgrade your subscription at any time</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {Object.entries(tierFeatures).map(([tier, features]) => {
                const tierKey = tier as SubscriptionTier;
                const pricing = tierPricing[tierKey];
                const isCurrentTier = currentTier === tierKey;
                const isUpgrade = Object.keys(SubscriptionTier).indexOf(tierKey) > 
                                Object.keys(SubscriptionTier).indexOf(currentTier);

                return (
                  <div 
                    key={tier}
                    className={`bg-white rounded-lg border-2 p-6 ${
                      isCurrentTier 
                        ? 'border-blue-500 ring-2 ring-blue-200' 
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-lg font-semibold text-gray-900">
                        {tier.charAt(0) + tier.slice(1).toLowerCase()}
                      </h3>
                      {isCurrentTier && (
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                          Current
                        </span>
                      )}
                    </div>

                    <div className="mb-4">
                      <span className="text-3xl font-bold text-gray-900">${pricing.price}</span>
                      <span className="text-gray-600">/{pricing.period}</span>
                    </div>

                    <div className="space-y-3 mb-6">
                      {features.map((feature, index) => (
                        <div key={index} className="flex items-center space-x-2">
                          <div className="w-1.5 h-1.5 bg-green-500 rounded-full" />
                          <span className="text-sm text-gray-600">{feature}</span>
                        </div>
                      ))}
                    </div>

                    <UpgradeButton
                      targetTier={tierKey}
                      currentTier={currentTier}
                      isCurrentTier={isCurrentTier}
                      className={`w-full py-2 px-4 rounded-lg font-medium transition-colors ${
                        isCurrentTier
                          ? 'bg-gray-100 text-gray-500 cursor-not-allowed'
                          : isUpgrade
                          ? 'bg-blue-600 text-white hover:bg-blue-700'
                          : 'bg-gray-600 text-white hover:bg-gray-700'
                      }`}
                    >
                      {isCurrentTier 
                        ? 'Current Plan'
                        : isUpgrade 
                        ? 'Upgrade with Stripe'
                        : 'Contact Support'
                      }
                    </UpgradeButton>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* FAQ Section */}
        <div className="mt-12 bg-white rounded-lg border border-gray-200 p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">Frequently Asked Questions</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="font-medium text-gray-900 mb-2">What happens when I reach my limit?</h3>
              <p className="text-sm text-gray-600">
                You won't be able to generate new scripts until your usage resets at the beginning of the next month, or you can upgrade your plan for more scripts.
              </p>
            </div>
            <div>
              <h3 className="font-medium text-gray-900 mb-2">Can I change plans anytime?</h3>
              <p className="text-sm text-gray-600">
                Yes, you can upgrade or downgrade your plan at any time. Changes take effect immediately with prorated billing.
              </p>
            </div>
            <div>
              <h3 className="font-medium text-gray-900 mb-2">What are Pro-only script styles?</h3>
              <p className="text-sm text-gray-600">
                Persuasive, Narrative, and Academic styles use advanced AI techniques and are available to Pro subscribers and above.
              </p>
            </div>
            <div>
              <h3 className="font-medium text-gray-900 mb-2">How does priority processing work?</h3>
              <p className="text-sm text-gray-600">
                Pro and above subscribers get their scripts generated faster through our priority queue system.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}