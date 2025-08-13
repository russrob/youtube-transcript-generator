import { NextRequest, NextResponse } from 'next/server';
import { headers } from 'next/headers';
import Stripe from 'stripe';
import { prisma } from '@/lib/prisma';
import { SubscriptionTier, SubscriptionStatus } from '@prisma/client';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-06-20',
});

const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET!;

export async function POST(request: NextRequest) {
  const body = await request.text();
  const signature = headers().get('stripe-signature') as string;

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(body, signature, endpointSecret);
  } catch (err: any) {
    console.error(`Webhook signature verification failed:`, err.message);
    return NextResponse.json(
      { error: 'Webhook signature verification failed' },
      { status: 400 }
    );
  }

  console.log(`Processing webhook event: ${event.type}`);

  try {
    switch (event.type) {
      case 'customer.subscription.created':
      case 'customer.subscription.updated':
        await handleSubscriptionChange(event.data.object as Stripe.Subscription);
        break;

      case 'customer.subscription.deleted':
        await handleSubscriptionCancellation(event.data.object as Stripe.Subscription);
        break;

      case 'invoice.payment_succeeded':
        await handlePaymentSucceeded(event.data.object as Stripe.Invoice);
        break;

      case 'invoice.payment_failed':
        await handlePaymentFailed(event.data.object as Stripe.Invoice);
        break;

      case 'customer.subscription.trial_will_end':
        await handleTrialWillEnd(event.data.object as Stripe.Subscription);
        break;

      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error(`Error processing webhook ${event.type}:`, error);
    return NextResponse.json(
      { error: 'Webhook processing failed' },
      { status: 500 }
    );
  }
}

async function handleSubscriptionChange(subscription: Stripe.Subscription) {
  const customerId = subscription.customer as string;
  const status = mapStripeStatusToPrisma(subscription.status);
  const tier = determineTierFromSubscription(subscription);

  console.log(`Updating subscription for customer ${customerId}: ${tier} - ${status}`);

  // Find user by Stripe customer ID
  const user = await prisma.user.findFirst({
    where: { stripeCustomerId: customerId }
  });

  if (!user) {
    console.error(`User not found for Stripe customer ID: ${customerId}`);
    return;
  }

  // Update user subscription
  await prisma.user.update({
    where: { id: user.id },
    data: {
      subscriptionTier: tier,
      subscriptionStatus: status,
      stripeSubscriptionId: subscription.id,
      subscriptionCurrentPeriodStart: new Date(subscription.current_period_start * 1000),
      subscriptionCurrentPeriodEnd: new Date(subscription.current_period_end * 1000),
      subscriptionCancelAtPeriodEnd: subscription.cancel_at_period_end
    }
  });

  console.log(`Successfully updated subscription for user ${user.id}`);
}

async function handleSubscriptionCancellation(subscription: Stripe.Subscription) {
  const customerId = subscription.customer as string;

  console.log(`Handling subscription cancellation for customer ${customerId}`);

  const user = await prisma.user.findFirst({
    where: { stripeCustomerId: customerId }
  });

  if (!user) {
    console.error(`User not found for Stripe customer ID: ${customerId}`);
    return;
  }

  // Update user to FREE tier
  await prisma.user.update({
    where: { id: user.id },
    data: {
      subscriptionTier: SubscriptionTier.FREE,
      subscriptionStatus: SubscriptionStatus.CANCELED,
      stripeSubscriptionId: null,
      subscriptionCurrentPeriodStart: null,
      subscriptionCurrentPeriodEnd: null,
      subscriptionCancelAtPeriodEnd: false
    }
  });

  console.log(`Successfully cancelled subscription for user ${user.id}`);
}

async function handlePaymentSucceeded(invoice: Stripe.Invoice) {
  const customerId = invoice.customer as string;
  const subscriptionId = invoice.subscription as string;

  console.log(`Payment succeeded for customer ${customerId}, subscription ${subscriptionId}`);

  if (!subscriptionId) return;

  const user = await prisma.user.findFirst({
    where: { stripeCustomerId: customerId }
  });

  if (!user) {
    console.error(`User not found for Stripe customer ID: ${customerId}`);
    return;
  }

  // Update subscription status to active
  await prisma.user.update({
    where: { id: user.id },
    data: {
      subscriptionStatus: SubscriptionStatus.ACTIVE,
      lastPaymentDate: new Date()
    }
  });

  // Reset usage for the new billing period if this is a recurring payment
  if (invoice.billing_reason === 'subscription_cycle') {
    await prisma.user.update({
      where: { id: user.id },
      data: {
        monthlyScriptsUsed: 0,
        lastUsageReset: new Date()
      }
    });
    console.log(`Reset usage counters for user ${user.id}`);
  }
}

async function handlePaymentFailed(invoice: Stripe.Invoice) {
  const customerId = invoice.customer as string;

  console.log(`Payment failed for customer ${customerId}`);

  const user = await prisma.user.findFirst({
    where: { stripeCustomerId: customerId }
  });

  if (!user) {
    console.error(`User not found for Stripe customer ID: ${customerId}`);
    return;
  }

  // Update subscription status
  await prisma.user.update({
    where: { id: user.id },
    data: {
      subscriptionStatus: SubscriptionStatus.PAST_DUE
    }
  });

  console.log(`Updated subscription status to PAST_DUE for user ${user.id}`);
}

async function handleTrialWillEnd(subscription: Stripe.Subscription) {
  const customerId = subscription.customer as string;

  console.log(`Trial will end soon for customer ${customerId}`);

  // Here you could send email notifications or take other actions
  // For now, just log the event
}

function mapStripeStatusToPrisma(stripeStatus: string): SubscriptionStatus {
  switch (stripeStatus) {
    case 'active':
      return SubscriptionStatus.ACTIVE;
    case 'past_due':
      return SubscriptionStatus.PAST_DUE;
    case 'canceled':
      return SubscriptionStatus.CANCELED;
    case 'incomplete':
      return SubscriptionStatus.INCOMPLETE;
    case 'incomplete_expired':
      return SubscriptionStatus.INCOMPLETE_EXPIRED;
    case 'trialing':
      return SubscriptionStatus.TRIALING;
    case 'unpaid':
      return SubscriptionStatus.UNPAID;
    default:
      return SubscriptionStatus.INCOMPLETE;
  }
}

function determineTierFromSubscription(subscription: Stripe.Subscription): SubscriptionTier {
  // Map Stripe price IDs to subscription tiers
  const priceToTierMap: Record<string, SubscriptionTier> = {
    [process.env.NEXT_PUBLIC_STRIPE_PRO_MONTHLY_PRICE_ID!]: SubscriptionTier.PRO,
    [process.env.NEXT_PUBLIC_STRIPE_BUSINESS_MONTHLY_PRICE_ID!]: SubscriptionTier.BUSINESS,
    [process.env.NEXT_PUBLIC_STRIPE_ENTERPRISE_MONTHLY_PRICE_ID!]: SubscriptionTier.ENTERPRISE,
  };

  // Get the first subscription item's price ID
  const priceId = subscription.items.data[0]?.price.id;
  
  if (priceId && priceToTierMap[priceId]) {
    return priceToTierMap[priceId];
  }

  // Default to PRO if we can't determine the tier
  console.warn(`Could not determine tier for price ID: ${priceId}`);
  return SubscriptionTier.PRO;
}