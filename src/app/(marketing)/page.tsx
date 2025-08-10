import Link from 'next/link';
import { Container } from '@/components/ui/Container';
import { Button } from '@/components/ui/button';

export default function Home() {
  return (
    <div className="relative">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-blue-50 via-white to-blue-50 py-20 lg:py-32">
        <Container>
          <div className="text-center max-w-4xl mx-auto">
            <div className="inline-flex items-center px-4 py-2 rounded-full text-sm font-medium bg-blue-100 text-blue-800 mb-8">
              ✨ AI-Powered Script Generation
            </div>
            
            <h1 className="text-h1 md:text-6xl lg:text-7xl text-gray-900 mb-6">
              Turn YouTube Videos Into{' '}
              <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Professional Scripts
              </span>
            </h1>
            
            <p className="text-body-lg text-gray-600 mb-12 max-w-2xl mx-auto">
              Transform any YouTube video into polished, professional scripts in seconds. 
              Perfect for content creators, educators, marketers, and enterprises.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
              <Link href="/sign-up">
                <Button size="lg" className="text-lg px-8 py-4 h-auto">
                  Start Creating Scripts - Free
                </Button>
              </Link>
              <Link href="/studio">
                <Button variant="outline" size="lg" className="text-lg px-8 py-4 h-auto">
                  Try Demo →
                </Button>
              </Link>
            </div>

            {/* Social Proof */}
            <div className="text-body-sm text-gray-500">
              <p>⚡ Generate scripts in 60 seconds • 🚀 1000+ happy users • ✅ No credit card required</p>
            </div>
          </div>
        </Container>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-white border-t border-b border-gray-100">
        <Container>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            <div>
              <div className="text-h2 font-bold text-gray-900">1000+</div>
              <div className="text-body-sm text-gray-600">Scripts Generated</div>
            </div>
            <div>
              <div className="text-h2 font-bold text-gray-900">50+</div>
              <div className="text-body-sm text-gray-600">Hours Saved Daily</div>
            </div>
            <div>
              <div className="text-h2 font-bold text-gray-900">6</div>
              <div className="text-body-sm text-gray-600">Script Styles</div>
            </div>
            <div>
              <div className="text-h2 font-bold text-gray-900">99%</div>
              <div className="text-body-sm text-gray-600">User Satisfaction</div>
            </div>
          </div>
        </Container>
      </section>

      {/* Features Grid */}
      <section className="py-20 bg-gray-50">
        <Container>
          <div className="text-center mb-16">
            <h2 className="text-h2 text-gray-900 mb-4">
              Everything You Need to Create Amazing Scripts
            </h2>
            <p className="text-body-lg text-gray-600 max-w-3xl mx-auto">
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
              <div key={index} className="bg-white rounded-2xl p-8 shadow-soft hover:shadow-soft-lg transition-shadow">
                <div className="text-4xl mb-4">{feature.icon}</div>
                <h3 className="text-h4 text-gray-900 mb-3">{feature.title}</h3>
                <p className="text-body text-gray-600">{feature.description}</p>
              </div>
            ))}
          </div>
        </Container>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-blue-600 to-purple-600">
        <Container>
          <div className="text-center max-w-4xl mx-auto">
            <h2 className="text-h2 text-white mb-4">
              Ready to Transform Your Video Content?
            </h2>
            <p className="text-body-lg text-blue-100 mb-8">
              Join thousands of creators who are already saving hours and creating better content with AI-powered scripts.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/sign-up">
                <Button size="lg" variant="secondary" className="text-lg px-8 py-4 h-auto">
                  Start Your Free Trial
                </Button>
              </Link>
              <Link href="/studio">
                <Button size="lg" variant="outline" className="text-lg px-8 py-4 h-auto border-white text-white hover:bg-white hover:text-blue-600">
                  Try Demo First →
                </Button>
              </Link>
            </div>
            <p className="text-body-sm text-blue-200 mt-6">
              ✅ No credit card required • ✅ 2 free scripts to start • ✅ Cancel anytime
            </p>
          </div>
        </Container>
      </section>
    </div>
  );
}