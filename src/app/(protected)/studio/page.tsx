"use client";

import { useState, useEffect } from "react";
import { useUser } from '@clerk/nextjs';
import { LoadingPage } from '@/components/ui/LoadingSpinner';
import type { Video, Transcript, Script, TranscriptFetchResponse, ScriptStyle } from "@/lib/types";
import type { SubscriptionLimits, Hook, TitleSuggestion, ThumbnailPremise } from "@/lib/subscription/subscription-service";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogPanel, DialogTitle } from '@headlessui/react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { RemixVariationsModal, type RemixVariations } from '@/components/ui/remix-variations';
import { TargetAudienceDropdown } from '@/components/ui/target-audience-dropdown';

export default function StudioPage() {
  const { user, isLoaded } = useUser();
  const [currentVideo, setCurrentVideo] = useState<Video | null>(null);
  const [transcript, setTranscript] = useState<Transcript | null>(null);
  const [scripts, setScripts] = useState<Script[]>([]);
  const [urlInput, setUrlInput] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [generationProgress, setGenerationProgress] = useState<number>(0);
  const [generationStatus, setGenerationStatus] = useState<string>("");
  const [subscription, setSubscription] = useState<any>(null);
  const [limits, setLimits] = useState<SubscriptionLimits | null>(null);

  // Form state
  const [scriptStyle, setScriptStyle] = useState<ScriptStyle>("PROFESSIONAL" as ScriptStyle);
  const [duration, setDuration] = useState(5);
  type TargetAudience = "general" | "beginners" | "professionals" | "students" | "experts";
  type Tone = "casual" | "formal" | "enthusiastic" | "informative";
  type Mode = "hybrid" | "word" | "bullet";
  
  const [targetAudience, setTargetAudience] = useState<TargetAudience>("general");
  const [tone, setTone] = useState<Tone>('casual');
  const [mode, setMode] = useState<Mode>('hybrid');
  
  // Enhanced features state
  const [generateHooks, setGenerateHooks] = useState(false);
  const [generateTitlePack, setGenerateTitlePack] = useState(false);
  const [generateThumbnailPremises, setGenerateThumbnailPremises] = useState(false);
  const [ctaConfig, setCTAConfig] = useState<{
    enabled: boolean;
    type: 'free_resource' | 'newsletter' | 'sponsor' | 'subscribe' | 'custom';
    label: string;
    url: string;
  }>({ enabled: false, type: 'subscribe', label: 'Subscribe for more!', url: '' });
  const [relinkConfig, setRelinkConfig] = useState<{
    enabled: boolean;
    url: string;
    title: string;
  }>({ enabled: false, url: '', title: '' });

  // Enhanced results state
  const [enhancedResults, setEnhancedResults] = useState<{
    hooks: Hook[];
    titlePack: TitleSuggestion[];
    thumbnailPremises: ThumbnailPremise[];
    clickConfirmation: string;
    payoutMoments: string[];
  } | null>(null);

  // Remix state management
  const [selectedHook, setSelectedHook] = useState<Hook | null>(null);
  const [selectedPayoutMoments, setSelectedPayoutMoments] = useState<string[]>([]);
  const [remixKeyPoints, setRemixKeyPoints] = useState<string>("");
  const [showRemixModal, setShowRemixModal] = useState(false);
  const [isRemixing, setIsRemixing] = useState(false);
  const [remixProgress, setRemixProgress] = useState(0);
  const [remixStatus, setRemixStatus] = useState<string>("");

  // Enhanced remix variations state
  const [showRemixVariationsModal, setShowRemixVariationsModal] = useState(false);
  const [remixVariations, setRemixVariations] = useState<RemixVariations | null>(null);
  const [isGeneratingVariations, setIsGeneratingVariations] = useState(false);
  const [isGeneratingFinalRemix, setIsGeneratingFinalRemix] = useState(false);

  // Hook suggestions state
  const [hookSuggestions, setHookSuggestions] = useState<any[]>([]);
  const [loadingHooks, setLoadingHooks] = useState(false);

  // Fetch hook suggestions based on current form values
  const fetchHookSuggestions = async () => {
    setLoadingHooks(true);
    
    try {
      const params = new URLSearchParams();
      if (scriptStyle) params.append('style', scriptStyle);
      if (tone) params.append('tone', tone);  
      if (targetAudience) params.append('audience', targetAudience);
      params.append('limit', '5');
      
      const response = await fetch(`/api/hooks?${params.toString()}`);
      const data = await response.json();
      
      if (data.success) {
        setHookSuggestions(data.hooks);
      }
    } catch (error) {
      console.error('Failed to fetch hook suggestions:', error);
    } finally {
      setLoadingHooks(false);
    }
  };

  // Fetch hook suggestions when form values change
  useEffect(() => {
    if (scriptStyle && tone && targetAudience) {
      fetchHookSuggestions();
    }
  }, [scriptStyle, tone, targetAudience]);

  // Fetch transcript from YouTube
  const handleFetchTranscript = async () => {
    if (!urlInput.trim()) {
      setError("Please enter a YouTube URL");
      return;
    }

    if (!user?.id) {
      setError("Please sign in to use this feature");
      return;
    }

    setIsProcessing(true);
    setError(null);

    try {
      const response = await fetch('/api/transcript/fetch', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          url: urlInput,
          userId: user.id,
          language: 'en'
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch transcript');
      }

      if (data.success) {
        setCurrentVideo({
          id: data.data.videoId,
          youtubeId: data.data.youtubeId,
          title: data.data.title,
        });
        setTranscript(data.data.transcript);
        setScripts([]);
        
        // Show info if using demo transcript
        if (data.data.transcript.content && data.data.transcript.content.length <= 5) {
          setError("ℹ️ Note: YouTube transcript not available. Using demo transcript for testing the script generation feature.");
        }
      }
    } catch (err: any) {
      setError(err.message || 'Failed to fetch transcript');
    } finally {
      setIsProcessing(false);
    }
  };

  // Load subscription info when user changes
  useEffect(() => {
    if (user?.id) {
      loadSubscriptionInfo();
    }
  }, [user?.id]);

  const loadSubscriptionInfo = async () => {
    if (!user?.id) return;

    try {
      // Check for test mode parameters in URL
      const urlParams = new URLSearchParams(window.location.search);
      const testMode = urlParams.get('test');
      const adminKey = urlParams.get('admin');
      
      let apiUrl = '/api/subscription/current';
      if (testMode === 'premium' && adminKey === 'test123') {
        apiUrl += '?test=premium&admin=test123';
      }
      
      const response = await fetch(apiUrl);
      const data = await response.json();
      
      if (response.ok && data.success) {
        setSubscription(data.subscription);
        setLimits(data.limits);
        
        // Show test mode notification
        if (data.testMode) {
          setError("🧪 Premium Test Mode Active - All premium features enabled for testing");
        }
      }
    } catch (error) {
      console.error('Failed to load subscription info:', error);
    }
  };

  // Generate enhanced script from transcript
  const handleGenerateScript = async () => {
    if (!currentVideo || !transcript) {
      setError("Please fetch a transcript first");
      return;
    }

    setIsProcessing(true);
    setError(null);
    setGenerationProgress(0);
    setGenerationStatus("Initializing AI script generation...");
    setEnhancedResults(null);

    // Simulate progress updates
    const progressInterval = setInterval(() => {
      setGenerationProgress(prev => {
        if (prev >= 90) return prev;
        const increment = Math.random() * 15 + 5; // Random increment between 5-20%
        return Math.min(prev + increment, 90);
      });
    }, 1500) as NodeJS.Timeout;

    // Update status messages
    const statusUpdates = [
      { delay: 0, status: "Initializing AI script generation..." },
      { delay: 2000, status: "Analyzing transcript content..." },
      { delay: 5000, status: "Generating professional script..." },
      { delay: 10000, status: "Applying style and formatting..." },
      { delay: 15000, status: "Finalizing script structure..." }
    ];

    statusUpdates.forEach(({ delay, status }) => {
      setTimeout(() => setGenerationStatus(status), delay);
    });

    try {
      // Use enhanced API endpoint
      const requestBody = {
        videoId: currentVideo.id,
        style: scriptStyle,
        durationMin: duration,
        audience: targetAudience,
        mode: mode,
        tone: tone,
        generateHooks: generateHooks,
        generateTitlePack: generateTitlePack,
        generateThumbnailPremises: generateThumbnailPremises,
        includeIntro: true,
        includeConclusion: true
      };

      // Add CTA if enabled
      if (ctaConfig.enabled) {
        requestBody.cta = {
          type: ctaConfig.type,
          label: ctaConfig.label,
          url: ctaConfig.url || undefined
        };
      }

      // Add relink if enabled
      if (relinkConfig.enabled && relinkConfig.url) {
        requestBody.relink = {
          url: relinkConfig.url,
          title: relinkConfig.title || undefined
        };
      }

      // Check for admin test mode parameters in current URL
      const currentUrl = new URL(window.location.href);
      const testMode = currentUrl.searchParams.get('test');
      const adminKey = currentUrl.searchParams.get('admin');
      
      // Build API URL with test parameters if present
      let apiUrl = '/api/script/generate-enhanced';
      if (testMode && adminKey) {
        const params = new URLSearchParams({ test: testMode, admin: adminKey });
        apiUrl = `${apiUrl}?${params.toString()}`;
      }

      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody)
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to generate script');
      }

      if (data.success) {
        clearInterval(progressInterval);
        setGenerationProgress(100);
        setGenerationStatus("Script generated successfully!");
        setScripts(prevScripts => [...prevScripts, data.data]);
        
        // Store enhanced results
        if (data.data.hooks || data.data.titlePack || data.data.thumbnailPremises) {
          setEnhancedResults({
            hooks: data.data.hooks || [],
            titlePack: data.data.titlePack || [],
            thumbnailPremises: data.data.thumbnailPremises || [],
            clickConfirmation: data.data.clickConfirmation || '',
            payoutMoments: data.data.payoutMoments || []
          });
        }
        
        // Clear progress after a short delay
        setTimeout(() => {
          setGenerationProgress(0);
          setGenerationStatus("");
        }, 2000);
      }
    } catch (err: any) {
      clearInterval(progressInterval);
      setGenerationProgress(0);
      setGenerationStatus("");
      setError(err.message || 'Failed to generate script');
    } finally {
      setIsProcessing(false);
    }
  };

  // Handle remix variations generation
  const handleGenerateRemixVariations = async (targetAudienceValue: string, selectedHookContent?: string, customInstructions?: string) => {
    console.log('🚀 Starting handleGenerateRemixVariations...', {
      targetAudienceValue,
      selectedHookContent,
      customInstructions,
      currentVideoId: currentVideo?.id,
      scriptsCount: scripts.length
    });

    if (!currentVideo?.id) {
      console.error('❌ No video selected for remix variations');
      setError("No video selected for remix variations");
      return;
    }

    // Find a completed script for this video
    const completedScript = scripts.find(script => 
      script.videoId === currentVideo.id && script.status === 'COMPLETED'
    );

    if (!completedScript) {
      setError("No completed script found for this video. Generate a script first.");
      return;
    }

    setIsGeneratingVariations(true);
    setError(null);

    try {
      // Check for admin test mode parameters
      const currentUrl = new URL(window.location.href);
      const testMode = currentUrl.searchParams.get('test');
      const adminKey = currentUrl.searchParams.get('admin');
      
      let apiUrl = '/api/script/remix-variations';
      if (testMode && adminKey) {
        const params = new URLSearchParams({ test: testMode, admin: adminKey });
        apiUrl = `${apiUrl}?${params.toString()}`;
      }

      const requestBody = {
        scriptId: completedScript.id,
        targetAudience: targetAudienceValue,
        selectedHook: selectedHookContent,
        customInstructions
      };

      console.log('📡 Making API call to:', apiUrl);
      console.log('📡 Request body:', requestBody);

      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody)
      });

      console.log('📡 Response status:', response.status);
      console.log('📡 Response ok:', response.ok);

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to generate remix variations');
      }

      if (data.success) {
        setRemixVariations(data.data.variations);
      }
    } catch (err: any) {
      console.error('Remix variations generation error:', err);
      setError(err.message || 'Failed to generate remix variations');
    } finally {
      setIsGeneratingVariations(false);
    }
  };

  // Handle final remix generation with selected variations
  const handleFinalRemixGeneration = async (selections: {
    hook: any;
    title: any;
    payoff: any;
    targetAudience: string;
    customInstructions?: string;
  }) => {
    if (!currentVideo?.id) {
      setError("No video selected for final remix");
      return;
    }

    // Find a completed script for this video
    const completedScript = scripts.find(script => 
      script.videoId === currentVideo.id && script.status === 'COMPLETED'
    );

    if (!completedScript) {
      setError("No completed script found for this video.");
      return;
    }

    setIsGeneratingFinalRemix(true);
    setError(null);

    try {
      // Check for admin test mode parameters
      const currentUrl = new URL(window.location.href);
      const testMode = currentUrl.searchParams.get('test');
      const adminKey = currentUrl.searchParams.get('admin');
      
      let apiUrl = '/api/script/final-remix';
      if (testMode && adminKey) {
        const params = new URLSearchParams({ test: testMode, admin: adminKey });
        apiUrl = `${apiUrl}?${params.toString()}`;
      }

      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          scriptId: completedScript.id,
          selections: {
            hook: selections.hook,
            title: selections.title,
            payoff: selections.payoff,
            targetAudience: selections.targetAudience,
            customInstructions: selections.customInstructions
          }
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to generate final remix');
      }

      if (data.success) {
        // Add the new remix script to the scripts list
        setScripts(prevScripts => [data.data, ...prevScripts]);
        
        // Reset variations state
        setRemixVariations(null);
        setShowRemixVariationsModal(false);
      }
    } catch (err: any) {
      console.error('Final remix generation error:', err);
      setError(err.message || 'Failed to generate final remix');
    } finally {
      setIsGeneratingFinalRemix(false);
    }
  };

  // Handle remix generation
  const handleRemixGeneration = async () => {
    if (!currentVideo?.id) {
      setError("No video selected for remixing");
      return;
    }

    if (!selectedHook && selectedPayoutMoments.length === 0 && !remixKeyPoints.trim()) {
      setError("Please select at least one hook, payout moment, or add key points for remixing");
      return;
    }

    setIsRemixing(true);
    setError(null);
    setRemixProgress(0);
    setRemixStatus("Preparing remix...");

    try {
      // Progress updates
      setRemixProgress(10);
      setRemixStatus("Building remix configuration...");
      // Check for admin test mode parameters in current URL
      const currentUrl = new URL(window.location.href);
      const testMode = currentUrl.searchParams.get('test');
      const adminKey = currentUrl.searchParams.get('admin');
      
      // Build API URL with test parameters if present
      let apiUrl = '/api/script/remix';
      if (testMode && adminKey) {
        const params = new URLSearchParams({ test: testMode, admin: adminKey });
        apiUrl = `${apiUrl}?${params.toString()}`;
      }

      const remixData = {
        videoId: currentVideo.id,
        selectedHook,
        selectedPayoutMoments,
        remixKeyPoints: remixKeyPoints.trim() || undefined,
        // Use current form settings as defaults
        style: scriptStyle,
        durationMin: duration,
        audience: targetAudience,
        tone: tone
      };

      console.log('Remix data being sent:', remixData);

      setRemixProgress(30);
      setRemixStatus("Sending remix request...");

      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(remixData)
      });

      setRemixProgress(60);
      setRemixStatus("AI is generating your remixed script...");

      const data = await response.json();

      if (!response.ok) {
        console.error('Remix API error response:', data);
        throw new Error(data.error || 'Failed to generate remix');
      }

      setRemixProgress(90);
      setRemixStatus("Finalizing your remix...");

      if (data.success) {
        setRemixProgress(100);
        setRemixStatus("Remix completed successfully!");
        
        setScripts(prevScripts => [data.data, ...prevScripts]);
        
        // Small delay to show completion, then close modal
        setTimeout(() => {
          setShowRemixModal(false);
          // Clear selections for next remix
          setSelectedHook(null);
          setSelectedPayoutMoments([]);
          setRemixKeyPoints("");
          setRemixProgress(0);
          setRemixStatus("");
        }, 1000);
      }

    } catch (err: any) {
      console.error('Remix generation error:', err);
      setError(err.message || 'Failed to generate remix');
      setRemixProgress(0);
      setRemixStatus("");
    } finally {
      setIsRemixing(false);
    }
  };

  if (!isLoaded) {
    return <LoadingPage message="Loading Studio..." />;
  }

  return (
    <div className="bg-sketch-bg min-h-screen">
      {/* Studio Header */}
      <div className="bg-white border-b border-sketch-border">
        <div className="max-w-sketch-content mx-auto px-sketch-6 py-sketch-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="font-sketch-serif text-5xl text-sketch-text leading-tight">Studio</h1>
              <p className="text-sketch-body text-sketch-text-muted mt-sketch-2">
                Transform YouTube videos into professional scripts
              </p>
            </div>
            
            {currentVideo && (
              <div className="text-right bg-sketch-surface px-sketch-4 py-sketch-3 rounded-sketch-md">
                <div className="font-semibold text-sketch-text text-sketch-small">{currentVideo.title}</div>
                <div className="text-sketch-small text-sketch-text-muted">ID: {currentVideo.youtubeId}</div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Error Display */}
      {error && (
        <div className="max-w-sketch-content mx-auto px-sketch-6 pt-sketch-6">
          <div className="bg-red-50 border border-red-200 rounded-sketch-md p-sketch-4 shadow-sketch-soft">
            <div className="flex items-start">
              <div className="text-red-800 text-sketch-body">
                <strong>Notice:</strong> {error}
              </div>
              <button 
                onClick={() => setError(null)}
                className="ml-auto text-red-600 hover:text-red-800 transition-colors p-1"
              >
                ✕
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Main Content */}
      <main className="max-w-sketch-content mx-auto px-sketch-6 py-sketch-12">
        <div className="max-w-4xl mx-auto space-y-sketch-12">
          
          {/* Step 1: Import Video */}
          <section className="space-y-sketch-4">
            <div className="space-y-sketch-2">
              <h2 className="text-sketch-h2 font-semibold text-sketch-text tracking-sketch-tight">
                Import YouTube Video
              </h2>
              <p className="text-sketch-body text-sketch-text-muted">
                Paste any YouTube URL to extract the transcript and video details.
              </p>
            </div>
            <div className="bg-white rounded-sketch-md border border-sketch-border p-sketch-8 shadow-sketch-soft">
              <div className="space-y-sketch-6">
                <div>
                  <label className="block text-sketch-body font-medium text-sketch-text mb-sketch-3">
                    YouTube URL
                  </label>
                  <input 
                    type="url" 
                    placeholder="https://www.youtube.com/watch?v=..." 
                    value={urlInput}
                    onChange={(e) => setUrlInput(e.target.value)}
                    className="w-full px-sketch-4 py-sketch-3 border border-sketch-border rounded-sketch-sm bg-white text-sketch-text focus-visible:ring-2 focus-visible:ring-sketch-accent focus-visible:ring-offset-2 focus-visible:outline-none transition-colors"
                    disabled={isProcessing}
                  />
                </div>
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-sketch-4">
                  <button 
                    onClick={handleFetchTranscript}
                    disabled={isProcessing || !urlInput.trim()}
                    className="bg-sketch-accent text-white px-sketch-6 py-sketch-3 rounded-xl hover:bg-sketch-accent-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium shadow-sketch-soft hover:shadow-sketch-card"
                  >
                    {isProcessing ? 'Fetching Transcript...' : 'Import Video'}
                  </button>
                  <span className="text-sketch-small text-sketch-text-muted">
                    Extract transcript and video details automatically
                  </span>
                </div>
              </div>
            </div>
          </section>

          {/* Step 2: Review Transcript */}
          <section className="space-y-sketch-4">
            <div className="space-y-sketch-2">
              <h2 className="text-sketch-h2 font-semibold text-sketch-text tracking-sketch-tight">
                Review Transcript
              </h2>
              <p className="text-sketch-body text-sketch-text-muted">
                Review the extracted transcript before generating your script.
              </p>
            </div>
            <div className="bg-white rounded-sketch-md border border-sketch-border p-sketch-8 shadow-sketch-soft">
              {transcript ? (
                <div className="space-y-sketch-6">
                  <div className="flex items-start justify-between gap-sketch-4">
                    <div className="flex-1">
                      <h3 className="font-semibold text-sketch-text text-sketch-body">{currentVideo?.title}</h3>
                      <p className="text-sketch-small text-sketch-text-muted mt-sketch-1">
                        Duration: {Math.floor((transcript.duration || 0) / 60)}:{((transcript.duration || 0) % 60).toString().padStart(2, '0')} • Language: {transcript.language}
                      </p>
                    </div>
                    <button 
                      onClick={() => {
                        const fullText = Array.isArray(transcript.content) 
                          ? transcript.content.map((segment: any) => segment.text).join(' ')
                          : transcript.fullText || '';
                        navigator.clipboard.writeText(fullText);
                      }}
                      className="text-sketch-small text-sketch-link hover:text-sketch-text transition-colors font-medium bg-sketch-surface px-sketch-3 py-sketch-2 rounded-sketch-sm hover:bg-gray-200"
                    >
                      Copy Transcript
                    </button>
                  </div>
                  <div className="bg-sketch-surface p-sketch-6 rounded-sketch-md text-sketch-small leading-relaxed max-h-64 overflow-y-auto border border-sketch-border">
                    {Array.isArray(transcript.content) ? (
                      transcript.content.slice(0, 10).map((segment: any, index: number) => (
                        <p key={index} className="mb-sketch-3 text-sketch-text">
                          <span className="text-sketch-text-muted font-mono text-xs">[{Math.floor(segment.offset / 60)}:{(segment.offset % 60).toString().padStart(2, '0')}]</span> {segment.text}
                        </p>
                      ))
                    ) : (
                      <p className="text-sketch-text">{transcript.fullText}</p>
                    )}
                    {Array.isArray(transcript.content) && transcript.content.length > 10 && (
                      <p className="text-sketch-link cursor-pointer hover:text-sketch-text mt-sketch-4 font-medium">
                        ▼ Show {transcript.content.length - 10} more segments
                      </p>
                    )}
                  </div>
                </div>
              ) : (
                <div className="text-sketch-text-muted text-center py-sketch-12 bg-sketch-surface rounded-sketch-md">
                  <p className="text-sketch-body">Import a video to see the transcript here</p>
                </div>
              )}
            </div>
          </section>

          {/* Step 3: Generate Script */}
          <section className="space-y-sketch-4">
            <div className="space-y-sketch-2">
              <h2 className="text-sketch-h2 font-semibold text-sketch-text tracking-sketch-tight">
                Generate Professional Script
              </h2>
              <p className="text-sketch-body text-sketch-text-muted">
                Configure your script settings and generate a professional version with AI.
              </p>
            </div>
            <div className="bg-white rounded-sketch-md border border-sketch-border p-sketch-8 shadow-sketch-soft">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <div>
                  <label className="block text-sketch-body font-medium text-sketch-text mb-sketch-3">
                    Script Style
                  </label>
                  <Select value={scriptStyle} onValueChange={(value) => setScriptStyle(value as ScriptStyle)} disabled={isProcessing}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select script style" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="PROFESSIONAL">Professional</SelectItem>
                      <SelectItem value="CASUAL">Casual</SelectItem>
                      <SelectItem value="EDUCATIONAL">Educational</SelectItem>
                      <SelectItem value="ENTERTAINING">Entertaining</SelectItem>
                      <SelectItem value="TECHNICAL">Technical</SelectItem>
                      <SelectItem value="STORYTELLING">Storytelling</SelectItem>
                      <SelectItem value="PERSUASIVE" disabled={!limits?.advancedStyles}>✨ Persuasive {!limits?.advancedStyles ? '(Pro)' : ''}</SelectItem>
                      <SelectItem value="NARRATIVE" disabled={!limits?.advancedStyles}>✨ Narrative {!limits?.advancedStyles ? '(Pro)' : ''}</SelectItem>
                      <SelectItem value="ACADEMIC" disabled={!limits?.advancedStyles}>✨ Academic {!limits?.advancedStyles ? '(Pro)' : ''}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="block text-sketch-body font-medium text-sketch-text mb-sketch-3">
                    Duration (minutes)
                  </label>
                  <input 
                    type="number" 
                    value={duration}
                    onChange={(e) => setDuration(Number(e.target.value))}
                    min="1" 
                    max="10" 
                    className="w-full px-sketch-4 py-sketch-3 border border-sketch-border rounded-xl bg-white text-sketch-text focus-visible:ring-2 focus-visible:ring-sketch-accent focus-visible:ring-offset-2 focus-visible:outline-none transition-colors"
                    disabled={isProcessing}
                  />
                </div>
                <div>
                  <label className="block text-sketch-body font-medium text-sketch-text mb-sketch-3">
                    Target Audience
                  </label>
                  <TargetAudienceDropdown
                    value={targetAudience}
                    onValueChange={(value) => setTargetAudience(value as TargetAudience)}
                    disabled={isProcessing}
                  />
                </div>
                <div>
                  <label className="block text-sketch-body font-medium text-sketch-text mb-sketch-3">
                    Tone
                  </label>
                  <Select value={tone} onValueChange={(value) => setTone(value as Tone)} disabled={isProcessing}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select tone" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="casual">Casual</SelectItem>
                      <SelectItem value="formal">Formal</SelectItem>
                      <SelectItem value="enthusiastic">Enthusiastic</SelectItem>
                      <SelectItem value="informative">Informative</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="block text-sketch-body font-medium text-sketch-text mb-sketch-3">
                    Mode
                  </label>
                  <Select value={mode} onValueChange={(value) => setMode(value as Mode)} disabled={isProcessing}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select mode" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="hybrid">Hybrid (Mixed)</SelectItem>
                      <SelectItem value="word">Word (Flowing)</SelectItem>
                      <SelectItem value="bullet">Bullet (Punchy)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              {/* Enhanced Features */}
              {limits && (
                <div className="mt-6 border-t pt-6">
                  <h4 className="text-lg font-medium text-gray-900 mb-4">✨ Enhanced Features</h4>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Hook Generation */}
                    <div className="space-y-3">
                      <label className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          checked={generateHooks}
                          onChange={(e) => setGenerateHooks(e.target.checked)}
                          disabled={!limits.hookGeneration || isProcessing}
                          className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 disabled:opacity-50"
                        />
                        <span className={`text-sm font-medium ${!limits.hookGeneration ? 'text-gray-400' : 'text-gray-900'}`}>
                          Hook Generation {!limits.hookGeneration ? '(Pro Only)' : ''}
                        </span>
                      </label>
                      <p className="text-xs text-gray-500 ml-6">
                        Generate 3-5 different opening hooks to maximize retention
                      </p>
                    </div>

                    {/* Title & Thumbnail Pack */}
                    <div className="space-y-3">
                      <label className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          checked={generateTitlePack}
                          onChange={(e) => {
                            setGenerateTitlePack(e.target.checked);
                            setGenerateThumbnailPremises(e.target.checked);
                          }}
                          disabled={!limits.titleAndThumbnailPack || isProcessing}
                          className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 disabled:opacity-50"
                        />
                        <span className={`text-sm font-medium ${!limits.titleAndThumbnailPack ? 'text-gray-400' : 'text-gray-900'}`}>
                          Title & Thumbnail Pack {!limits.titleAndThumbnailPack ? '(Pro Only)' : ''}
                        </span>
                      </label>
                      <p className="text-xs text-gray-500 ml-6">
                        Get 5 titles and 3 thumbnail concepts for maximum clicks
                      </p>
                    </div>

                    {/* CTA Integration */}
                    <div className="space-y-3">
                      <label className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          checked={ctaConfig.enabled}
                          onChange={(e) => setCTAConfig(prev => ({ ...prev, enabled: e.target.checked }))}
                          disabled={!limits.ctaIntegration || isProcessing}
                          className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 disabled:opacity-50"
                        />
                        <span className={`text-sm font-medium ${!limits.ctaIntegration ? 'text-gray-400' : 'text-gray-900'}`}>
                          CTA Integration {!limits.ctaIntegration ? '(Pro Only)' : ''}
                        </span>
                      </label>
                      {ctaConfig.enabled && limits.ctaIntegration && (
                        <div className="ml-6 space-y-2">
                          <Select value={ctaConfig.type} onValueChange={(value) => setCTAConfig(prev => ({ ...prev, type: value as any }))}>
                            <SelectTrigger className="w-full px-2 py-1 text-xs border border-gray-300 rounded">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="subscribe">Subscribe</SelectItem>
                              <SelectItem value="newsletter">Newsletter</SelectItem>
                              <SelectItem value="free_resource">Free Resource</SelectItem>
                              <SelectItem value="sponsor">Sponsor</SelectItem>
                              <SelectItem value="custom">Custom</SelectItem>
                            </SelectContent>
                          </Select>
                          <input
                            type="text"
                            placeholder="CTA Label"
                            value={ctaConfig.label}
                            onChange={(e) => setCTAConfig(prev => ({ ...prev, label: e.target.value }))}
                            className="w-full px-2 py-1 text-xs border border-gray-300 rounded"
                          />
                          {ctaConfig.type !== 'subscribe' && (
                            <input
                              type="url"
                              placeholder="URL (optional)"
                              value={ctaConfig.url}
                              onChange={(e) => setCTAConfig(prev => ({ ...prev, url: e.target.value }))}
                              className="w-full px-2 py-1 text-xs border border-gray-300 rounded"
                            />
                          )}
                        </div>
                      )}
                    </div>

                    {/* Relink Outros */}
                    <div className="space-y-3">
                      <label className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          checked={relinkConfig.enabled}
                          onChange={(e) => setRelinkConfig(prev => ({ ...prev, enabled: e.target.checked }))}
                          disabled={!limits.relinkOutros || isProcessing}
                          className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 disabled:opacity-50"
                        />
                        <span className={`text-sm font-medium ${!limits.relinkOutros ? 'text-gray-400' : 'text-gray-900'}`}>
                          Relink Outros {!limits.relinkOutros ? '(Pro Only)' : ''}
                        </span>
                      </label>
                      {relinkConfig.enabled && limits.relinkOutros && (
                        <div className="ml-6 space-y-2">
                          <input
                            type="url"
                            placeholder="Next video URL"
                            value={relinkConfig.url}
                            onChange={(e) => setRelinkConfig(prev => ({ ...prev, url: e.target.value }))}
                            className="w-full px-2 py-1 text-xs border border-gray-300 rounded"
                          />
                          <input
                            type="text"
                            placeholder="Video title (optional)"
                            value={relinkConfig.title}
                            onChange={(e) => setRelinkConfig(prev => ({ ...prev, title: e.target.value }))}
                            className="w-full px-2 py-1 text-xs border border-gray-300 rounded"
                          />
                        </div>
                      )}
                    </div>
                  </div>
                  
                  {!limits.hookGeneration && (
                    <div className="mt-sketch-6 p-sketch-4 bg-sketch-accent/10 border border-sketch-accent/20 rounded-sketch-md">
                      <p className="text-sketch-small text-sketch-text">
                        <strong>Upgrade to Pro</strong> to unlock hook generation, title packs, CTA integration, and advanced script styles!
                      </p>
                    </div>
                  )}
                </div>
              )}

              {/* Hook Suggestions */}
              {hookSuggestions.length > 0 && (
                <div className="mt-6 border-t pt-6">
                  <h4 className="text-lg font-medium text-gray-900 mb-4">💡 Hook Suggestions</h4>
                  <div className="space-y-3">
                    {loadingHooks ? (
                      <div className="flex items-center space-x-2 text-gray-500">
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                        <span>Loading hook suggestions...</span>
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 gap-3">
                        {hookSuggestions.map((hook, index) => (
                          <div key={hook.id} className="p-4 border border-gray-200 rounded-lg hover:border-blue-300 transition-colors bg-blue-50/50">
                            <div className="flex justify-between items-start">
                              <div className="flex-1">
                                <p className="text-sm font-medium text-gray-900 mb-1">
                                  {hook.hook}
                                </p>
                                <div className="flex flex-wrap gap-1">
                                  {hook.styles.map((style: string) => (
                                    <span key={style} className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                                      {style}
                                    </span>
                                  ))}
                                  {hook.tones.map((tone: string) => (
                                    <span key={tone} className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">
                                      {tone}
                                    </span>
                                  ))}
                                </div>
                              </div>
                              <button
                                onClick={() => navigator.clipboard.writeText(hook.hook)}
                                className="ml-2 p-1 text-gray-400 hover:text-blue-600 transition-colors"
                                title="Copy hook"
                              >
                                📋
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                  <p className="text-xs text-gray-500 mt-3">
                    These hooks are generated based on your selected style, tone, and audience. Click 📋 to copy.
                  </p>
                </div>
              )}
              
              <div className="mt-sketch-8 flex justify-end">
                <button 
                  onClick={handleGenerateScript}
                  disabled={isProcessing || !transcript}
                  className="bg-sketch-accent text-white px-sketch-8 py-sketch-4 rounded-xl hover:bg-sketch-accent-600 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed font-semibold shadow-sketch-soft hover:shadow-sketch-card hover:-translate-y-0.5"
                >
                  {isProcessing ? 'Generating Script...' : 'Generate Professional Script'}
                </button>
              </div>
              
              {/* Progress Bar */}
              {isProcessing && (
                <div className="mt-4 space-y-2">
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-gray-600">{generationStatus}</span>
                    <span className="text-blue-600 font-medium">{Math.round(generationProgress)}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-blue-600 h-2 rounded-full transition-all duration-500 ease-out"
                      style={{ width: `${generationProgress}%` }}
                    ></div>
                  </div>
                  <div className="text-xs text-gray-500 text-center">
                    AI script generation typically takes 15-20 seconds
                  </div>
                </div>
              )}
            </div>
          </section>

          {/* Step 4: View Results */}
          <section className="space-y-sketch-4">
            <div className="space-y-sketch-2">
              <h2 className="text-sketch-h2 font-semibold text-sketch-text tracking-sketch-tight">
                Your Generated Scripts
              </h2>
              <p className="text-sketch-body text-sketch-text-muted">
                View, copy, and download your AI-generated professional scripts.
              </p>
            </div>
            <div className="bg-white rounded-sketch-md border border-sketch-border p-sketch-8 shadow-sketch-soft">
              {scripts.length > 0 ? (
                <div className="space-y-8">
                  {/* Enhanced Results Display */}
                  {enhancedResults && (
                    <div className="border-b border-gray-200 pb-6">
                      <h3 className="text-lg font-semibold text-gray-900 mb-4">✨ Enhanced Content Pack</h3>
                      
                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {/* Hooks */}
                        {enhancedResults.hooks.length > 0 && (
                          <div>
                            <h4 className="font-medium text-gray-900 mb-3">📢 Hook Variations ({enhancedResults.hooks.length})</h4>
                            {limits?.scriptRemixing && (
                              <p className="text-sm text-gray-600 mb-3">Select a hook for remixing:</p>
                            )}
                            <div className="space-y-3">
                              {enhancedResults.hooks.map((hook, idx) => (
                                <div key={hook.id} className={`bg-yellow-50 border-l-4 border-yellow-400 p-3 rounded-r relative ${
                                  limits?.scriptRemixing ? 'hover:bg-yellow-100 cursor-pointer' : ''
                                } ${
                                  selectedHook?.id === hook.id ? 'ring-2 ring-blue-500 bg-blue-50' : ''
                                }`}
                                onClick={() => limits?.scriptRemixing && setSelectedHook(hook)}
                                >
                                  {limits?.scriptRemixing && (
                                    <input
                                      type="radio"
                                      name="selectedHook"
                                      value={hook.id}
                                      checked={selectedHook?.id === hook.id}
                                      onChange={() => setSelectedHook(hook)}
                                      className="absolute top-3 right-3"
                                    />
                                  )}
                                  <div className="text-sm font-medium text-yellow-800 uppercase tracking-wide">
                                    {hook.type.replace('_', ' ')}
                                  </div>
                                  <div className="text-gray-900 mt-1 font-medium">{hook.content}</div>
                                  <div className="text-xs text-gray-600 mt-2">{hook.reasoning}</div>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Title Pack */}
                        {enhancedResults.titlePack.length > 0 && (
                          <div>
                            <h4 className="font-medium text-gray-900 mb-3">📝 Title Pack ({enhancedResults.titlePack.length})</h4>
                            <div className="space-y-3">
                              {enhancedResults.titlePack.map((title, idx) => (
                                <div key={idx} className="bg-blue-50 border-l-4 border-blue-400 p-3 rounded-r">
                                  <div className="flex items-center justify-between">
                                    <div className="text-gray-900 font-medium">{title.title}</div>
                                    <div className="text-blue-600 font-bold text-sm">{title.clickability_score}/10</div>
                                  </div>
                                  <div className="text-xs text-gray-600 mt-2">{title.reasoning}</div>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Thumbnail Premises */}
                        {enhancedResults.thumbnailPremises.length > 0 && (
                          <div className="lg:col-span-2">
                            <h4 className="font-medium text-gray-900 mb-3">🎨 Thumbnail Concepts ({enhancedResults.thumbnailPremises.length})</h4>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                              {enhancedResults.thumbnailPremises.map((thumb, idx) => (
                                <div key={idx} className="bg-purple-50 border border-purple-200 p-4 rounded-lg">
                                  <div className="text-sm font-medium text-purple-800 uppercase tracking-wide">
                                    {thumb.contrast_type.replace('_', ' ')}
                                  </div>
                                  <div className="text-gray-900 font-medium mt-2">{thumb.concept}</div>
                                  <div className="mt-3">
                                    <div className="text-xs text-gray-600 mb-2">Visual Elements:</div>
                                    <div className="flex flex-wrap gap-1">
                                      {thumb.visual_elements.map((element, elemIdx) => (
                                        <span key={elemIdx} className="text-xs bg-white px-2 py-1 rounded-full border">
                                          {element}
                                        </span>
                                      ))}
                                    </div>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Click Confirmation & Payout Moments */}
                        {(enhancedResults.clickConfirmation || enhancedResults.payoutMoments.length > 0) && (
                          <div className="lg:col-span-2">
                            {enhancedResults.clickConfirmation && (
                              <div className="mb-4">
                                <h4 className="font-medium text-gray-900 mb-2">✅ Click Confirmation</h4>
                                <div className="bg-green-50 border-l-4 border-green-400 p-3 rounded-r">
                                  <div className="text-gray-900">{enhancedResults.clickConfirmation}</div>
                                </div>
                              </div>
                            )}
                            
                            {enhancedResults.payoutMoments.length > 0 && (
                              <div>
                                <h4 className="font-medium text-gray-900 mb-2">🎯 Payout Moments ({enhancedResults.payoutMoments.length})</h4>
                                {limits?.scriptRemixing && (
                                  <p className="text-sm text-gray-600 mb-3">Select payout moments to emphasize in remix:</p>
                                )}
                                <div className="space-y-2">
                                  {enhancedResults.payoutMoments.map((payout, idx) => (
                                    <div key={idx} className={`bg-orange-50 border-l-4 border-orange-400 p-2 rounded-r text-sm relative ${
                                      limits?.scriptRemixing ? 'hover:bg-orange-100 cursor-pointer' : ''
                                    } ${
                                      selectedPayoutMoments.includes(payout) ? 'ring-2 ring-blue-500 bg-blue-50' : ''
                                    }`}
                                    onClick={() => {
                                      if (limits?.scriptRemixing) {
                                        if (selectedPayoutMoments.includes(payout)) {
                                          setSelectedPayoutMoments(prev => prev.filter(p => p !== payout));
                                        } else {
                                          setSelectedPayoutMoments(prev => [...prev, payout]);
                                        }
                                      }
                                    }}
                                    >
                                      {limits?.scriptRemixing && (
                                        <input
                                          type="checkbox"
                                          checked={selectedPayoutMoments.includes(payout)}
                                          onChange={(e) => {
                                            if (e.target.checked) {
                                              setSelectedPayoutMoments(prev => [...prev, payout]);
                                            } else {
                                              setSelectedPayoutMoments(prev => prev.filter(p => p !== payout));
                                            }
                                          }}
                                          className="absolute top-2 right-2"
                                        />
                                      )}
                                      {payout}
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                      
                      {/* Remix Buttons */}
                      {limits?.scriptRemixing && (
                        <div className="mt-6 flex justify-center gap-4">
                          <button
                            onClick={() => setShowRemixModal(true)}
                            disabled={!selectedHook && selectedPayoutMoments.length === 0}
                            className="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold rounded-lg shadow-lg hover:from-blue-700 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
                          >
                            🔄 Quick Remix
                          </button>
                          <button
                            onClick={() => setShowRemixVariationsModal(true)}
                            className="px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-semibold rounded-lg shadow-lg hover:from-purple-700 hover:to-pink-700 transition-all duration-200"
                          >
                            🎭 Enhanced Remix (3×3×3)
                          </button>
                        </div>
                      )}
                    </div>
                  )}
                  
                  {/* Script Content */}
                  {scripts.map((script, index) => (
                    <div key={script.id || index} className="border-b border-gray-100 pb-6 last:border-b-0">
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-2">
                          <h3 className="font-semibold">{script.title}</h3>
                          {(script as any).isRemix && (
                            <span className="px-2 py-1 bg-purple-100 text-purple-800 text-xs font-medium rounded-full">
                              🔄 Remix
                            </span>
                          )}
                        </div>
                        <div className="flex space-x-2">
                          <button 
                            onClick={() => navigator.clipboard.writeText(script.content)}
                            className="text-sm text-blue-600 hover:text-blue-800"
                          >
                            📋 Copy
                          </button>
                          <button 
                            onClick={() => {
                              const blob = new Blob([script.content], { type: 'text/markdown' });
                              const url = URL.createObjectURL(blob);
                              const a = document.createElement('a');
                              a.href = url;
                              a.download = `${script.title}.md`;
                              a.click();
                            }}
                            className="text-sm text-blue-600 hover:text-blue-800"
                          >
                            💾 Download
                          </button>
                        </div>
                      </div>
                      <div className="text-sm text-gray-600 mb-4">
                        <p><strong>Style:</strong> {script.style} | <strong>Target Duration:</strong> {script.durationMin} minutes | <strong>Audience:</strong> {targetAudience}</p>
                        {script.status && <p><strong>Status:</strong> {script.status}</p>}
                        {script.aiMetrics && (
                          <p><strong>Generated:</strong> {script.aiMetrics.wordCount} words | {script.aiMetrics.estimatedDuration} min | {script.aiMetrics.sections} sections</p>
                        )}
                      </div>
                      <div className="bg-gray-50 p-4 rounded-md text-sm leading-relaxed max-h-96 overflow-y-auto">
                        <pre className="whitespace-pre-wrap font-sans">{script.content}</pre>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-sketch-text-muted text-center py-sketch-12 bg-sketch-surface rounded-sketch-md">
                  <p className="text-sketch-body">Generate a script to see the results here</p>
                </div>
              )}
            </div>
          </section>

        </div>
      </main>

      {/* Remix Configuration Modal */}
      <Dialog open={showRemixModal} onClose={() => !isRemixing && setShowRemixModal(false)} className="relative z-50">
        <div className="fixed inset-0 bg-black bg-opacity-25" />
        <div className="fixed inset-0 flex items-center justify-center p-4">
          <DialogPanel className="w-full max-w-md rounded-xl bg-white p-6 shadow-lg">
            <DialogTitle className="text-lg font-semibold text-gray-900 mb-4">
              🔄 Generate Script Remix
            </DialogTitle>
            
            {/* Progress Indicator */}
            {isRemixing && (
              <div className="mb-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <div className="space-y-3">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-blue-800 font-medium">{remixStatus || "Initializing remix..."}</span>
                    <span className="text-blue-600">{remixProgress}%</span>
                  </div>
                  <div className="w-full bg-blue-200 rounded-full h-2">
                    <div 
                      className="bg-gradient-to-r from-blue-600 to-purple-600 h-2 rounded-full transition-all duration-300 ease-out"
                      style={{ width: `${remixProgress}%` }}
                    />
                  </div>
                  {remixProgress === 100 && (
                    <div className="text-sm text-green-700 font-medium">
                      ✅ Remix completed successfully!
                    </div>
                  )}
                </div>
              </div>
            )}
            
            <div className="space-y-4">
              {/* Selected Hook Display */}
              {selectedHook && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Selected Hook:</label>
                  <div className="bg-blue-50 border border-blue-200 p-3 rounded-lg">
                    <div className="text-sm font-medium text-blue-800 uppercase">
                      {selectedHook.type.replace('_', ' ')}
                    </div>
                    <div className="text-gray-900 font-medium">{selectedHook.content}</div>
                  </div>
                </div>
              )}

              {/* Selected Payout Moments Display */}
              {selectedPayoutMoments.length > 0 && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Selected Payout Moments ({selectedPayoutMoments.length}):
                  </label>
                  <div className="space-y-2 max-h-32 overflow-y-auto">
                    {selectedPayoutMoments.map((payout, idx) => (
                      <div key={idx} className="bg-orange-50 border border-orange-200 p-2 rounded text-sm">
                        {payout}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Additional Key Points for Remix */}
              <div>
                <label htmlFor="remixKeyPoints" className="block text-sm font-medium text-gray-700 mb-2">
                  Additional Key Points (Optional):
                </label>
                <Textarea
                  id="remixKeyPoints"
                  value={remixKeyPoints}
                  onChange={(e) => setRemixKeyPoints(e.target.value)}
                  placeholder="Add your own key points to emphasize in the remixed script..."
                  rows={4}
                  className="w-full"
                />
              </div>
            </div>

            <div className="mt-6 flex space-x-3">
              <Button
                variant="outline"
                onClick={() => setShowRemixModal(false)}
                disabled={isRemixing}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                onClick={handleRemixGeneration}
                disabled={isRemixing}
                className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
              >
                {isRemixing 
                  ? (remixProgress === 100 ? 'Completing...' : 'Generating...') 
                  : 'Generate Remix'
                }
              </Button>
            </div>
          </DialogPanel>
        </div>
      </Dialog>

      {/* Enhanced Remix Variations Modal */}
      <RemixVariationsModal
        isOpen={showRemixVariationsModal}
        onClose={() => setShowRemixVariationsModal(false)}
        onGenerateVariations={handleGenerateRemixVariations}
        onFinalRemix={handleFinalRemixGeneration}
        variations={remixVariations}
        isGeneratingVariations={isGeneratingVariations}
        isGeneratingFinal={isGeneratingFinalRemix}
        selectedHook={selectedHook?.content}
        currentTargetAudience={targetAudience}
      />
    </div>
  );
}