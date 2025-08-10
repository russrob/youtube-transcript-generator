# Stripe Integration Setup Guide

## Overview

This application includes a complete Stripe integration for subscription management with the following features:

- ✅ **Subscription Tiers**: FREE, PRO ($19/mo), BUSINESS ($49/mo), ENTERPRISE ($199/mo)  
- ✅ **Usage Limits**: 2 free scripts → 50 Pro → 200 Business → Unlimited Enterprise
- ✅ **Premium Features**: Priority processing, advanced styles, watermark removal
- ✅ **Stripe Checkout**: Secure payment processing
- ✅ **Webhook Handling**: Automatic subscription updates
- ✅ **Database Integration**: Full subscription tracking

## Quick Demo

1. **Visit Subscription Page**: Go to `/subscription` to see the built subscription management UI
2. **View Features**: Compare all tiers with feature breakdown and usage stats  
3. **Test Flow**: Click upgrade buttons (shows demo message since Stripe isn't configured)
4. **Usage Tracking**: Generate scripts to see usage limits in action

## Stripe Dashboard Setup

### 1. Create Stripe Account
1. Go to [stripe.com](https://stripe.com) and create account
2. Get your API keys from Dashboard → Developers → API Keys

### 2. Create Products & Prices
Create these subscription products in your Stripe dashboard:

```
PRO Plan
- Name: "ScriptForge AI Pro"  
- Price: $19.00 USD/month recurring
- Copy the Price ID (starts with price_...)

BUSINESS Plan  
- Name: "ScriptForge AI Business"
- Price: $49.00 USD/month recurring  
- Copy the Price ID

ENTERPRISE Plan
- Name: "ScriptForge AI Enterprise" 
- Price: $199.00 USD/month recurring
- Copy the Price ID
```

### 3. Update Environment Variables
Replace the placeholder values in `.env`:

```bash
# Replace with your actual Stripe keys
STRIPE_SECRET_KEY=sk_test_your_secret_key_here
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_your_publishable_key_here

# Replace with your actual Price IDs from step 2
NEXT_PUBLIC_STRIPE_PRO_MONTHLY_PRICE_ID=price_your_pro_price_id  
NEXT_PUBLIC_STRIPE_BUSINESS_MONTHLY_PRICE_ID=price_your_business_price_id
NEXT_PUBLIC_STRIPE_ENTERPRISE_MONTHLY_PRICE_ID=price_your_enterprise_price_id
```

### 4. Set Up Webhook
1. In Stripe Dashboard → Developers → Webhooks
2. Click "Add endpoint"  
3. URL: `https://yourdomain.com/api/stripe/webhook`
4. Select these events:
   - `checkout.session.completed`
   - `customer.subscription.created`
   - `customer.subscription.updated` 
   - `customer.subscription.deleted`
   - `invoice.payment_succeeded`
   - `invoice.payment_failed`
5. Copy the webhook signing secret:
   ```bash
   STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret_here
   ```

## Architecture

### Database Schema
```sql
-- User subscription fields
subscriptionTier: FREE | PRO | BUSINESS | ENTERPRISE
subscriptionStatus: ACTIVE | CANCELED | etc.
monthlyScriptCount: INT (usage tracking)
stripeCustomerId: STRING
stripeSubscriptionId: STRING

-- Usage tracking
UsageLog: action, metadata, timestamp per user
```

### API Routes
- `POST /api/stripe/create-checkout-session` - Start Stripe checkout
- `POST /api/stripe/webhook` - Handle Stripe events  
- `GET /api/subscription` - Get user subscription info
- `POST /api/script/generate` - Script generation with usage limits

### Key Features
1. **Usage Enforcement**: Hard limits based on subscription tier
2. **Feature Gates**: Pro-only script styles, watermark removal
3. **Priority Processing**: Queue prioritization for paid users
4. **Automatic Upgrades**: Webhook handling updates subscriptions
5. **Usage Analytics**: Track generation counts and processing times

## Testing

### Test Cards (Stripe Test Mode)
```
Success: 4242 4242 4242 4242
Decline: 4000 0000 0000 0002  
3D Secure: 4000 0027 6000 3184
```

### Test Flow
1. Sign up for account → starts as FREE tier
2. Try to generate 3+ scripts → hit usage limit  
3. Click upgrade → redirects to Stripe checkout
4. Complete payment → webhook updates subscription
5. Generate scripts with premium features

## Production Deployment

### 1. Environment Variables
Set production values:
```bash
STRIPE_SECRET_KEY=sk_live_...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_...
NEXT_PUBLIC_BASE_URL=https://yourdomain.com
```

### 2. Switch to Live Mode
- Use live Stripe keys
- Create live products/prices
- Set up live webhook endpoint
- Test with real payment methods

### 3. Database Migration  
Switch from SQLite to PostgreSQL:
```bash
DATABASE_URL="postgresql://user:password@host:5432/dbname"
npx prisma migrate deploy
```

## Key Components

### Frontend
- `UsageLimits` component shows progress bars and remaining usage
- `UpgradeButton` component handles Stripe checkout
- Subscription page with tier comparison and management

### Backend  
- Usage middleware enforces limits before script generation
- Subscription service manages tiers and limits
- Webhook handlers keep subscriptions in sync
- Priority queue system for Pro users

## Pricing Strategy

Based on business plan analysis:

- **FREE**: 2 scripts (lead generation)
- **PRO**: $19/month, 50 scripts (individual creators) 
- **BUSINESS**: $49/month, 200 scripts (small teams)
- **ENTERPRISE**: $199/month, unlimited (large organizations)

Target metrics:
- 3-8% free-to-paid conversion
- $456 Pro user LTV (24mo retention)  
- $1,176 Business user LTV
- 6:1+ LTV/CAC ratio

## Next Steps

1. **Set up Stripe account and get API keys**
2. **Create products and update environment variables**
3. **Test the full payment flow**  
4. **Set up webhook endpoint**
5. **Deploy to production with live keys**

The subscription system is fully built and ready - just needs Stripe configuration!