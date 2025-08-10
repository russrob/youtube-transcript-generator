import { NextRequest, NextResponse } from 'next/server';
import { currentUser } from '@clerk/nextjs/server';
import { checkUsageLimit, recordScriptUsage } from '@/lib/subscription/subscription-service';

export interface UsageCheckResult {
  allowed: boolean;
  usage?: {
    used: number;
    limit: number;
    remaining: number;
    resetDate: Date;
  };
  error?: string;
}

/**
 * Middleware to check usage limits before script generation
 */
export async function checkUsageLimitMiddleware(): Promise<UsageCheckResult> {
  try {
    const user = await currentUser();
    
    if (!user?.id) {
      return {
        allowed: false,
        error: 'Authentication required'
      };
    }

    const usageInfo = await checkUsageLimit(user.id);
    
    if (!usageInfo.canGenerate) {
      return {
        allowed: false,
        usage: {
          used: usageInfo.used,
          limit: usageInfo.limit,
          remaining: usageInfo.remaining,
          resetDate: usageInfo.resetDate
        },
        error: 'Monthly script limit reached. Upgrade your plan to generate more scripts.'
      };
    }

    return {
      allowed: true,
      usage: {
        used: usageInfo.used,
        limit: usageInfo.limit,
        remaining: usageInfo.remaining,
        resetDate: usageInfo.resetDate
      }
    };

  } catch (error) {
    console.error('Usage limit check error:', error);
    return {
      allowed: false,
      error: 'Failed to check usage limits'
    };
  }
}

/**
 * Record usage after successful script generation
 */
export async function recordUsageMiddleware(
  metadata?: { scriptId?: string; processingTimeMs?: number }
): Promise<void> {
  try {
    const user = await currentUser();
    
    if (user?.id) {
      await recordScriptUsage(user.id, metadata);
    }
  } catch (error) {
    console.error('Failed to record usage:', error);
    // Don't throw error - usage recording failure shouldn't break the flow
  }
}

/**
 * API route helper for usage-limited endpoints
 */
export async function withUsageLimit<T>(
  handler: () => Promise<T>
): Promise<NextResponse> {
  const usageCheck = await checkUsageLimitMiddleware();
  
  if (!usageCheck.allowed) {
    return NextResponse.json(
      { 
        error: usageCheck.error,
        usage: usageCheck.usage
      },
      { status: 429 } // Too Many Requests
    );
  }

  try {
    const result = await handler();
    return NextResponse.json(result);
  } catch (error: any) {
    console.error('Handler error:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * Get user's current usage status (for UI display)
 */
export async function getUserUsageStatus() {
  try {
    const user = await currentUser();
    
    if (!user?.id) {
      return null;
    }

    const usageInfo = await checkUsageLimit(user.id);
    
    return {
      used: usageInfo.used,
      limit: usageInfo.limit,
      remaining: usageInfo.remaining,
      resetDate: usageInfo.resetDate,
      canGenerate: usageInfo.canGenerate,
      isUnlimited: usageInfo.limit === -1
    };

  } catch (error) {
    console.error('Failed to get usage status:', error);
    return null;
  }
}