// This file configures the initialization of Sentry on the browser/client side
import * as Sentry from '@sentry/nextjs';

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  environment: process.env.NODE_ENV,
  
  // Performance Monitoring
  tracesSampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 1.0,
  
  // Session Replay
  replaysSessionSampleRate: 0.1, // This sets the sample rate at 10%. You may want to change it to 100% while in development and then sample at a lower rate in production.
  replaysOnErrorSampleRate: 1.0, // If you're not already sampling the entire session, change the sample rate to 100% when sampling sessions where errors occur.
  
  integrations: [
    new Sentry.Replay({
      // Mask all text content, passwords, and emails
      maskAllText: true,
      blockAllMedia: true,
    }),
    new Sentry.BrowserTracing({
      // Set sampling rate for performance monitoring
      tracePropagationTargets: [
        'localhost',
        /^https:\/\/yourapp\.vercel\.app/,
        /^https:\/\/api\.openai\.com/,
        /^https:\/\/api\.stripe\.com/,
      ],
    }),
  ],
  
  // Error filtering for client-side
  beforeSend(event, hint) {
    const error = hint.originalException;
    
    // Filter out network errors
    if (error && typeof error === 'object' && 'message' in error) {
      const message = String(error.message).toLowerCase();
      if (
        message.includes('network error') ||
        message.includes('failed to fetch') ||
        message.includes('load failed') ||
        message.includes('script error')
      ) {
        return null;
      }
    }
    
    // Filter out common browser extension errors
    if (event.exception?.values?.[0]?.stacktrace?.frames?.some(frame => 
      frame.filename?.includes('extension://') || 
      frame.filename?.includes('moz-extension://')
    )) {
      return null;
    }
    
    return event;
  },
});