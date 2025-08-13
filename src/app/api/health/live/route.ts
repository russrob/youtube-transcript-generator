import { NextResponse } from 'next/server';

/**
 * Liveness probe endpoint - simple check to verify the service is running
 * This should be used by load balancers, Kubernetes, etc. for basic uptime checks
 */
export async function GET() {
  return NextResponse.json(
    {
      status: 'alive',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      pid: process.pid,
      nodeVersion: process.version,
    },
    {
      status: 200,
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate',
      }
    }
  );
}