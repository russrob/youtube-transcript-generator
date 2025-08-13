import { NextRequest, NextResponse } from 'next/server';

// CORS configuration
interface CorsOptions {
  origin?: string | string[] | boolean;
  methods?: string[];
  allowedHeaders?: string[];
  credentials?: boolean;
  maxAge?: number;
}

// Default CORS configuration
const defaultCorsOptions: CorsOptions = {
  origin: process.env.NODE_ENV === 'production' 
    ? [
        process.env.NEXT_PUBLIC_BASE_URL || 'https://yourdomain.com',
        'https://yourdomain.com',
        'https://www.yourdomain.com'
      ]
    : ['http://localhost:3000', 'http://127.0.0.1:3000'],
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: [
    'Content-Type',
    'Authorization',
    'X-Requested-With',
    'Accept',
    'Origin',
    'Access-Control-Request-Method',
    'Access-Control-Request-Headers',
    'stripe-signature'
  ],
  credentials: true,
  maxAge: 86400 // 24 hours
};

// Specific CORS configurations for different routes
export const corsConfigs = {
  // Public API endpoints (more permissive)
  public: {
    ...defaultCorsOptions,
    credentials: false
  },
  
  // Authenticated API endpoints (restrictive)
  authenticated: defaultCorsOptions,
  
  // Webhook endpoints (very restrictive)
  webhook: {
    origin: [
      'https://hooks.stripe.com',
      'https://api.stripe.com'
    ],
    methods: ['POST'],
    allowedHeaders: ['content-type', 'stripe-signature'],
    credentials: false,
    maxAge: 0
  },
  
  // Admin endpoints (most restrictive)
  admin: {
    origin: process.env.NODE_ENV === 'production' 
      ? [process.env.NEXT_PUBLIC_BASE_URL || 'https://yourdomain.com']
      : ['http://localhost:3000'],
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true,
    maxAge: 3600 // 1 hour
  }
};

/**
 * CORS middleware function
 */
export function cors(options: CorsOptions = defaultCorsOptions) {
  return (request: NextRequest): NextResponse | null => {
    // Handle preflight requests
    if (request.method === 'OPTIONS') {
      return handlePreflightRequest(request, options);
    }
    
    // For non-preflight requests, return null to continue
    // Headers will be added by the response handler
    return null;
  };
}

/**
 * Handle CORS preflight requests
 */
function handlePreflightRequest(request: NextRequest, options: CorsOptions): NextResponse {
  const response = new NextResponse(null, { status: 200 });
  
  // Set CORS headers for preflight
  setCorsHeaders(response, request, options);
  
  return response;
}

/**
 * Set CORS headers on response
 */
export function setCorsHeaders(
  response: NextResponse, 
  request: NextRequest, 
  options: CorsOptions = defaultCorsOptions
): void {
  const origin = request.headers.get('origin');
  
  // Handle origin
  if (options.origin === true) {
    response.headers.set('Access-Control-Allow-Origin', '*');
  } else if (typeof options.origin === 'string') {
    response.headers.set('Access-Control-Allow-Origin', options.origin);
  } else if (Array.isArray(options.origin) && origin) {
    if (options.origin.includes(origin)) {
      response.headers.set('Access-Control-Allow-Origin', origin);
      response.headers.set('Vary', 'Origin');
    }
  }
  
  // Handle methods
  if (options.methods) {
    response.headers.set('Access-Control-Allow-Methods', options.methods.join(', '));
  }
  
  // Handle headers
  if (options.allowedHeaders) {
    response.headers.set('Access-Control-Allow-Headers', options.allowedHeaders.join(', '));
  }
  
  // Handle credentials
  if (options.credentials) {
    response.headers.set('Access-Control-Allow-Credentials', 'true');
  }
  
  // Handle max age
  if (options.maxAge !== undefined) {
    response.headers.set('Access-Control-Max-Age', options.maxAge.toString());
  }
}

/**
 * CORS wrapper for API route handlers
 */
export function withCors(
  handler: (request: NextRequest, context?: any) => Promise<NextResponse>,
  corsType: keyof typeof corsConfigs = 'authenticated'
) {
  return async (request: NextRequest, context?: any): Promise<NextResponse> => {
    const corsOptions = corsConfigs[corsType];
    
    // Handle preflight requests
    if (request.method === 'OPTIONS') {
      return handlePreflightRequest(request, corsOptions);
    }
    
    // Execute the original handler
    const response = await handler(request, context);
    
    // Add CORS headers to the response
    setCorsHeaders(response, request, corsOptions);
    
    return response;
  };
}

/**
 * Validate origin against allowed origins
 */
export function isOriginAllowed(origin: string, allowedOrigins: string | string[] | boolean): boolean {
  if (allowedOrigins === true) return true;
  if (typeof allowedOrigins === 'string') return origin === allowedOrigins;
  if (Array.isArray(allowedOrigins)) return allowedOrigins.includes(origin);
  return false;
}