"use client";

import { useState } from "react";
import { toast } from "sonner";
import { ChevronDown, ChevronUp, Copy, FileText, Clock, Globe } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";

import type { Transcript, Video } from "@/lib/types";

interface TranscriptCardProps {
  transcript: Transcript | null;
  video: Video | null;
  className?: string;
}

export function TranscriptCard({ transcript, video, className }: TranscriptCardProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isCopying, setIsCopying] = useState(false);

  const handleCopyTranscript = async () => {
    if (!transcript?.fullText) {
      toast.error("No transcript content to copy");
      return;
    }

    setIsCopying(true);
    
    try {
      await navigator.clipboard.writeText(transcript.fullText);
      toast.success("Transcript copied to clipboard");
    } catch (error) {
      console.error("Failed to copy transcript:", error);
      toast.error("Failed to copy transcript");
    } finally {
      setIsCopying(false);
    }
  };

  const formatDuration = (seconds: number | null): string => {
    if (!seconds) return "Unknown";
    
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const remainingSeconds = seconds % 60;
    
    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
    }
    
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  // Don't render if no transcript
  if (!transcript) {
    return (
      <Card className={className}>
        <CardHeader>
          <div className="flex items-center space-x-2">
            <FileText className="h-5 w-5 text-muted-foreground" />
            <CardTitle className="text-muted-foreground">Transcript</CardTitle>
          </div>
          <CardDescription>
            Import a YouTube video to see its transcript here
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  const segmentCount = transcript.content?.length || 0;
  const wordCount = transcript.fullText?.split(/\s+/).length || 0;

  return (
    <Card className={className}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <FileText className="h-5 w-5" />
            <div>
              <CardTitle>Transcript</CardTitle>
              {video?.title && (
                <CardDescription className="mt-1">
                  {video.title}
                </CardDescription>
              )}
            </div>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={handleCopyTranscript}
            disabled={isCopying}
          >
            <Copy className="mr-2 h-4 w-4" />
            {isCopying ? "Copying..." : "Copy"}
          </Button>
        </div>
        
        {/* Transcript metadata */}
        <div className="flex items-center gap-4 text-sm text-muted-foreground">
          <div className="flex items-center gap-1">
            <Clock className="h-3 w-3" />
            <span>{formatDuration(transcript.duration)}</span>
          </div>
          <div className="flex items-center gap-1">
            <Globe className="h-3 w-3" />
            <span>{transcript.language.toUpperCase()}</span>
          </div>
          <span>{segmentCount} segments</span>
          <span>{wordCount} words</span>
        </div>
      </CardHeader>

      <Collapsible open={isOpen} onOpenChange={setIsOpen}>
        <CardContent className="pt-0">
          <CollapsibleTrigger asChild>
            <Button variant="ghost" className="w-full justify-between p-0 h-auto">
              <span>
                {isOpen ? "Hide transcript" : "Show full transcript"}
              </span>
              {isOpen ? (
                <ChevronUp className="h-4 w-4" />
              ) : (
                <ChevronDown className="h-4 w-4" />
              )}
            </Button>
          </CollapsibleTrigger>
          
          <CollapsibleContent className="mt-4">
            <div className="max-h-96 overflow-y-auto space-y-3">
              {transcript.content && transcript.content.length > 0 ? (
                <div className="space-y-2">
                  {transcript.content.map((segment, index) => (
                    <div
                      key={index}
                      className="group flex gap-3 p-3 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors"
                    >
                      <div className="flex-shrink-0 text-xs text-muted-foreground font-mono min-w-[60px]">
                        {formatDuration(segment.offset)}
                      </div>
                      <div className="text-sm leading-relaxed">
                        {segment.text}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-sm text-muted-foreground bg-muted/30 p-4 rounded-lg">
                  <p className="whitespace-pre-wrap leading-relaxed">
                    {transcript.fullText || "No transcript content available"}
                  </p>
                </div>
              )}
            </div>
          </CollapsibleContent>
        </CardContent>
      </Collapsible>
    </Card>
  );
}