import { SubscriptionTier, SubscriptionStatus, User, ScriptStyle } from '@prisma/client';
import { prisma } from '@/lib/prisma';

export interface SubscriptionLimits {
  monthlyScripts: number;
  priorityProcessing: boolean;
  advancedStyles: boolean;
  watermarkFree: boolean;
  apiAccess: boolean;
  teamMembers: number;
  supportLevel: 'basic' | 'priority' | 'dedicated';
  // Enhanced features
  hookGeneration: boolean;
  titleAndThumbnailPack: boolean;
  ctaIntegration: boolean;
  relinkOutros: boolean;
  clickConfirmation: boolean;
  payoutStructure: boolean;
  // Premium remix features
  keyPointsIntegration: boolean;
  customInstructions: boolean;
  scriptRemixing: boolean;
  creativityControls: boolean;
  batchGeneration: boolean;
  abTesting: boolean;
  templateLibrary: boolean;
}

export interface UsageInfo {
  used: number;
  limit: number;
  remaining: number;
  resetDate: Date;
  canGenerate: boolean;
}

/**
 * Get subscription limits based on tier
 */
export function getSubscriptionLimits(tier: SubscriptionTier): SubscriptionLimits {
  const limitsMap: Record<SubscriptionTier, SubscriptionLimits> = {
    FREE: {
      monthlyScripts: 2,
      priorityProcessing: false,
      advancedStyles: false,
      watermarkFree: false,
      apiAccess: false,
      teamMembers: 1,
      supportLevel: 'basic',
      // Enhanced features - Basic only
      hookGeneration: false,
      titleAndThumbnailPack: false,
      ctaIntegration: false,
      relinkOutros: false,
      clickConfirmation: true, // Basic feature for all
      payoutStructure: false,
      // Premium remix features - FREE tier gets basic script generation only
      keyPointsIntegration: false,
      customInstructions: false,
      scriptRemixing: false,
      creativityControls: false,
      batchGeneration: false,
      abTesting: false,
      templateLibrary: false
    },
    PRO: {
      monthlyScripts: 50,
      priorityProcessing: true,
      advancedStyles: true,
      watermarkFree: true,
      apiAccess: true,
      teamMembers: 1,
      supportLevel: 'priority',
      // Enhanced features - Pro gets most
      hookGeneration: true,
      titleAndThumbnailPack: true,
      ctaIntegration: true,
      relinkOutros: true,
      clickConfirmation: true,
      payoutStructure: true,
      // Premium remix features - PRO tier gets core remix capabilities
      keyPointsIntegration: true,
      customInstructions: true,
      scriptRemixing: true,
      creativityControls: true,
      batchGeneration: false, // Reserved for BUSINESS+
      abTesting: false, // Reserved for BUSINESS+
      templateLibrary: false // Reserved for BUSINESS+
    },
    BUSINESS: {
      monthlyScripts: 200,
      priorityProcessing: true,
      advancedStyles: true,
      watermarkFree: true,
      apiAccess: true,
      teamMembers: 5,
      supportLevel: 'priority',
      // Enhanced features - All features
      hookGeneration: true,
      titleAndThumbnailPack: true,
      ctaIntegration: true,
      relinkOutros: true,
      clickConfirmation: true,
      payoutStructure: true,
      // Premium remix features - BUSINESS tier gets advanced features
      keyPointsIntegration: true,
      customInstructions: true,
      scriptRemixing: true,
      creativityControls: true,
      batchGeneration: true,
      abTesting: true,
      templateLibrary: false // Reserved for ENTERPRISE
    },
    ENTERPRISE: {
      monthlyScripts: -1, // Unlimited
      priorityProcessing: true,
      advancedStyles: true,
      watermarkFree: true,
      apiAccess: true,
      teamMembers: -1, // Unlimited
      supportLevel: 'dedicated',
      // Enhanced features - All features + future ones
      hookGeneration: true,
      titleAndThumbnailPack: true,
      ctaIntegration: true,
      relinkOutros: true,
      clickConfirmation: true,
      payoutStructure: true,
      // Premium remix features - ENTERPRISE tier gets all features
      keyPointsIntegration: true,
      customInstructions: true,
      scriptRemixing: true,
      creativityControls: true,
      batchGeneration: true,
      abTesting: true,
      templateLibrary: true
    }
  };

  return limitsMap[tier];
}

/**
 * Check if user can generate a script
 */
