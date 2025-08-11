import { NextRequest, NextResponse } from 'next/server';
import { currentUser } from '@clerk/nextjs/server';
import { prisma } from '@/lib/prisma';
import { SubscriptionTier, SubscriptionStatus } from '@prisma/client';

export async function POST(request: NextRequest) {
  try {
    // Check authentication
    const user = await currentUser();
    if (!user?.id) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { tier = 'PRO' } = body;

    // Upgrade user to specified tier for testing
    const updatedUser = await prisma.user.upsert({
      where: { id: user.id },
      create: {
        id: user.id,
        email: user.emailAddresses[0]?.emailAddress || 'test@example.com',
        subscriptionTier: tier as SubscriptionTier,
        subscriptionStatus: SubscriptionStatus.ACTIVE,
        subscriptionStart: new Date(),
        subscriptionEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
        monthlyScriptCount: 0,
        totalScriptCount: 0,
        lastUsageReset: new Date()
      },
      update: {
        subscriptionTier: tier as SubscriptionTier,
        subscriptionStatus: SubscriptionStatus.ACTIVE,
        subscriptionStart: new Date(),
        subscriptionEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
      }
    });

    return NextResponse.json({
      success: true,
      message: `Account upgraded to ${tier} for testing`,
      user: {
        id: updatedUser.id,
        email: updatedUser.email,
        tier: updatedUser.subscriptionTier,
        status: updatedUser.subscriptionStatus
      }
    });

  } catch (error: any) {
    console.error('Test upgrade error:', error);
    return NextResponse.json(
      { 
        error: 'Internal server error',
        message: error.message
      },
      { status: 500 }
    );
  }
}