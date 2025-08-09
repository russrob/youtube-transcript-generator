import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

interface RouteParams {
  params: {
    id: string;
  };
}

export async function GET(
  request: NextRequest,
  { params }: RouteParams
) {
  try {
    const { id } = params;

    if (!id) {
      return NextResponse.json(
        { error: 'Video ID is required' },
        { status: 400 }
      );
    }

    // Fetch video with all related data
    const video = await prisma.video.findUnique({
      where: { id },
      include: {
        transcript: true,
        scripts: {
          orderBy: { createdAt: 'desc' }
        },
        user: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      }
    });

    if (!video) {
      return NextResponse.json(
        { error: 'Video not found' },
        { status: 404 }
      );
    }

    // Format transcript content if it exists
    let formattedTranscript = null;
    if (video.transcript) {
      try {
        const transcriptSegments = JSON.parse(video.transcript.content);
        formattedTranscript = {
          id: video.transcript.id,
          segments: transcriptSegments,
          language: video.transcript.language,
          duration: video.transcript.duration,
          createdAt: video.transcript.createdAt,
          updatedAt: video.transcript.updatedAt
        };
      } catch (parseError) {
        console.error('Failed to parse transcript content:', parseError);
        formattedTranscript = {
          id: video.transcript.id,
          segments: [],
          language: video.transcript.language,
          duration: video.transcript.duration,
          createdAt: video.transcript.createdAt,
          updatedAt: video.transcript.updatedAt,
          error: 'Failed to parse transcript content'
        };
      }
    }

    // Format scripts with parsed options
    const formattedScripts = video.scripts.map(script => {
      let parsedOptions = {};
      if (script.options) {
        try {
          parsedOptions = JSON.parse(script.options);
        } catch (parseError) {
          console.error('Failed to parse script options:', parseError);
        }
      }

      return {
        id: script.id,
        title: script.title,
        content: script.content,
        style: script.style,
        durationMin: script.durationMin,
        audience: script.audience,
        options: parsedOptions,
        status: script.status,
        createdAt: script.createdAt,
        updatedAt: script.updatedAt
      };
    });

    return NextResponse.json({
      success: true,
      data: {
        video: {
          id: video.id,
          youtubeId: video.youtubeId,
          title: video.title,
          description: video.description,
          duration: video.duration,
          thumbnailUrl: video.thumbnailUrl,
          channelName: video.channelName,
          publishedAt: video.publishedAt,
          createdAt: video.createdAt,
          updatedAt: video.updatedAt,
          user: video.user
        },
        transcript: formattedTranscript,
        scripts: formattedScripts,
        stats: {
          totalScripts: video.scripts.length,
          completedScripts: video.scripts.filter(s => s.status === 'COMPLETED').length,
          hasTranscript: !!video.transcript,
          transcriptDuration: video.transcript?.duration || 0
        }
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

// Handle DELETE request to remove a video
export async function DELETE(
  request: NextRequest,
  { params }: RouteParams
) {
  try {
    const { id } = params;

    if (!id) {
      return NextResponse.json(
        { error: 'Video ID is required' },
        { status: 400 }
      );
    }

    // Check if video exists
    const video = await prisma.video.findUnique({
      where: { id },
      include: {
        _count: {
          select: {
            scripts: true
          }
        }
      }
    });

    if (!video) {
      return NextResponse.json(
        { error: 'Video not found' },
        { status: 404 }
      );
    }

    // Delete video (cascade will handle transcript and scripts)
    await prisma.video.delete({
      where: { id }
    });

    return NextResponse.json({
      success: true,
      message: 'Video and all related data deleted successfully',
      deletedCount: {
        video: 1,
        scripts: video._count.scripts,
        transcript: video.transcript ? 1 : 0
      }
    });

  } catch (error: any) {
    console.error('Delete error:', error);
    return NextResponse.json(
      { 
        error: 'Failed to delete video',
        message: error.message
      },
      { status: 500 }
    );
  }
}

// Handle PATCH request to update video metadata
export async function PATCH(
  request: NextRequest,
  { params }: RouteParams
) {
  try {
    const { id } = params;
    const body = await request.json();

    if (!id) {
      return NextResponse.json(
        { error: 'Video ID is required' },
        { status: 400 }
      );
    }

    // Validate updatable fields
    const allowedFields = ['title', 'description', 'channelName'];
    const updateData: any = {};
    
    for (const field of allowedFields) {
      if (body[field] !== undefined) {
        updateData[field] = body[field];
      }
    }

    if (Object.keys(updateData).length === 0) {
      return NextResponse.json(
        { error: 'No valid fields to update' },
        { status: 400 }
      );
    }

    const updatedVideo = await prisma.video.update({
      where: { id },
      data: updateData,
      include: {
        transcript: true,
        scripts: {
          orderBy: { createdAt: 'desc' }
        }
      }
    });

    return NextResponse.json({
      success: true,
      data: {
        video: updatedVideo,
        updated: Object.keys(updateData)
      }
    });

  } catch (error: any) {
    if (error.code === 'P2025') {
      return NextResponse.json(
        { error: 'Video not found' },
        { status: 404 }
      );
    }

    console.error('Update error:', error);
    return NextResponse.json(
      { 
        error: 'Failed to update video',
        message: error.message
      },
      { status: 500 }
    );
  }
}