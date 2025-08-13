import { z } from 'zod';
import { ScriptStyle } from '@prisma/client';

// Common validation patterns
export const patterns = {
  email: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  url: /^https?:\/\/.+/,
  youtubeUrl: /^https?:\/\/(www\.)?(youtube\.com|youtu\.be)\/.+/,
  youtubeId: /^[a-zA-Z0-9_-]{11}$/,
  slug: /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
};

// YouTube URL validation
export const youtubeUrlSchema = z.string()
  .url('Must be a valid URL')
  .regex(patterns.youtubeUrl, 'Must be a valid YouTube URL')
  .min(1, 'YouTube URL is required');

// Script generation schemas
export const scriptGenerationSchema = z.object({
  videoId: z.string().min(1, 'Video ID is required'),
  style: z.nativeEnum(ScriptStyle),
  durationMin: z.number()
    .min(1, 'Duration must be at least 1 minute')
    .max(60, 'Duration cannot exceed 60 minutes'),
  audience: z.string().min(1, 'Target audience is required'),
  tone: z.enum(['formal', 'casual', 'enthusiastic', 'informative']).optional(),
  includeIntro: z.boolean().optional(),
  includeConclusion: z.boolean().optional(),
  keyPoints: z.array(z.string()).optional(),
  customInstructions: z.string().max(1000, 'Custom instructions too long').optional(),
  generateHooks: z.boolean().optional(),
  generateTitlePack: z.boolean().optional(),
  generateThumbnailPremises: z.boolean().optional(),
});

// Remix variations schema
export const remixVariationsSchema = z.object({
  scriptId: z.string().min(1, 'Script ID is required'),
  targetAudience: z.string()
    .min(1, 'Target audience is required')
    .max(100, 'Target audience name too long'),
  selectedHook: z.string().max(500, 'Selected hook too long').optional(),
  customInstructions: z.string().max(1000, 'Custom instructions too long').optional(),
});

// Final remix schema
export const finalRemixSchema = z.object({
  scriptId: z.string().min(1, 'Script ID is required'),
  selections: z.object({
    hook: z.object({
      id: z.string(),
      type: z.enum(['question', 'context', 'bold_statement', 'curiosity_gap']),
      content: z.string().min(1, 'Hook content is required').max(1000, 'Hook content too long'),
      reasoning: z.string().min(1, 'Hook reasoning is required').max(500, 'Hook reasoning too long')
    }),
    title: z.object({
      title: z.string()
        .min(1, 'Title is required')
        .max(100, 'Title too long'),
      reasoning: z.string().min(1, 'Title reasoning is required').max(500, 'Title reasoning too long'),
      clickability_score: z.number().min(0).max(10)
    }),
    payoff: z.object({
      id: z.string(),
      type: z.enum(['unexpected_reveal', 'action_plan', 'transformation_story', 'cliffhanger', 'call_to_action']),
      title: z.string().min(1, 'Payoff title is required').max(100, 'Payoff title too long'),
      description: z.string().min(1, 'Payoff description is required').max(500, 'Payoff description too long'),
      content: z.string().min(1, 'Payoff content is required').max(2000, 'Payoff content too long'),
      reasoning: z.string().min(1, 'Payoff reasoning is required').max(500, 'Payoff reasoning too long')
    }),
    targetAudience: z.string()
      .min(1, 'Target audience is required')
      .max(100, 'Target audience name too long'),
    customInstructions: z.string().max(1000, 'Custom instructions too long').optional()
  })
});

// Custom audience schema
export const customAudienceSchema = z.object({
  name: z.string()
    .min(1, 'Audience name is required')
    .max(50, 'Audience name must be 50 characters or less')
    .regex(/^[a-zA-Z0-9\s\-_]+$/, 'Audience name contains invalid characters'),
  description: z.string()
    .max(200, 'Description must be 200 characters or less')
    .optional()
    .transform(val => val?.trim() || undefined)
});

