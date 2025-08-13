import { NextResponse } from 'next/server'

export async function GET() {
  return NextResponse.json({
    publishableKey: process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY?.substring(0, 20) + '...',
    secretKey: process.env.CLERK_SECRET_KEY?.substring(0, 20) + '...',
    nodeEnv: process.env.NODE_ENV,
    vercelEnv: process.env.VERCEL_ENV,
    isLiveKey: process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY?.startsWith('pk_live_'),
    timestamp: new Date().toISOString()
  })
}