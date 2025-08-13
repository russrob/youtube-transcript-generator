import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { logger } from '@/lib/monitoring/logger';

interface HealthCheck {
  service: string;
  status: 'healthy' | 'degraded' | 'unhealthy';
  responseTime?: number;
  error?: string;
  metadata?: Record<string, any>;
}

interface HealthResponse {
  status: 'healthy' | 'degraded' | 'unhealthy';
  timestamp: string;
  version: string;
  environment: string;
  checks: HealthCheck[];
  summary: {
    total: number;
    healthy: number;
    degraded: number;
    unhealthy: number;
  };
}

async function checkDatabase(): Promise<HealthCheck> {
  const startTime = Date.now();
  
  try {
    // Simple database connectivity check
    await prisma.$queryRaw`SELECT 1`;
    
    const responseTime = Date.now() - startTime;
    
    return {
      service: 'database',
      status: responseTime < 1000 ? 'healthy' : 'degraded',
      responseTime,
      metadata: {
        provider: 'postgresql', // or sqlite in development
        responseTimeThreshold: 1000,
      }
    };
  } catch (error: any) {
    return {
      service: 'database',
      status: 'unhealthy',
      responseTime: Date.now() - startTime,
      error: error.message,
    };
  }
}

async function checkOpenAI(): Promise<HealthCheck> {
  const startTime = Date.now();
  
  try {
    if (!process.env.OPENAI_API_KEY) {
      return {
        service: 'openai',
        status: 'unhealthy',
        error: 'API key not configured',
      };
    }

    // Simple API connectivity check (without actually calling the expensive API)
    const response = await fetch('https://api.openai.com/v1/models', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
      },
      signal: AbortSignal.timeout(5000), // 5 second timeout
    });

    const responseTime = Date.now() - startTime;

    if (response.ok) {
      return {
        service: 'openai',
        status: responseTime < 2000 ? 'healthy' : 'degraded',
        responseTime,
        metadata: {
          responseTimeThreshold: 2000,
        }
      };
    } else {
      return {
        service: 'openai',
        status: response.status === 401 ? 'unhealthy' : 'degraded',
        responseTime,
        error: `HTTP ${response.status}`,
      };
    }
  } catch (error: any) {
    return {
      service: 'openai',
      status: 'unhealthy',
      responseTime: Date.now() - startTime,
      error: error.message,
    };
  }
}

async function checkStripe(): Promise<HealthCheck> {
  const startTime = Date.now();
  
  try {
    if (!process.env.STRIPE_SECRET_KEY) {
      return {
        service: 'stripe',
        status: 'degraded',
        error: 'API key not configured',
        metadata: {
          note: 'Stripe is optional for basic functionality'
        }
      };
    }

    // Simple Stripe API check
    const response = await fetch('https://api.stripe.com/v1/account', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${process.env.STRIPE_SECRET_KEY}`,
      },
      signal: AbortSignal.timeout(5000),
    });

    const responseTime = Date.now() - startTime;

    if (response.ok) {
      return {
        service: 'stripe',
        status: responseTime < 2000 ? 'healthy' : 'degraded',
        responseTime,
        metadata: {
          responseTimeThreshold: 2000,
        }
      };
    } else {
      return {
        service: 'stripe',
        status: 'degraded', // Stripe issues shouldn't fail the whole app
        responseTime,
        error: `HTTP ${response.status}`,
      };
    }
  } catch (error: any) {
    return {
      service: 'stripe',
      status: 'degraded', // Stripe issues shouldn't fail the whole app
      responseTime: Date.now() - startTime,
      error: error.message,
    };
  }
}

async function checkMemory(): Promise<HealthCheck> {
  try {
    const usage = process.memoryUsage();
    const totalMB = Math.round(usage.heapTotal / 1024 / 1024);
    const usedMB = Math.round(usage.heapUsed / 1024 / 1024);
    const usagePercentage = Math.round((usage.heapUsed / usage.heapTotal) * 100);
    
    let status: 'healthy' | 'degraded' | 'unhealthy';
    if (usagePercentage < 70) {
      status = 'healthy';
    } else if (usagePercentage < 90) {
      status = 'degraded';
    } else {
      status = 'unhealthy';
    }

    return {
      service: 'memory',
      status,
      metadata: {
        totalMB,
        usedMB,
        usagePercentage,
        thresholds: {
          degraded: 70,
          unhealthy: 90,
        }
      }
    };
  } catch (error: any) {
    return {
      service: 'memory',
      status: 'unhealthy',
      error: error.message,
    };
  }
}

async function performHealthChecks(): Promise<HealthCheck[]> {
  const checks = await Promise.allSettled([
    checkDatabase(),
    checkOpenAI(),
    checkStripe(),
    checkMemory(),
  ]);

  return checks.map((result) => {
    if (result.status === 'fulfilled') {
      return result.value;
    } else {
      return {
        service: 'unknown',
        status: 'unhealthy' as const,
        error: result.reason?.message || 'Health check failed',
      };
    }
  });
}

export async function GET(request: NextRequest) {
  const startTime = Date.now();
  
  try {
    logger.info('Health check requested', {
      operation: 'health_check',
      metadata: {
        userAgent: request.headers.get('user-agent'),
        ip: request.headers.get('x-forwarded-for') || 'unknown',
      }
    });

    const checks = await performHealthChecks();
    
    // Calculate summary
    const summary = {
      total: checks.length,
      healthy: checks.filter(c => c.status === 'healthy').length,
      degraded: checks.filter(c => c.status === 'degraded').length,
      unhealthy: checks.filter(c => c.status === 'unhealthy').length,
    };

    // Determine overall status
    let overallStatus: 'healthy' | 'degraded' | 'unhealthy';
    if (summary.unhealthy > 0) {
      // Check if critical services are unhealthy
      const criticalServices = ['database'];
      const criticalUnhealthy = checks.filter(c => 
        criticalServices.includes(c.service) && c.status === 'unhealthy'
      );
      overallStatus = criticalUnhealthy.length > 0 ? 'unhealthy' : 'degraded';
    } else if (summary.degraded > 0) {
      overallStatus = 'degraded';
    } else {
      overallStatus = 'healthy';
    }

    const response: HealthResponse = {
      status: overallStatus,
      timestamp: new Date().toISOString(),
      version: process.env.NEXT_PUBLIC_APP_VERSION || 'unknown',
      environment: process.env.NODE_ENV || 'unknown',
      checks,
      summary,
    };

    const totalTime = Date.now() - startTime;
    
    logger.info('Health check completed', {
      operation: 'health_check',
      metadata: {
        status: overallStatus,
        duration: totalTime,
        summary,
      }
    });

    // Return appropriate HTTP status based on health
    const httpStatus = overallStatus === 'healthy' ? 200 : 
                      overallStatus === 'degraded' ? 200 : 503;

    return NextResponse.json(response, { 
      status: httpStatus,
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'X-Health-Check-Duration': totalTime.toString(),
      }
    });

  } catch (error: any) {
    logger.error('Health check failed', {
      operation: 'health_check',
      metadata: {
        error: error.message,
        duration: Date.now() - startTime,
      }
    });

    return NextResponse.json(
      {
        status: 'unhealthy',
        timestamp: new Date().toISOString(),
        error: error.message,
        checks: [],
        summary: { total: 0, healthy: 0, degraded: 0, unhealthy: 1 }
      },
      { status: 503 }
    );
  }
}