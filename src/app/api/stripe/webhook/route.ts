import { NextRequest, NextResponse } from 'next/server';
import { stripe, SUBSCRIPTION_TIERS } from '@/lib/stripe/config';
import { upgradeSubscription, cancelSubscription } from '@/lib/subscription/subscription-service';
import { SubscriptionTier } from '@prisma/client';
import Stripe from 'stripe';

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!;

export async function POST(request: NextRequest) {
  try {
    const body = await request.text();
    const signature = request.headers.get('stripe-signature')!;

    // Verify webhook signature
    let event: Stripe.Event;
    try {
      event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
    } catch (err: any) {
      console.error('Webhook signature verification failed:', err.message);
      return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
    }

    // Handle the event
    switch (event.type) {
      case 'checkout.session.completed':
        await handleCheckoutCompleted(event.data.object as Stripe.Checkout.Session);
        break;
        
      case 'customer.subscription.created':
        await handleSubscriptionCreated(event.data.object as Stripe.Subscription);
        break;
        
      case 'customer.subscription.updated':
        await handleSubscriptionUpdated(event.data.object as Stripe.Subscription);
        break;
        
      case 'customer.subscription.deleted':
        await handleSubscriptionDeleted(event.data.object as Stripe.Subscription);
        break;
        
      case 'invoice.payment_succeeded':
        await handlePaymentSucceeded(event.data.object as Stripe.Invoice);
        break;
        
      case 'invoice.payment_failed':
        await handlePaymentFailed(event.data.object as Stripe.Invoice);
        break;
        
      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    return NextResponse.json({ received: true });

  } catch (error: any) {
    console.error('Webhook handler error:', error);
    return NextResponse.json(
      { error: 'Webhook handler failed' },
      { status: 500 }
    );
  }
}

async function handleCheckoutCompleted(session: Stripe.Checkout.Session) {
  const userId = session.client_reference_id || session.metadata?.userId;
  const subscriptionId = session.subscription as string;
  const customerId = session.customer as string;

  if (!userId) {
    console.error('No user ID found in checkout session');
    return;
  }

  console.log(`Checkout completed for user ${userId}, subscription ${subscriptionId}`);
  
  // The subscription will be handled in the subscription.created event
}

async function handleSubscriptionCreated(subscription: Stripe.Subscription) {
  const customerId = subscription.customer as string;
  const priceId = subscription.items.data[0]?.price.id;
  
  if (!priceId || !SUBSCRIPTION_TIERS[priceId]) {
    console.error('Unknown price ID:', priceId);
    return;
  }

  // Get customer to find user ID
  const customer = await stripe.customers.retrieve(customerId);
  const userId = customer.metadata?.userId;
  
  if (!userId) {
    console.error('No user ID found in customer metadata');
    return;
  }

  const tier = SUBSCRIPTION_TIERS[priceId] as SubscriptionTier;
  
  try {
    await upgradeSubscription(
      userId,
      tier,
      customerId,
      subscription.id
    );
    console.log(`Subscription created for user ${userId}, tier ${tier}`);
  } catch (error) {
    console.error('Failed to upgrade subscription:', error);
  }
}

async function handleSubscriptionUpdated(subscription: Stripe.Subscription) {
  const customerId = subscription.customer as string;
  const priceId = subscription.items.data[0]?.price.id;
  
  if (!priceId || !SUBSCRIPTION_TIERS[priceId]) {
    console.error('Unknown price ID:', priceId);
    return;
  }

  const customer = await stripe.customers.retrieve(customerId);
  const userId = customer.metadata?.userId;
  
  if (!userId) {
    console.error('No user ID found in customer metadata');
    return;
  }

  const tier = SUBSCRIPTION_TIERS[priceId] as SubscriptionTier;
  
  try {
    await upgradeSubscription(
      userId,
      tier,
      customerId,
      subscription.id
    );
    console.log(`Subscription updated for user ${userId}, tier ${tier}`);
  } catch (error) {
    console.error('Failed to update subscription:', error);
  }
}

async function handleSubscriptionDeleted(subscription: Stripe.Subscription) {
  const customerId = subscription.customer as string;
  const customer = await stripe.customers.retrieve(customerId);
  const userId = customer.metadata?.userId;
  
  if (!userId) {
    console.error('No user ID found in customer metadata');
    return;
  }

  try {
    await cancelSubscription(userId);
    console.log(`Subscription canceled for user ${userId}`);
  } catch (error) {
    console.error('Failed to cancel subscription:', error);
  }
}

async function handlePaymentSucceeded(invoice: Stripe.Invoice) {
  console.log(`Payment succeeded for invoice ${invoice.id}`);
  // Handle successful payment - could send confirmation emails, etc.
}

async function handlePaymentFailed(invoice: Stripe.Invoice) {
  console.log(`Payment failed for invoice ${invoice.id}`);
  // Handle failed payment - could send notification emails, retry logic, etc.
}