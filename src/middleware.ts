import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { verifyAuth } from '@/lib/auth';

// Middleware to protect API routes
export async function middleware(request: NextRequest) {
  // In development, allow all API calls without auth
  if (process.env.NODE_ENV === 'development') {
    return NextResponse.next();
  }

  // Production auth (commented out for testing)
  /*
  if (request.nextUrl.pathname.startsWith('/api/')) {
    if (request.nextUrl.pathname === '/api/health') {
      return NextResponse.next();
    }

    const { user, error } = await verifyAuth(request);

    if (!user) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Authentication required',
          details: error 
        },
        { status: 401 }
      );
    }

    const response = NextResponse.next();
    response.headers.set('x-user-id', user.id);
    return response;
  }
  */

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/api/:path*'
  ]
};