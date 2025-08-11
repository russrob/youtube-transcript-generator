import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { currentUser } from '@clerk/nextjs/server';
import { prisma } from '@/lib/prisma';
import { generateTitleAndThumbnailPack } from '@/lib/ai/script-generator';
import { formatTranscript } from '@/lib/youtube/fetch-transcript';
import { 
  getUserSubscription,
  getSubscriptionLimits
} from '@/lib/subscription/subscription-service';

// Request validation schema
const titlePackSchema = z.object({
  videoId: z.string().min(1, 'Video ID is required'),
  topic: z.string().optional(),
  niche: z.string().optional()
});

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
    
    // Validate request body
    const validationResult = titlePackSchema.safeParse(body);
    if (!validationResult.success) {
      return NextResponse.json(
        { 
          error: 'Invalid request data',
          details: validationResult.error.format()
        },
        { status: 400 }
      );
    }

    const { videoId, topic, niche } = validationResult.data;

    // Get user's subscription info
    const subscription = await getUserSubscription(user.id);
    const limits = getSubscriptionLimits(subscription.tier);

    // Check if user has access to title and thumbnail pack
    if (!limits.titleAndThumbnailPack) {
      return NextResponse.json(
        { 
          error: 'Title and thumbnail pack requires a Pro subscription',
          feature: 'titleAndThumbnailPack',
          requiredTier: 'PRO',
          currentTier: subscription.tier
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

    // Parse transcript segments
    const transcriptSegments = JSON.parse(video.transcript.content);
    const transcriptText = formatTranscript(transcriptSegments, false);

    // Generate title and thumbnail pack
    const packResult = await generateTitleAndThumbnailPack(
      transcriptText,
      video.title,
      topic,
      niche
    );

    if (!packResult.success) {
      return NextResponse.json(
        { 
          error: 'Failed to generate title and thumbnail pack',
          code: packResult.error.code,
          message: packResult.error.message
        },
        { status: 500 }
      );
    }

    // Return the title and thumbnail pack
    return NextResponse.json({
      success: true,
      data: {
        video: {
          id: video.id,
          youtubeId: video.youtubeId,
          title: video.title,
          thumbnailUrl: video.thumbnailUrl
        },
        titlePack: packResult.titlePack,
        thumbnailPremises: packResult.thumbnailPremises,
        subscription: {
          tier: subscription.tier,
          hasAccess: true
        }
      }
    });

  } catch (error: any) {
    console.error('Title pack API error:', error);
    return NextResponse.json(
      { 
        error: 'Internal server error',
        message: error.message
      },
      { status: 500 }
    );
  }
}