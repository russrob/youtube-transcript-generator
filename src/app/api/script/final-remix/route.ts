import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { ScriptStatus } from '@prisma/client';
import { currentUser } from '@clerk/nextjs/server';
import { prisma } from '@/lib/prisma';
import { generateFinalRemixScript } from '@/lib/ai/script-generator';
import { 
  checkUsageLimitMiddleware, 
  recordUsageMiddleware 
} from '@/lib/middleware/usage-middleware';
import { 
  getUserSubscription,
  hasScriptRemixingAccess,
  getEffectiveSubscriptionTier
} from '@/lib/subscription/subscription-service';

// Final remix request validation schema
const finalRemixSchema = z.object({
  scriptId: z.string().min(1, 'Script ID is required'),
  selections: z.object({
    hook: z.object({
      id: z.string(),
      type: z.enum(['question', 'context', 'bold_statement', 'curiosity_gap']),
      content: z.string(),
      reasoning: z.string()
    }),
    title: z.object({
      title: z.string(),
      reasoning: z.string(),
      clickability_score: z.number()
    }),
    payoff: z.object({
      id: z.string(),
      type: z.enum(['unexpected_reveal', 'action_plan', 'transformation_story', 'cliffhanger', 'call_to_action']),
      title: z.string(),
      description: z.string(),
      content: z.string(),
      reasoning: z.string()
    }),
    targetAudience: z.string().min(1, 'Target audience is required'),
    customInstructions: z.string().optional()
  })
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
    const validationResult = finalRemixSchema.safeParse(body);
    if (!validationResult.success) {
      return NextResponse.json(
        { 
          error: 'Invalid request data',
          details: validationResult.error.format()
        },
        { status: 400 }
      );
    }

    const { scriptId, selections } = validationResult.data;

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

    // Fetch the original script with its video
    const originalScript = await prisma.script.findUnique({
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

    if (!originalScript) {
      return NextResponse.json(
        { error: 'Original script not found' },
        { status: 404 }
      );
    }

    // Verify ownership
    if (originalScript.video.userId !== user.id) {
      return NextResponse.json(
        { error: 'You can only remix your own scripts' },
        { status: 403 }
      );
    }

    if (originalScript.status !== 'COMPLETED') {
      return NextResponse.json(
        { error: 'Can only remix completed scripts' },
        { status: 400 }
      );
    }

    // Create new script record with GENERATING status
    const newScript = await prisma.script.create({
      data: {
        title: selections.title.title,
        content: '',
        style: originalScript.style,
        durationMin: originalScript.durationMin,
        status: ScriptStatus.GENERATING,
        videoId: originalScript.video.id,
        hasWatermark: false // PRO users get watermark-free
      }
    });

    // Convert original script to GeneratedScript format
    const generatedScript = {
      title: originalScript.title,
      content: originalScript.content,
      estimatedDuration: originalScript.durationMin,
      wordCount: originalScript.content.split(' ').length,
      sections: [] // We don't need sections for final remix
    };

    // Generate final remix script with selected variations
    const finalRemixResult = await generateFinalRemixScript(
      generatedScript,
      selections
    );

    if (!finalRemixResult.success) {
      // Update script with error status
      await prisma.script.update({
        where: { id: newScript.id },
        data: {
          status: ScriptStatus.ERROR,
          content: `Generation failed: ${finalRemixResult.error.message}`
        }
      });

      return NextResponse.json(
        {
          error: 'Failed to generate final remix script',
          code: finalRemixResult.error.code,
          message: finalRemixResult.error.message
        },
        { status: 500 }
      );
    }

    // Update script with generated content
    const updatedScript = await prisma.script.update({
      where: { id: newScript.id },
      data: {
        title: finalRemixResult.script.title,
        content: finalRemixResult.script.content,
        status: ScriptStatus.COMPLETED,
        processingTimeMs: Date.now() - startTime
      }
    });

    // Record usage
    await recordUsageMiddleware({
      scriptId: updatedScript.id,
      processingTimeMs: Date.now() - startTime
    });

    return NextResponse.json({
      success: true,
      data: {
        ...updatedScript,
        isFinalRemix: true,
        originalScriptId: scriptId,
        remixConfig: {
          selectedHook: selections.hook,
          selectedTitle: selections.title,
          selectedPayoff: selections.payoff,
          targetAudience: selections.targetAudience,
          customInstructions: selections.customInstructions
        },
        aiMetrics: {
          wordCount: finalRemixResult.script.wordCount,
          estimatedDuration: finalRemixResult.script.estimatedDuration,
          sections: finalRemixResult.script.sections.length,
          generationTimeMs: Date.now() - startTime
        },
        subscription: {
          tier: subscription.tier,
          hasAccess: true
        }
      }
    });

  } catch (error: any) {
    console.error('Final remix generation error:', error);

    return NextResponse.json(
      {
        error: 'Internal server error',
        message: error.message
      },
      { status: 500 }
    );
  }
}