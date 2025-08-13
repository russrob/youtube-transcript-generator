import { NextRequest, NextResponse } from 'next/server';
import { currentUser } from '@clerk/nextjs/server';
import { getUserSubscription, getSubscriptionLimits, getEffectiveSubscriptionTier, isMasterAdmin } from '@/lib/subscription/subscription-service';

export async function GET(request: NextRequest) {
  try {
    // Check authentication
    const user = await currentUser();
    if (!user?.id) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    // Get user's subscription info
    const subscription = await getUserSubscription(user.id);
    const userEmail = user.emailAddresses[0]?.emailAddress || '';

    // Check for admin test mode and master admin status
    const { searchParams } = new URL(request.url);
    const testMode = searchParams.get('test');
    const adminKey = searchParams.get('admin');
    
    // Get effective tier (handles URL test mode and master admin status)
    const effectiveTier = getEffectiveSubscriptionTier(
      subscription.tier,
      userEmail,
      user.id,
      testMode || undefined,
      adminKey || undefined
    );
    
    const limits = getSubscriptionLimits(effectiveTier);
    const isAdmin = isMasterAdmin(userEmail, user.id);
    const isTestMode = testMode === 'premium' && adminKey === 'test123';
    
    // If user has admin privileges (master admin or test mode), return enhanced response
    if (isAdmin || isTestMode) {
      return NextResponse.json({
        success: true,
        subscription: {
          ...subscription,
          tier: effectiveTier // Override displayed tier
        },
        limits,
        isAdmin,
        testMode: isTestMode,
        adminPrivileges: isAdmin ? 'MASTER_ADMIN' : isTestMode ? 'TEST_MODE' : null,
        user: {
          id: user.id,
          email: userEmail
        }
      });
    }

    return NextResponse.json({
      success: true,
      subscription,
      limits,
      testMode: false,
      user: {
        id: user.id,
        email: user.emailAddresses[0]?.emailAddress || 'N/A'
      }
    });

  } catch (error: any) {
    console.error('Subscription API error:', error);
    return NextResponse.json(
      { 
        error: 'Internal server error',
        message: error.message
      },
      { status: 500 }
    );
  }
}