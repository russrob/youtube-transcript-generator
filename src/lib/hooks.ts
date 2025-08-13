import hooks from "@/data/hooks.json";
import { HookRow, HookFilters, ScriptStyle, Tone, Audience } from "@/types/hooks";

/**
 * Filter hooks based on style, tone, audience, and limit
 */
export function getHooks({ style, tone, audience, limit = 20 }: HookFilters): HookRow[] {
  let filteredHooks = hooks as HookRow[];
  
  // Filter by style if provided
  if (style) {
    filteredHooks = filteredHooks.filter(hook => 
      hook.styles.includes(style)
    );
  }
  
  // Filter by tone if provided  
  if (tone) {
    filteredHooks = filteredHooks.filter(hook =>
      hook.tones.includes(tone)
    );
  }
  
  // Filter by audience if provided
  if (audience) {
    filteredHooks = filteredHooks.filter(hook =>
      hook.audiences.includes(audience)
    );
  }
  
  // Apply limit
  return filteredHooks.slice(0, limit);
}

/**
 * Get a random hook matching the filters
 */
export function randomHook(filters: HookFilters = {}): HookRow | null {
  const matchingHooks = getHooks({ ...filters, limit: 9999 });
  
  if (matchingHooks.length === 0) {
    return null;
  }
  
  const randomIndex = Math.floor(Math.random() * matchingHooks.length);
  return matchingHooks[randomIndex];
}

/**
 * Get hook statistics for debugging/monitoring
 */
export function getHookStats() {
  const totalHooks = hooks.length;
  
  // Count by style
  const styleStats: Record<string, number> = {};
  const toneStats: Record<string, number> = {};
  const audienceStats: Record<string, number> = {};
  
  hooks.forEach((hook: HookRow) => {
    hook.styles.forEach(style => {
      styleStats[style] = (styleStats[style] || 0) + 1;
    });
    
    hook.tones.forEach(tone => {
      toneStats[tone] = (toneStats[tone] || 0) + 1;
    });
    
    hook.audiences.forEach(audience => {
      audienceStats[audience] = (audienceStats[audience] || 0) + 1;
    });
  });
  
  return {
    totalHooks,
    styleStats,
    toneStats,
    audienceStats
  };
}

/**
 * Validate hook filters
 */
export function validateHookFilters(filters: HookFilters): { valid: boolean; errors: string[] } {
  const errors: string[] = [];
  
  const validStyles: ScriptStyle[] = [
    "PROFESSIONAL", "CASUAL", "EDUCATIONAL", "ENTERTAINING", "TECHNICAL",
    "STORYTELLING", "PERSUASIVE", "NARRATIVE", "ACADEMIC"
  ];
  
  const validTones: Tone[] = ["casual", "formal", "enthusiastic", "informative"];
  
  const validAudiences: Audience[] = ["general", "beginners", "professionals", "students", "experts"];
  
  if (filters.style && !validStyles.includes(filters.style)) {
    errors.push(`Invalid style: ${filters.style}. Valid options: ${validStyles.join(', ')}`);
  }
  
  if (filters.tone && !validTones.includes(filters.tone)) {
    errors.push(`Invalid tone: ${filters.tone}. Valid options: ${validTones.join(', ')}`);
  }
  
  if (filters.audience && !validAudiences.includes(filters.audience)) {
    errors.push(`Invalid audience: ${filters.audience}. Valid options: ${validAudiences.join(', ')}`);
  }
  
  if (filters.limit && (filters.limit < 1 || filters.limit > 50)) {
    errors.push('Limit must be between 1 and 50');
  }
  
  return {
    valid: errors.length === 0,
    errors
  };
}