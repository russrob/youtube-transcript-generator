# Stripe Products Setup Guide
## YouTube Transcript Generator - Complete Setup Instructions

This guide will walk you through setting up Stripe products for your YouTube Transcript Generator's subscription system.

## 🎯 Overview

You need to create 3 subscription products in Stripe:
- **PRO**: $29/month - 50 scripts, advanced features, remixing
- **BUSINESS**: $99/month - 200 scripts, batch processing, team features  
- **ENTERPRISE**: $299/month - Unlimited scripts, all features, dedicated support

## 📋 Prerequisites

- [ ] Stripe account created and verified
- [ ] Business information completed in Stripe
- [ ] Bank account connected for payouts
- [ ] Tax information submitted

---

## Phase 1: Stripe Dashboard Setup

### Step 1: Log into Stripe Dashboard

1. Go to [dashboard.stripe.com](https://dashboard.stripe.com)
2. Sign in to your account
3. Make sure you're in **LIVE MODE** (toggle in top-left)
4. Navigate to **Products** in the left sidebar

### Step 2: Create PRO Monthly Product

1. **Click "Add Product"**
2. **Fill in Product Information:**
   ```
   Name: YouTube Transcript Generator - PRO
   Description: Professional plan with advanced script generation, remixing capabilities, and priority processing
   ```

3. **Set Up Pricing:**
   ```
   Pricing Model: Standard pricing
   Price: $29.00
   Billing Period: Monthly
   Currency: USD
   ```

4. **Add Product Metadata** (Click "Add metadata"):
   ```
   tier: PRO
   scripts_limit: 50
   features: advanced_styles,script_remixing,priority_processing,watermark_free
   team_members: 1
   support_level: priority
   ```

5. **Click "Save Product"**
6. **Copy the Price ID** (starts with `price_`) - you'll need this for environment variables

### Step 3: Create BUSINESS Monthly Product

1. **Click "Add Product"**
2. **Fill in Product Information:**
   ```
   Name: YouTube Transcript Generator - BUSINESS
   Description: Business plan with team collaboration, batch processing, and A/B testing capabilities
   ```

3. **Set Up Pricing:**
   ```
   Pricing Model: Standard pricing
   Price: $99.00
   Billing Period: Monthly
   Currency: USD
   ```

4. **Add Product Metadata:**
   ```
   tier: BUSINESS
   scripts_limit: 200
   features: all_pro_features,batch_generation,ab_testing,team_collaboration
   team_members: 5
   support_level: priority
   ```

5. **Click "Save Product"**
6. **Copy the Price ID** (starts with `price_`)

### Step 4: Create ENTERPRISE Monthly Product

1. **Click "Add Product"**
2. **Fill in Product Information:**
   ```
   Name: YouTube Transcript Generator - ENTERPRISE
   Description: Enterprise plan with unlimited scripts, template library, and dedicated support
   ```

3. **Set Up Pricing:**
   ```
   Pricing Model: Standard pricing
   Price: $299.00
   Billing Period: Monthly
   Currency: USD
   ```

4. **Add Product Metadata:**
   ```
   tier: ENTERPRISE
   scripts_limit: unlimited
   features: all_features,template_library,custom_integrations,dedicated_support
   team_members: unlimited
   support_level: dedicated
   ```

5. **Click "Save Product"**
6. **Copy the Price ID** (starts with `price_`)

---

## Phase 2: Webhook Configuration

### Step 1: Create Webhook Endpoint

1. **Navigate to "Webhooks"** in the Stripe dashboard
2. **Click "Add endpoint"**
3. **Enter Endpoint URL:**
   ```
   https://yourdomain.com/api/webhooks/stripe
   ```
   (Replace `yourdomain.com` with your actual domain)

4. **Select Events to Listen For:**
   ```
   ✅ customer.subscription.created
   ✅ customer.subscription.updated
   ✅ customer.subscription.deleted
   ✅ customer.subscription.trial_will_end
   ✅ invoice.payment_succeeded
   ✅ invoice.payment_failed
   ✅ customer.created
   ✅ customer.updated
   ```

5. **Click "Add endpoint"**
6. **Copy the Webhook Signing Secret** (starts with `whsec_`)

### Step 2: Test Webhook (Optional for now)

1. **Click "Send test webhook"** 
2. **Select "customer.subscription.created"**
3. **Click "Send test webhook"**
4. Verify it shows as successful (will fail until you deploy)

---

## Phase 3: Environment Variables Update

### Step 1: Update .env File

Open your `.env` file and update these values with your actual Stripe data:

```bash
# Stripe Configuration - LIVE KEYS
STRIPE_SECRET_KEY="sk_live_YOUR_ACTUAL_SECRET_KEY"
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY="pk_live_YOUR_ACTUAL_PUBLISHABLE_KEY"

# Stripe Price IDs - Replace with your actual price IDs from above
NEXT_PUBLIC_STRIPE_PRO_MONTHLY_PRICE_ID="price_1XXXXXXXXXXXXXXX"
NEXT_PUBLIC_STRIPE_BUSINESS_MONTHLY_PRICE_ID="price_1XXXXXXXXXXXXXXX"
NEXT_PUBLIC_STRIPE_ENTERPRISE_MONTHLY_PRICE_ID="price_1XXXXXXXXXXXXXXX"

# Stripe Webhook Secret - Replace with your actual webhook secret
STRIPE_WEBHOOK_SECRET="whsec_1XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX"
```

### Step 2: Update .env.production File

Create or update `.env.production` with the same values for production deployment.

---

## Phase 4: Testing Your Setup

### Step 1: Start Development Server

```bash
npm run dev
```

### Step 2: Test Subscription Flow

1. **Navigate to your app** (http://localhost:3000)
2. **Sign up for a new account**
3. **Go to subscription/pricing page**
4. **Try to subscribe to PRO plan**
5. **Use Stripe test card**: `4242 4242 4242 4242`
6. **Verify subscription activation**

### Step 3: Test Webhook Processing

1. **In Stripe dashboard**, go to Webhooks
2. **Click on your endpoint**
3. **Click "Send test webhook"**
4. **Select "customer.subscription.created"**
5. **Verify webhook is received successfully**

---

## 🔍 Verification Checklist

After completing setup, verify:

- [ ] **3 products created** in Stripe dashboard with correct pricing
- [ ] **Price IDs copied** and added to environment variables
- [ ] **Webhook endpoint configured** with correct events
- [ ] **Webhook secret added** to environment variables
- [ ] **Test subscription flow** works end-to-end
- [ ] **Webhook processing** receives events successfully

---

## 🚨 Important Notes

### Security
- **Never commit** your live Stripe keys to version control
- **Use test keys** in development environment
- **Use live keys** only in production environment

### Testing
- **Test mode**: Use `sk_test_` and `pk_test_` keys for testing
- **Live mode**: Use `sk_live_` and `pk_live_` keys for production
- **Test cards**: Use Stripe's test card numbers for testing

### Webhooks
- **Endpoint URL**: Must be HTTPS in production
- **Event validation**: Your app validates webhook signatures
- **Retry logic**: Stripe retries failed webhooks automatically

---

## 📞 Support

If you encounter issues:

1. **Check Stripe Dashboard** → Events for webhook delivery status
2. **Check Application Logs** for error messages
3. **Verify Environment Variables** are correct
4. **Test with Stripe CLI** for local webhook testing

### Stripe CLI Testing (Optional)

```bash
# Install Stripe CLI
# Login to your account
stripe login

# Forward webhooks to local development
stripe listen --forward-to localhost:3000/api/webhooks/stripe

# Test webhook delivery
stripe trigger customer.subscription.created
```

---

## ✅ Next Steps

After completing Stripe setup:

1. **Deploy to production** with live environment variables
2. **Test production subscription flows**
3. **Monitor webhook delivery** in first week
4. **Set up subscription management** UI for customers
5. **Configure email notifications** for subscription events

Your Stripe integration is now ready for production! 🎉