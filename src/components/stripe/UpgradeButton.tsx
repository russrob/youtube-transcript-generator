'use client';

import { useState } from 'react';
import { SubscriptionTier } from '@prisma/client';

interface UpgradeButtonProps {
  targetTier: SubscriptionTier;
  currentTier: SubscriptionTier;
  isCurrentTier: boolean;
  className?: string;
  children: React.ReactNode;
}

const STRIPE_PRICE_IDS = {
  PRO: process.env.NEXT_PUBLIC_STRIPE_PRO_MONTHLY_PRICE_ID || 'price_pro_monthly_placeholder',
  BUSINESS: process.env.NEXT_PUBLIC_STRIPE_BUSINESS_MONTHLY_PRICE_ID || 'price_business_monthly_placeholder', 
  ENTERPRISE: process.env.NEXT_PUBLIC_STRIPE_ENTERPRISE_MONTHLY_PRICE_ID || 'price_enterprise_monthly_placeholder',
};

export function UpgradeButton({ 
  targetTier, 
  currentTier, 
  isCurrentTier, 
  className = '',
  children 
}: UpgradeButtonProps) {
  const [loading, setLoading] = useState(false);

  const handleUpgrade = async () => {
    if (isCurrentTier || targetTier === 'FREE') return;
    
    setLoading(true);
    
    try {
      const priceId = STRIPE_PRICE_IDS[targetTier];
      
      if (!priceId || priceId.includes('placeholder')) {
        alert('Stripe is not fully configured yet. This is a demo.');
        setLoading(false);
        return;
      }

      const response = await fetch('/api/stripe/create-checkout-session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          priceId,
          successUrl: `${window.location.origin}/subscription?success=true`,
          cancelUrl: `${window.location.origin}/subscription?canceled=true`,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to create checkout session');
      }

      // Redirect to Stripe Checkout
      if (data.checkoutUrl) {
        window.location.href = data.checkoutUrl;
      }
    } catch (error: any) {
      console.error('Upgrade error:', error);
      alert('Failed to start upgrade process. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (isCurrentTier) {
    return (
      <button className={className} disabled>
        {children}
      </button>
    );
  }

  return (
    <button
      onClick={handleUpgrade}
      disabled={loading}
      className={className}
    >
      {loading ? 'Loading...' : children}
    </button>
  );
}