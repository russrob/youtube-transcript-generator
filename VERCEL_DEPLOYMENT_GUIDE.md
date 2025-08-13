# 🚀 Vercel Production Deployment Guide

## Step-by-Step Deployment Process

### 1. **Initial Deployment**
```bash
cd /path/to/youtube-transcript-generator
vercel --prod
```

### 2. **Vercel Setup Process**
During deployment, Vercel will ask:
- **Project name**: `youtube-transcript-generator` 
- **Framework detection**: Next.js (auto-detected)
- **Root directory**: `.` (current directory)
- **Build settings**: Use defaults (Next.js detected)

### 3. **Add Vercel PostgreSQL Database**
```bash
# After deployment, add PostgreSQL
vercel storage add postgres
```

### 4. **Configure Environment Variables**
In Vercel Dashboard → Settings → Environment Variables:

```env
# Database (from Vercel PostgreSQL)
DATABASE_URL=postgresql://...
DIRECT_URL=postgresql://...

# Core Application
OPENAI_API_KEY=sk-proj-A_PeXpTLBpoL_vAySD5_eLr...
NEXTAUTH_SECRET=your-production-secret

# URLs (replace with actual domain)
NEXTAUTH_URL=https://your-app.vercel.app
NEXT_PUBLIC_BASE_URL=https://your-app.vercel.app

# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://bdiakaaddqzgbzxynulk.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIs...

# Clerk (Production Keys)
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_live_...
CLERK_SECRET_KEY=sk_live_...
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/dashboard
NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=/dashboard

# Stripe LIVE Keys
STRIPE_SECRET_KEY=sk_live_51RaJd3CXj4bagfyk...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_51RaJd3CXj4bagfyk...

# Stripe LIVE Price IDs
NEXT_PUBLIC_STRIPE_PRO_MONTHLY_PRICE_ID=price_1RvS2XCXj4bagfyk...
NEXT_PUBLIC_STRIPE_BUSINESS_MONTHLY_PRICE_ID=price_1RvS3gCXj4bagfyk...
NEXT_PUBLIC_STRIPE_ENTERPRISE_MONTHLY_PRICE_ID=price_1RvSGjCXj4bagfyk...

# Stripe Webhook (update after deployment)
STRIPE_WEBHOOK_SECRET=whsec_production_webhook_secret

# Admin
ADMIN_EMAILS=russrob23@gmail.com,admin@scriptforge.ai
```

### 5. **Database Migration**
```bash
# Connect to production database and run migrations
npx prisma migrate deploy
npx prisma generate
```

### 6. **Update Stripe Webhooks**
1. Go to Stripe Dashboard → Webhooks
2. Add new endpoint: `https://your-app.vercel.app/api/webhooks/stripe`
3. Copy new webhook secret
4. Update `STRIPE_WEBHOOK_SECRET` in Vercel environment variables

### 7. **Deploy with Environment Variables**
```bash
vercel --prod
```

---

## 🔧 Post-Deployment Checklist

### Immediate Testing
- [ ] App loads at production URL
- [ ] Authentication works (sign up/sign in)
- [ ] Database connection successful
- [ ] Stripe payments work with live keys
- [ ] Webhook events received

### Production Validation
- [ ] All API endpoints respond correctly
- [ ] Subscription flow works end-to-end
- [ ] Error monitoring active (Sentry)
- [ ] Performance metrics acceptable
- [ ] Security headers configured

### Domain & SSL (Optional)
- [ ] Custom domain configured
- [ ] SSL certificate active
- [ ] DNS records updated

---

## 🚨 Important Notes

### Security Considerations
- Never commit `.env.production` to version control
- Use Vercel's environment variable UI for sensitive data
- Rotate secrets after initial deployment
- Enable Vercel's security features

### Performance Optimization
- Vercel Edge Functions for API routes
- Image optimization enabled
- Static generation where possible
- CDN caching configured

### Monitoring Setup
- Vercel Analytics enabled
- Sentry error tracking active
- Stripe webhook monitoring
- Database performance monitoring

---

## 🆘 Troubleshooting

### Common Issues
**Build Failures**: Check build logs in Vercel dashboard
**Database Connection**: Verify DATABASE_URL format
**Environment Variables**: Ensure all required vars are set
**Stripe Webhooks**: Verify endpoint URL and secret

### Rollback Plan
```bash
# Rollback to previous deployment
vercel rollback
```

### Support Resources
- Vercel Documentation: https://vercel.com/docs
- Next.js Deployment: https://nextjs.org/docs/deployment
- Stripe Webhooks: https://stripe.com/docs/webhooks