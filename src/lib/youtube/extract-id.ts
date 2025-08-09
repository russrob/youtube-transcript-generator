/**
 * Extracts YouTube video ID from various YouTube URL formats
 * Supports:
 * - https://www.youtube.com/watch?v=VIDEO_ID
 * - https://youtu.be/VIDEO_ID  
 * - https://www.youtube.com/embed/VIDEO_ID
 * - https://www.youtube.com/v/VIDEO_ID
 * - https://m.youtube.com/watch?v=VIDEO_ID
 */
export function extractVideoId(url: string): string | null {
  if (!url || typeof url !== 'string') {
    return null;
  }

  // Clean up the URL - remove whitespace and convert to lowercase for pattern matching
  const cleanUrl = url.trim();
  
  // Regular expressions for different YouTube URL formats
  const patterns = [
    // Standard watch URLs: youtube.com/watch?v=VIDEO_ID
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/|youtube\.com\/v\/)([a-zA-Z0-9_-]{11})/,
    // Mobile URLs: m.youtube.com/watch?v=VIDEO_ID  
    /(?:m\.youtube\.com\/watch\?v=)([a-zA-Z0-9_-]{11})/,
    // Shorts URLs: youtube.com/shorts/VIDEO_ID
    /(?:youtube\.com\/shorts\/)([a-zA-Z0-9_-]{11})/,
    // YouTube Music URLs: music.youtube.com/watch?v=VIDEO_ID
    /(?:music\.youtube\.com\/watch\?v=)([a-zA-Z0-9_-]{11})/,
  ];

  for (const pattern of patterns) {
    const match = cleanUrl.match(pattern);
    if (match && match[1]) {
      // Validate that the extracted ID is exactly 11 characters (YouTube video ID format)
      const videoId = match[1];
      if (videoId.length === 11) {
        return videoId;
      }
    }
  }

  // If no pattern matches, try to extract from query parameters
  try {
    const urlObj = new URL(cleanUrl);
    const vParam = urlObj.searchParams.get('v');
    if (vParam && vParam.length === 11) {
      return vParam;
    }
  } catch (error) {
    // URL parsing failed, continue to return null
  }

  return null;
}

/**
 * Validates if a string is a valid YouTube video ID
 * YouTube video IDs are exactly 11 characters long and contain only letters, numbers, hyphens, and underscores
 */
export function isValidVideoId(id: string): boolean {
  if (!id || typeof id !== 'string') {
    return false;
  }
  
  // YouTube video IDs are exactly 11 characters
  if (id.length !== 11) {
    return false;
  }
  
  // Valid characters: letters, numbers, hyphens, underscores
  const validPattern = /^[a-zA-Z0-9_-]{11}$/;
  return validPattern.test(id);
}

/**
 * Constructs a standard YouTube watch URL from a video ID
 */
export function constructWatchUrl(videoId: string): string | null {
  if (!isValidVideoId(videoId)) {
    return null;
  }
  
  return `https://www.youtube.com/watch?v=${videoId}`;
}

/**
 * Constructs a YouTube thumbnail URL from a video ID
 */
export function constructThumbnailUrl(videoId: string, quality: 'default' | 'medium' | 'high' | 'standard' | 'maxres' = 'high'): string | null {
  if (!isValidVideoId(videoId)) {
    return null;
  }
  
  const qualityMap = {
    'default': 'default.jpg',
    'medium': 'mqdefault.jpg', 
    'high': 'hqdefault.jpg',
    'standard': 'sddefault.jpg',
    'maxres': 'maxresdefault.jpg'
  };
  
  const filename = qualityMap[quality] || qualityMap.high;
  return `https://img.youtube.com/vi/${videoId}/${filename}`;
}