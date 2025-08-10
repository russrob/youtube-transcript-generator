import { SubscriptionTier } from '@prisma/client';

interface UsageInfo {
  used: number;
  limit: number;
  remaining: number;
  resetDate: Date;
  canGenerate: boolean;
  isUnlimited?: boolean;
}

interface UsageLimitsProps {
  usage: UsageInfo;
  tier: SubscriptionTier;
  className?: string;
}

export function UsageLimits({ usage, tier, className = '' }: UsageLimitsProps) {
  const { used, limit, remaining, resetDate, canGenerate, isUnlimited } = usage;
  
  // Calculate progress percentage
  const progressPercent = isUnlimited ? 0 : (used / limit) * 100;
  
  // Determine status color
  const getStatusColor = () => {
    if (isUnlimited) return 'text-purple-600';
    if (remaining <= 0) return 'text-red-600';
    if (progressPercent >= 80) return 'text-yellow-600';
    return 'text-green-600';
  };

  const getProgressBarColor = () => {
    if (isUnlimited) return 'bg-purple-500';
    if (remaining <= 0) return 'bg-red-500';
    if (progressPercent >= 80) return 'bg-yellow-500';
    return 'bg-green-500';
  };

  const formatTier = (tier: SubscriptionTier) => {
    return tier.charAt(0) + tier.slice(1).toLowerCase();
  };

  return (
    <div className={`bg-white rounded-lg border border-gray-200 p-4 ${className}`}>
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center space-x-2">
          <h3 className="text-sm font-medium text-gray-900">Usage This Month</h3>
          <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800`}>
            {formatTier(tier)}
          </span>
        </div>
        {!canGenerate && (
          <span className="text-xs font-medium text-red-600 bg-red-100 px-2 py-1 rounded-full">
            Limit Reached
          </span>
        )}
      </div>

      {!isUnlimited ? (
        <>
          {/* Progress Bar */}
          <div className="w-full bg-gray-200 rounded-full h-2 mb-3">
            <div 
              className={`h-2 rounded-full transition-all duration-300 ${getProgressBarColor()}`}
              style={{ width: `${Math.min(progressPercent, 100)}%` }}
            />
          </div>

          {/* Usage Stats */}
          <div className="flex justify-between text-sm">
            <span className={`font-medium ${getStatusColor()}`}>
              {used} of {limit} scripts used
            </span>
            <span className="text-gray-500">
              {remaining} remaining
            </span>
          </div>
        </>
      ) : (
        <div className="text-center py-2">
          <span className="text-purple-600 font-medium text-sm">
            ✨ Unlimited Scripts
          </span>
          <p className="text-xs text-gray-500 mt-1">
            {used} scripts generated this month
          </p>
        </div>
      )}

      {/* Reset Date */}
      <div className="mt-3 pt-3 border-t border-gray-100">
        <p className="text-xs text-gray-500">
          Usage resets on {resetDate.toLocaleDateString('en-US', { 
            month: 'short', 
            day: 'numeric' 
          })}
        </p>
      </div>

      {/* Upgrade CTA for low limits */}
      {tier === SubscriptionTier.FREE && (
        <div className="mt-3 pt-3 border-t border-gray-100">
          <button className="w-full text-center text-xs text-blue-600 hover:text-blue-800 font-medium">
            Upgrade to Pro for 50 scripts/month →
          </button>
        </div>
      )}
    </div>
  );
}