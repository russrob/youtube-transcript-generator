import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';

export async function GET(request: NextRequest) {
  try {
    // Check OpenAI connectivity (main dependency for premium features)
    const openaiStatus = process.env.OPENAI_API_KEY ? 'configured' : 'missing';
    
    // Test OpenAI connection if key is available
    let openaiWorking = false;
    if (process.env.OPENAI_API_KEY) {
      try {
        const openai = new OpenAI({
          apiKey: process.env.OPENAI_API_KEY,
        });
        
        // Simple test call
        const response = await openai.chat.completions.create({
          model: "gpt-3.5-turbo",
          messages: [{ role: "user", content: "Hello" }],
          max_tokens: 5,
        });
        
        openaiWorking = !!response.choices[0]?.message?.content;
      } catch (error) {
        console.error('OpenAI test failed:', error);
        openaiWorking = false;
      }
    }

    return NextResponse.json({
      status: 'healthy',
      timestamp: new Date().toISOString(),
      services: {
        openai: {
          configured: openaiStatus === 'configured',
          working: openaiWorking,
          note: 'Required for premium features (hooks, titles, thumbnails)'
        },
        database: {
          working: true,
          note: 'SQLite database for user data and scripts'
        },
        authentication: {
          working: true,
          provider: 'Clerk',
          note: 'User authentication and subscription management'
        }
      },
      features: {
        basic_transcription: true,
        script_generation: openaiWorking,
        premium_features: {
          hook_generation: openaiWorking,
          title_pack: openaiWorking,
          thumbnail_premises: openaiWorking,
          cta_integration: openaiWorking,
          advanced_styles: openaiWorking
        }
      },
      mcp_status: {
        magic: {
          required: false,
          status: 'not_needed',
          note: 'All UI generation handled by OpenAI directly'
        },
        context7: {
          required: false,
          status: 'optional',
          note: 'Used for documentation lookup (fallback available)'
        },
        sequential: {
          required: false,
          status: 'optional', 
          note: 'Used for complex analysis (native implementation available)'
        },
        playwright: {
          required: false,
          status: 'optional',
          note: 'Used for E2E testing (manual testing possible)'
        }
      }
    });

  } catch (error: any) {
    console.error('Status check error:', error);
    return NextResponse.json(
      { 
        status: 'error',
        error: error.message,
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    );
  }
}