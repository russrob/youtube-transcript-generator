import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { currentUser } from '@clerk/nextjs/server';
import { prisma } from '@/lib/prisma';
import { generateRemixVariations } from '@/lib/ai/script-generator';
import { 
  checkUsageLimitMiddleware, 
  recordUsageMiddleware 
} from '@/lib/middleware/usage-middleware';
import { 
  getUserSubscription,
  hasScriptRemixingAccess,
  getEffectiveSubscriptionTier
} from '@/lib/subscription/subscription-service';

// Remix variations request validation schema
const remixVariationsSchema = z.object({
  scriptId: z.string().min(1, 'Script ID is required'),
  targetAudience: z.string().min(1, 'Target audience is required'),
  selectedHook: z.string().optional(),
  customInstructions: z.string().optional()
});

export async function POST(request: NextRequest) {
  const startTime = Date.now();
  
  try {
    // Check authentication
    const user = await currentUser();
    if (!user?.id) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    // Check usage limits first
    const usageCheck = await checkUsageLimitMiddleware();
    if (!usageCheck.allowed) {
      return NextResponse.json(
        { 
          error: usageCheck.error,
          usage: usageCheck.usage
        },
        { status: 429 } // Too Many Requests
      );
    }

    const body = await request.json();
    
    // Validate request body
    const validationResult = remixVariationsSchema.safeParse(body);
    if (!validationResult.success) {
      return NextResponse.json(
        { 
          error: 'Invalid request data',
          details: validationResult.error.format()
        },
        { status: 400 }
      );
    }

    const { 
      scriptId,
      targetAudience,
      selectedHook,
      customInstructions
    } = validationResult.data;

    // Get user's subscription info
    const subscription = await getUserSubscription(user.id);
    const userEmail = user.emailAddresses[0]?.emailAddress || '';

    // Check for admin test mode and master admin status
    const { searchParams } = new URL(request.url);
    const testMode = searchParams.get('test');
    const adminKey = searchParams.get('admin');
    
    // Get effective tier (handles URL test mode and master admin status)
    const effectiveTier = getEffectiveSubscriptionTier(
      subscription.tier,
      userEmail,
      user.id,
      testMode || undefined,
      adminKey || undefined
    );

    // Check if user has access to script remixing
    if (!hasScriptRemixingAccess(effectiveTier)) {
      return NextResponse.json(
        { 
          error: 'Script remixing requires a Pro subscription',
          feature: 'scriptRemixing',
          requiredTier: 'PRO'
        },
        { status: 403 }
      );
    }

    // Fetch the script with its video
    const script = await prisma.script.findUnique({
      where: { id: scriptId },
      include: {
        video: {
          select: {
            id: true,
            title: true,
            youtubeId: true,
            userId: true
          }
        }
      }
    });

    if (!script) {
      return NextResponse.json(
        { error: 'Script not found' },
        { status: 404 }
      );
    }

    // Verify ownership
    if (script.video.userId !== user.id) {
      return NextResponse.json(
        { error: 'You can only remix your own scripts' },
        { status: 403 }
      );
    }

    if (script.status !== 'COMPLETED') {
      return NextResponse.json(
        { error: 'Can only remix completed scripts' },
        { status: 400 }
      );
    }

    // Convert script to GeneratedScript format
    const originalScript = {
      title: script.title,
      content: script.content,
      estimatedDuration: script.durationMin,
      wordCount: script.content.split(' ').length,
      sections: [] // We don't need sections for remix variations
    };

    // Generate remix variations
    const variationsResult = await generateRemixVariations(
      originalScript,
      script.video.title,
      targetAudience,
      selectedHook,
      customInstructions
    );

    if (!variationsResult.success) {
      return NextResponse.json(
        {
          error: 'Failed to generate remix variations',
          code: variationsResult.error.code,
          message: variationsResult.error.message
        },
        { status: 500 }
      );
    }

    // Record usage
    await recordUsageMiddleware(user.id, {
      scriptId: script.id,
      processingTimeMs: Date.now() - startTime,
      isRemixVariations: true
    });

    return NextResponse.json({
      success: true,
      data: {
        scriptId: script.id,
        originalTitle: script.title,
        videoTitle: script.video.title,
        variations: variationsResult.variations,
        aiMetrics: {
          generationTimeMs: Date.now() - startTime,
          variationsCount: {
            hooks: variationsResult.variations.hookVariations.length,
            titles: variationsResult.variations.titleVariations.length,
            payoffs: variationsResult.variations.payoffScenarios.length
          }
        },
        subscription: {
          tier: subscription.tier,
          hasAccess: true
        }
      }
    });

  } catch (error: any) {
    console.error('Remix variations generation error:', error);

    return NextResponse.json(
      {
        error: 'Internal server error',
        message: error.message
      },
      { status: 500 }
    );
  }
}