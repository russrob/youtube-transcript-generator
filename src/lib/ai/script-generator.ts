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
  // Enhanced features
  generateHooks?: boolean;
  generateTitlePack?: boolean;
  generateThumbnailPremises?: boolean;
  cta?: {
    type: 'free_resource' | 'newsletter' | 'sponsor' | 'subscribe' | 'custom';
    label: string;
    url?: string;
  };
  relink?: {
    url: string;
    title?: string;
  };
  mode?: 'bullet' | 'word' | 'hybrid';
}

export interface Hook {
  id: string;
  type: 'question' | 'context' | 'bold_statement' | 'curiosity_gap';
  content: string;
  reasoning: string;
}

export interface TitleSuggestion {
  title: string;
  reasoning: string;
  clickability_score: number;
}

export interface ThumbnailPremise {
  concept: string;
  visual_elements: string[];
  contrast_type: 'before_after' | 'a_b_comparison' | 'problem_solution' | 'curiosity';
}

export interface PayoffScenario {
  id: string;
  type: 'unexpected_reveal' | 'action_plan' | 'transformation_story' | 'cliffhanger' | 'call_to_action';
  title: string;
  description: string;
  content: string;
  reasoning: string;
}

export interface RemixVariations {
  hookVariations: Hook[];
  titleVariations: TitleSuggestion[];
  payoffScenarios: PayoffScenario[];
}

export interface GeneratedScript {
  title: string;
  content: string;
  estimatedDuration: number;
  wordCount: number;
  sections: ScriptSection[];
  // Enhanced features
  hooks?: Hook[];
  titlePack?: TitleSuggestion[];
  thumbnailPremises?: ThumbnailPremise[];
  clickConfirmation?: string;
  payoutMoments?: string[];
  // Remix variations
  remixVariations?: RemixVariations;
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
            content: "You are a YouTube Script Architect specializing in HIGH-RETENTION content that maximizes watch time and engagement. You create scripts with click confirmation, hooks, payout structure, and native CTAs. Always respond with valid JSON in the exact format requested."
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

  const ctaSection = options.cta 
    ? `\n\n**Call-to-Action:**\nType: ${options.cta.type}\nLabel: "${options.cta.label}"\n${options.cta.url ? `URL: ${options.cta.url}` : ''}`
    : '';

  const relinkSection = options.relink 
    ? `\n\n**Relink Outro:**\nNext Video: ${options.relink.url}\n${options.relink.title ? `Title: "${options.relink.title}"` : ''}`
    : '';

  // Enhanced prompt for high-retention YouTube scripts
  return `You are a YouTube Script Architect specializing in HIGH-RETENTION content. Create a script that maximizes watch time and engagement.

**SOURCE MATERIAL:**
Video Title: ${videoTitle}
Transcript: ${transcript}

**TARGET SPECIFICATIONS:**
Duration: ${options.durationMin} minutes (${Math.round(150 * options.durationMin)} words)
Style: ${options.style} - ${styleInstructions}
Audience: ${options.audience} - ${audienceInstructions}
${toneInstructions ? `Tone: ${toneInstructions}` : ''}
Mode: ${options.mode || 'hybrid'} (bullet = punchy lists, word = flowing prose, hybrid = mixed)

${keyPointsSection}${ctaSection}${relinkSection}${customSection}

**CRITICAL REQUIREMENTS:**

1. **CLICK CONFIRMATION** - First 2-3 lines must explicitly confirm the video title promise
2. **HOOK VARIATIONS** - Generate 3-5 different opening hooks if requested
3. **PAYOUT STRUCTURE** - End each major section with a valuable insight/takeaway
4. **MINI RE-HOOKS** - Insert curiosity bridges between sections to prevent drop-off
5. **NATIVE CTA** - Integrate call-to-action naturally into content flow
6. **RELINK OUTRO** - Bridge to next video with compelling reason to watch

**RESPONSE FORMAT (JSON):**
{
  "title": "Script title (can be different from video title)",
  "content": "Complete script with proper formatting and flow",
  "estimatedDuration": ${options.durationMin},
  "wordCount": 0,
  "clickConfirmation": "First 2-3 lines that confirm the title promise",
  "sections": [
    {
      "title": "Section name", 
      "content": "Section content with payout at end",
      "estimatedDuration": 0.0,
      "type": "intro|main|conclusion|transition"
    }
  ],
  ${options.generateHooks ? `"hooks": [
    {
      "id": "hook_1",
      "type": "question|context|bold_statement|curiosity_gap",
      "content": "Hook content",
      "reasoning": "Why this hook works"
    }
  ],` : ''}
  ${options.generateTitlePack ? `"titlePack": [
    {
      "title": "Alternative title",
      "reasoning": "Why this title works",
      "clickability_score": 8.5
    }
  ],` : ''}
  ${options.generateThumbnailPremises ? `"thumbnailPremises": [
    {
      "concept": "Visual concept description",
      "visual_elements": ["element1", "element2"],
      "contrast_type": "before_after|a_b_comparison|problem_solution|curiosity"
    }
  ],` : ''}
  "payoutMoments": ["Key insight 1", "Key insight 2", "Key insight 3"]
}

STRUCTURE YOUR SCRIPT FOR MAXIMUM RETENTION:
- Hook (0-15s): Grab attention + confirm click
- Context (15-30s): Set up the problem/promise  
- Value Delivery (30s-90%): Main content with payouts
- CTA Integration (80-90%): Natural call-to-action
- Outro/Relink (90-100%): Bridge to next video

Make every line count for retention!`;
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
  const audienceKey = audience.toLowerCase().replace(/\s+/g, '_');
  
