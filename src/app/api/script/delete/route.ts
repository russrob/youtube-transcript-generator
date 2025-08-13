import { NextRequest, NextResponse } from 'next/server';
import { currentUser } from '@clerk/nextjs/server';
import { prisma } from '@/lib/prisma';

export async function DELETE(request: NextRequest) {
  try {
    // Check authentication
    const user = await currentUser();
    if (!user?.id) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    // Get script ID from query params
    const { searchParams } = new URL(request.url);
    const scriptId = searchParams.get('id');

    if (!scriptId) {
      return NextResponse.json(
        { error: 'Script ID is required' },
        { status: 400 }
      );
    }

    // Find the script and verify ownership
    const script = await prisma.script.findUnique({
      where: { id: scriptId },
      include: {
        video: {
          select: {
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

    // Verify the user owns this script (through the video)
    if (script.video.userId !== user.id) {
      return NextResponse.json(
        { error: 'You can only delete your own scripts' },
        { status: 403 }
      );
    }

    // Delete the script
    await prisma.script.delete({
      where: { id: scriptId }
    });

    return NextResponse.json({
      success: true,
      message: 'Script deleted successfully'
    });

  } catch (error: any) {
    console.error('Delete script error:', error);

    return NextResponse.json(
      {
        error: 'Internal server error',
        message: error.message
      },
      { status: 500 }
    );
  }
}