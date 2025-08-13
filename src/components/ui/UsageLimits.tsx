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
    <div className={`bg-white rounded-sketch-md border border-sketch-border p-sketch-6 shadow-sketch-soft ${className}`}>
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center space-x-2">
          <h3 className="text-sketch-small font-medium text-sketch-text">Usage This Month</h3>
          <span className={`inline-flex items-center px-sketch-3 py-sketch-1 rounded-full text-sketch-small font-medium bg-sketch-surface text-sketch-text border border-sketch-border`}>
            {formatTier(tier)}
          </span>
        </div>
        {!canGenerate && (
          <span className="text-xs font-semibold text-red-600 bg-red-50 px-sketch-3 py-sketch-1 rounded-full border border-red-200">
            Limit Reached
          </span>
        )}
      </div>

      {!isUnlimited ? (
        <>
          {/* Progress Bar */}
          <div className="w-full bg-sketch-surface rounded-full h-2 mb-sketch-4 border border-sketch-border">
            <div 
              className={`h-2 rounded-full transition-all duration-300 ${getProgressBarColor()}`}
              style={{ width: `${Math.min(progressPercent, 100)}%` }}
            />
          </div>

          {/* Usage Stats */}
          <div className="flex justify-between text-sketch-small">
            <span className={`font-semibold ${getStatusColor()}`}>
              {used} of {limit} scripts used
            </span>
            <span className="text-sketch-text-muted font-medium">
              {remaining} remaining
            </span>
          </div>
        </>
      ) : (
        <div className="text-center py-2">
          <span className="text-purple-600 font-medium text-sm">
            ✨ Unlimited Scripts
          </span>
          <p className="text-sketch-small text-sketch-text-muted mt-1">
            {used} scripts generated this month
          </p>
        </div>
      )}

      {/* Reset Date */}
      <div className="mt-sketch-3 pt-sketch-3 border-t border-sketch-border">
        <p className="text-sketch-small text-sketch-text-muted">
          Usage resets on {resetDate.toLocaleDateString('en-US', { 
            month: 'short', 
            day: 'numeric' 
          })}
        </p>
      </div>

      {/* Upgrade CTA for low limits */}
      {tier === SubscriptionTier.FREE && (
        <div className="mt-sketch-3 pt-sketch-3 border-t border-sketch-border">
          <button className="w-full text-center text-sketch-small text-blue-600 hover:text-blue-800 font-medium">
            Upgrade to Pro for 50 scripts/month →
          </button>
        </div>
      )}
    </div>
  );
}