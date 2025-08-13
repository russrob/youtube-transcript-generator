# Stripe Setup - Quick Start Guide

## 🚀 5-Minute Setup Checklist

Follow these exact steps to get Stripe configured for your YouTube Transcript Generator.

### Step 1: Create Products in Stripe Dashboard

1. **Go to**: [dashboard.stripe.com](https://dashboard.stripe.com) → **Products**
2. **Switch to LIVE mode** (top-left toggle)

#### Create PRO Product
```
Name: YouTube Transcript Generator - PRO
Price: $29.00 monthly
Add metadata:
  - tier: PRO
  - features: advanced_styles,script_remixing,priority_processing
```
📋 **Copy the Price ID** (starts with `price_`)

#### Create BUSINESS Product  
```
Name: YouTube Transcript Generator - BUSINESS
Price: $99.00 monthly
Add metadata:
  - tier: BUSINESS
  - features: all_pro_features,batch_generation,ab_testing
```
📋 **Copy the Price ID** (starts with `price_`)

#### Create ENTERPRISE Product
```
Name: YouTube Transcript Generator - ENTERPRISE  
Price: $299.00 monthly
Add metadata:
  - tier: ENTERPRISE
  - features: all_features,unlimited_scripts,dedicated_support
```
📋 **Copy the Price ID** (starts with `price_`)

### Step 2: Create Webhook Endpoint

1. **Go to**: **Webhooks** → **Add endpoint**
2. **URL**: `https://yourdomain.com/api/webhooks/stripe`
3. **Select these events**:
   - `customer.subscription.created`
   - `customer.subscription.updated` 
   - `customer.subscription.deleted`
   - `invoice.payment_succeeded`
   - `invoice.payment_failed`
4. **Click**: **Add endpoint**
5. 📋 **Copy the Webhook Secret** (starts with `whsec_`)

### Step 3: Update Environment Variables

Update your `.env` file:

```bash
# Replace these with your actual values from Stripe dashboard:

STRIPE_SECRET_KEY="sk_live_YOUR_SECRET_KEY"
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY="pk_live_YOUR_PUBLISHABLE_KEY"

NEXT_PUBLIC_STRIPE_PRO_MONTHLY_PRICE_ID="price_XXXXXXXXXXXXX"
NEXT_PUBLIC_STRIPE_BUSINESS_MONTHLY_PRICE_ID="price_XXXXXXXXXXXXX"  
NEXT_PUBLIC_STRIPE_ENTERPRISE_MONTHLY_PRICE_ID="price_XXXXXXXXXXXXX"

STRIPE_WEBHOOK_SECRET="whsec_XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX"
```

### Step 4: Test Your Setup

```bash
# Run the validation script
npm run test:stripe

# Start your development server  
npm run dev

# Test subscription flow in your app
# Visit: http://localhost:3000
```

---

## ✅ Validation Checklist

- [ ] 3 products created in Stripe with correct prices
- [ ] All 3 price IDs copied to environment variables
- [ ] Webhook endpoint created with all required events
- [ ] Webhook secret copied to environment variables
- [ ] Validation script runs without errors
- [ ] Test subscription flow works in your app

## 🚨 Important Notes

- **Test Mode**: Use `sk_test_` keys during development
- **Live Mode**: Use `sk_live_` keys for production only
- **Security**: Never commit API keys to version control
- **Testing**: Use card `4242 4242 4242 4242` for testing

## 🆘 Quick Troubleshooting

**"Price not found" error**: Check price IDs are correct in `.env`
**"Webhook failed" error**: Verify webhook URL matches your domain
**"Invalid API key" error**: Ensure you're using the correct test/live keys
**"Product inactive" error**: Activate products in Stripe dashboard

---

**That's it!** Your Stripe integration should now be working. 🎉

Next: Deploy to production and update environment variables with your live domain.