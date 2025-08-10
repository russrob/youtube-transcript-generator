"use client";

import { useState } from 'react';
import Link from 'next/link';

export default function LandingPage() {
  const [selectedPersona, setSelectedPersona] = useState<string>('creator');

  const personas = {
    creator: {
      title: "Content Creators & YouTubers",
      headline: "Turn Your YouTube Videos Into Viral Scripts",
      subheader: "Generate professional scripts from any video in 60 seconds. Save hours of work and create better content.",
      benefits: [
        "Generate scripts 10x faster than manual writing",
        "Multiple styles: Professional, Casual, Educational, Entertaining", 
        "Perfect for video descriptions, social posts, and new content",
        "Optimize for different platforms and audiences"
      ],
      cta: "Start Creating Scripts",
      roi: "Save 5+ hours per video"
    },
    educator: {
      title: "Educators & Trainers", 
      headline: "Transform Video Lectures Into Study Materials",
      subheader: "Convert any educational video into comprehensive study guides, notes, and course materials instantly.",
      benefits: [
        "Create study guides and handouts automatically",
        "Generate quiz questions from video content", 
        "Ensure accessibility compliance with transcripts",
        "Adapt content for different learning styles"
      ],
      cta: "Transform Your Content",
      roi: "Save 3+ hours per lecture"
    },
    marketer: {
      title: "Marketing Teams",
      headline: "Repurpose Video Content Across All Channels", 
      subheader: "10x your content ROI by transforming webinars, demos, and video content into blog posts, social media, and more.",
      benefits: [
        "Turn one video into 10+ pieces of content",
        "Optimize scripts for SEO and social media",
        "Generate multiple formats: blogs, emails, ads",
        "Scale content production without scaling team"
      ],
      cta: "Boost Your ROI", 
      roi: "10x content output"
    },
    business: {
      title: "Enterprise & Teams",
      headline: "Scale Video Content Production Across Teams",
      subheader: "Enterprise-grade AI script generation with team collaboration, custom templates, and API integration.",
      benefits: [
        "Team collaboration with role-based permissions",
        "Custom templates for brand consistency", 
        "API integration for existing workflows",
        "Advanced analytics and usage reporting"
      ],
      cta: "Request Enterprise Demo",
      roi: "50% faster content workflows"
    }
  };

  const currentPersona = personas[selectedPersona as keyof typeof personas];

  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <nav className="border-b border-gray-200 bg-white/95 backdrop-blur-sm fixed w-full top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center">
              <h1 className="text-2xl font-bold text-blue-600">ScriptForge AI</h1>
            </div>
            <div className="hidden md:flex items-center space-x-8">
              <Link href="#features" className="text-gray-600 hover:text-gray-900">Features</Link>
              <Link href="#pricing" className="text-gray-600 hover:text-gray-900">Pricing</Link>
              <Link href="/studio" className="text-gray-600 hover:text-gray-900">Demo</Link>
              <Link href="/auth/login" className="text-gray-600 hover:text-gray-900">Login</Link>
              <Link href="/auth/signup" className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors">
                Start Free Trial
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-24 pb-12 px-4">
        <div className="max-w-7xl mx-auto">
          {/* Persona Selector */}
          <div className="text-center mb-12">
            <h2 className="text-lg font-medium text-gray-600 mb-4">Choose your role:</h2>
            <div className="flex flex-wrap justify-center gap-3 mb-8">
              {Object.entries(personas).map(([key, persona]) => (
                <button
                  key={key}
                  onClick={() => setSelectedPersona(key)}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                    selectedPersona === key
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {persona.title}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            {/* Left Column - Content */}
            <div>
              <div className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800 mb-6">
                ✨ AI-Powered Script Generation
              </div>
              
              <h1 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-6">
                {currentPersona.headline}
              </h1>
              
              <p className="text-xl text-gray-600 mb-8">
                {currentPersona.subheader}
              </p>

              {/* Benefits */}
              <ul className="space-y-3 mb-8">
                {currentPersona.benefits.map((benefit, index) => (
                  <li key={index} className="flex items-start">
                    <svg className="w-6 h-6 text-green-500 mr-3 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"/>
                    </svg>
                    <span className="text-gray-700">{benefit}</span>
                  </li>
                ))}
              </ul>

              {/* CTA Buttons */}
              <div className="flex flex-col sm:flex-row gap-4">
                <Link 
                  href="/auth/signup" 
                  className="bg-blue-600 text-white px-8 py-4 rounded-lg font-semibold hover:bg-blue-700 transition-colors text-center"
                >
                  {currentPersona.cta} - Free Trial
                </Link>
                <Link 
                  href="/studio" 
                  className="border-2 border-gray-300 text-gray-700 px-8 py-4 rounded-lg font-semibold hover:border-gray-400 transition-colors text-center"
                >
                  Try Demo →
                </Link>
              </div>

              {/* Social Proof */}
              <div className="mt-8 text-sm text-gray-500">
                <p>⚡ {currentPersona.roi} • 🚀 1000+ satisfied users • ✅ No credit card required</p>
              </div>
            </div>

            {/* Right Column - Demo/Visual */}
            <div className="relative">
              <div className="bg-white rounded-lg shadow-xl border border-gray-200 p-6">
                <div className="space-y-4">
                  <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 bg-red-400 rounded-full"></div>
                    <div className="w-3 h-3 bg-yellow-400 rounded-full"></div>
                    <div className="w-3 h-3 bg-green-400 rounded-full"></div>
                    <div className="text-sm text-gray-500 ml-4">ScriptForge AI Studio</div>
                  </div>
                  
                  <div className="space-y-3">
                    <div>
                      <div className="text-xs text-gray-500 mb-1">YouTube URL</div>
                      <div className="bg-gray-50 p-2 rounded text-sm">https://youtube.com/watch?v=example</div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <div className="text-xs text-gray-500 mb-1">Style</div>
                        <div className="bg-blue-50 text-blue-700 p-2 rounded text-sm text-center">Professional</div>
                      </div>
                      <div>
                        <div className="text-xs text-gray-500 mb-1">Duration</div>
                        <div className="bg-blue-50 text-blue-700 p-2 rounded text-sm text-center">5 min</div>
                      </div>
                    </div>
                    
                    <button className="w-full bg-blue-600 text-white p-3 rounded font-medium">
                      Generate Script ✨
                    </button>
                    
                    <div className="bg-gray-50 p-3 rounded">
                      <div className="text-xs text-gray-500 mb-1">Generated Script Preview:</div>
                      <div className="text-sm text-gray-700">
                        "Welcome to today's deep dive into productivity hacks that will transform your workflow..."
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Floating elements for visual appeal */}
              <div className="absolute -top-4 -right-4 bg-green-100 text-green-700 px-3 py-1 rounded-full text-sm font-medium">
                ⚡ 60 seconds
              </div>
              <div className="absolute -bottom-4 -left-4 bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-sm font-medium">
                🎯 AI-Powered
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 text-center">
            <div>
              <div className="text-3xl font-bold text-gray-900">1000+</div>
              <div className="text-gray-600">Scripts Generated</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-gray-900">50+</div>
              <div className="text-gray-600">Hours Saved Daily</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-gray-900">6</div>
              <div className="text-gray-600">Script Styles</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-gray-900">99%</div>
              <div className="text-gray-600">User Satisfaction</div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Everything You Need to Create Amazing Scripts
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              From YouTube transcript extraction to AI-powered script generation - we've got every step covered.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                icon: "🎬",
                title: "Any YouTube Video",
                description: "Extract transcripts from any public YouTube video instantly"
              },
              {
                icon: "🤖", 
                title: "AI Script Generation",
                description: "Transform transcripts into polished scripts with advanced AI"
              },
              {
                icon: "🎨",
                title: "Multiple Styles", 
                description: "Choose from 6 different writing styles to match your brand"
              },
              {
                icon: "⚡",
                title: "Lightning Fast",
                description: "Generate professional scripts in under 60 seconds"
              },
              {
                icon: "📝",
                title: "Export Options",
                description: "Download as PDF, Word, or copy to clipboard"
              },
              {
                icon: "👥",
                title: "Team Collaboration",
                description: "Share and collaborate on scripts with your team"
              }
            ].map((feature, index) => (
              <div key={index} className="bg-white rounded-lg p-6 shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
                <div className="text-4xl mb-4">{feature.icon}</div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">{feature.title}</h3>
                <p className="text-gray-600">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Choose Your Plan
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Start free and scale as you grow. All plans include core features.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              {
                name: "Starter",
                price: "Free",
                description: "Perfect for trying out",
                features: [
                  "2 scripts per month",
                  "All script styles", 
                  "Basic export options",
                  "Community support"
                ],
                cta: "Start Free",
                popular: false
              },
              {
                name: "Pro",
                price: "$19",
                description: "For regular content creators", 
                features: [
                  "50 scripts per month",
                  "Priority processing",
                  "All export formats",
                  "Email support",
                  "Usage analytics"
                ],
                cta: "Try Pro Free",
                popular: true
              },
              {
                name: "Business", 
                price: "$49",
                description: "For teams and agencies",
                features: [
                  "200 scripts per month",
                  "Team collaboration",
                  "Custom templates",
                  "Priority support", 
                  "Advanced analytics",
                  "API access"
                ],
                cta: "Start Business",
                popular: false
              },
              {
                name: "Enterprise",
                price: "Custom",
                description: "For large organizations",
                features: [
                  "Unlimited scripts",
                  "White-label option",
                  "Custom integrations",
                  "Dedicated support",
                  "SLA guarantee",
                  "Advanced security"
                ],
                cta: "Contact Sales",
                popular: false
              }
            ].map((plan, index) => (
              <div key={index} className={`bg-white rounded-lg p-8 shadow-sm border-2 ${
                plan.popular ? 'border-blue-500 relative' : 'border-gray-200'
              }`}>
                {plan.popular && (
                  <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                    <span className="bg-blue-500 text-white px-3 py-1 rounded-full text-sm font-medium">
                      Most Popular
                    </span>
                  </div>
                )}
                
                <div className="text-center mb-6">
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">{plan.name}</h3>
                  <div className="text-4xl font-bold text-gray-900 mb-1">
                    {plan.price}
                    {plan.price !== "Free" && plan.price !== "Custom" && <span className="text-lg text-gray-500">/month</span>}
                  </div>
                  <p className="text-gray-600">{plan.description}</p>
                </div>
                
                <ul className="space-y-3 mb-8">
                  {plan.features.map((feature, featureIndex) => (
                    <li key={featureIndex} className="flex items-start">
                      <svg className="w-5 h-5 text-green-500 mr-2 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"/>
                      </svg>
                      <span className="text-sm text-gray-700">{feature}</span>
                    </li>
                  ))}
                </ul>
                
                <Link 
                  href="/auth/signup"
                  className={`block w-full text-center py-3 rounded-lg font-semibold transition-colors ${
                    plan.popular 
                      ? 'bg-blue-600 text-white hover:bg-blue-700' 
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {plan.cta}
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-blue-600">
        <div className="max-w-4xl mx-auto text-center px-4">
          <h2 className="text-3xl font-bold text-white mb-4">
            Ready to Transform Your Video Content?
          </h2>
          <p className="text-xl text-blue-100 mb-8">
            Join thousands of creators who are already saving hours and creating better content with AI-powered scripts.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link 
              href="/auth/signup"
              className="bg-white text-blue-600 px-8 py-4 rounded-lg font-semibold hover:bg-gray-100 transition-colors"
            >
              Start Your Free Trial
            </Link>
            <Link 
              href="/studio"
              className="border-2 border-blue-400 text-white px-8 py-4 rounded-lg font-semibold hover:border-white transition-colors"
            >
              Try Demo First →
            </Link>
          </div>
          <p className="text-blue-200 text-sm mt-4">
            ✅ No credit card required • ✅ 2 free scripts to start • ✅ Cancel anytime
          </p>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <h3 className="text-2xl font-bold text-white mb-4">ScriptForge AI</h3>
              <p className="text-gray-400">
                Transform any YouTube video into professional scripts with AI-powered generation.
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Product</h4>
              <ul className="space-y-2 text-gray-400">
                <li><Link href="#features" className="hover:text-white transition-colors">Features</Link></li>
                <li><Link href="#pricing" className="hover:text-white transition-colors">Pricing</Link></li>
                <li><Link href="/studio" className="hover:text-white transition-colors">Demo</Link></li>
                <li><Link href="/api" className="hover:text-white transition-colors">API</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Company</h4>
              <ul className="space-y-2 text-gray-400">
                <li><Link href="/about" className="hover:text-white transition-colors">About</Link></li>
                <li><Link href="/contact" className="hover:text-white transition-colors">Contact</Link></li>
                <li><Link href="/privacy" className="hover:text-white transition-colors">Privacy</Link></li>
                <li><Link href="/terms" className="hover:text-white transition-colors">Terms</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Support</h4>
              <ul className="space-y-2 text-gray-400">
                <li><Link href="/help" className="hover:text-white transition-colors">Help Center</Link></li>
                <li><Link href="/docs" className="hover:text-white transition-colors">Documentation</Link></li>
                <li><Link href="/blog" className="hover:text-white transition-colors">Blog</Link></li>
                <li><Link href="/status" className="hover:text-white transition-colors">Status</Link></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
            <p>&copy; 2024 ScriptForge AI. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}