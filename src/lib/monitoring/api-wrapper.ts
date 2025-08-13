import { NextRequest, NextResponse } from 'next/server';
import { currentUser } from '@clerk/nextjs/server';
import { withApiMonitoring, logError, setUserContext, addBreadcrumb } from './sentry';

export interface ApiError {
  code: string;
  message: string;
  statusCode: number;
  details?: any;
}

export class APIError extends Error {
  public code: string;
  public statusCode: number;
  public details?: any;

  constructor(message: string, code: string, statusCode: number = 500, details?: any) {
    super(message);
    this.name = 'APIError';
    this.code = code;
    this.statusCode = statusCode;
    this.details = details;
  }
}

/**
 * Wrapper for API route handlers with error monitoring and standardized responses
 */
export function withErrorMonitoring<T = any>(
  handler: (request: NextRequest, context?: any) => Promise<NextResponse<T>>,
  options: {
    endpoint: string;
    method: string;
    requireAuth?: boolean;
    rateLimitKey?: string;
  }
) {
  return async (request: NextRequest, context?: any): Promise<NextResponse<T | { error: string; code?: string }>> => {
    const startTime = Date.now();
    let userId: string | undefined;

    try {
      // Add breadcrumb for request tracking
      addBreadcrumb(`${options.method} ${options.endpoint}`, 'http', {
        url: request.url,
        method: options.method,
        userAgent: request.headers.get('user-agent'),
      });

      // Get user context if auth is required
      if (options.requireAuth) {
        const user = await currentUser();
        if (!user?.id) {
          throw new APIError('Authentication required', 'UNAUTHORIZED', 401);
        }
        userId = user.id;
        
        // Set user context for error tracking
        setUserContext({
          id: user.id,
          email: user.emailAddresses[0]?.emailAddress,
        });
      }

      // Execute the handler with monitoring
      const response = await withApiMonitoring(
        options.endpoint,
        options.method,
        () => handler(request, context),
        userId
      );

      // Log successful requests (info level)
      const duration = Date.now() - startTime;
      addBreadcrumb(`${options.method} ${options.endpoint} completed`, 'http', {
        statusCode: response.status,
        duration,
        userId,
      });

      return response;

    } catch (error: any) {
      const duration = Date.now() - startTime;

      // Handle different types of errors
      if (error instanceof APIError) {
        // Custom API errors - log as warnings (expected errors)
        logError(error, {
          endpoint: options.endpoint,
          method: options.method,
          userId,
          duration,
          statusCode: error.statusCode,
          errorCode: error.code,
        }, 'warning');

        return NextResponse.json(
          {
            error: error.message,
            code: error.code,
            ...(error.details && { details: error.details })
          },
          { status: error.statusCode }
        );
      }

      // Unexpected errors - log as errors
      logError(error, {
        endpoint: options.endpoint,
        method: options.method,
        userId,
        duration,
        requestUrl: request.url,
        requestHeaders: Object.fromEntries(request.headers.entries()),
      });

      // Return generic error response
      return NextResponse.json(
        {
          error: process.env.NODE_ENV === 'production' 
            ? 'Internal server error' 
            : error.message,
          code: 'INTERNAL_ERROR'
        },
        { status: 500 }
      );
    }
  };
}

/**
 * Standardized error responses for common scenarios
 */
export const ApiErrors = {
  UNAUTHORIZED: () => new APIError('Authentication required', 'UNAUTHORIZED', 401),
  FORBIDDEN: (message = 'Access denied') => new APIError(message, 'FORBIDDEN', 403),
  NOT_FOUND: (resource = 'Resource') => new APIError(`${resource} not found`, 'NOT_FOUND', 404),
  VALIDATION_ERROR: (message: string, details?: any) => new APIError(message, 'VALIDATION_ERROR', 400, details),
  RATE_LIMIT: (message = 'Rate limit exceeded') => new APIError(message, 'RATE_LIMIT', 429),
  EXTERNAL_API_ERROR: (service: string, message?: string) => new APIError(
    message || `External ${service} API error`, 
    'EXTERNAL_API_ERROR', 
    502,
    { service }
  ),
  QUOTA_EXCEEDED: (resource: string) => new APIError(
    `${resource} quota exceeded`, 
    'QUOTA_EXCEEDED', 
    429,
    { resource }
  ),
};

/**
 * Validate request body with Zod schema and proper error handling
 */
export async function validateRequestBody<T>(
  request: NextRequest,
  schema: any
): Promise<T> {
  try {
    const body = await request.json();
    const result = schema.safeParse(body);
    
    if (!result.success) {
      const firstError = result.error.errors[0];
      const errorMessage = firstError 
        ? `${firstError.path.join('.')}: ${firstError.message}`
        : 'Invalid request data';
      
      throw ApiErrors.VALIDATION_ERROR(errorMessage, result.error.errors);
    }
    
    return result.data;
  } catch (error: any) {
    if (error instanceof APIError) {
      throw error;
    }
    
    // JSON parsing error
    throw ApiErrors.VALIDATION_ERROR('Invalid JSON in request body');
  }
}

/**
 * Handle and standardize external API errors (OpenAI, Stripe, etc.)
 */
export function handleExternalApiError(error: any, service: string): never {
  if (error?.error?.type === 'rate_limit_exceeded') {
    throw ApiErrors.RATE_LIMIT(`${service} rate limit exceeded`);
  }
  
  if (error?.error?.type === 'invalid_request_error') {
    throw ApiErrors.VALIDATION_ERROR(`${service}: ${error.error.message}`);
  }
  
  if (error?.error?.type === 'authentication_error') {
    throw new APIError(`${service} authentication failed`, 'EXTERNAL_AUTH_ERROR', 502);
  }
  
  // Generic external API error
  const message = error?.message || error?.error?.message || `${service} API error`;
  throw ApiErrors.EXTERNAL_API_ERROR(service, message);
}