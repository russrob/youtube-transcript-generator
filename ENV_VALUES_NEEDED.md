# Production Environment Variables Needed

## ✅ COMPLETED
- ✅ Database connection (automatically added by Vercel)
- ✅ NEXT_PUBLIC_APP_URL

## 🔑 REQUIRED VALUES

Please add these environment variables via Vercel Dashboard (Settings > Environment Variables):

### 1. Clerk Authentication
**You need to get these from your Clerk dashboard:**
- `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` = `pk_live_...` (your live Clerk key)
- `CLERK_SECRET_KEY` = `sk_live_...` (your live Clerk secret)

**Additional Clerk URLs to add:**
- `NEXT_PUBLIC_CLERK_SIGN_IN_URL` = `/sign-in`
- `NEXT_PUBLIC_CLERK_SIGN_UP_URL` = `/sign-up`
- `NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL` = `/dashboard`
- `NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL` = `/dashboard`

### 2. OpenAI API
- `OPENAI_API_KEY` = `sk-...` (your OpenAI API key)

### 3. Stripe (LIVE KEYS for Production)
**You provided these live keys earlier:**
- `STRIPE_PUBLISHABLE_KEY` = `pk_live_51RaJd3CXj4bagfykBxwiH2GLbvOtOySCqtV5F975v1m13tGZ0NfeW2bn0VbKhVwyNeYwNnpmStGlT6dDLi8sx6Bt00tGdzx0qN`
- `STRIPE_SECRET_KEY` = `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`
- `STRIPE_WEBHOOK_SECRET` = `whsec_aa52279338b135b01975506f14c5a0786fe9d34b8208d9fe2e596cc65be2ed53`

### 4. Stripe Price IDs (LIVE)
**You provided these live price IDs:**
- `STRIPE_PRO_PRICE_ID` = `price_1RvS2XCXj4bagfykKAuZT6XZ`
- `STRIPE_BUSINESS_PRICE_ID` = `price_1RvS3gCXj4bagfyk5Ry8fW4e`
- `STRIPE_ENTERPRISE_PRICE_ID` = `price_1RvSGjCXj4bagfykRxQMqAKc`

## 🔧 How to Add via Vercel Dashboard

1. Go to: https://vercel.com/dashboard
2. Select your project: `youtube-transcript-generator`
3. Go to: Settings > Environment Variables
4. Click "Add" for each variable
5. Set environment to: **Production**
6. Add each key-value pair from above

## 🚀 After Adding All Variables

Run this command to deploy with the new environment:
```bash
npx vercel --prod
```

## 📋 Quick CLI Commands (Alternative)

If you prefer CLI, use these commands:

```bash
# Add Clerk keys
echo "your_clerk_publishable_key" | npx vercel env add NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY production
echo "your_clerk_secret_key" | npx vercel env add CLERK_SECRET_KEY production

# Add OpenAI key
echo "your_openai_api_key" | npx vercel env add OPENAI_API_KEY production

# Add Stripe live keys
echo "pk_live_51RaJd3CXj4bagfykBxwiH2GLbvOtOySCqtV5F975v1m13tGZ0NfeW2bn0VbKhVwyNeYwNnpmStGlT6dDLi8sx6Bt00tGdzx0qN" | npx vercel env add STRIPE_PUBLISHABLE_KEY production
echo "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" | npx vercel env add STRIPE_SECRET_KEY production

# Add Stripe price IDs (live)
echo "price_1RvS2XCXj4bagfykKAuZT6XZ" | npx vercel env add STRIPE_PRO_PRICE_ID production
echo "price_1RvS3gCXj4bagfyk5Ry8fW4e" | npx vercel env add STRIPE_BUSINESS_PRICE_ID production
echo "price_1RvSGjCXj4bagfykRxQMqAKc" | npx vercel env add STRIPE_ENTERPRISE_PRICE_ID production
```

## ⚠️ IMPORTANT
- Make sure to use your **LIVE** Clerk keys (not test keys)
- Use the **LIVE** Stripe keys provided above
- Update the Stripe webhook URL after deployment