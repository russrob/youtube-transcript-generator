import * as Sentry from '@sentry/nextjs';

/**
 * Initialize Sentry for error monitoring
 */
export function initSentry() {
  if (process.env.SENTRY_DSN) {
    Sentry.init({
      dsn: process.env.SENTRY_DSN,
      environment: process.env.NODE_ENV,
      
      // Performance Monitoring
      tracesSampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 1.0,
      
      // Release tracking
      release: process.env.NEXT_PUBLIC_APP_VERSION || 'unknown',
      
      // Error filtering
      beforeSend(event, hint) {
        const error = hint.originalException;
        
        // Filter out network errors that we can't control
        if (error && typeof error === 'object' && 'message' in error) {
          const message = String(error.message).toLowerCase();
          if (
            message.includes('network') ||
            message.includes('fetch') ||
            message.includes('cors') ||
            message.includes('timeout')
          ) {
            return null; // Don't send to Sentry
          }
        }
        
        // Filter out user-caused errors
        if (event.exception?.values?.[0]?.type === 'ValidationError') {
          return null; // Don't send validation errors to Sentry
        }
        
        return event;
      },
      
      // Session tracking
      autoSessionTracking: true,
      
      // Additional context
      integrations: [
        new Sentry.BrowserTracing({
          // Set sampling rate for performance monitoring
          tracePropagationTargets: [
            'localhost',
            /^https:\/\/yourapp\.vercel\.app/
          ],
        }),
      ],
    });
  }
}

/**
 * Log error to Sentry with additional context
 */
export function logError(error: Error, context?: Record<string, any>, level: 'error' | 'warning' | 'info' = 'error') {
  if (process.env.NODE_ENV === 'development') {
    console.error(`[${level.toUpperCase()}]`, error.message, { error, context });
    return;
  }

  Sentry.withScope((scope) => {
    scope.setLevel(level);
    
    if (context) {
      Object.entries(context).forEach(([key, value]) => {
        scope.setContext(key, value);
      });
    }
    
    Sentry.captureException(error);
  });
}

/**
 * Log custom message to Sentry
 */
export function logMessage(message: string, level: 'error' | 'warning' | 'info' = 'info', context?: Record<string, any>) {
  if (process.env.NODE_ENV === 'development') {
    console.log(`[${level.toUpperCase()}]`, message, context);
    return;
  }

  Sentry.withScope((scope) => {
    scope.setLevel(level);
    
    if (context) {
      Object.entries(context).forEach(([key, value]) => {
        scope.setContext(key, value);
      });
    }
    
    Sentry.captureMessage(message);
  });
}

/**
 * Set user context for error tracking
 */
export function setUserContext(user: {
  id: string;
  email?: string;
  subscription?: string;
}) {
  Sentry.setUser({
    id: user.id,
    email: user.email,
    subscription: user.subscription,
  });
}

/**
 * Add breadcrumb for debugging
 */
export function addBreadcrumb(message: string, category: string, data?: Record<string, any>) {
  Sentry.addBreadcrumb({
    message,
    category,
    level: 'info',
    data,
    timestamp: Date.now() / 1000,
  });
}

/**
 * Performance monitoring for async operations
 */
export function withPerformanceMonitoring<T>(
  operationName: string,
  operation: () => Promise<T>,
  metadata?: Record<string, any>
): Promise<T> {
  const transaction = Sentry.startTransaction({
    name: operationName,
    description: `Performance monitoring for ${operationName}`,
  });

  if (metadata) {
    Object.entries(metadata).forEach(([key, value]) => {
      transaction.setData(key, value);
    });
  }

  return operation()
    .then((result) => {
      transaction.setStatus('ok');
      return result;
    })
    .catch((error) => {
      transaction.setStatus('internal_error');
      logError(error, { operation: operationName, ...metadata });
      throw error;
    })
    .finally(() => {
      transaction.finish();
    });
}

/**
 * Monitor API endpoint performance
 */
export function withApiMonitoring<T>(
  endpoint: string,
  method: string,
  operation: () => Promise<T>,
  userId?: string
): Promise<T> {
  return withPerformanceMonitoring(
    `API ${method} ${endpoint}`,
    operation,
    {
      endpoint,
      method,
      userId,
      timestamp: new Date().toISOString(),
    }
  );
}

/**
 * Monitor AI generation performance
 */
export function withAiMonitoring<T>(
  operationType: 'script_generation' | 'remix_variations' | 'final_remix',
  operation: () => Promise<T>,
  metadata?: {
    userId?: string;
    videoId?: string;
    style?: string;
    audience?: string;
  }
): Promise<T> {
  return withPerformanceMonitoring(
    `AI ${operationType}`,
    operation,
    {
      operationType,
      ...metadata,
      provider: 'openai',
      model: 'gpt-4',
    }
  );
}

export default {
  init: initSentry,
  logError,
  logMessage,
  setUserContext,
  addBreadcrumb,
  withPerformanceMonitoring,
  withApiMonitoring,
  withAiMonitoring,
};