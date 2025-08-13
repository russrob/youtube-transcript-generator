import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { ScriptStyle, ScriptStatus } from '@prisma/client';
import { currentUser } from '@clerk/nextjs/server';
import { prisma } from '@/lib/prisma';
import { generateScript, ScriptGenerationOptions } from '@/lib/ai/script-generator';
import { formatTranscript } from '@/lib/youtube/fetch-transcript';
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
  selectedHook: z.object({
    id: z.string(),
    type: z.enum(['question', 'context', 'bold_statement', 'curiosity_gap']),
    content: z.string(),
    reasoning: z.string()
  }),
  selectedTitle: z.object({
    title: z.string(),
    reasoning: z.string(),
    clickability_score: z.number()
  }),
  selectedPayoff: z.object({
    id: z.string(),
    type: z.enum(['unexpected_reveal', 'action_plan', 'transformation_story', 'cliffhanger', 'call_to_action']),
    title: z.string(),
    description: z.string(),
    content: z.string(),
    reasoning: z.string()
  }),
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

    const { 
      scriptId,
      selectedHook,
      selectedTitle,
      selectedPayoff,
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

    // Fetch the original script with its video and transcript
    const originalScript = await prisma.script.findUnique({
      where: { id: scriptId },
      include: {
        video: {
          include: {
            transcript: true
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

    if (!originalScript.video.transcript) {
      return NextResponse.json(
        { error: 'No transcript available for remix generation' },
        { status: 400 }
      );
    }

    // Build custom instructions for the remix
    let remixInstructions = `REMIX GENERATION with Selected Variations:\n\n`;
    
    remixInstructions += `**SELECTED HOOK (Use as opening):**\n`;
    remixInstructions += `Type: ${selectedHook.type}\n`;
    remixInstructions += `Content: "${selectedHook.content}"\n`;
    remixInstructions += `Reasoning: ${selectedHook.reasoning}\n\n`;
    
    remixInstructions += `**SELECTED TITLE (Use as script title):**\n`;
    remixInstructions += `Title: "${selectedTitle.title}"\n`;
    remixInstructions += `Reasoning: ${selectedTitle.reasoning}\n`;
    remixInstructions += `Clickability Score: ${selectedTitle.clickability_score}/10\n\n`;
    
    remixInstructions += `**SELECTED PAYOFF SCENARIO (Use as conclusion):**\n`;
    remixInstructions += `Type: ${selectedPayoff.type}\n`;
    remixInstructions += `Title: ${selectedPayoff.title}\n`;
    remixInstructions += `Description: ${selectedPayoff.description}\n`;
    remixInstructions += `Content: "${selectedPayoff.content}"\n`;
    remixInstructions += `Reasoning: ${selectedPayoff.reasoning}\n\n`;
    
    remixInstructions += `**REMIX REQUIREMENTS:**\n`;
    remixInstructions += `1. Start the script with the selected hook exactly as provided\n`;
    remixInstructions += `2. Use the selected title as the script title\n`;
    remixInstructions += `3. End the script with the selected payoff scenario content\n`;
    remixInstructions += `4. Create smooth transitions between these selected elements\n`;
    remixInstructions += `5. Maintain high retention and engagement throughout\n`;
    remixInstructions += `6. Ensure the middle content flows naturally from hook to payoff\n`;
    remixInstructions += `7. Keep the overall structure coherent and professional\n\n`;

    if (customInstructions?.trim()) {
      remixInstructions += `**ADDITIONAL CUSTOM INSTRUCTIONS:**\n${customInstructions}\n\n`;
    }

    // Prepare remix generation options
    const remixOptions: ScriptGenerationOptions = {
      style: originalScript.style as ScriptStyle,
      durationMin: originalScript.durationMin,
      audience: originalScript.audience || 'general',
      tone: 'casual', // Default tone for remixes
      includeIntro: true,
      includeConclusion: true,
      keyPoints: [],
      customInstructions: remixInstructions
    };

    // Create initial script record with GENERATING status
    const newScript = await prisma.script.create({
      data: {
        title: selectedTitle.title,
        content: '',
        style: originalScript.style,
        durationMin: originalScript.durationMin,
        audience: originalScript.audience || 'general',
        status: ScriptStatus.GENERATING,
        videoId: originalScript.video.id,
        hasWatermark: false, // PRO users get watermark-free
        // Store remix metadata
        options: JSON.stringify({
          isRemix: true,
          originalScriptId: scriptId,
          selectedVariations: {
            hook: selectedHook,
            title: selectedTitle,
            payoff: selectedPayoff
          }
        })
      }
    });

    try {
      // Generate the final remix script
      const transcriptSegments = JSON.parse(originalScript.video.transcript.content);
      const formattedTranscript = formatTranscript(transcriptSegments, false);
      
      const generationResult = await generateScript(
        formattedTranscript,
        originalScript.video.title,
        remixOptions
      );

      if (!generationResult.success) {
        // Update script with error status
        await prisma.script.update({
          where: { id: newScript.id },
          data: {
            status: ScriptStatus.ERROR,
            content: `Generation failed: ${generationResult.error.message}`
          }
        });

        return NextResponse.json(
          {
            error: 'Failed to generate final remix',
            code: generationResult.error.code,
            message: generationResult.error.message,
            scriptId: newScript.id
          },
          { status: 500 }
        );
      }

      // Calculate processing time
      const processingTimeMs = Date.now() - startTime;

      // Update script with generated content
      const completedScript = await prisma.script.update({
        where: { id: newScript.id },
        data: {
          title: generationResult.script.title,
          content: generationResult.script.content,
          status: ScriptStatus.COMPLETED,
          processingTimeMs
        },
        include: {
          video: {
            select: {
              id: true,
              youtubeId: true,
              title: true,
              thumbnailUrl: true
            }
          }
        }
      });

      // Record usage
      await recordUsageMiddleware(user.id, {
        scriptId: completedScript.id,
        processingTimeMs,
        isRemix: true,
        isFinalRemix: true
      });

      return NextResponse.json({
        success: true,
        data: {
          scriptId: completedScript.id,
          title: completedScript.title,
          content: completedScript.content,
          style: completedScript.style,
          durationMin: completedScript.durationMin,
          audience: completedScript.audience,
          status: completedScript.status,
          generatedAt: completedScript.updatedAt,
          video: completedScript.video,
          isRemix: true,
          originalScriptId: scriptId,
          selectedVariations: {
            hook: selectedHook,
            title: selectedTitle,
            payoff: selectedPayoff
          },
          aiMetrics: {
            wordCount: generationResult.script.wordCount,
            estimatedDuration: generationResult.script.estimatedDuration,
            sections: generationResult.script.sections.length,
            processingTimeMs
          },
          subscription: {
            tier: subscription.tier,
            hasAccess: true
          }
        }
      });

    } catch (generationError: any) {
      console.error('Final remix generation error:', generationError);
      
      // Update script status to ERROR
      await prisma.script.update({
        where: { id: newScript.id },
        data: {
          status: ScriptStatus.ERROR,
          content: `Generation error: ${generationError.message}`
        }
      });

      return NextResponse.json(
        { 
          error: 'Final remix generation failed',
          message: generationError.message,
          scriptId: newScript.id
        },
        { status: 500 }
      );
    }

  } catch (error: any) {
    console.error('Final remix API error:', error);

    return NextResponse.json(
      {
        error: 'Internal server error',
        message: error.message
      },
      { status: 500 }
    );
  }
}