import { NextRequest, NextResponse } from 'next/server';

// Rate limiting configuration
interface RateLimitConfig {
  windowMs: number; // Time window in milliseconds
  maxRequests: number; // Maximum requests per window
  message?: string; // Custom error message
}

// Default configurations for different endpoint types
export const RATE_LIMIT_CONFIGS = {
  // Standard API endpoints
  default: {
    windowMs: 15 * 60 * 1000, // 15 minutes
    maxRequests: 100, // 100 requests per 15 minutes
    message: 'Too many requests, please try again later.'
  },
  
  // AI generation endpoints (more restrictive)
  ai_generation: {
    windowMs: 60 * 1000, // 1 minute
    maxRequests: 5, // 5 requests per minute
    message: 'AI generation rate limit exceeded. Please wait before generating again.'
  },
  
  // Authentication endpoints
  auth: {
    windowMs: 15 * 60 * 1000, // 15 minutes
    maxRequests: 10, // 10 attempts per 15 minutes
    message: 'Too many authentication attempts, please try again later.'
  },
  
  // File upload endpoints
  upload: {
    windowMs: 60 * 1000, // 1 minute
    maxRequests: 3, // 3 uploads per minute
    message: 'Upload rate limit exceeded.'
  },
  
  // Webhook endpoints
  webhook: {
    windowMs: 60 * 1000, // 1 minute
    maxRequests: 100, // 100 webhooks per minute
    message: 'Webhook rate limit exceeded.'
  }
};

// In-memory store for rate limiting (use Redis in production)
const rateLimitStore = new Map<string, { count: number; resetTime: number }>();

// Cleanup old entries periodically
setInterval(() => {
  const now = Date.now();
  for (const [key, value] of rateLimitStore.entries()) {
    if (now > value.resetTime) {
      rateLimitStore.delete(key);
    }
  }
}, 5 * 60 * 1000); // Cleanup every 5 minutes

/**
 * Rate limiting middleware
 */
export function rateLimit(config: RateLimitConfig = RATE_LIMIT_CONFIGS.default) {
  return async (request: NextRequest): Promise<NextResponse | null> => {
    try {
      // Get client identifier (IP address + user agent for better uniqueness)
      const clientIP = request.ip || 
                      request.headers.get('x-forwarded-for') || 
                      request.headers.get('x-real-ip') || 
                      '127.0.0.1';
      
      const userAgent = request.headers.get('user-agent') || 'unknown';
      const identifier = `${clientIP}:${userAgent.slice(0, 50)}`;
      
      const now = Date.now();
      const windowStart = now - config.windowMs;
      
      // Get or create rate limit entry
      let entry = rateLimitStore.get(identifier);
      
      if (!entry || now > entry.resetTime) {
        // Create new entry or reset expired entry
        entry = {
          count: 1,
          resetTime: now + config.windowMs
        };
        rateLimitStore.set(identifier, entry);
        return null; // Allow request
      }
      
      // Check if limit exceeded
      if (entry.count >= config.maxRequests) {
        const resetTimeSeconds = Math.ceil((entry.resetTime - now) / 1000);
        
        return NextResponse.json(
          {
            error: config.message || 'Rate limit exceeded',
            retryAfter: resetTimeSeconds,
            limit: config.maxRequests,
            windowMs: config.windowMs
          },
          {
            status: 429,
            headers: {
              'Retry-After': resetTimeSeconds.toString(),
              'X-RateLimit-Limit': config.maxRequests.toString(),
              'X-RateLimit-Remaining': '0',
              'X-RateLimit-Reset': new Date(entry.resetTime).toISOString()
            }
          }
        );
      }
      
      // Increment counter
      entry.count++;
      rateLimitStore.set(identifier, entry);
      
      return null; // Allow request
      
    } catch (error) {
      console.error('Rate limiting error:', error);
      // In case of error, allow the request to proceed
      return null;
    }
  };
}

/**
 * Apply rate limiting to API routes
 */
export async function applyRateLimit(
  request: NextRequest, 
  configType: keyof typeof RATE_LIMIT_CONFIGS = 'default'
): Promise<NextResponse | null> {
  const config = RATE_LIMIT_CONFIGS[configType];
  const rateLimitMiddleware = rateLimit(config);
  return await rateLimitMiddleware(request);
}

/**
 * Rate limiting decorator for API routes
 */
export function withRateLimit(
  handler: (request: NextRequest, context?: any) => Promise<NextResponse>,
  configType: keyof typeof RATE_LIMIT_CONFIGS = 'default'
) {
  return async (request: NextRequest, context?: any): Promise<NextResponse> => {
    // Apply rate limiting
    const rateLimitResponse = await applyRateLimit(request, configType);
    if (rateLimitResponse) {
      return rateLimitResponse;
    }
    
    // Proceed with original handler
    return await handler(request, context);
  };
}