import OpenAI from 'openai';
import { ScriptStyle } from '@prisma/client';

export interface ScriptGenerationOptions {
  style: ScriptStyle;
  durationMin: number;
  audience: string;
  tone?: 'formal' | 'casual' | 'enthusiastic' | 'informative';
  includeIntro?: boolean;
  includeConclusion?: boolean;
  keyPoints?: string[];
  customInstructions?: string;
}

export interface GeneratedScript {
  title: string;
  content: string;
  estimatedDuration: number;
  wordCount: number;
  sections: ScriptSection[];
}

export interface ScriptSection {
  title: string;
  content: string;
  estimatedDuration: number;
  type: 'intro' | 'main' | 'conclusion' | 'transition';
}

export interface ScriptGenerationError {
  code: 'API_ERROR' | 'INVALID_INPUT' | 'TOKEN_LIMIT' | 'RATE_LIMIT';
  message: string;
}

/**
 * Generates a script from YouTube transcript using OpenAI
 */
export async function generateScript(
  transcript: string,
  videoTitle: string,
  options: ScriptGenerationOptions
): Promise<{ success: true; script: GeneratedScript } | { success: false; error: ScriptGenerationError }> {
  try {
    const openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });

    if (!process.env.OPENAI_API_KEY) {
      return {
        success: false,
        error: {
          code: 'API_ERROR',
          message: 'OpenAI API key not configured'
        }
      };
    }

    // Validate inputs
    if (!transcript || transcript.trim().length === 0) {
      return {
        success: false,
        error: {
          code: 'INVALID_INPUT',
          message: 'Transcript cannot be empty'
        }
      };
    }

    if (options.durationMin < 1 || options.durationMin > 60) {
      return {
        success: false,
        error: {
          code: 'INVALID_INPUT',
          message: 'Duration must be between 1 and 60 minutes'
        }
      };
    }

    // Build the prompt based on options
    const prompt = buildScriptPrompt(transcript, videoTitle, options);

    try {
      const completion = await openai.chat.completions.create({
        model: "gpt-4",
        messages: [
          {
            role: "system",
            content: "You are an expert script writer who creates engaging, well-structured scripts from video transcripts. You always respond with valid JSON in the exact format requested."
          },
          {
            role: "user", 
            content: prompt
          }
        ],
        max_tokens: 4000,
        temperature: 0.7,
      });

      const response = completion.choices[0]?.message?.content;
      if (!response) {
        return {
          success: false,
          error: {
            code: 'API_ERROR',
            message: 'No response received from OpenAI'
          }
        };
      }

      // Parse the JSON response
      let parsedScript: GeneratedScript;
      try {
        parsedScript = JSON.parse(response);
      } catch (parseError) {
        return {
          success: false,
          error: {
            code: 'API_ERROR',
            message: 'Failed to parse AI response as JSON'
          }
        };
      }

      // Validate the parsed script structure
      if (!isValidGeneratedScript(parsedScript)) {
        return {
          success: false,
          error: {
            code: 'API_ERROR',
            message: 'AI response does not match expected script format'
          }
        };
      }

      return {
        success: true,
        script: parsedScript
      };

    } catch (apiError: any) {
      if (apiError?.error?.type === 'invalid_request_error') {
        return {
          success: false,
          error: {
            code: 'TOKEN_LIMIT',
            message: 'Input too long for AI model'
          }
        };
      }
      
      if (apiError?.error?.type === 'rate_limit_exceeded') {
        return {
          success: false,
          error: {
            code: 'RATE_LIMIT',
            message: 'Rate limit exceeded, please try again later'
          }
        };
      }

      return {
        success: false,
        error: {
          code: 'API_ERROR',
          message: `OpenAI API error: ${apiError.message}`
        }
      };
    }

  } catch (error: any) {
    return {
      success: false,
      error: {
        code: 'API_ERROR',
        message: `Unexpected error: ${error.message}`
      }
    };
  }
}

/**
 * Builds the prompt for script generation based on options
 */