  const commonAudiences: Record<string, string> = {
    'general': 'General audience with no assumed prior knowledge. Use accessible language, avoid jargon, and provide relatable examples. Focus on universal benefits and outcomes.',
    'beginners': 'Complete beginners who need basic concepts explained clearly. Use simple analogies, step-by-step approaches, and avoid intimidating technical terms. Build confidence through achievable wins.',
    'professionals': 'Working professionals in the industry. Use business-focused language, emphasize ROI and practical applications. Include industry-specific examples and measurable outcomes.',
    'students': 'Educational focus with clear learning objectives. Structure content with clear takeaways, use academic language appropriately, and provide practical exercises or assignments.',
    'experts': 'Advanced practitioners who appreciate technical depth and nuance. Use precise terminology, discuss advanced concepts, and provide cutting-edge insights.',
    'entrepreneurs': 'Business owners and startup founders. Focus on growth, scaling, innovation, and competitive advantage. Use business metrics, case studies, and actionable strategies.',
    'content_creators': 'YouTubers, bloggers, and content producers. Emphasize audience growth, monetization, creative processes, and platform-specific strategies. Use creator economy language.',
    'small_business': 'Small business owners and operators. Focus on practical, cost-effective solutions. Emphasize local impact, community building, and manageable growth strategies.'
  };
  
