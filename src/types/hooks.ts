export type ScriptStyle =
  | "PROFESSIONAL" | "CASUAL" | "EDUCATIONAL" | "ENTERTAINING" | "TECHNICAL"
  | "STORYTELLING" | "PERSUASIVE" | "NARRATIVE" | "ACADEMIC";

export type Tone = "casual" | "formal" | "enthusiastic" | "informative";

export type Audience = "general" | "beginners" | "professionals" | "students" | "experts";

export interface HookRow {
  id: string;
  hook: string;
  styles: ScriptStyle[];
  tones: Tone[];
  audiences: Audience[];
}

export interface HookFilters {
  style?: ScriptStyle;
  tone?: Tone;  
  audience?: Audience;
  limit?: number;
}