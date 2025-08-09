"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Play, Youtube, Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";

import type { ApiResponse, ApiError, TranscriptFetchResponse } from "@/lib/types";

interface UrlIngestCardProps {
  onTranscriptFetched?: (data: TranscriptFetchResponse) => void;
  userId?: string;
}

export function UrlIngestCard({ onTranscriptFetched, userId }: UrlIngestCardProps) {
  const [url, setUrl] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const isValidYouTubeUrl = (url: string): boolean => {
    const youtubeRegex = /^(https?:\/\/)?(www\.)?(youtube\.com\/watch\?v=|youtu\.be\/)[a-zA-Z0-9_-]{11}$/;
    return youtubeRegex.test(url);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!url.trim()) {
      toast.error("Please enter a YouTube URL");
      return;
    }

    if (!isValidYouTubeUrl(url)) {
      toast.error("Please enter a valid YouTube URL");
      return;
    }

    if (!userId) {
      toast.error("User session required. Please sign in.");
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch('/api/transcript/fetch', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          url: url.trim(),
          userId,
          language: "en"
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        const error = data as ApiError;
        throw new Error(error.message || error.error || 'Failed to fetch transcript');
      }

      const result = data as ApiResponse<TranscriptFetchResponse>;
      
      toast.success(`Successfully fetched transcript for "${result.data.title}"`);
      
      // Clear the form
      setUrl("");
      
      // Notify parent component
      onTranscriptFetched?.(result.data);

    } catch (error) {
      console.error('Transcript fetch error:', error);
      
      const errorMessage = error instanceof Error ? error.message : 'Failed to fetch transcript';
      toast.error(errorMessage);
      
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <div className="flex items-center space-x-2">
            <Youtube className="h-5 w-5" />
            <CardTitle>Fetching Transcript</CardTitle>
          </div>
          <CardDescription>
            Processing your YouTube video...
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Skeleton className="h-4 w-20" />
            <Skeleton className="h-10 w-full" />
          </div>
          <Skeleton className="h-10 w-full" />
          <div className="flex items-center justify-center p-4">
            <Loader2 className="h-6 w-6 animate-spin" />
            <span className="ml-2">Extracting transcript...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center space-x-2">
          <Youtube className="h-5 w-5" />
          <CardTitle>Import YouTube Video</CardTitle>
        </div>
        <CardDescription>
          Paste a YouTube URL to extract the transcript and generate content
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="youtube-url">YouTube URL</Label>
            <Input
              id="youtube-url"
              type="url"
              placeholder="https://www.youtube.com/watch?v=..."
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              disabled={isLoading}
              className="w-full"
            />
          </div>
          
          <Button 
            type="submit" 
            className="w-full" 
            disabled={isLoading || !url.trim() || !isValidYouTubeUrl(url)}
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Fetching Transcript...
              </>
            ) : (
              <>
                <Play className="mr-2 h-4 w-4" />
                Extract Transcript
              </>
            )}
          </Button>
        </form>
        
        {url && !isValidYouTubeUrl(url) && (
          <p className="text-sm text-destructive mt-2">
            Please enter a valid YouTube URL
          </p>
        )}
      </CardContent>
    </Card>
  );
}