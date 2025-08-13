import { NextResponse } from 'next/server'

export async function GET() {
  const response = NextResponse.json({
    message: 'Test endpoint to verify deployment',
    timestamp: new Date().toISOString(),
    nodeEnv: process.env.NODE_ENV,
    deploymentId: Math.random().toString(36).substring(7)
  })
  
  // Add a custom header to verify this deployment is working
  response.headers.set('X-Custom-Test-Header', 'deployment-test-' + Date.now())
  
  return response
}