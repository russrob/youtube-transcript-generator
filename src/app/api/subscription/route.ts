import { NextRequest, NextResponse } from 'next/server';
import { currentUser } from '@clerk/nextjs/server';
import { 
  getUserSubscription, 
  getAvailableStyles,
  upgradeSubscription 
} from '@/lib/subscription/subscription-service';
import { SubscriptionTier } from '@prisma/client';
import { z } from 'zod';

// GET /api/subscription - Get user's subscription info
export async function GET() {
  try {
    const user = await currentUser();
    
    if (!user?.id) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    const subscription = await getUserSubscription(user.id);
    const availableStyles = getAvailableStyles(subscription.tier);

    return NextResponse.json({
      success: true,
      data: {
        ...subscription,
        availableStyles
      }
    });

  } catch (error: any) {
    console.error('Failed to get subscription:', error);
    return NextResponse.json(
      { 
        error: 'Failed to retrieve subscription information',
        message: error.message
      },
      { status: 500 }
    );
  }
}

// POST /api/subscription - Update subscription (for future Stripe integration)
const updateSubscriptionSchema = z.object({
  tier: z.nativeEnum(SubscriptionTier),
  stripeCustomerId: z.string().optional(),
  stripeSubscriptionId: z.string().optional()
});

export async function POST(request: NextRequest) {
  try {
    const user = await currentUser();
    
    if (!user?.id) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    const body = await request.json();
    
    const validationResult = updateSubscriptionSchema.safeParse(body);
    if (!validationResult.success) {
      return NextResponse.json(
        { 
          error: 'Invalid request data',
          details: validationResult.error.format()
        },
        { status: 400 }
      );
    }

    const { tier, stripeCustomerId, stripeSubscriptionId } = validationResult.data;

    // For now, this is a placeholder for Stripe integration
    // In a real implementation, you would verify the Stripe subscription here
    await upgradeSubscription(
      user.id,
      tier,
      stripeCustomerId,
      stripeSubscriptionId
    );

    const updatedSubscription = await getUserSubscription(user.id);

    return NextResponse.json({
      success: true,
      data: updatedSubscription,
      message: `Successfully upgraded to ${tier}`
    });

  } catch (error: any) {
    console.error('Failed to update subscription:', error);
    return NextResponse.json(
      { 
        error: 'Failed to update subscription',
        message: error.message
      },
      { status: 500 }
    );
  }
}