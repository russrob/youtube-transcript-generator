import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'About Us - ScriptForge AI',
  description: 'Learn about ScriptForge AI and our mission to transform video content creation with AI.',
};

export default function AboutPage() {
  return (
    <div className="max-w-4xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
      <div className="prose prose-lg max-w-none">
        <h1 className="text-4xl font-bold text-gray-900 mb-8">About ScriptForge AI</h1>
        
        <section className="mb-12">
          <h2 className="text-2xl font-semibold text-gray-900 mb-6">Our Mission</h2>
          <p className="text-gray-700 text-lg leading-relaxed mb-6">
            ScriptForge AI empowers content creators, educators, and marketers to transform 
            YouTube videos into professional, polished scripts in seconds. We believe that 
            great content should be accessible to everyone, regardless of their writing expertise.
          </p>
          <p className="text-gray-700 text-lg leading-relaxed">
            By combining cutting-edge AI technology with intuitive design, we're making it 
            easier than ever to repurpose video content, create compelling narratives, and 
            save hours of manual transcription and editing work.
          </p>
        </section>

        <section className="mb-12">
          <h2 className="text-2xl font-semibold text-gray-900 mb-6">What We Do</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="bg-blue-50 p-6 rounded-lg">
              <h3 className="text-xl font-semibold text-blue-900 mb-3">🎬 Video to Script</h3>
              <p className="text-blue-800">
                Transform any YouTube video into a professional script with our AI-powered 
                generation technology.
              </p>
            </div>
            <div className="bg-green-50 p-6 rounded-lg">
              <h3 className="text-xl font-semibold text-green-900 mb-3">✨ Premium Features</h3>
              <p className="text-green-800">
                Get hook variations, title packs, and advanced script styles to maximize 
                your content's impact.
              </p>
            </div>
            <div className="bg-purple-50 p-6 rounded-lg">
              <h3 className="text-xl font-semibold text-purple-900 mb-3">⚡ Lightning Fast</h3>
              <p className="text-purple-800">
                Generate professional scripts in under 60 seconds, saving hours of 
                manual work.
              </p>
            </div>
            <div className="bg-orange-50 p-6 rounded-lg">
              <h3 className="text-xl font-semibold text-orange-900 mb-3">🔧 Multiple Styles</h3>
              <p className="text-orange-800">
                Choose from 6 different writing styles to match your brand voice and 
                content goals.
              </p>
            </div>
          </div>
        </section>

        <section className="mb-12">
          <h2 className="text-2xl font-semibold text-gray-900 mb-6">Our Technology</h2>
          <p className="text-gray-700 text-lg leading-relaxed mb-6">
            ScriptForge AI is built with modern, reliable technology to ensure fast, 
            accurate, and secure script generation:
          </p>
          <ul className="space-y-4">
            <li className="flex items-start">
              <span className="flex-shrink-0 w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-semibold mr-4 mt-1">✓</span>
              <div>
                <strong className="text-gray-900">Advanced AI Models:</strong>
                <span className="text-gray-700 ml-2">Powered by OpenAI's GPT-4 for intelligent content generation</span>
              </div>
            </li>
            <li className="flex items-start">
              <span className="flex-shrink-0 w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-semibold mr-4 mt-1">✓</span>
              <div>
                <strong className="text-gray-900">Secure Infrastructure:</strong>
                <span className="text-gray-700 ml-2">Enterprise-grade security with encrypted data storage</span>
              </div>
            </li>
            <li className="flex items-start">
              <span className="flex-shrink-0 w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-semibold mr-4 mt-1">✓</span>
              <div>
                <strong className="text-gray-900">Real-time Processing:</strong>
                <span className="text-gray-700 ml-2">Fast transcript extraction and script generation</span>
              </div>
            </li>
          </ul>
        </section>

        <section className="mb-12">
          <h2 className="text-2xl font-semibold text-gray-900 mb-6">Why Choose ScriptForge AI?</h2>
          <div className="bg-gradient-to-r from-blue-50 to-purple-50 p-8 rounded-xl">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
              <div>
                <div className="text-3xl font-bold text-blue-600 mb-2">1000+</div>
                <div className="text-gray-700">Scripts Generated</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-purple-600 mb-2">50+</div>
                <div className="text-gray-700">Hours Saved Daily</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-green-600 mb-2">99%</div>
                <div className="text-gray-700">User Satisfaction</div>
              </div>
            </div>
          </div>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold text-gray-900 mb-6">Get In Touch</h2>
          <p className="text-gray-700 text-lg leading-relaxed mb-6">
            Have questions about ScriptForge AI or want to learn more about our enterprise solutions? 
            We'd love to hear from you.
          </p>
          <div className="flex flex-col sm:flex-row gap-4">
            <a 
              href="/contact" 
              className="inline-flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 transition-colors"
            >
              Contact Us
            </a>
            <a 
              href="/sign-up" 
              className="inline-flex items-center justify-center px-6 py-3 border border-gray-300 text-base font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 transition-colors"
            >
              Try ScriptForge AI Free
            </a>
          </div>
        </section>
      </div>
    </div>
  );
}