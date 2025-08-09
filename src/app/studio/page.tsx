"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/auth";
import type { Video, Transcript, Script, TranscriptFetchResponse, ScriptStyle } from "@/lib/types";

export default function StudioPage() {
  const [currentVideo, setCurrentVideo] = useState<Video | null>(null);
  const [transcript, setTranscript] = useState<Transcript | null>(null);
  const [scripts, setScripts] = useState<Script[]>([]);
  const [userId, setUserId] = useState<string>("");
  const [isLoading, setIsLoading] = useState(true);
  const [urlInput, setUrlInput] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [generationProgress, setGenerationProgress] = useState<number>(0);
  const [generationStatus, setGenerationStatus] = useState<string>("");

  // Form state
  const [scriptStyle, setScriptStyle] = useState<ScriptStyle>("PROFESSIONAL" as ScriptStyle);
  const [duration, setDuration] = useState(5);
  const [audience, setAudience] = useState("general");

  // Initialize user session with Supabase auth
  useEffect(() => {
    async function initializeAuth() {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        
        if (session?.user) {
          setUserId(session.user.id);
        } else {
          // Use anonymous auth for demo
          const { data, error } = await supabase.auth.signInAnonymously();
          if (data.user) {
            setUserId(data.user.id);
          } else if (error) {
            console.error('Authentication error:', error.message);
            // Fallback to demo user
            setUserId('demo-user-' + Date.now());
          }
        }
      } catch (error) {
        console.error('Session initialization error:', error);
        // Fallback to demo user
        setUserId('demo-user-' + Date.now());
      } finally {
        setIsLoading(false);
      }
    }

    initializeAuth();
  }, []);

  // Fetch transcript from YouTube
  const handleFetchTranscript = async () => {
    if (!urlInput.trim()) {
      setError("Please enter a YouTube URL");
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
          userId: userId,
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

  // Generate script from transcript
  const handleGenerateScript = async () => {
    if (!currentVideo || !transcript) {
      setError("Please fetch a transcript first");
      return;
    }

    setIsProcessing(true);
    setError(null);
    setGenerationProgress(0);
    setGenerationStatus("Initializing AI script generation...");

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
      const response = await fetch('/api/script/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          videoId: currentVideo.id,
          style: scriptStyle,
          durationMin: duration,
          audience: audience,
          options: {
            includeIntro: true,
            includeConclusion: true
          }
        })
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

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
          <p className="mt-4 text-gray-600">Initializing Studio...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200">
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
      </header>

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
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                <div className="flex items-end">
                  <button 
                    onClick={handleGenerateScript}
                    disabled={isProcessing || !transcript}
                    className="w-full bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
                  >
                    {isProcessing ? 'Generating...' : 'Generate Script'}
                  </button>
                </div>
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
                <div className="space-y-6">
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
    </div>
  );
}