  return commonAudiences[audienceKey] || `Tailored for ${audience} audience with specialized language, examples, and approach suitable for this specific group.`;
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
  const baseValid = (
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

  if (!baseValid) return false;

  // Validate enhanced features if present
  if (script.hooks && !Array.isArray(script.hooks)) return false;
  if (script.titlePack && !Array.isArray(script.titlePack)) return false;
  if (script.thumbnailPremises && !Array.isArray(script.thumbnailPremises)) return false;
  if (script.payoutMoments && !Array.isArray(script.payoutMoments)) return false;
  if (script.clickConfirmation && typeof script.clickConfirmation !== 'string') return false;

  // Validate hook structure if present
  if (script.hooks && script.hooks.length > 0) {
    const hooksValid = script.hooks.every((hook: any) =>
      hook &&
      typeof hook.id === 'string' &&
      typeof hook.type === 'string' &&
      typeof hook.content === 'string' &&
      typeof hook.reasoning === 'string'
    );
    if (!hooksValid) return false;
  }

  // Validate title pack structure if present
  if (script.titlePack && script.titlePack.length > 0) {
    const titlePackValid = script.titlePack.every((title: any) =>
      title &&
      typeof title.title === 'string' &&
      typeof title.reasoning === 'string' &&
      typeof title.clickability_score === 'number'
    );
    if (!titlePackValid) return false;
  }

  // Validate thumbnail premises structure if present
  if (script.thumbnailPremises && script.thumbnailPremises.length > 0) {
    const thumbnailsValid = script.thumbnailPremises.every((thumb: any) =>
      thumb &&
      typeof thumb.concept === 'string' &&
      Array.isArray(thumb.visual_elements) &&
      typeof thumb.contrast_type === 'string'
    );
    if (!thumbnailsValid) return false;
  }

  return true;
}

/**
 * Generates remix variations for an existing script
 */
export async function generateRemixVariations(
  originalScript: GeneratedScript,
  videoTitle: string,
  targetAudience: string,
  selectedHook?: string,
  customInstructions?: string
): Promise<{ success: true; variations: RemixVariations } | { success: false; error: ScriptGenerationError }> {
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

    const prompt = buildRemixVariationsPrompt(originalScript, videoTitle, targetAudience, selectedHook, customInstructions);

    const completion = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        {
          role: "system",
          content: "You are a YouTube Script Remix Expert specializing in creating multiple compelling variations. Always respond with valid JSON in the exact format requested."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      max_tokens: 3000,
      temperature: 0.8, // Higher creativity for variations
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

    let parsedVariations: RemixVariations;
    try {
      parsedVariations = JSON.parse(response);
    } catch (parseError) {
      return {
        success: false,
        error: {
          code: 'API_ERROR',
          message: 'Failed to parse AI response as JSON'
        }
      };
    }

    // Validate structure
    if (!isValidRemixVariations(parsedVariations)) {
      return {
        success: false,
        error: {
          code: 'API_ERROR',
          message: 'AI response does not match expected remix variations format'
        }
      };
    }

    return {
      success: true,
      variations: parsedVariations
    };

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
 * Builds the prompt for remix variations generation
 */
function buildRemixVariationsPrompt(
  originalScript: GeneratedScript,
  videoTitle: string,
  targetAudience: string,
  selectedHook?: string,
  customInstructions?: string
): string {
  const hookSection = selectedHook 
    ? `\n\n**SELECTED HOOK PREFERENCE:**\n"${selectedHook}"\nUse this as inspiration for hook variations but create 3 distinct alternatives.`
    : '';

  const audienceInstructions = getAudienceInstructions(targetAudience);
  const audienceSection = `\n\n**TARGET AUDIENCE:** ${targetAudience}\n${audienceInstructions}\nAll variations must be tailored specifically for this audience.`;

  const customSection = customInstructions 
    ? `\n\n**CUSTOM INSTRUCTIONS:** ${customInstructions}`
    : '';

  return `You are a YouTube Script Remix Expert. Create 3 distinct variations each for HOOKS, TITLES, and PAYOFF SCENARIOS based on this original script.

**ORIGINAL SCRIPT CONTEXT:**
Video Title: ${videoTitle}
Original Script Title: ${originalScript.title}
Script Content: ${originalScript.content.substring(0, 1500)}...
Style: Professional, high-retention YouTube content
Duration: ${originalScript.estimatedDuration} minutes
${audienceSection}${hookSection}${customSection}

**TASK:** Generate exactly 3 variations each for:
1. **Hook Variations** - Different opening approaches to grab attention
2. **Title Variations** - Alternative compelling titles for the script
3. **Payoff Scenarios** - Different ways to deliver value and conclude

**REMIX VARIATION REQUIREMENTS:**

**HOOK VARIATIONS (3 required):**
- Each hook should be 15-30 seconds when spoken
- Different psychological approaches: question, bold statement, curiosity gap
- Maintain click confirmation but with unique angles
- Each should feel distinctly different in approach

**TITLE VARIATIONS (3 required):**
- Under 60 characters for mobile optimization
- Different emotional triggers: curiosity, urgency, benefit
- Score each for clickability (7.0-10.0)
- Avoid direct copies of original title

**PAYOFF SCENARIOS (3 required):**
- Different conclusion approaches: reveal, action plan, transformation story
- Each should provide clear value delivery
- Different emotional endings: satisfaction, motivation, intrigue
- 30-60 seconds of content each

**RESPONSE FORMAT (JSON):**
{
  "hookVariations": [
    {
      "id": "hook_var_1",
      "type": "question|context|bold_statement|curiosity_gap",
      "content": "Complete hook content (15-30 seconds spoken)",
      "reasoning": "Why this hook works and how it differs from others"
    }
  ],
  "titleVariations": [
    {
      "title": "Compelling alternative title under 60 chars",
      "reasoning": "Psychological trigger and appeal explanation",
      "clickability_score": 8.7
    }
  ],
  "payoffScenarios": [
    {
      "id": "payoff_1",
      "type": "unexpected_reveal|action_plan|transformation_story|cliffhanger|call_to_action",
      "title": "Scenario name (5-8 words)",
      "description": "Brief description of this payoff approach",
      "content": "Complete payoff content (30-60 seconds spoken)",
      "reasoning": "Why this ending works for retention and satisfaction"
    }
  ]
}

**VARIATION STRATEGY:**
- Hook 1: Question-based curiosity opener
- Hook 2: Bold statement with immediate value promise  
- Hook 3: Context setup with compelling storyline

- Title 1: Curiosity-driven with numbers/specifics
- Title 2: Benefit-focused with emotional appeal
- Title 3: Urgency/scarcity with action orientation

- Payoff 1: Unexpected reveal with "aha" moment
- Payoff 2: Practical action plan with next steps
- Payoff 3: Transformation story with emotional satisfaction

Generate exactly 3 of each type. Each variation should feel meaningfully different while maintaining quality and retention focus.`;
}

/**
 * Generates final remix script with selected variations
 */
export async function generateFinalRemixScript(
  originalScript: GeneratedScript,
  selections: {
    hook: Hook;
    title: TitleSuggestion;
    payoff: PayoffScenario;
    targetAudience: string;
    customInstructions?: string;
  }
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

    const audienceInstructions = getAudienceInstructions(selections.targetAudience);
    const customSection = selections.customInstructions 
      ? `\n\n**CUSTOM INSTRUCTIONS:** ${selections.customInstructions}`
      : '';

    const prompt = `You are a YouTube Script Architect creating a final remix script using selected variations.

**ORIGINAL SCRIPT:**
Title: ${originalScript.title}
Content: ${originalScript.content}
Duration: ${originalScript.estimatedDuration} minutes

**SELECTED VARIATIONS:**
Hook: ${selections.hook.content}
Title: ${selections.title.title}
Payoff: ${selections.payoff.content}

**TARGET AUDIENCE:** ${selections.targetAudience}
${audienceInstructions}
${customSection}

**TASK:** Create a complete remix script that integrates:
1. The selected hook as the opening (maintain its style and approach)
2. The selected title as the script title
3. The selected payoff scenario as the conclusion
4. Content tailored specifically for the target audience
5. Smooth transitions between original content and new variations

**REQUIREMENTS:**
- Maintain the original script's core message and value
- Seamlessly integrate the selected hook, title, and payoff
- Adapt language, examples, and references for the target audience
- Ensure smooth flow between all sections
- Keep the same estimated duration as original (${originalScript.estimatedDuration} minutes)

**RESPONSE FORMAT (JSON):**
{
  "title": "${selections.title.title}",
  "content": "Complete remixed script with selected variations integrated",
  "estimatedDuration": ${originalScript.estimatedDuration},
  "wordCount": 0,
  "sections": [
    {
      "title": "Hook",
      "content": "Selected hook content with smooth transition",
      "estimatedDuration": 0.5,
      "type": "intro"
    },
    {
      "title": "Main Content",
      "content": "Adapted main content for target audience",
      "estimatedDuration": ${originalScript.estimatedDuration - 1.0},
      "type": "main"  
    },
    {
      "title": "Payoff",
      "content": "Selected payoff scenario content",
      "estimatedDuration": 0.5,
      "type": "conclusion"
    }
  ],
  "clickConfirmation": "Opening lines that confirm the title promise for target audience",
  "payoutMoments": ["Key insight 1 for audience", "Key insight 2 for audience", "Key insight 3 for audience"]
}

Create a cohesive, audience-tailored script that feels natural and engaging while incorporating all selected variations.`;

    const completion = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        {
          role: "system",
          content: "You are a YouTube Script Architect who creates cohesive, engaging scripts. Always respond with valid JSON in the exact format requested."
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

    // Validate structure
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
 * Validates remix variations structure
 */
function isValidRemixVariations(variations: any): variations is RemixVariations {
  if (!variations || typeof variations !== 'object') return false;

  // Validate hook variations
  if (!Array.isArray(variations.hookVariations) || variations.hookVariations.length !== 3) return false;
  for (const hook of variations.hookVariations) {
    if (!hook.id || !hook.type || !hook.content || !hook.reasoning) return false;
  }

  // Validate title variations
  if (!Array.isArray(variations.titleVariations) || variations.titleVariations.length !== 3) return false;
  for (const title of variations.titleVariations) {
    if (!title.title || !title.reasoning || typeof title.clickability_score !== 'number') return false;
  }

  // Validate payoff scenarios
  if (!Array.isArray(variations.payoffScenarios) || variations.payoffScenarios.length !== 3) return false;
  for (const payoff of variations.payoffScenarios) {
    if (!payoff.id || !payoff.type || !payoff.title || !payoff.description || !payoff.content || !payoff.reasoning) return false;
  }

  return true;
}

/**
 * Generates a title and thumbnail pack for a video
 */
export async function generateTitleAndThumbnailPack(
  transcript: string,
  videoTitle: string,
  topic?: string,
  niche?: string
): Promise<{ success: true; titlePack: TitleSuggestion[]; thumbnailPremises: ThumbnailPremise[] } | { success: false; error: ScriptGenerationError }> {
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

    const prompt = `You are a YouTube Packaging Expert specializing in high-clickability titles and thumbnails.

**TASK:** Generate 5 compelling title options and 3 thumbnail premises for this video.

**SOURCE MATERIAL:**
Original Title: ${videoTitle}
${topic ? `Topic: ${topic}` : ''}
${niche ? `Niche: ${niche}` : ''}
Transcript: ${transcript.substring(0, 2000)}... [truncated]

**TITLE REQUIREMENTS:**
- Create curiosity loops without giving away the answer
- Use numbers, questions, or bold statements
- Keep under 60 characters for mobile optimization
- Score each title for clickability (1-10)

**THUMBNAIL REQUIREMENTS:**
- Focus on visual contrast and emotion
- Suggest specific visual elements and text overlays
- Create before/after or A/B comparison opportunities
- Consider facial expressions and color psychology

**RESPONSE FORMAT (JSON):**
{
  "titlePack": [
    {
      "title": "Compelling title under 60 characters",
      "reasoning": "Why this title creates curiosity and compels clicks",
      "clickability_score": 8.5
    }
  ],
  "thumbnailPremises": [
    {
      "concept": "Main visual concept description",
      "visual_elements": ["facial expression", "text overlay", "background element"],
      "contrast_type": "before_after"
    }
  ]
}

Generate exactly 5 titles and 3 thumbnail concepts.`;

    const completion = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        {
          role: "system",
          content: "You are a YouTube Packaging Expert who creates viral titles and thumbnails. Always respond with valid JSON."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      max_tokens: 2000,
      temperature: 0.8, // Higher creativity for titles
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

    let parsed: { titlePack: TitleSuggestion[]; thumbnailPremises: ThumbnailPremise[] };
    try {
      parsed = JSON.parse(response);
    } catch (parseError) {
      return {
        success: false,
        error: {
          code: 'API_ERROR',
          message: 'Failed to parse AI response as JSON'
        }
      };
    }

    // Validate structure
    if (!parsed.titlePack || !Array.isArray(parsed.titlePack) || parsed.titlePack.length !== 5) {
      return {
        success: false,
        error: {
          code: 'API_ERROR',
          message: 'Invalid title pack structure'
        }
      };
    }

    if (!parsed.thumbnailPremises || !Array.isArray(parsed.thumbnailPremises) || parsed.thumbnailPremises.length !== 3) {
      return {
        success: false,
        error: {
          code: 'API_ERROR',
          message: 'Invalid thumbnail premises structure'
        }
      };
    }

    return {
      success: true,
      titlePack: parsed.titlePack,
      thumbnailPremises: parsed.thumbnailPremises
    };

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