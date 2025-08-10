import Stripe from 'stripe';

if (!process.env.STRIPE_SECRET_KEY) {
  throw new Error('STRIPE_SECRET_KEY environment variable is not set');
}

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: '2024-12-18.acacia',
  typescript: true,
});

// Stripe Price IDs - Replace with your actual Stripe Price IDs
export const STRIPE_PRICES = {
  PRO_MONTHLY: process.env.STRIPE_PRO_MONTHLY_PRICE_ID || 'price_pro_monthly_placeholder',
  BUSINESS_MONTHLY: process.env.STRIPE_BUSINESS_MONTHLY_PRICE_ID || 'price_business_monthly_placeholder',
  ENTERPRISE_MONTHLY: process.env.STRIPE_ENTERPRISE_MONTHLY_PRICE_ID || 'price_enterprise_monthly_placeholder',
};

export const SUBSCRIPTION_TIERS = {
  [STRIPE_PRICES.PRO_MONTHLY]: 'PRO',
  [STRIPE_PRICES.BUSINESS_MONTHLY]: 'BUSINESS', 
  [STRIPE_PRICES.ENTERPRISE_MONTHLY]: 'ENTERPRISE',
} as const;