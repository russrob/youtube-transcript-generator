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
  hasAdvancedStyleAccess,
  hasPriorityProcessing,
  shouldHaveWatermark,
  getSubscriptionLimits
} from '@/lib/subscription/subscription-service';

// Enhanced request validation schema
const generateEnhancedScriptSchema = z.object({
  videoId: z.string().min(1, 'Video ID is required'),
  style: z.nativeEnum(ScriptStyle).default(ScriptStyle.PROFESSIONAL),
  durationMin: z.number().min(1).max(60).default(5),
  audience: z.string().default('general'),
  mode: z.enum(['bullet', 'word', 'hybrid']).optional().default('hybrid'),
  tone: z.enum(['formal', 'casual', 'enthusiastic', 'informative']).optional(),
  // Enhanced features
  generateHooks: z.boolean().optional().default(false),
  generateTitlePack: z.boolean().optional().default(false),
  generateThumbnailPremises: z.boolean().optional().default(false),
  cta: z.object({
    type: z.enum(['free_resource', 'newsletter', 'sponsor', 'subscribe', 'custom']),
    label: z.string(),
    url: z.string().url().optional()
  }).optional(),
  relink: z.object({
    url: z.string().url(),
    title: z.string().optional()
  }).optional(),
  // Standard options
  includeIntro: z.boolean().default(true),
  includeConclusion: z.boolean().default(true),
  keyPoints: z.array(z.string()).optional(),
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
    const validationResult = generateEnhancedScriptSchema.safeParse(body);
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
      videoId, 
      style, 
      durationMin, 
      audience, 
      mode,
      tone,
      generateHooks,
      generateTitlePack,
      generateThumbnailPremises,
      cta,
      relink,
      includeIntro,
      includeConclusion,
      keyPoints,
      customInstructions
    } = validationResult.data;

    // Get user's subscription info
    const subscription = await getUserSubscription(user.id);
    const limits = getSubscriptionLimits(subscription.tier);

    // Check if user has access to the requested script style
    if (!hasAdvancedStyleAccess(subscription.tier, style)) {
      return NextResponse.json(
        { 
          error: 'Advanced script styles require a Pro subscription',
          requiredTier: 'PRO',
          currentTier: subscription.tier,
          restrictedStyle: style
        },
        { status: 403 }
      );
    }

    // Check access to enhanced features
    if (generateHooks && !limits.hookGeneration) {
      return NextResponse.json(
        { 
          error: 'Hook generation requires a Pro subscription',
          feature: 'hookGeneration',
          requiredTier: 'PRO'
        },
        { status: 403 }
      );
    }

    if (generateTitlePack && !limits.titleAndThumbnailPack) {
      return NextResponse.json(
        { 
          error: 'Title and thumbnail pack requires a Pro subscription',
          feature: 'titleAndThumbnailPack',
          requiredTier: 'PRO'
        },
        { status: 403 }
      );
    }

    if (cta && !limits.ctaIntegration) {
      return NextResponse.json(
        { 
          error: 'CTA integration requires a Pro subscription',
          feature: 'ctaIntegration',
          requiredTier: 'PRO'
        },
        { status: 403 }
      );
    }

    if (relink && !limits.relinkOutros) {
      return NextResponse.json(
        { 
          error: 'Relink outros require a Pro subscription',
          feature: 'relinkOutros',
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

    // Determine priority and watermark settings based on subscription
    const isPriority = hasPriorityProcessing(subscription.tier);
    const hasWatermark = shouldHaveWatermark(subscription.tier);

    // Create initial script record with GENERATING status
    const script = await prisma.script.create({
      data: {
        title: `Enhanced Script for ${video.title}`,
        content: '',
        style,
        durationMin,
        audience,
        options: JSON.stringify({
          mode,
          tone,
          generateHooks,
          generateTitlePack,
          generateThumbnailPremises,
          cta,
          relink,
          includeIntro,
          includeConclusion,
          keyPoints,
          customInstructions
        }),
        status: ScriptStatus.GENERATING,
        isPriority,
        hasWatermark,
        videoId,
        transcriptId: video.transcript.id
      }
    });

    try {
      // Parse transcript segments
      const transcriptSegments = JSON.parse(video.transcript.content);
      const transcriptText = formatTranscript(transcriptSegments, false);

      // Generate enhanced script using AI
      const generationOptions: ScriptGenerationOptions = {
        style,
        durationMin,
        audience,
        tone,
        includeIntro,
        includeConclusion,
        keyPoints,
        customInstructions,
        // Enhanced features
        mode,
        generateHooks,
        generateTitlePack,
        generateThumbnailPremises,
        cta,
        relink
      };

      const scriptResult = await generateScript(
        transcriptText,
        video.title,
        generationOptions
      );

      if (!scriptResult.success) {
        // Update script status to ERROR
        await prisma.script.update({
          where: { id: script.id },
          data: {
            status: ScriptStatus.ERROR,
            content: `Generation failed: ${scriptResult.error.message}`
          }
        });

        return NextResponse.json(
          { 
            error: 'Failed to generate enhanced script',
            code: scriptResult.error.code,
            message: scriptResult.error.message,
            scriptId: script.id
          },
          { status: 500 }
        );
      }

      // Add watermark to content if required
      let finalContent = scriptResult.script.content;
      if (hasWatermark) {
        finalContent += '\n\n---\n\n*Generated by ScriptForge AI - Upgrade to Pro to remove this watermark*';
      }

      // Calculate processing time
      const processingTimeMs = Date.now() - startTime;

      // Update script with generated content
      const updatedScript = await prisma.script.update({
        where: { id: script.id },
        data: {
          title: scriptResult.script.title,
          content: finalContent,
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

      // Record usage after successful generation
      await recordUsageMiddleware({
        scriptId: script.id,
        processingTimeMs
      });

      return NextResponse.json({
        success: true,
        data: {
          scriptId: updatedScript.id,
          title: updatedScript.title,
          content: updatedScript.content,
          style: updatedScript.style,
          durationMin: updatedScript.durationMin,
          audience: updatedScript.audience,
          status: updatedScript.status,
          generatedAt: updatedScript.updatedAt,
          video: updatedScript.video,
          // Enhanced features data
          hooks: scriptResult.script.hooks || [],
          titlePack: scriptResult.script.titlePack || [],
          thumbnailPremises: scriptResult.script.thumbnailPremises || [],
          clickConfirmation: scriptResult.script.clickConfirmation,
          payoutMoments: scriptResult.script.payoutMoments || [],
          aiMetrics: {
            wordCount: scriptResult.script.wordCount,
            estimatedDuration: scriptResult.script.estimatedDuration,
            sections: scriptResult.script.sections.length
          },
          subscription: {
            tier: subscription.tier,
            isPriority,
            hasWatermark,
            processingTimeMs,
            usage: usageCheck.usage,
            enhancedFeatures: {
              hookGeneration: limits.hookGeneration,
              titleAndThumbnailPack: limits.titleAndThumbnailPack,
              ctaIntegration: limits.ctaIntegration,
              relinkOutros: limits.relinkOutros,
              payoutStructure: limits.payoutStructure
            }
          }
        }
      });

    } catch (generationError: any) {
      console.error('Enhanced script generation error:', generationError);
      
      // Update script status to ERROR
      await prisma.script.update({
        where: { id: script.id },
        data: {
          status: ScriptStatus.ERROR,
          content: `Generation error: ${generationError.message}`
        }
      });

      return NextResponse.json(
        { 
          error: 'Enhanced script generation failed',
          message: generationError.message,
          scriptId: script.id
        },
        { status: 500 }
      );
    }

  } catch (error: any) {
    console.error('API error:', error);
    return NextResponse.json(
      { 
        error: 'Internal server error',
        message: error.message
      },
      { status: 500 }
    );
  }
}