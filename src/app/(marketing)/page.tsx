import Link from 'next/link';

export default function Home() {
  return (
    <div className="min-h-screen bg-sketch-bg">
      {/* Hero Section - Authentic Sketch Style */}
      <section className="relative py-24 px-6">
        <div className="max-w-6xl mx-auto">
          {/* Main Hero Content */}
          <div className="text-center mb-20">
            <h1 className="font-sketch-serif text-6xl md:text-7xl lg:text-8xl text-sketch-text mb-8 leading-none">
              Transform YouTube into
              <br />
              Professional Scripts
            </h1>
            <p className="text-xl text-sketch-text-muted mb-12 max-w-2xl mx-auto leading-relaxed">
              AI-powered script generation that turns any YouTube video into 
              engaging, professional content in seconds.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16">
              <Link href="/sign-up" className="inline-flex items-center justify-center px-8 py-4 bg-sketch-accent text-white rounded-xl font-medium hover:bg-sketch-accent-600 transition-all duration-200 text-lg">
                Get started for free
              </Link>
            </div>
            
            <p className="text-sketch-text-muted text-sm">
              No credit card required • Generate 2 free scripts
            </p>
          </div>
        </div>
      </section>

      {/* Product Showcase Section */}
      <section className="py-20 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center mb-20">
            {/* Left Side - Content */}
            <div>
              <div className="inline-flex items-center px-4 py-2 rounded-full bg-orange-100 text-orange-800 text-sm font-medium mb-6">
                NEW
              </div>
              <h2 className="font-sketch-serif text-5xl text-sketch-text mb-6 leading-tight">
                AI-powered script generation
              </h2>
              <p className="text-lg text-sketch-text-muted mb-8 leading-relaxed">
                Transform any YouTube video into professional scripts with our advanced AI. 
                Perfect for content creators, marketers, and educators.
              </p>
              <div className="space-y-4">
                <div className="flex items-center space-x-3">
                  <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center">
                    <svg className="w-4 h-4 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <span className="text-sketch-text">Instant script generation</span>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center">
                    <svg className="w-4 h-4 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <span className="text-sketch-text">Multiple script formats</span>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center">
                    <svg className="w-4 h-4 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <span className="text-sketch-text">Professional quality output</span>
                </div>
              </div>
            </div>
            
            {/* Right Side - Product Screenshot Mockup */}
            <div className="lg:pl-8">
              <div className="bg-gradient-to-br from-blue-50 to-indigo-100 rounded-3xl p-8 relative overflow-hidden">
                <div className="bg-white rounded-xl shadow-lg p-6">
                  <div className="flex items-center space-x-3 mb-4">
                    <div className="w-3 h-3 bg-red-400 rounded-full"></div>
                    <div className="w-3 h-3 bg-yellow-400 rounded-full"></div>
                    <div className="w-3 h-3 bg-green-400 rounded-full"></div>
                    <span className="text-xs text-gray-500 ml-2">ScriptForge AI - Studio</span>
                  </div>
                  <div className="space-y-4">
                    <div className="flex items-center space-x-2 p-3 bg-gray-50 rounded-lg">
                      <div className="w-4 h-4 bg-red-500 rounded"></div>
                      <span className="text-sm text-gray-600">YouTube URL Input</span>
                    </div>
                    <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                    <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                    <div className="h-8 bg-blue-100 rounded flex items-center px-3">
                      <span className="text-xs text-blue-800">🤖 AI Generating Script...</span>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="h-16 bg-green-50 rounded flex items-center justify-center">
                        <span className="text-xs text-green-700">✓ Script Ready</span>
                      </div>
                      <div className="h-16 bg-purple-50 rounded flex items-center justify-center">
                        <span className="text-xs text-purple-700">📄 Export</span>
                      </div>
                    </div>
                  </div>
                </div>
                {/* Floating elements */}
                <div className="absolute top-4 right-4 bg-white/80 rounded-lg p-2 shadow-sm">
                  <span className="text-xs text-gray-600">⚡ 30s</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonial Section */}
      <section className="py-20 px-6 bg-sketch-surface">
        <div className="max-w-4xl mx-auto">
          <div className="text-center">
            <blockquote className="text-2xl md:text-3xl text-sketch-text mb-8 leading-relaxed font-light">
              "ScriptForge AI has transformed how I create content. 
              What used to take hours now takes minutes, and the quality 
              is consistently professional."
            </blockquote>
            
            <div className="flex items-center justify-center space-x-4">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-400 to-purple-500 rounded-full flex items-center justify-center">
                <span className="text-white font-semibold">MR</span>
              </div>
              <div className="text-left">
                <div className="font-semibold text-sketch-text">Maria Rodriguez</div>
                <div className="text-sketch-text-muted text-sm">Content Creator</div>
              </div>
              <div className="flex items-center space-x-1 ml-8">
                <div className="flex items-center space-x-1">
                  {[1,2,3,4,5].map(i => (
                    <svg key={i} className="w-4 h-4 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Feature Grid - Sketch Style */}
      <section className="py-20 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-16">
            {/* Feature 1 */}
            <div className="bg-gradient-to-br from-pink-50 to-rose-100 rounded-3xl p-8 relative overflow-hidden">
              <div className="relative z-10">
                <div className="inline-flex items-center px-3 py-1 rounded-full bg-pink-200 text-pink-800 text-xs font-medium mb-4">
                  OFFLINE
                </div>
                <h3 className="font-sketch-serif text-3xl text-sketch-text mb-4 leading-tight">
                  Lightning fast processing
                </h3>
                <p className="text-sketch-text-muted mb-6 leading-relaxed">
                  Generate professional scripts in under 60 seconds. 
                  No waiting, no delays - just instant results.
                </p>
                <div className="bg-white/60 rounded-xl p-4">
                  <div className="flex items-center space-x-2">
                    <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center">
                      <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3z"/>
                      </svg>
                    </div>
                    <div>
                      <div className="text-sm font-medium text-sketch-text">Processing...</div>
                      <div className="text-xs text-sketch-text-muted">30 seconds remaining</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Feature 2 */}
            <div className="bg-gradient-to-br from-blue-50 to-indigo-100 rounded-3xl p-8">
              <div className="inline-flex items-center px-3 py-1 rounded-full bg-blue-200 text-blue-800 text-xs font-medium mb-4">
                PROFESSIONAL
              </div>
              <h3 className="font-sketch-serif text-3xl text-sketch-text mb-4 leading-tight">
                Multiple script formats
              </h3>
              <p className="text-sketch-text-muted mb-6 leading-relaxed">
                Choose from educational, promotional, storytelling, 
                and more formats to match your content style.
              </p>
              <div className="space-y-2">
                {['Educational', 'Promotional', 'Storytelling', 'Documentary'].map(format => (
                  <div key={format} className="bg-white/60 rounded-lg p-3 flex items-center space-x-3">
                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                    <span className="text-sm text-sketch-text">{format}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA Section */}
      <section className="py-24 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="font-sketch-serif text-5xl md:text-6xl text-sketch-text mb-8 leading-tight">
            Ready to transform your content creation?
          </h2>
          <p className="text-xl text-sketch-text-muted mb-12 max-w-2xl mx-auto leading-relaxed">
            Join thousands of creators who are already using AI to generate 
            professional scripts in seconds.
          </p>
          
          <Link href="/sign-up" className="inline-flex items-center justify-center px-8 py-4 bg-sketch-accent text-white rounded-xl font-medium hover:bg-sketch-accent-600 transition-all duration-200 text-lg mb-8">
            Get started for free
          </Link>
          
          <div className="flex justify-center items-center space-x-12 opacity-60">
            <div className="text-sketch-text-muted font-medium">YouTube</div>
            <div className="text-sketch-text-muted font-medium">TikTok</div>
            <div className="text-sketch-text-muted font-medium">Instagram</div>
            <div className="text-sketch-text-muted font-medium">LinkedIn</div>
          </div>
        </div>
      </section>

      {/* Brand Footer Section */}
      <section className="py-16 px-6 bg-sketch-surface border-t">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-6 gap-8 opacity-50">
            <div className="flex items-center justify-center">
              <span className="text-sketch-text-muted text-sm font-medium">YouTube</span>
            </div>
            <div className="flex items-center justify-center">
              <span className="text-sketch-text-muted text-sm font-medium">TikTok</span>
            </div>
            <div className="flex items-center justify-center">
              <span className="text-sketch-text-muted text-sm font-medium">Instagram</span>
            </div>
            <div className="flex items-center justify-center">
              <span className="text-sketch-text-muted text-sm font-medium">LinkedIn</span>
            </div>
            <div className="flex items-center justify-center">
              <span className="text-sketch-text-muted text-sm font-medium">Twitter</span>
            </div>
            <div className="flex items-center justify-center">
              <span className="text-sketch-text-muted text-sm font-medium">Creators</span>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}