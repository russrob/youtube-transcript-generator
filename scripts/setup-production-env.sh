#!/bin/bash

# Production Environment Setup Script for Vercel
# Run this after creating the PostgreSQL database in Vercel dashboard

echo "🚀 Setting up production environment variables for YouTube Transcript Generator"
echo "=================================================================="
echo ""
echo "⚠️  IMPORTANT: Make sure you have created the PostgreSQL database in Vercel dashboard first!"
echo "   Visit: https://vercel.com/dashboard -> Your Project -> Storage -> Create Database"
echo ""

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    echo "❌ Error: Please run this script from the project root directory"
    exit 1
fi

# Check if user is logged into Vercel
if ! npx vercel whoami > /dev/null 2>&1; then
    echo "❌ Error: Please login to Vercel first: npx vercel login"
    exit 1
fi

echo "📝 Adding environment variables to Vercel project..."
echo ""

# Function to add environment variable
add_env_var() {
    local var_name=$1
    local var_description=$2
    
    echo "Adding $var_name ($var_description):"
    npx vercel env add $var_name production
    echo ""
}

# Add required environment variables
echo "🔐 Authentication Variables:"
add_env_var "NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY" "Clerk Publishable Key"
add_env_var "CLERK_SECRET_KEY" "Clerk Secret Key"

echo "🤖 AI API Variables:"
add_env_var "OPENAI_API_KEY" "OpenAI API Key"

echo "💳 Stripe Variables (LIVE KEYS):"
add_env_var "STRIPE_PUBLISHABLE_KEY" "Stripe Live Publishable Key"
add_env_var "STRIPE_SECRET_KEY" "Stripe Live Secret Key"
add_env_var "STRIPE_WEBHOOK_SECRET" "Stripe Production Webhook Secret"

echo "💰 Stripe Price IDs (LIVE):"
add_env_var "STRIPE_PRO_PRICE_ID" "Stripe PRO Plan Live Price ID"
add_env_var "STRIPE_BUSINESS_PRICE_ID" "Stripe Business Plan Live Price ID"
add_env_var "STRIPE_ENTERPRISE_PRICE_ID" "Stripe Enterprise Plan Live Price ID"

echo "🌐 Application URLs:"
read -p "Enter your production app URL (default: https://youtube-transcript-generator-nqw6497ng-russrob23-1382s-projects.vercel.app): " APP_URL
APP_URL=${APP_URL:-"https://youtube-transcript-generator-nqw6497ng-russrob23-1382s-projects.vercel.app"}
echo $APP_URL | npx vercel env add NEXT_PUBLIC_APP_URL production

echo ""
echo "✅ Environment variables setup complete!"
echo ""
echo "🔄 Next steps:"
echo "1. Run database migration: npx prisma db push"
echo "2. Update Stripe webhook URL to: $APP_URL/api/stripe/webhook"
echo "3. Deploy with new environment: npx vercel --prod"
echo "4. Test the production application"
echo ""
echo "📋 Environment variables checklist:"
echo "- Database: ✅ (Auto-added by Vercel PostgreSQL)"
echo "- Clerk Auth: ✅"
echo "- OpenAI: ✅"
echo "- Stripe: ✅"
echo "- App URL: ✅"
echo ""
echo "🎉 Production setup is now ready!"