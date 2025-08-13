import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

/**
 * Readiness probe endpoint - checks if the service is ready to accept traffic
 * This includes checking critical dependencies like the database
 */
export async function GET() {
  try {
    // Check database connectivity (critical for the app to function)
    await prisma.$queryRaw`SELECT 1`;
    
    // Check essential environment variables
    const requiredEnvVars = [
      'DATABASE_URL',
      'NEXTAUTH_SECRET',
      'CLERK_SECRET_KEY',
    ];
    
    const missingEnvVars = requiredEnvVars.filter(varName => !process.env[varName]);
    
    if (missingEnvVars.length > 0) {
      return NextResponse.json(
        {
          status: 'not_ready',
          reason: 'Missing required environment variables',
          missingEnvVars,
          timestamp: new Date().toISOString(),
        },
        { status: 503 }
      );
    }

    return NextResponse.json(
      {
        status: 'ready',
        timestamp: new Date().toISOString(),
        environment: process.env.NODE_ENV,
        database: 'connected',
      },
      {
        status: 200,
        headers: {
          'Cache-Control': 'no-cache, no-store, must-revalidate',
        }
      }
    );

  } catch (error: any) {
    return NextResponse.json(
      {
        status: 'not_ready',
        reason: 'Database connection failed',
        error: error.message,
        timestamp: new Date().toISOString(),
      },
      { status: 503 }
    );
  }
}