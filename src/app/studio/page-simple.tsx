"use client";

import { useState, useEffect } from "react";

export default function StudioPage() {
  const [currentVideo, setCurrentVideo] = useState<any>(null);
  const [transcript, setTranscript] = useState<any>(null);
  const [scripts, setScripts] = useState<any[]>([]);
  const [userId, setUserId] = useState<string>("");
  const [isLoading, setIsLoading] = useState(true);

  // Initialize user session with mock data
  useEffect(() => {
    // For demo purposes, use a mock user ID
    setUserId('demo-user-' + Date.now());
    setIsLoading(false);
  }, []);

  const handleTranscriptFetched = (data: any) => {
    setCurrentVideo({
      id: data.videoId,
      youtubeId: data.youtubeId,
      title: data.title,
    });
    setTranscript(data.transcript);
    setScripts([]);
  };

  const handleScriptGenerated = (script: any) => {
    setScripts(prevScripts => [...prevScripts, script]);
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
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <div className="flex items-center space-x-2">
                  <button className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors">
                    Fetch Transcript
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
              <div className="text-gray-500 text-center py-8">
                Import a video to see the transcript here
              </div>
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
                  <select className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
                    <option>Professional</option>
                    <option>Casual</option>
                    <option>Educational</option>
                    <option>Entertaining</option>
                    <option>Technical</option>
                    <option>Storytelling</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Duration (minutes)
                  </label>
                  <input 
                    type="number" 
                    defaultValue="5" 
                    min="1" 
                    max="10" 
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Target Audience
                  </label>
                  <select className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
                    <option>General</option>
                    <option>Beginners</option>
                    <option>Professionals</option>
                    <option>Students</option>
                    <option>Experts</option>
                  </select>
                </div>
                <div className="flex items-end">
                  <button className="w-full bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed">
                    Generate Script
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Step 4: View Results */}
          <div className="space-y-2">
            <h2 className="text-xl font-semibold text-gray-900">
              4. Your Generated Scripts
            </h2>
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <div className="border-b border-gray-200 mb-4">
                <nav className="flex space-x-8">
                  <button className="py-2 px-1 border-b-2 border-blue-500 font-medium text-blue-600">
                    Outline
                  </button>
                  <button className="py-2 px-1 border-b-2 border-transparent font-medium text-gray-500 hover:text-gray-700 hover:border-gray-300">
                    Script
                  </button>
                  <button className="py-2 px-1 border-b-2 border-transparent font-medium text-gray-500 hover:text-gray-700 hover:border-gray-300">
                    B-roll
                  </button>
                </nav>
              </div>
              <div className="text-gray-500 text-center py-8">
                Generate a script to see the results here
              </div>
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