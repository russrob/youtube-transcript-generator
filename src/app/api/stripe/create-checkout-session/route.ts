import { NextRequest, NextResponse } from 'next/server';
import { currentUser } from '@clerk/nextjs/server';
import { stripe, STRIPE_PRICES } from '@/lib/stripe/config';
import { z } from 'zod';

const checkoutSchema = z.object({
  priceId: z.enum([
    STRIPE_PRICES.PRO_MONTHLY,
    STRIPE_PRICES.BUSINESS_MONTHLY,
    STRIPE_PRICES.ENTERPRISE_MONTHLY
  ] as const),
  successUrl: z.string().url().optional(),
  cancelUrl: z.string().url().optional()
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
    const validationResult = checkoutSchema.safeParse(body);
    
    if (!validationResult.success) {
      return NextResponse.json(
        { 
          error: 'Invalid request data',
          details: validationResult.error.format()
        },
        { status: 400 }
      );
    }

    const { priceId, successUrl, cancelUrl } = validationResult.data;
    
    // Create Stripe Checkout Session
    const session = await stripe.checkout.sessions.create({
      customer_email: user.emailAddresses[0]?.emailAddress,
      client_reference_id: user.id,
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      mode: 'subscription',
      success_url: successUrl || `${process.env.NEXT_PUBLIC_BASE_URL}/subscription?success=true`,
      cancel_url: cancelUrl || `${process.env.NEXT_PUBLIC_BASE_URL}/subscription?canceled=true`,
      metadata: {
        userId: user.id,
        userEmail: user.emailAddresses[0]?.emailAddress || '',
      },
    });

    return NextResponse.json({
      success: true,
      checkoutUrl: session.url,
      sessionId: session.id
    });

  } catch (error: any) {
    console.error('Stripe checkout session creation failed:', error);
    return NextResponse.json(
      { 
        error: 'Failed to create checkout session',
        message: error.message
      },
      { status: 500 }
    );
  }
}