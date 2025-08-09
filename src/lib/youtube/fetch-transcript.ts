import { YoutubeTranscript } from 'youtube-transcript';
import { extractVideoId, isValidVideoId } from './extract-id';

export interface TranscriptSegment {
  text: string;
  duration: number;
  offset: number;
  lang?: string;
}

export interface TranscriptResult {
  videoId: string;
  segments: TranscriptSegment[];
  language: string;
  totalDuration: number;
  fullText: string;
}

export interface TranscriptError {
  code: 'INVALID_URL' | 'NO_TRANSCRIPT' | 'FETCH_ERROR' | 'PRIVATE_VIDEO' | 'VIDEO_NOT_FOUND';
  message: string;
  videoId?: string;
}

/**
 * Fetches transcript for a YouTube video
 * @param url YouTube video URL or video ID
 * @param language Optional language code (e.g., 'en', 'es', 'fr')
 * @returns Promise with transcript result or error
 */
export async function fetchTranscript(
  url: string, 
  language?: string
): Promise<{ success: true; data: TranscriptResult } | { success: false; error: TranscriptError }> {
  try {
    // Extract video ID from URL
    const videoId = extractVideoId(url) || (isValidVideoId(url) ? url : null);
    
    if (!videoId) {
      return {
        success: false,
        error: {
          code: 'INVALID_URL',
          message: 'Invalid YouTube URL or video ID provided'
        }
      };
    }

    // Fetch transcript using youtube-transcript library
    let transcriptData;
    try {
      if (language) {
        transcriptData = await YoutubeTranscript.fetchTranscript(videoId, { lang: language });
      } else {
        transcriptData = await YoutubeTranscript.fetchTranscript(videoId);
      }
    } catch (fetchError: any) {
      // Handle specific youtube-transcript errors
      const errorMessage = fetchError?.message?.toLowerCase() || '';
      
      if (errorMessage.includes('transcript is disabled') || errorMessage.includes('no transcript')) {
        return {
          success: false,
          error: {
            code: 'NO_TRANSCRIPT',
            message: 'No transcript available for this video',
            videoId
          }
        };
      }
      
      if (errorMessage.includes('private') || errorMessage.includes('unavailable')) {
        return {
          success: false,
          error: {
            code: 'PRIVATE_VIDEO',
            message: 'Video is private or unavailable',
            videoId
          }
        };
      }
      
      if (errorMessage.includes('not found') || errorMessage.includes('does not exist')) {
        return {
          success: false,
          error: {
            code: 'VIDEO_NOT_FOUND',
            message: 'Video not found',
            videoId
          }
        };
      }
      
      return {
        success: false,
        error: {
          code: 'FETCH_ERROR',
          message: `Failed to fetch transcript: ${fetchError.message}`,
          videoId
        }
      };
    }

    // Process and format transcript data
    const segments: TranscriptSegment[] = transcriptData.map((item: any) => ({
      text: item.text || '',
      duration: item.duration || 0,
      offset: item.offset || 0,
      lang: language
    }));

    // Calculate total duration and create full text
    const totalDuration = segments.reduce((max, segment) => 
      Math.max(max, segment.offset + segment.duration), 0
    );
    
    const fullText = segments
      .map(segment => segment.text)
      .join(' ')
      .replace(/\s+/g, ' ')
      .trim();

    return {
      success: true,
      data: {
        videoId,
        segments,
        language: language || 'en',
        totalDuration,
        fullText
      }
    };

  } catch (error: any) {
    return {
      success: false,
      error: {
        code: 'FETCH_ERROR',
        message: `Unexpected error: ${error.message}`
      }
    };
  }
}

/**
 * Gets available transcript languages for a video
 * @param url YouTube video URL or video ID
 * @returns Promise with available language codes
 */
export async function getAvailableLanguages(
  url: string
): Promise<{ success: true; languages: string[] } | { success: false; error: TranscriptError }> {
  try {
    const videoId = extractVideoId(url) || (isValidVideoId(url) ? url : null);
    
    if (!videoId) {
      return {
        success: false,
        error: {
          code: 'INVALID_URL',
          message: 'Invalid YouTube URL or video ID provided'
        }
      };
    }

    // This is a placeholder - youtube-transcript library doesn't expose language detection
    // In a real implementation, you might need to try common languages or use YouTube Data API
    const commonLanguages = ['en', 'es', 'fr', 'de', 'it', 'pt', 'ru', 'ja', 'ko', 'zh'];
    const availableLanguages: string[] = [];
    
    for (const lang of commonLanguages) {
      try {
        await YoutubeTranscript.fetchTranscript(videoId, { lang });
        availableLanguages.push(lang);
      } catch {
        // Language not available, continue
      }
    }
    
    return {
      success: true,
      languages: availableLanguages
    };

  } catch (error: any) {
    return {
      success: false,
      error: {
        code: 'FETCH_ERROR',
        message: `Failed to check available languages: ${error.message}`
      }
    };
  }
}

/**
 * Formats transcript for display with timestamps
 * @param segments Transcript segments
 * @param includeTimestamps Whether to include timestamp markers
 * @returns Formatted transcript string
 */
export function formatTranscript(segments: TranscriptSegment[], includeTimestamps = true): string {
  if (!segments || segments.length === 0) {
    return '';
  }
  
  const formatTime = (seconds: number): string => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };
  
  if (includeTimestamps) {
    return segments
      .map(segment => `[${formatTime(segment.offset)}] ${segment.text}`)
      .join('\n');
  }
  
  return segments
    .map(segment => segment.text)
    .join(' ')
    .replace(/\s+/g, ' ')
    .trim();
}