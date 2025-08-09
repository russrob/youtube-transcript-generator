"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Wand2, Loader2, Settings } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";

import type { ApiResponse, ApiError, Script, ScriptStyle, ScriptGenerateRequest, Video } from "@/lib/types";

interface ScriptFormProps {
  video: Video | null;
  onScriptGenerated?: (script: Script) => void;
  disabled?: boolean;
}

const SCRIPT_STYLES = [
  { value: "PROFESSIONAL", label: "Professional", description: "Formal, business-appropriate tone" },
  { value: "CASUAL", label: "Casual", description: "Conversational, relaxed tone" },
  { value: "EDUCATIONAL", label: "Educational", description: "Clear, instructional approach" },
  { value: "ENTERTAINING", label: "Entertaining", description: "Engaging, fun presentation" },
  { value: "TECHNICAL", label: "Technical", description: "Detailed, precise explanation" },
  { value: "STORYTELLING", label: "Storytelling", description: "Narrative-driven approach" },
];

const DURATION_OPTIONS = [
  { value: 1, label: "1 minute", description: "Quick summary" },
  { value: 2, label: "2 minutes", description: "Brief overview" },
  { value: 3, label: "3 minutes", description: "Standard length" },
  { value: 5, label: "5 minutes", description: "Detailed coverage" },
  { value: 7, label: "7 minutes", description: "Comprehensive" },
  { value: 10, label: "10 minutes", description: "In-depth analysis" },
];

const AUDIENCE_OPTIONS = [
  { value: "general", label: "General Audience", description: "Broad appeal" },
  { value: "professionals", label: "Professionals", description: "Industry experts" },
  { value: "students", label: "Students", description: "Learning-focused" },
  { value: "beginners", label: "Beginners", description: "New to the topic" },
  { value: "enthusiasts", label: "Enthusiasts", description: "Passionate about the subject" },
];

