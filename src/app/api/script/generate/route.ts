import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { ScriptStyle, ScriptStatus } from '@prisma/client';
import { prisma } from '@/lib/prisma';
import { generateScript, ScriptGenerationOptions } from '@/lib/ai/script-generator';
import { formatTranscript } from '@/lib/youtube/fetch-transcript';

// Request validation schema
const generateScriptSchema = z.object({
  videoId: z.string().min(1, 'Video ID is required'),
  style: z.nativeEnum(ScriptStyle).default(ScriptStyle.PROFESSIONAL),
  durationMin: z.number().min(1).max(60).default(5),
  audience: z.string().default('general'),
  options: z.object({
    tone: z.enum(['formal', 'casual', 'enthusiastic', 'informative']).optional(),
    includeIntro: z.boolean().default(true),
    includeConclusion: z.boolean().default(true),
    keyPoints: z.array(z.string()).optional(),
    customInstructions: z.string().optional()
  }).optional().default({})
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Validate request body
    const validationResult = generateScriptSchema.safeParse(body);
    if (!validationResult.success) {
      return NextResponse.json(
        { 
          error: 'Invalid request data',
          details: validationResult.error.format()
        },
        { status: 400 }
      );
    }

    const { videoId, style, durationMin, audience, options } = validationResult.data;

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

    // Create initial script record with GENERATING status
    const script = await prisma.script.create({
      data: {
        title: `Script for ${video.title}`,
        content: '',
        style,
        durationMin,
        audience,
        options: JSON.stringify(options),
        status: ScriptStatus.GENERATING,
        videoId,
        transcriptId: video.transcript.id
      }
    });

    try {
      // Parse transcript segments
      const transcriptSegments = JSON.parse(video.transcript.content);
      const transcriptText = formatTranscript(transcriptSegments, false);

      // Generate script using AI
      const generationOptions: ScriptGenerationOptions = {
        style,
        durationMin,
        audience,
        ...options
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
            error: 'Failed to generate script',
            code: scriptResult.error.code,
            message: scriptResult.error.message,
            scriptId: script.id
          },
          { status: 500 }
        );
      }

      // Update script with generated content
      const updatedScript = await prisma.script.update({
        where: { id: script.id },
        data: {
          title: scriptResult.script.title,
          content: scriptResult.script.content,
          status: ScriptStatus.COMPLETED
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
          aiMetrics: {
            wordCount: scriptResult.script.wordCount,
            estimatedDuration: scriptResult.script.estimatedDuration,
            sections: scriptResult.script.sections.length
          }
        }
      });

    } catch (generationError: any) {
      console.error('Script generation error:', generationError);
      
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
          error: 'Script generation failed',
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

// Handle GET request to check script generation status
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const scriptId = searchParams.get('scriptId');

    if (!scriptId) {
      return NextResponse.json(
        { error: 'Script ID is required' },
        { status: 400 }
      );
    }

    const script = await prisma.script.findUnique({
      where: { id: scriptId },
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

    if (!script) {
      return NextResponse.json(
        { error: 'Script not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: {
        scriptId: script.id,
        title: script.title,
        content: script.content,
        style: script.style,
        durationMin: script.durationMin,
        audience: script.audience,
        status: script.status,
        createdAt: script.createdAt,
        updatedAt: script.updatedAt,
        video: script.video
      }
    });

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