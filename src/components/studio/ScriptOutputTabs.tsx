"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Copy, Download, FileText, List, Film, Loader2, CheckCircle, XCircle, Clock } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";

import type { Script, ScriptStatus } from "@/lib/types";

interface ScriptOutputTabsProps {
  scripts: Script[];
  className?: string;
}

export function ScriptOutputTabs({ scripts, className }: ScriptOutputTabsProps) {
  const [copyingStates, setCopyingStates] = useState<Record<string, boolean>>({});

  const handleCopyContent = async (content: string, type: string) => {
    const key = `${type}_${Date.now()}`;
    setCopyingStates(prev => ({ ...prev, [key]: true }));
    
    try {
      await navigator.clipboard.writeText(content);
      toast.success(`${type} copied to clipboard`);
    } catch (error) {
      console.error(`Failed to copy ${type}:`, error);
      toast.error(`Failed to copy ${type}`);
    } finally {
      setCopyingStates(prev => {
        const newState = { ...prev };
        delete newState[key];
        return newState;
      });
    }
  };

  const handleDownloadContent = (content: string, filename: string) => {
    try {
      const blob = new Blob([content], { type: 'text/markdown' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      
      toast.success(`${filename} downloaded`);
    } catch (error) {
      console.error('Download failed:', error);
      toast.error('Download failed');
    }
  };

  const getStatusIcon = (status: ScriptStatus) => {
    switch (status) {
      case "GENERATING":
        return <Loader2 className="h-4 w-4 animate-spin text-blue-500" />;
      case "COMPLETED":
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case "ERROR":
        return <XCircle className="h-4 w-4 text-red-500" />;
      default:
        return <Clock className="h-4 w-4 text-gray-500" />;
    }
  };

  const getStatusText = (status: ScriptStatus) => {
    switch (status) {
      case "GENERATING":
        return "Generating...";
      case "COMPLETED":
        return "Ready";
      case "ERROR":
        return "Failed";
      default:
        return "Draft";
    }
  };

  const generateOutline = (content: string): string => {
    // Simple outline generation by extracting headers and key sections
    const lines = content.split('\n');
    const outline: string[] = [];
    
    lines.forEach((line, index) => {
      const trimmed = line.trim();
      
      // Look for section markers, numbered lists, or paragraph starts
      if (trimmed.match(/^#{1,3}\s+/)) {
        outline.push(trimmed);
      } else if (trimmed.match(/^\d+\.\s+/)) {
        outline.push(`• ${trimmed.substring(trimmed.indexOf(' ') + 1)}`);
      } else if (trimmed.length > 50 && trimmed.endsWith('.') && index < lines.length / 3) {
        // Likely an intro or key point
        outline.push(`• ${trimmed.substring(0, 80)}...`);
      }
    });

    if (outline.length === 0) {
      // Fallback: create outline from first sentence of each paragraph
      const paragraphs = content.split('\n\n').filter(p => p.trim().length > 20);
      paragraphs.slice(0, 5).forEach((para, i) => {
        const firstSentence = para.split('.')[0];
        if (firstSentence.length > 10) {
          outline.push(`${i + 1}. ${firstSentence}...`);
        }
      });
    }

    return outline.join('\n') || 'No outline available';
  };

  const generateBRollSuggestions = (content: string): string => {
    // Generate B-roll suggestions based on content analysis
    const suggestions: string[] = [
      "# B-Roll Video Suggestions\n",
      "## Visual Elements:",
    ];

    // Look for key terms that suggest visual content
    const visualKeywords = [
      'show', 'demonstrate', 'example', 'process', 'step', 'method',
      'technique', 'tool', 'interface', 'screen', 'graph', 'chart'
    ];

    const contentLower = content.toLowerCase();
    const foundKeywords = visualKeywords.filter(keyword => 
      contentLower.includes(keyword)
    );

    foundKeywords.forEach((keyword, index) => {
      suggestions.push(`${index + 1}. Close-up shots of ${keyword} in action`);
    });

    suggestions.push(
      "\n## Additional B-Roll Ideas:",
      "• Wide establishing shots of workspace/environment",
      "• Close-up detail shots of key elements mentioned",
      "• Transition shots between different sections",
      "• Graphics/animations to illustrate complex concepts",
      "• Product/tool demonstrations if applicable",
      "• Behind-the-scenes process footage"
    );

    return suggestions.join('\n');
  };

  // Don't render if no scripts
  if (!scripts || scripts.length === 0) {
    return (
      <Card className={className}>
        <CardHeader>
          <div className="flex items-center space-x-2">
            <FileText className="h-5 w-5 text-muted-foreground" />
            <CardTitle className="text-muted-foreground">Generated Scripts</CardTitle>
          </div>
          <CardDescription>
            Your generated scripts will appear here
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  // Get the most recent script
  const latestScript = scripts[scripts.length - 1];

  if (latestScript.status === "GENERATING") {
    return (
      <Card className={className}>
        <CardHeader>
          <div className="flex items-center space-x-2">
            <Loader2 className="h-5 w-5 animate-spin" />
            <CardTitle>Generating Script</CardTitle>
          </div>
          <CardDescription>
            AI is creating your script... This may take a minute.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-4 w-1/2" />
          </div>
          <div className="space-y-2">
            <Skeleton className="h-20 w-full" />
            <Skeleton className="h-20 w-full" />
            <Skeleton className="h-20 w-full" />
          </div>
        </CardContent>
      </Card>
    );
  }

  if (latestScript.status === "ERROR") {
    return (
      <Card className={className}>
        <CardHeader>
          <div className="flex items-center space-x-2">
            <XCircle className="h-5 w-5 text-red-500" />
            <CardTitle>Script Generation Failed</CardTitle>
          </div>
          <CardDescription>
            There was an error generating your script. Please try again.
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  const outline = generateOutline(latestScript.content);
  const brollSuggestions = generateBRollSuggestions(latestScript.content);

  return (
    <Card className={className}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <FileText className="h-5 w-5" />
            <div>
              <CardTitle>{latestScript.title}</CardTitle>
              <CardDescription className="flex items-center gap-2 mt-1">
                {getStatusIcon(latestScript.status)}
                <span>{getStatusText(latestScript.status)}</span>
                <span>•</span>
                <span>{latestScript.style}</span>
                <span>•</span>
                <span>{latestScript.durationMin} min target</span>
                <span>•</span>
                <span>{latestScript.audience}</span>
              </CardDescription>
            </div>
          </div>
          
          {latestScript.aiMetrics && (
            <div className="text-sm text-muted-foreground text-right">
              <div>{latestScript.aiMetrics.wordCount} words</div>
              <div>~{latestScript.aiMetrics.estimatedDuration?.toFixed(1)} min read</div>
            </div>
          )}
        </div>
      </CardHeader>

      <CardContent>
        <Tabs defaultValue="script" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="outline" className="flex items-center gap-2">
              <List className="h-4 w-4" />
              Outline
            </TabsTrigger>
            <TabsTrigger value="script" className="flex items-center gap-2">
              <FileText className="h-4 w-4" />
              Script
            </TabsTrigger>
            <TabsTrigger value="broll" className="flex items-center gap-2">
              <Film className="h-4 w-4" />
              B-roll
            </TabsTrigger>
          </TabsList>

          <TabsContent value="outline" className="mt-4">
            <div className="space-y-4">
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleCopyContent(outline, "Outline")}
                  disabled={Object.keys(copyingStates).length > 0}
                >
                  <Copy className="mr-2 h-4 w-4" />
                  Copy Outline
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleDownloadContent(outline, `${latestScript.title} - Outline.md`)}
                >
                  <Download className="mr-2 h-4 w-4" />
                  Download MD
                </Button>
              </div>
              
              <div className="prose prose-sm max-w-none">
                <pre className="whitespace-pre-wrap text-sm bg-muted p-4 rounded-lg">
                  {outline}
                </pre>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="script" className="mt-4">
            <div className="space-y-4">
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleCopyContent(latestScript.content, "Script")}
                  disabled={Object.keys(copyingStates).length > 0}
                >
                  <Copy className="mr-2 h-4 w-4" />
                  Copy Script
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleDownloadContent(latestScript.content, `${latestScript.title} - Script.md`)}
                >
                  <Download className="mr-2 h-4 w-4" />
                  Download MD
                </Button>
              </div>
              
              <div className="prose prose-sm max-w-none">
                <div className="text-sm leading-relaxed bg-muted/30 p-6 rounded-lg">
                  <div className="whitespace-pre-wrap">
                    {latestScript.content}
                  </div>
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="broll" className="mt-4">
            <div className="space-y-4">
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleCopyContent(brollSuggestions, "B-roll Suggestions")}
                  disabled={Object.keys(copyingStates).length > 0}
                >
                  <Copy className="mr-2 h-4 w-4" />
                  Copy B-roll
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleDownloadContent(brollSuggestions, `${latestScript.title} - B-roll.md`)}
                >
                  <Download className="mr-2 h-4 w-4" />
                  Download MD
                </Button>
              </div>
              
              <div className="prose prose-sm max-w-none">
                <pre className="whitespace-pre-wrap text-sm bg-muted p-4 rounded-lg">
                  {brollSuggestions}
                </pre>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}