import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { currentUser } from '@clerk/nextjs/server';
import { prisma } from '@/lib/prisma';

// Default audiences that are always available
const DEFAULT_AUDIENCES = [
  { id: 'general', name: 'General', description: 'General audience with varied interests' },
  { id: 'beginners', name: 'Beginners', description: 'People new to the topic or field' },
  { id: 'professionals', name: 'Professionals', description: 'Working professionals in the industry' },
  { id: 'students', name: 'Students', description: 'Students learning about the topic' },
  { id: 'experts', name: 'Experts', description: 'Advanced practitioners and experts' },
  { id: 'entrepreneurs', name: 'Entrepreneurs', description: 'Business owners and startup founders' },
  { id: 'content_creators', name: 'Content Creators', description: 'YouTubers, bloggers, and content producers' },
  { id: 'small_business', name: 'Small Business Owners', description: 'Small business owners and operators' }
];

// Create custom audience validation schema
const createAudienceSchema = z.object({
  name: z.string().min(1, 'Name is required').max(50, 'Name must be 50 characters or less'),
  description: z.string().max(200, 'Description must be 200 characters or less').optional()
});

// GET /api/audiences - Fetch user's audiences (defaults + custom)
export async function GET(request: NextRequest) {
  try {
    // Check authentication
    const user = await currentUser();
    if (!user?.id) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    // Fetch user's custom audiences
    const customAudiences = await prisma.customAudience.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: 'asc' },
      select: {
        id: true,
        name: true,
        description: true,
        createdAt: true
      }
    });

    // Combine default and custom audiences
    const allAudiences = [
      ...DEFAULT_AUDIENCES.map(audience => ({
        ...audience,
        isDefault: true,
        createdAt: null
      })),
      ...customAudiences.map(audience => ({
        ...audience,
        isDefault: false
      }))
    ];

    return NextResponse.json({
      success: true,
      audiences: allAudiences
    });

  } catch (error: any) {
    console.error('Audiences fetch error:', error);
    return NextResponse.json(
      { 
        error: 'Internal server error',
        message: error.message
      },
      { status: 500 }
    );
  }
}

// POST /api/audiences - Create new custom audience
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
    const validationResult = createAudienceSchema.safeParse(body);
    if (!validationResult.success) {
      return NextResponse.json(
        { 
          error: 'Invalid request data',
          details: validationResult.error.format()
        },
        { status: 400 }
      );
    }

    const { name, description } = validationResult.data;

    // Check if name conflicts with default audiences
    const nameConflictsWithDefault = DEFAULT_AUDIENCES.some(
      defaultAudience => defaultAudience.name.toLowerCase() === name.toLowerCase()
    );

    if (nameConflictsWithDefault) {
      return NextResponse.json(
        { error: 'Audience name conflicts with default audience' },
        { status: 400 }
      );
    }

    // Create custom audience
    const customAudience = await prisma.customAudience.create({
      data: {
        name: name.trim(),
        description: description?.trim() || null,
        userId: user.id
      },
      select: {
        id: true,
        name: true,
        description: true,
        createdAt: true
      }
    });

    return NextResponse.json({
      success: true,
      audience: {
        ...customAudience,
        isDefault: false
      }
    });

  } catch (error: any) {
    console.error('Custom audience creation error:', error);
    
    // Handle unique constraint violation
    if (error.code === 'P2002') {
      return NextResponse.json(
        { error: 'You already have an audience with this name' },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { 
        error: 'Internal server error',
        message: error.message
      },
      { status: 500 }
    );
  }
}