// Transcript fetch schema
export const transcriptFetchSchema = z.object({
  url: youtubeUrlSchema,
  forceRefresh: z.boolean().optional()
});

// User profile update schema
export const userProfileSchema = z.object({
  name: z.string()
    .min(1, 'Name is required')
    .max(100, 'Name too long')
    .optional(),
  email: z.string()
    .email('Invalid email format')
    .optional(),
  preferences: z.object({
    defaultStyle: z.nativeEnum(ScriptStyle).optional(),
    defaultDuration: z.number().min(1).max(60).optional(),
    defaultAudience: z.string().max(100).optional(),
    emailNotifications: z.boolean().optional(),
  }).optional()
});

// File upload schema
export const fileUploadSchema = z.object({
  file: z.any().refine(
    (file) => file instanceof File,
    'Must be a valid file'
  ).refine(
    (file) => file.size <= 10 * 1024 * 1024, // 10MB
    'File size must be less than 10MB'
  ).refine(
    (file) => ['image/jpeg', 'image/png', 'image/webp', 'text/plain', 'application/pdf'].includes(file.type),
    'Invalid file type'
  )
});

// Search and pagination schemas
export const paginationSchema = z.object({
  page: z.number().min(1).default(1),
  limit: z.number().min(1).max(100).default(20),
  sortBy: z.string().optional(),
  sortOrder: z.enum(['asc', 'desc']).default('desc'),
});

export const searchSchema = z.object({
  query: z.string().min(1, 'Search query is required').max(200, 'Search query too long'),
  filters: z.object({
    style: z.nativeEnum(ScriptStyle).optional(),
    audience: z.string().optional(),
    dateFrom: z.string().datetime().optional(),
    dateTo: z.string().datetime().optional(),
  }).optional(),
  ...paginationSchema.shape
});

// Admin schemas
export const adminUserUpdateSchema = z.object({
  userId: z.string().min(1, 'User ID is required'),
  subscriptionTier: z.enum(['FREE', 'PRO', 'BUSINESS', 'ENTERPRISE']).optional(),
  isActive: z.boolean().optional(),
  notes: z.string().max(1000).optional(),
});

// Rate limiting override schema
export const rateLimitOverrideSchema = z.object({
  identifier: z.string().min(1, 'Identifier is required'),
  windowMs: z.number().min(1000).max(24 * 60 * 60 * 1000), // 1 second to 24 hours
  maxRequests: z.number().min(1).max(10000),
  reason: z.string().min(1, 'Reason is required').max(200),
});

// Webhook validation
export const webhookEventSchema = z.object({
  id: z.string(),
  type: z.string(),
  data: z.object({
    object: z.any()
  }),
  created: z.number(),
  livemode: z.boolean(),
});

// Export commonly used types
export type ScriptGenerationInput = z.infer<typeof scriptGenerationSchema>;
export type RemixVariationsInput = z.infer<typeof remixVariationsSchema>;
export type FinalRemixInput = z.infer<typeof finalRemixSchema>;
export type CustomAudienceInput = z.infer<typeof customAudienceSchema>;
export type TranscriptFetchInput = z.infer<typeof transcriptFetchSchema>;
export type UserProfileInput = z.infer<typeof userProfileSchema>;
export type SearchInput = z.infer<typeof searchSchema>;
export type PaginationInput = z.infer<typeof paginationSchema>;

// Validation helper function
export function validateInput<T>(schema: z.ZodSchema<T>, data: unknown): {
  success: true;
  data: T;
} | {
  success: false;
  error: string;
  details: z.ZodError;
} {
  try {
    const result = schema.parse(data);
    return { success: true, data: result };
  } catch (error) {
    if (error instanceof z.ZodError) {
      const firstError = error.errors[0];
      const errorMessage = firstError ? 
        `${firstError.path.join('.')}: ${firstError.message}` : 
        'Validation failed';
      
      return {
        success: false,
        error: errorMessage,
        details: error
      };
    }
    
    return {
      success: false,
      error: 'Unknown validation error',
      details: error as z.ZodError
    };
  }
}