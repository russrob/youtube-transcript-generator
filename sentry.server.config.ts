// This file configures the initialization of Sentry on the server side
import * as Sentry from '@sentry/nextjs';

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  environment: process.env.NODE_ENV,
  
  // Performance Monitoring
  tracesSampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 1.0,
  
  // Release tracking
  release: process.env.SENTRY_RELEASE || process.env.VERCEL_GIT_COMMIT_SHA || 'unknown',
  
  // Server-specific configuration
  serverName: process.env.VERCEL_REGION || 'localhost',
  
  integrations: [
    // Add server-side integrations
  ],
  
  // Error filtering for server-side
  beforeSend(event, hint) {
    const error = hint.originalException;
    
    // Filter out validation errors
    if (event.exception?.values?.[0]?.type === 'ZodError') {
      return null; // Don't send Zod validation errors
    }
    
    // Filter out rate limiting errors (expected behavior)
    if (error && typeof error === 'object' && 'message' in error) {
      const message = String(error.message).toLowerCase();
      if (message.includes('rate limit') || message.includes('too many requests')) {
        return null;
      }
    }
    
    // Log critical errors to console in development
    if (process.env.NODE_ENV === 'development') {
      console.error('Sentry Error:', error);
    }
    
    return event;
  },
  
  // Enhanced error context
  initialScope: {
    tags: {
      component: 'youtube-transcript-generator',
      deployment: process.env.VERCEL_ENV || 'development',
    },
  },
});