/**
 * Fetches YouTube video title from the video page
 * This is a simple scraper that doesn't require API keys
 */
export async function fetchYouTubeTitle(videoId: string): Promise<string> {
  try {
    const response = await fetch(`https://www.youtube.com/watch?v=${videoId}`, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
      }
    });
    
    if (!response.ok) {
      throw new Error('Failed to fetch video page');
    }
    
    const html = await response.text();
    
    // Extract title from the HTML - YouTube uses a specific meta tag
    const titleMatch = html.match(/<meta name="title" content="([^"]+)"/);
    if (titleMatch && titleMatch[1]) {
      // Decode HTML entities
      return titleMatch[1]
        .replace(/&quot;/g, '"')
        .replace(/&#39;/g, "'")
        .replace(/&lt;/g, '<')
        .replace(/&gt;/g, '>')
        .replace(/&amp;/g, '&');
    }
    
    // Fallback: try to extract from page title
    const pageTitleMatch = html.match(/<title>([^<]+) - YouTube<\/title>/);
    if (pageTitleMatch && pageTitleMatch[1]) {
      return pageTitleMatch[1];
    }
    
    throw new Error('Could not extract title');
    
  } catch (error) {
    console.warn(`Failed to fetch YouTube title for ${videoId}:`, error);
    // Return a more descriptive fallback
    return `YouTube Video (ID: ${videoId})`;
  }
}