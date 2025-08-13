// API Response Types
export interface ApiResponse<T> {
  success: true;
  data: T;
}

export interface ApiError {
  error: string;
  message: string;
  code?: string;
}

// Data Models
export interface TranscriptSegment {
  text: string;
  duration: number;
  offset: number;
  lang?: string;
}

export interface Transcript {
  id: string;
  content: TranscriptSegment[];
  language: string;
  duration: number | null;
  fullText: string;
}

export interface Video {
  id: string;
  youtubeId: string;
  title: string;
  description?: string;
  duration?: number;
  thumbnailUrl?: string;
  channelName?: string;
  publishedAt?: string;
}

export interface Script {
  id: string;
  title: string;
  content: string;
  style: ScriptStyle;
  durationMin: number;
  audience: string;
  options?: Record<string, any>;
  status: ScriptStatus;
  generatedAt?: string;
  video?: Video;
  aiMetrics?: {
    wordCount: number;
    estimatedDuration: number;
    sections: number;
  };
}

export enum ScriptStyle {
  PROFESSIONAL = "PROFESSIONAL",
  CASUAL = "CASUAL",
  EDUCATIONAL = "EDUCATIONAL",
  ENTERTAINING = "ENTERTAINING",
  TECHNICAL = "TECHNICAL",
  STORYTELLING = "STORYTELLING",
  // Pro-only styles
  PERSUASIVE = "PERSUASIVE",
  NARRATIVE = "NARRATIVE",
  ACADEMIC = "ACADEMIC",
}

export enum ScriptStatus {
  DRAFT = "DRAFT",
  GENERATING = "GENERATING",
  COMPLETED = "COMPLETED",
  ERROR = "ERROR",
}

// API Endpoint Types
export interface TranscriptFetchRequest {
  url: string;
  userId: string;
  language?: string;
}

export interface TranscriptFetchResponse {
  videoId: string;
  youtubeId: string;
  title: string;
  transcript: Transcript;
}

export interface ScriptGenerateRequest {
  videoId: string;
  style: ScriptStyle;
  durationMin: number;
  audience: string;
  options?: {
    tone?: string;
    includeIntro?: boolean;
    includeConclusion?: boolean;
    keyPoints?: string[];
    customInstructions?: string;
  };
}

// UI Component Types
export interface StudioState {
  currentVideo: Video | null;
  transcript: Transcript | null;
  scripts: Script[];
  isLoading: boolean;
  error: string | null;
}