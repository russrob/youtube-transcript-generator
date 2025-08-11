import { NextRequest, NextResponse } from 'next/server';
import { currentUser } from '@clerk/nextjs/server';
import { getUserSubscription, getSubscriptionLimits } from '@/lib/subscription/subscription-service';

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
    const limits = getSubscriptionLimits(subscription.tier);

    return NextResponse.json({
      success: true,
      subscription,
      limits,
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