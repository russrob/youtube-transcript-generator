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
  getSubscriptionLimits,
  getEffectiveSubscriptionTier
} from '@/lib/subscription/subscription-service';

// Remix request validation schema
const remixScriptSchema = z.object({
  videoId: z.string().min(1, 'Video ID is required'),
  selectedHook: z.object({
    id: z.string(),
    type: z.enum(['question', 'context', 'bold_statement', 'curiosity_gap']),
    content: z.string(),
    reasoning: z.string()
  }).nullable().optional(),
  selectedPayoutMoments: z.array(z.string()).default([]),
  remixKeyPoints: z.string().optional(),
  // Optional overrides for remix
  style: z.nativeEnum(ScriptStyle).optional(),
  durationMin: z.number().min(1).max(60).optional(),
  audience: z.string().optional(),
  tone: z.enum(['formal', 'casual', 'enthusiastic', 'informative']).optional()
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
    console.log('Remix API received body:', body);
    
    // Validate request body
    const validationResult = remixScriptSchema.safeParse(body);
    if (!validationResult.success) {
      console.error('Remix validation failed:', validationResult.error.format());
      return NextResponse.json(
        { 
          error: 'Invalid request data',
          details: validationResult.error.format()
        },
        { status: 400 }
      );
    }

    const { 
      videoId, 
      selectedHook,
      selectedPayoutMoments,
      remixKeyPoints,
      style,
      durationMin,
      audience,
      tone
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
    
    const limits = getSubscriptionLimits(effectiveTier);

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

    // Fetch video and transcript
    const video = await prisma.video.findUnique({
      where: { id: videoId },
      include: {
        transcript: true
      }
    });

    if (!video) {
      return NextResponse.json(
        { error: 'Video not found' },
        { status: 404 }
      );
    }

    if (!video.transcript) {
      return NextResponse.json(
        { error: 'No transcript available for this video' },
        { status: 400 }
      );
    }

    // Prepare remix options
    const remixOptions: ScriptGenerationOptions = {
      style: style || ScriptStyle.PROFESSIONAL,
      durationMin: durationMin || 5,
      audience: audience || 'general',
      tone: tone || 'casual',
      includeIntro: true,
      includeConclusion: true,
      keyPoints: [],
      customInstructions: ''
    };

    // Build remix-specific instructions
    let remixInstructions = 'REMIX REQUEST: Create a completely new script variation using the same transcript but with different structure and approach.\n\n';
    
    if (selectedHook) {
      remixInstructions += `SELECTED HOOK TO INCORPORATE:\nType: ${selectedHook.type}\nContent: "${selectedHook.content}"\nReasoning: ${selectedHook.reasoning}\n\n`;
      remixInstructions += 'INSTRUCTION: Use this hook as inspiration for the opening or integrate it throughout the script in a natural way.\n\n';
    }

    if (selectedPayoutMoments.length > 0) {
      remixInstructions += `SELECTED PAYOUT MOMENTS TO EMPHASIZE:\n${selectedPayoutMoments.map((moment, idx) => `${idx + 1}. ${moment}`).join('\n')}\n\n`;
      remixInstructions += 'INSTRUCTION: Incorporate these payout moments prominently throughout the script, ensuring they appear at strategic points for maximum impact.\n\n';
    }

    if (remixKeyPoints?.trim()) {
      const keyPointsArray = remixKeyPoints.split('\n').filter(point => point.trim());
      remixOptions.keyPoints = keyPointsArray;
      remixInstructions += 'INSTRUCTION: Integrate the user-provided key points as primary focal areas in the remixed script.\n\n';
    }

    remixInstructions += 'REMIX REQUIREMENTS:\n- Create entirely new content structure\n- Maintain professional quality\n- Ensure natural flow and coherence\n- Make it distinctly different from the original while using the same source material\n- Focus on the selected elements while creating fresh content';

    remixOptions.customInstructions = remixInstructions;

    // Create initial script record with GENERATING status
    const script = await prisma.script.create({
      data: {
        title: `Remixed Script: ${video.title}`,
        content: '',
        style: remixOptions.style,
        durationMin: remixOptions.durationMin,
        status: ScriptStatus.GENERATING,
        videoId: video.id,
        hasWatermark: false // PRO users get watermark-free
      }
    });

    // Generate the remixed script
    const transcriptSegments = JSON.parse(video.transcript.content);
    const formattedTranscript = formatTranscript(transcriptSegments, false);
    const generationResult = await generateScript(
      formattedTranscript,
      video.title,
      remixOptions
    );

    if (!generationResult.success) {
      // Update script with error status
      await prisma.script.update({
        where: { id: script.id },
        data: {
          status: ScriptStatus.FAILED,
          content: `Generation failed: ${generationResult.error.message}`
        }
      });

      return NextResponse.json(
        {
          error: generationResult.error.message,
          code: generationResult.error.code
        },
        { status: 500 }
      );
    }

    // Update script with generated content
    const updatedScript = await prisma.script.update({
      where: { id: script.id },
      data: {
        title: generationResult.script.title,
        content: generationResult.script.content,
        status: ScriptStatus.COMPLETED,
        processingTimeMs: Date.now() - startTime
      }
    });

    // Record usage
    await recordUsageMiddleware(user.id, {
      scriptId: updatedScript.id,
      style: remixOptions.style,
      processingTimeMs: Date.now() - startTime,
      isRemix: true
    });

    return NextResponse.json({
      success: true,
      data: {
        ...updatedScript,
        isRemix: true,
        originalVideoId: videoId,
        remixConfig: {
          selectedHook,
          selectedPayoutMoments,
          remixKeyPoints
        },
        aiMetrics: {
          wordCount: generationResult.script.wordCount,
          estimatedDuration: generationResult.script.estimatedDuration,
          sections: generationResult.script.sections.length,
          generationTimeMs: Date.now() - startTime
        }
      }
    });

  } catch (error: any) {
    console.error('Script remix error:', error);

    return NextResponse.json(
      {
        error: 'Internal server error',
        message: error.message
      },
      { status: 500 }
    );
  }
}