export function ScriptForm({ video, onScriptGenerated, disabled = false }: ScriptFormProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [showAdvanced, setShowAdvanced] = useState(false);
  
  // Form state
  const [style, setStyle] = useState<ScriptStyle>("PROFESSIONAL" as ScriptStyle);
  const [durationMin, setDurationMin] = useState(3);
  const [audience, setAudience] = useState("general");
  const [tone, setTone] = useState("formal");
  const [includeIntro, setIncludeIntro] = useState(true);
  const [includeConclusion, setIncludeConclusion] = useState(true);
  const [keyPoints, setKeyPoints] = useState("");
  const [customInstructions, setCustomInstructions] = useState("");

  const isFormValid = video?.id && style && durationMin && audience;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!video?.id) {
      toast.error("Please import a video first");
      return;
    }

    if (!isFormValid) {
      toast.error("Please fill in all required fields");
      return;
    }

    setIsLoading(true);

    try {
      const requestData: ScriptGenerateRequest = {
        videoId: video.id,
        style,
        durationMin,
        audience,
        options: {
          tone,
          includeIntro,
          includeConclusion,
          ...(keyPoints && { keyPoints: keyPoints.split('\n').filter(point => point.trim()) }),
          ...(customInstructions && { customInstructions }),
        },
      };

      const response = await fetch('/api/script/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestData),
      });

      const data = await response.json();

      if (!response.ok) {
        const error = data as ApiError;
        throw new Error(error.message || error.error || 'Failed to generate script');
      }

      const result = data as ApiResponse<Script>;
      
      toast.success("Script generation started successfully!");
      
      // Notify parent component
      onScriptGenerated?.(result.data);

    } catch (error) {
      console.error('Script generation error:', error);
      
      const errorMessage = error instanceof Error ? error.message : 'Failed to generate script';
      toast.error(errorMessage);
      
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center space-x-2">
          <Wand2 className="h-5 w-5" />
          <CardTitle>Generate Script</CardTitle>
        </div>
        <CardDescription>
          Configure how you want your script to be generated from the transcript
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Style Selection */}
          <div className="space-y-2">
            <Label htmlFor="style">Writing Style *</Label>
            <Select
              value={style}
              onValueChange={(value) => setStyle(value as ScriptStyle)}
              disabled={disabled || isLoading}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select writing style" />
              </SelectTrigger>
              <SelectContent>
                {SCRIPT_STYLES.map((styleOption) => (
                  <SelectItem key={styleOption.value} value={styleOption.value}>
                    <div>
                      <div className="font-medium">{styleOption.label}</div>
                      <div className="text-xs text-muted-foreground">{styleOption.description}</div>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Duration Selection */}
          <div className="space-y-2">
            <Label htmlFor="duration">Target Duration *</Label>
            <Select
              value={durationMin.toString()}
              onValueChange={(value) => setDurationMin(parseInt(value))}
              disabled={disabled || isLoading}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select target duration" />
              </SelectTrigger>
              <SelectContent>
                {DURATION_OPTIONS.map((duration) => (
                  <SelectItem key={duration.value} value={duration.value.toString()}>
                    <div>
                      <div className="font-medium">{duration.label}</div>
                      <div className="text-xs text-muted-foreground">{duration.description}</div>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Audience Selection */}
          <div className="space-y-2">
            <Label htmlFor="audience">Target Audience *</Label>
            <Select
              value={audience}
              onValueChange={setAudience}
              disabled={disabled || isLoading}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select target audience" />
              </SelectTrigger>
              <SelectContent>
                {AUDIENCE_OPTIONS.map((audienceOption) => (
                  <SelectItem key={audienceOption.value} value={audienceOption.value}>
                    <div>
                      <div className="font-medium">{audienceOption.label}</div>
                      <div className="text-xs text-muted-foreground">{audienceOption.description}</div>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Advanced Options */}
          <Collapsible open={showAdvanced} onOpenChange={setShowAdvanced}>
            <CollapsibleTrigger asChild>
              <Button type="button" variant="ghost" className="w-full justify-between">
                <div className="flex items-center gap-2">
                  <Settings className="h-4 w-4" />
                  Advanced Options
                </div>
                <span className="text-xs">{showAdvanced ? "Hide" : "Show"}</span>
              </Button>
            </CollapsibleTrigger>
            
            <CollapsibleContent className="space-y-4 pt-4">
              {/* Tone Selection */}
              <div className="space-y-2">
                <Label htmlFor="tone">Tone</Label>
                <Select
                  value={tone}
                  onValueChange={setTone}
                  disabled={disabled || isLoading}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="formal">Formal</SelectItem>
                    <SelectItem value="casual">Casual</SelectItem>
                    <SelectItem value="enthusiastic">Enthusiastic</SelectItem>
                    <SelectItem value="informative">Informative</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Key Points */}
              <div className="space-y-2">
                <Label htmlFor="keyPoints">Key Points to Emphasize</Label>
                <Textarea
                  id="keyPoints"
                  placeholder="Enter key points (one per line)&#10;• Main concept to highlight&#10;• Important takeaway&#10;• Call to action"
                  value={keyPoints}
                  onChange={(e) => setKeyPoints(e.target.value)}
                  disabled={disabled || isLoading}
                  rows={4}
                />
              </div>

              {/* Custom Instructions */}
              <div className="space-y-2">
                <Label htmlFor="customInstructions">Custom Instructions</Label>
                <Textarea
                  id="customInstructions"
                  placeholder="Any specific requirements or instructions for the script generation..."
                  value={customInstructions}
                  onChange={(e) => setCustomInstructions(e.target.value)}
                  disabled={disabled || isLoading}
                  rows={3}
                />
              </div>
            </CollapsibleContent>
          </Collapsible>

          {/* Submit Button */}
          <Button 
            type="submit" 
            className="w-full" 
            disabled={!isFormValid || disabled || isLoading}
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Generating Script...
              </>
            ) : (
              <>
                <Wand2 className="mr-2 h-4 w-4" />
                Generate Script
              </>
            )}
          </Button>

          {!video && (
            <p className="text-sm text-muted-foreground text-center">
              Please import a video first to generate a script
            </p>
          )}
        </form>
      </CardContent>
    </Card>
  );
}