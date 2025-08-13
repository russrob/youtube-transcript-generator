// This file configures the initialization of Sentry for edge runtime
import * as Sentry from '@sentry/nextjs';

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  environment: process.env.NODE_ENV,
  
  // Performance Monitoring (reduced for edge runtime)
  tracesSampleRate: process.env.NODE_ENV === 'production' ? 0.05 : 0.5,
  
  // Edge runtime specific configuration
  beforeSend(event, hint) {
    // Filter out edge-specific noise
    const error = hint.originalException;
    
    if (error && typeof error === 'object' && 'message' in error) {
      const message = String(error.message).toLowerCase();
      if (message.includes('edge runtime') || message.includes('edge function')) {
        return null;
      }
    }
    
    return event;
  },
});