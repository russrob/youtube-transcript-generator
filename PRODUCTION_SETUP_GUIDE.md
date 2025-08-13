# Production Setup Guide - Vercel PostgreSQL Database

## ✅ COMPLETED
- ✅ Vercel deployment successful
- ✅ TypeScript compilation errors fixed
- ✅ Prisma client generation configured

## 🔧 NEXT STEPS: Database & Environment Setup

### Step 1: Create Vercel PostgreSQL Database

**Via Vercel Dashboard** (Required):
1. Go to your Vercel dashboard: https://vercel.com/dashboard
2. Select your project: `youtube-transcript-generator`
3. Navigate to the **"Storage"** tab
4. Click **"Create Database"**
5. Select **"Postgres"**
6. Choose database name: `youtube-transcript-db`
7. Select region: **US East (recommended for performance)**
8. Click **"Create"**

### Step 2: Connect Database to Project

After creating the database:
1. Go to the **"Settings"** tab in your database
2. Click **"Connect Project"**
3. Select your `youtube-transcript-generator` project
4. This will automatically add the required environment variables

### Step 3: Configure Environment Variables

The following environment variables need to be added to your Vercel project:

#### Database Variables (Auto-added by Vercel)
```bash
POSTGRES_URL="postgresql://..."
POSTGRES_PRISMA_URL="postgresql://..."
POSTGRES_URL_NO_SSL="postgresql://..."
POSTGRES_URL_NON_POOLING="postgresql://..."
POSTGRES_USER="..."
POSTGRES_HOST="..."
POSTGRES_PASSWORD="..."
POSTGRES_DATABASE="..."
```

#### Manual Environment Variables (Add these via Vercel Dashboard > Settings > Environment Variables)

**Required for Application**:
```bash
# Clerk Authentication
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_SECRET_KEY=sk_test_...
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/dashboard
NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=/dashboard

# OpenAI API
OPENAI_API_KEY=sk-...

# Stripe (Production Keys)
STRIPE_PUBLISHABLE_KEY=pk_live_...
STRIPE_SECRET_KEY=sk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...

# Stripe Price IDs (Production)
STRIPE_PRO_PRICE_ID=price_...
STRIPE_BUSINESS_PRICE_ID=price_...
STRIPE_ENTERPRISE_PRICE_ID=price_...

# Application
NEXT_PUBLIC_APP_URL=https://youtube-transcript-generator-nqw6497ng-russrob23-1382s-projects.vercel.app
NODE_ENV=production

# Optional: Sentry (for error monitoring)
SENTRY_DSN=https://...
SENTRY_ORG=your-org
SENTRY_PROJECT=youtube-transcript-generator
SENTRY_AUTH_TOKEN=...
```

### Step 4: Run Database Migration

After database and environment variables are set up:

```bash
# Generate Prisma client for production
npx prisma generate

# Push schema to production database
npx prisma db push --accept-data-loss

# Optional: Seed database with initial data
npx prisma db seed
```

### Step 5: Update Stripe Webhook URL

1. Go to Stripe Dashboard > Webhooks
2. Find your webhook endpoint
3. Update the endpoint URL to:
   ```
   https://youtube-transcript-generator-nqw6497ng-russrob23-1382s-projects.vercel.app/api/stripe/webhook
   ```

### Step 6: Test Production Deployment

After all setup is complete:

1. **Test Authentication**: Sign up/sign in
2. **Test Transcript Fetching**: Enter a YouTube URL
3. **Test Script Generation**: Generate a script
4. **Test Subscription Flow**: Test Stripe checkout
5. **Test Premium Features**: Test script remixing

## 🚀 CLI Commands for Quick Setup

Once you have the database URL from Vercel:

```bash
# Set environment variables via CLI (alternative to dashboard)
vercel env add OPENAI_API_KEY
vercel env add STRIPE_SECRET_KEY
vercel env add CLERK_SECRET_KEY
# ... add all required variables

# Deploy with new environment variables
vercel --prod

# Run database migration (requires DATABASE_URL)
npx prisma db push
```

## 📋 Environment Variables Checklist

Copy your actual values:

- [ ] `POSTGRES_URL` (auto-added by Vercel)
- [ ] `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`
- [ ] `CLERK_SECRET_KEY`
- [ ] `OPENAI_API_KEY`
- [ ] `STRIPE_PUBLISHABLE_KEY` (live key)
- [ ] `STRIPE_SECRET_KEY` (live key)
- [ ] `STRIPE_WEBHOOK_SECRET` (production webhook)
- [ ] `STRIPE_PRO_PRICE_ID` (live price ID)
- [ ] `STRIPE_BUSINESS_PRICE_ID` (live price ID)
- [ ] `STRIPE_ENTERPRISE_PRICE_ID` (live price ID)
- [ ] `NEXT_PUBLIC_APP_URL`

## 🔍 Verification Steps

After complete setup:

1. **Database Connection**: Check if app connects to database
2. **Authentication**: Test Clerk sign-up/sign-in
3. **API Functionality**: Test transcript fetching
4. **Payments**: Test Stripe integration
5. **Premium Features**: Test subscription-gated features

## 🆘 Troubleshooting

**Common Issues**:
- **Database Connection**: Ensure `POSTGRES_URL` is correctly set
- **Clerk Auth**: Verify publishable and secret keys match your Clerk project
- **Stripe**: Ensure webhook URL is updated and live keys are used
- **CORS**: Check app URL in environment variables

**Debug Commands**:
```bash
# Check environment variables
vercel env ls

# Check deployment logs
vercel logs

# Test database connection
npx prisma db seed --preview-feature
```