export async function checkUsageLimit(userId: string): Promise<UsageInfo> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      subscriptionTier: true,
      subscriptionStatus: true,
      monthlyScriptCount: true,
      lastUsageReset: true
    }
  });

  if (!user) {
    throw new Error('User not found');
  }

  // Check if subscription is active
  const isActive = user.subscriptionStatus === SubscriptionStatus.ACTIVE || 
                   user.subscriptionStatus === SubscriptionStatus.TRIALING;

  if (!isActive) {
    // Downgrade to FREE if subscription is inactive
    await prisma.user.update({
      where: { id: userId },
      data: { subscriptionTier: SubscriptionTier.FREE }
    });
  }

  const effectiveTier = isActive ? user.subscriptionTier : SubscriptionTier.FREE;
  const limits = getSubscriptionLimits(effectiveTier);

  // Check if we need to reset monthly usage
  const now = new Date();
  const lastReset = new Date(user.lastUsageReset);
  const shouldReset = now.getMonth() !== lastReset.getMonth() || 
                     now.getFullYear() !== lastReset.getFullYear();

  let currentUsage = user.monthlyScriptCount;
  
  if (shouldReset) {
    await prisma.user.update({
      where: { id: userId },
      data: {
        monthlyScriptCount: 0,
        lastUsageReset: now
      }
    });
    currentUsage = 0;
  }

  // Calculate next reset date (first day of next month)
  const nextReset = new Date(now.getFullYear(), now.getMonth() + 1, 1);

  const unlimited = limits.monthlyScripts === -1;
  const remaining = unlimited ? Infinity : Math.max(0, limits.monthlyScripts - currentUsage);
  const canGenerate = unlimited || remaining > 0;

  return {
    used: currentUsage,
    limit: unlimited ? -1 : limits.monthlyScripts,
    remaining: unlimited ? -1 : remaining,
    resetDate: nextReset,
    canGenerate
  };
}

/**
 * Record script generation usage
 */
export async function recordScriptUsage(
  userId: string, 
  metadata?: { scriptId?: string; style?: ScriptStyle; processingTimeMs?: number }
): Promise<void> {
  await prisma.$transaction([
    // Increment user's monthly count
    prisma.user.update({
      where: { id: userId },
      data: {
        monthlyScriptCount: { increment: 1 },
        totalScriptCount: { increment: 1 }
      }
    }),
    // Log the usage
    prisma.usageLog.create({
      data: {
        userId,
        action: 'script_generated',
        metadata: metadata ? JSON.stringify(metadata) : null
      }
    })
  ]);
}

/**
 * Check if user has access to advanced script styles
 */
export function hasAdvancedStyleAccess(tier: SubscriptionTier, style: ScriptStyle): boolean {
  const proOnlyStyles: ScriptStyle[] = [
    ScriptStyle.PERSUASIVE,
    ScriptStyle.NARRATIVE,
    ScriptStyle.ACADEMIC
  ];

  if (!proOnlyStyles.includes(style)) {
    return true; // Basic styles available to all
  }

  const limits = getSubscriptionLimits(tier);
  return limits.advancedStyles;
}

/**
 * Check if user should get priority processing
 */
export function hasPriorityProcessing(tier: SubscriptionTier): boolean {
  const limits = getSubscriptionLimits(tier);
  return limits.priorityProcessing;
}

/**
 * Check if script should have watermark
 */
export function shouldHaveWatermark(tier: SubscriptionTier): boolean {
  const limits = getSubscriptionLimits(tier);
  return !limits.watermarkFree;
}

/**
 * Get user's current subscription info
 */
export async function getUserSubscription(userId: string) {
  let user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      subscriptionTier: true,
      subscriptionStatus: true,
      subscriptionStart: true,
      subscriptionEnd: true,
      monthlyScriptCount: true,
      totalScriptCount: true,
      lastUsageReset: true
    }
  });

  // If user doesn't exist, create a default user record
  if (!user) {
    const newUser = await prisma.user.create({
      data: {
        id: userId,
        email: 'temp@example.com', // Will be updated by require-user
        subscriptionTier: SubscriptionTier.FREE,
        subscriptionStatus: SubscriptionStatus.ACTIVE,
        monthlyScriptCount: 0,
        totalScriptCount: 0,
        lastUsageReset: new Date()
      },
      select: {
        subscriptionTier: true,
        subscriptionStatus: true,
        subscriptionStart: true,
        subscriptionEnd: true,
        monthlyScriptCount: true,
        totalScriptCount: true,
        lastUsageReset: true
      }
    });
    user = newUser;
  }

  const limits = getSubscriptionLimits(user.subscriptionTier);
  const usage = await checkUsageLimit(userId);

  return {
    tier: user.subscriptionTier,
    status: user.subscriptionStatus,
    limits,
    usage,
    subscriptionStart: user.subscriptionStart,
    subscriptionEnd: user.subscriptionEnd,
    totalScripts: user.totalScriptCount
  };
}

/**
 * Upgrade user subscription
 */
