"use client";

import { useState, useEffect } from "react";
import { useUser } from '@clerk/nextjs';
import { LoadingPage } from '@/components/ui/LoadingSpinner';
import type { Video, Transcript, Script, TranscriptFetchResponse, ScriptStyle } from "@/lib/types";
import type { SubscriptionLimits, Hook, TitleSuggestion, ThumbnailPremise } from "@/lib/subscription/subscription-service";

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
  const [audience, setAudience] = useState("general");
  const [tone, setTone] = useState<'formal' | 'casual' | 'enthusiastic' | 'informative'>('casual');
  const [mode, setMode] = useState<'bullet' | 'word' | 'hybrid'>('hybrid');
  
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
      const response = await fetch('/api/subscription/current');
      const data = await response.json();
      
      if (response.ok && data.success) {
        setSubscription(data.subscription);
        setLimits(data.limits);
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
        audience: audience,
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

      const response = await fetch('/api/script/generate-enhanced', {
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

  if (!isLoaded) {
    return <LoadingPage message="Loading Studio..." />;
  }

  return (
    <>
      
      {/* Studio Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Studio</h1>
              <p className="text-gray-600 mt-1">
                Transform YouTube videos into polished scripts
              </p>
            </div>
            
            {currentVideo && (
              <div className="text-right text-sm text-gray-500">
                <div className="font-medium">{currentVideo.title}</div>
                <div>Video ID: {currentVideo.youtubeId}</div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Error Display */}
      {error && (
        <div className="max-w-7xl mx-auto px-4 pt-4">
          <div className="bg-red-50 border border-red-200 rounded-md p-4">
            <div className="flex">
              <div className="text-red-800">
                <strong>Error:</strong> {error}
              </div>
              <button 
                onClick={() => setError(null)}
                className="ml-auto text-red-600 hover:text-red-800"
              >
                ✕
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto space-y-8">
          
          {/* Step 1: Import Video */}
          <div className="space-y-2">
            <h2 className="text-xl font-semibold text-gray-900">
              1. Import YouTube Video
            </h2>
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    YouTube URL
                  </label>
                  <input 
                    type="url" 
                    placeholder="https://www.youtube.com/watch?v=..." 
                    value={urlInput}
                    onChange={(e) => setUrlInput(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    disabled={isProcessing}
                  />
                </div>
                <div className="flex items-center space-x-2">
                  <button 
                    onClick={handleFetchTranscript}
                    disabled={isProcessing || !urlInput.trim()}
                    className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
                  >
                    {isProcessing ? 'Fetching...' : 'Fetch Transcript'}
                  </button>
                  <span className="text-sm text-gray-500">
                    Extract transcript and video details
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Step 2: Review Transcript */}
          <div className="space-y-2">
            <h2 className="text-xl font-semibold text-gray-900">
              2. Review Transcript
            </h2>
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              {transcript ? (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="font-semibold">{currentVideo?.title}</h3>
                    <button 
                      onClick={() => {
                        const fullText = Array.isArray(transcript.content) 
                          ? transcript.content.map((segment: any) => segment.text).join(' ')
                          : transcript.fullText || '';
                        navigator.clipboard.writeText(fullText);
                      }}
                      className="text-sm text-blue-600 hover:text-blue-800"
                    >
                      📋 Copy Transcript
                    </button>
                  </div>
                  <div className="text-sm text-gray-600">
                    <p><strong>Duration:</strong> {Math.floor((transcript.duration || 0) / 60)}:{((transcript.duration || 0) % 60).toString().padStart(2, '0')} | <strong>Language:</strong> {transcript.language}</p>
                  </div>
                  <div className="bg-gray-50 p-4 rounded-md text-sm leading-relaxed max-h-64 overflow-y-auto">
                    {Array.isArray(transcript.content) ? (
                      transcript.content.slice(0, 10).map((segment: any, index: number) => (
                        <p key={index} className="mb-2">
                          <span className="text-gray-400">[{Math.floor(segment.offset / 60)}:{(segment.offset % 60).toString().padStart(2, '0')}]</span> {segment.text}
                        </p>
                      ))
                    ) : (
                      <p>{transcript.fullText}</p>
                    )}
                    {Array.isArray(transcript.content) && transcript.content.length > 10 && (
                      <p className="text-blue-600 cursor-pointer hover:text-blue-800 mt-3">
                        ▼ Show {transcript.content.length - 10} more segments
                      </p>
                    )}
                  </div>
                </div>
              ) : (
                <div className="text-gray-500 text-center py-8">
                  Import a video to see the transcript here
                </div>
              )}
            </div>
          </div>

          {/* Step 3: Generate Script */}
          <div className="space-y-2">
            <h2 className="text-xl font-semibold text-gray-900">
              3. Generate Script
            </h2>
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Script Style
                  </label>
                  <select 
                    value={scriptStyle} 
                    onChange={(e) => setScriptStyle(e.target.value as ScriptStyle)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    disabled={isProcessing}
                  >
                    <option value="PROFESSIONAL">Professional</option>
                    <option value="CASUAL">Casual</option>
                    <option value="EDUCATIONAL">Educational</option>
                    <option value="ENTERTAINING">Entertaining</option>
                    <option value="TECHNICAL">Technical</option>
                    <option value="STORYTELLING">Storytelling</option>
                    <option value="PERSUASIVE" disabled={!limits?.advancedStyles}>✨ Persuasive {!limits?.advancedStyles ? '(Pro)' : ''}</option>
                    <option value="NARRATIVE" disabled={!limits?.advancedStyles}>✨ Narrative {!limits?.advancedStyles ? '(Pro)' : ''}</option>
                    <option value="ACADEMIC" disabled={!limits?.advancedStyles}>✨ Academic {!limits?.advancedStyles ? '(Pro)' : ''}</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Duration (minutes)
                  </label>
                  <input 
                    type="number" 
                    value={duration}
                    onChange={(e) => setDuration(Number(e.target.value))}
                    min="1" 
                    max="10" 
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    disabled={isProcessing}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Target Audience
                  </label>
                  <select 
                    value={audience}
                    onChange={(e) => setAudience(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    disabled={isProcessing}
                  >
                    <option value="general">General</option>
                    <option value="beginners">Beginners</option>
                    <option value="professionals">Professionals</option>
                    <option value="students">Students</option>
                    <option value="experts">Experts</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Tone
                  </label>
                  <select 
                    value={tone}
                    onChange={(e) => setTone(e.target.value as any)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    disabled={isProcessing}
                  >
                    <option value="casual">Casual</option>
                    <option value="formal">Formal</option>
                    <option value="enthusiastic">Enthusiastic</option>
                    <option value="informative">Informative</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Mode
                  </label>
                  <select 
                    value={mode}
                    onChange={(e) => setMode(e.target.value as any)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    disabled={isProcessing}
                  >
                    <option value="hybrid">Hybrid (Mixed)</option>
                    <option value="word">Word (Flowing)</option>
                    <option value="bullet">Bullet (Punchy)</option>
                  </select>
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
                          <select
                            value={ctaConfig.type}
                            onChange={(e) => setCTAConfig(prev => ({ ...prev, type: e.target.value as any }))}
                            className="w-full px-2 py-1 text-xs border border-gray-300 rounded"
                          >
                            <option value="subscribe">Subscribe</option>
                            <option value="newsletter">Newsletter</option>
                            <option value="free_resource">Free Resource</option>
                            <option value="sponsor">Sponsor</option>
                            <option value="custom">Custom</option>
                          </select>
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
                    <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                      <p className="text-sm text-blue-800">
                        ✨ <strong>Upgrade to Pro</strong> to unlock hook generation, title packs, CTA integration, and advanced script styles!
                      </p>
                    </div>
                  )}
                </div>
              )}
              
              <div className="mt-6 flex justify-end">
                <button 
                  onClick={handleGenerateScript}
                  disabled={isProcessing || !transcript}
                  className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
                >
                  {isProcessing ? 'Generating...' : '🎬 Generate Enhanced Script'}
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
          </div>

          {/* Step 4: View Results */}
          <div className="space-y-2">
            <h2 className="text-xl font-semibold text-gray-900">
              4. Your Generated Scripts
            </h2>
            <div className="bg-white rounded-lg border border-gray-200 p-6">
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
                            <div className="space-y-3">
                              {enhancedResults.hooks.map((hook, idx) => (
                                <div key={hook.id} className="bg-yellow-50 border-l-4 border-yellow-400 p-3 rounded-r">
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
                                <div className="space-y-2">
                                  {enhancedResults.payoutMoments.map((payout, idx) => (
                                    <div key={idx} className="bg-orange-50 border-l-4 border-orange-400 p-2 rounded-r text-sm">
                                      {payout}
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                  
                  {/* Script Content */}
                  {scripts.map((script, index) => (
                    <div key={script.id || index} className="border-b border-gray-100 pb-6 last:border-b-0">
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="font-semibold">{script.title}</h3>
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
                        <p><strong>Style:</strong> {script.style} | <strong>Target Duration:</strong> {script.durationMin} minutes | <strong>Audience:</strong> {script.audience}</p>
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
                <div className="text-gray-500 text-center py-8">
                  Generate a script to see the results here
                </div>
              )}
            </div>
          </div>

          {/* Footer */}
          <div className="text-center text-sm text-gray-500 py-8">
            <p>Built with Next.js, TypeScript, Tailwind CSS, and Supabase</p>
            <p className="mt-1">YouTube Studio - Working with real credentials!</p>
          </div>
        </div>
      </main>
    </>
  );
}