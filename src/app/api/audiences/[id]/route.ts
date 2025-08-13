import { NextRequest, NextResponse } from 'next/server';
import { currentUser } from '@clerk/nextjs/server';
import { prisma } from '@/lib/prisma';

// DELETE /api/audiences/[id] - Delete custom audience
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Check authentication
    const user = await currentUser();
    if (!user?.id) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    const audienceId = params.id;

    if (!audienceId) {
      return NextResponse.json(
        { error: 'Audience ID is required' },
        { status: 400 }
      );
    }

    // Find the custom audience
    const customAudience = await prisma.customAudience.findUnique({
      where: { id: audienceId },
      select: {
        id: true,
        name: true,
        userId: true
      }
    });

    if (!customAudience) {
      return NextResponse.json(
        { error: 'Custom audience not found' },
        { status: 404 }
      );
    }

    // Verify ownership
    if (customAudience.userId !== user.id) {
      return NextResponse.json(
        { error: 'You can only delete your own custom audiences' },
        { status: 403 }
      );
    }

    // Delete the custom audience
    await prisma.customAudience.delete({
      where: { id: audienceId }
    });

    return NextResponse.json({
      success: true,
      message: `Custom audience "${customAudience.name}" deleted successfully`
    });

  } catch (error: any) {
    console.error('Custom audience deletion error:', error);
    return NextResponse.json(
      { 
        error: 'Internal server error',
        message: error.message
      },
      { status: 500 }
    );
  }
}