export async function upgradeSubscription(
  userId: string,
  newTier: SubscriptionTier,
  stripeCustomerId?: string,
  stripeSubscriptionId?: string
) {
  const now = new Date();
  const subscriptionEnd = newTier === SubscriptionTier.FREE ? null : 
    new Date(now.getFullYear(), now.getMonth() + 1, now.getDate()); // 1 month from now

  await prisma.user.update({
    where: { id: userId },
    data: {
      subscriptionTier: newTier,
      subscriptionStatus: SubscriptionStatus.ACTIVE,
      subscriptionStart: now,
      subscriptionEnd,
      stripeCustomerId,
      stripeSubscriptionId
    }
  });

  // Log the upgrade
  await prisma.usageLog.create({
    data: {
      userId,
      action: 'subscription_upgraded',
      metadata: JSON.stringify({ 
        newTier, 
        stripeCustomerId, 
        stripeSubscriptionId 
      })
    }
  });
}

/**
 * Cancel user subscription (downgrade to FREE at end of billing period)
 */
export async function cancelSubscription(userId: string) {
  await prisma.user.update({
    where: { id: userId },
    data: {
      subscriptionStatus: SubscriptionStatus.CANCELED
    }
  });

  // Log the cancellation
  await prisma.usageLog.create({
    data: {
      userId,
      action: 'subscription_canceled',
      metadata: null
    }
  });
}

/**
 * Get available script styles for user's tier
 */
export function getAvailableStyles(tier: SubscriptionTier): ScriptStyle[] {
  const basicStyles: ScriptStyle[] = [
    ScriptStyle.PROFESSIONAL,
    ScriptStyle.CASUAL,
    ScriptStyle.EDUCATIONAL,
    ScriptStyle.ENTERTAINING,
    ScriptStyle.TECHNICAL,
    ScriptStyle.STORYTELLING
  ];

  const proOnlyStyles: ScriptStyle[] = [
    ScriptStyle.PERSUASIVE,
    ScriptStyle.NARRATIVE,
    ScriptStyle.ACADEMIC
  ];

  const limits = getSubscriptionLimits(tier);
  return limits.advancedStyles ? [...basicStyles, ...proOnlyStyles] : basicStyles;
}

/**
 * Check if user has access to key points integration
 */
export function hasKeyPointsAccess(tier: SubscriptionTier): boolean {
  const limits = getSubscriptionLimits(tier);
  return limits.keyPointsIntegration;
}

/**
 * Check if user has access to custom instructions
 */
export function hasCustomInstructionsAccess(tier: SubscriptionTier): boolean {
  const limits = getSubscriptionLimits(tier);
  return limits.customInstructions;
}

/**
 * Check if user has access to script remixing
 */
export function hasScriptRemixingAccess(tier: SubscriptionTier): boolean {
  const limits = getSubscriptionLimits(tier);
  return limits.scriptRemixing;
}

/**
 * Check if user has access to creativity controls
 */
export function hasCreativityControlsAccess(tier: SubscriptionTier): boolean {
  const limits = getSubscriptionLimits(tier);
  return limits.creativityControls;
}

/**
 * Check if user has access to batch generation
 */
export function hasBatchGenerationAccess(tier: SubscriptionTier): boolean {
  const limits = getSubscriptionLimits(tier);
  return limits.batchGeneration;
}

/**
 * Check if user has access to A/B testing
 */
export function hasABTestingAccess(tier: SubscriptionTier): boolean {
  const limits = getSubscriptionLimits(tier);
  return limits.abTesting;
}

/**
 * Check if user has access to template library
 */
export function hasTemplateLibraryAccess(tier: SubscriptionTier): boolean {
  const limits = getSubscriptionLimits(tier);
  return limits.templateLibrary;
}

/**
 * Check if user is a master admin (based on email or user ID)
 */
export function isMasterAdmin(userEmail: string, userId: string): boolean {
  // Get admin emails from environment variables
  const adminEmailsEnv = process.env.ADMIN_EMAILS || '';
  const adminEmails = adminEmailsEnv.split(',').map(email => email.trim()).filter(Boolean);
  
  // Get admin user IDs from environment variables
  const adminUserIdsEnv = process.env.ADMIN_USER_IDS || '';
  const adminUserIds = adminUserIdsEnv.split(',').map(id => id.trim()).filter(Boolean);
  
  return adminEmails.includes(userEmail.toLowerCase()) || adminUserIds.includes(userId);
}

/**
 * Get effective subscription tier for user (accounting for master admin status)
 */
export function getEffectiveSubscriptionTier(
  actualTier: SubscriptionTier, 
  userEmail: string, 
  userId: string,
  testMode?: string,
  adminKey?: string
): SubscriptionTier {
  // Check URL-based admin test mode first
  if (testMode === 'premium' && adminKey === 'test123') {
    return 'PRO';
  }
  
  // Check if user is master admin
  if (isMasterAdmin(userEmail, userId)) {
    return 'ENTERPRISE'; // Give master admins the highest tier
  }
  
  return actualTier;
}