function buildScriptPrompt(transcript: string, videoTitle: string, options: ScriptGenerationOptions): string {
  const styleInstructions = getStyleInstructions(options.style);
  const audienceInstructions = getAudienceInstructions(options.audience);
  const toneInstructions = options.tone ? getToneInstructions(options.tone) : '';
  
  const keyPointsSection = options.keyPoints && options.keyPoints.length > 0 
    ? `\n\nKey points to emphasize:\n${options.keyPoints.map(point => `- ${point}`).join('\n')}`
    : '';
    
  const customSection = options.customInstructions 
    ? `\n\nAdditional instructions: ${options.customInstructions}`
    : '';

  return `Please create a ${options.durationMin}-minute script based on the following YouTube video transcript.

**Video Title:** ${videoTitle}

**Target Duration:** ${options.durationMin} minutes
**Style:** ${options.style} - ${styleInstructions}
**Audience:** ${options.audience} - ${audienceInstructions}
${toneInstructions ? `**Tone:** ${toneInstructions}` : ''}

**Structure Requirements:**
${options.includeIntro ? '- Include an engaging introduction' : '- Start directly with main content'}
${options.includeConclusion ? '- Include a strong conclusion with call-to-action' : '- End with main content summary'}
- Break content into clear sections with smooth transitions
- Aim for approximately ${Math.round(150 * options.durationMin)} words total (150 words per minute)

**Original Transcript:**
${transcript}

${keyPointsSection}${customSection}

**Required Response Format (JSON):**
{
  "title": "Engaging title for the script",
  "content": "Full script content with clear paragraph breaks",
  "estimatedDuration": ${options.durationMin},
  "wordCount": 000,
  "sections": [
    {
      "title": "Section name",
      "content": "Section content",
      "estimatedDuration": 0.0,
      "type": "intro|main|conclusion|transition"
    }
  ]
}

Ensure the JSON is valid and follows this exact structure.`;
}

/**
 * Gets style-specific instructions
 */
function getStyleInstructions(style: ScriptStyle): string {
  const styleMap = {
    PROFESSIONAL: 'Formal, authoritative tone with clear structure and professional language',
    CASUAL: 'Conversational, friendly tone that feels like talking to a friend',
    EDUCATIONAL: 'Clear explanations, step-by-step approach, emphasis on learning outcomes',
    ENTERTAINING: 'Engaging, humorous, with storytelling elements and personality',
    TECHNICAL: 'Detailed, precise, with proper terminology and comprehensive coverage',
    STORYTELLING: 'Narrative structure with compelling story arc and emotional engagement',
    // Pro-only styles
    PERSUASIVE: 'Compelling, influential tone designed to convince and motivate action with strong arguments and emotional appeals',
    NARRATIVE: 'Rich storytelling with character development, plot structure, and immersive world-building elements',
    ACADEMIC: 'Scholarly tone with rigorous analysis, citations, theoretical frameworks, and research-backed conclusions'
  };
  
  return styleMap[style] || styleMap.PROFESSIONAL;
}

/**
 * Gets audience-specific instructions
 */
function getAudienceInstructions(audience: string): string {
  const commonAudiences: Record<string, string> = {
    'general': 'General audience with no assumed prior knowledge',
    'beginners': 'Complete beginners who need basic concepts explained clearly',
    'intermediate': 'Some background knowledge, can handle moderate complexity', 
    'experts': 'Advanced audience who appreciates technical depth and nuance',
    'students': 'Educational focus with clear learning objectives and examples',
    'professionals': 'Business context with practical applications and outcomes'
  };
  
  return commonAudiences[audience.toLowerCase()] || `Tailored for ${audience} audience`;
}

/**
 * Gets tone-specific instructions
 */
function getToneInstructions(tone: string): string {
  const toneMap = {
    'formal': 'Professional and authoritative language',
    'casual': 'Relaxed and conversational approach',
    'enthusiastic': 'Energetic and passionate delivery',
    'informative': 'Clear and educational focus'
  };
  
  return toneMap[tone] || '';
}

/**
 * Validates that the generated script has the correct structure
 */
function isValidGeneratedScript(script: any): script is GeneratedScript {
  return (
    script &&
    typeof script.title === 'string' &&
    typeof script.content === 'string' &&
    typeof script.estimatedDuration === 'number' &&
    typeof script.wordCount === 'number' &&
    Array.isArray(script.sections) &&
    script.sections.every((section: any) =>
      section &&
      typeof section.title === 'string' &&
      typeof section.content === 'string' &&
      typeof section.estimatedDuration === 'number' &&
      typeof section.type === 'string'
    )
  );
}