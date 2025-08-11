import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Cookie Policy - ScriptForge AI',
  description: 'Learn about how ScriptForge AI uses cookies and similar technologies.',
};

export default function CookiesPage() {
  return (
    <div className="max-w-4xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
      <div className="prose prose-lg max-w-none">
        <h1 className="text-4xl font-bold text-gray-900 mb-8">Cookie Policy</h1>
        <p className="text-gray-600 mb-8">Last updated: {new Date().toLocaleDateString()}</p>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">What Are Cookies</h2>
          <p className="text-gray-700 mb-4">
            Cookies are small text files that are placed on your computer or mobile device when 
            you visit our website. They are widely used to make websites work more efficiently 
            and provide a better user experience.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">How We Use Cookies</h2>
          <p className="text-gray-700 mb-4">ScriptForge AI uses cookies for the following purposes:</p>
          
          <div className="space-y-6">
            <div className="bg-blue-50 p-6 rounded-lg">
              <h3 className="text-xl font-semibold text-blue-900 mb-3">🔐 Essential Cookies</h3>
              <p className="text-blue-800 mb-3">These cookies are necessary for the website to function properly:</p>
              <ul className="list-disc pl-6 text-blue-800 space-y-1">
                <li>User authentication and session management</li>
                <li>Security and fraud prevention</li>
                <li>Load balancing and performance optimization</li>
              </ul>
            </div>

            <div className="bg-green-50 p-6 rounded-lg">
              <h3 className="text-xl font-semibold text-green-900 mb-3">📊 Analytics Cookies</h3>
              <p className="text-green-800 mb-3">These cookies help us understand how visitors use our website:</p>
              <ul className="list-disc pl-6 text-green-800 space-y-1">
                <li>Page views and user interactions</li>
                <li>Performance monitoring and error tracking</li>
                <li>Usage patterns and feature adoption</li>
              </ul>
            </div>

            <div className="bg-purple-50 p-6 rounded-lg">
              <h3 className="text-xl font-semibold text-purple-900 mb-3">⚙️ Functional Cookies</h3>
              <p className="text-purple-800 mb-3">These cookies enhance your experience on our website:</p>
              <ul className="list-disc pl-6 text-purple-800 space-y-1">
                <li>User preferences and settings</li>
                <li>Language and region preferences</li>
                <li>Recently generated scripts and history</li>
              </ul>
            </div>
          </div>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">Third-Party Cookies</h2>
          <p className="text-gray-700 mb-4">
            We also use cookies from trusted third-party services to enhance our functionality:
          </p>
          <ul className="list-disc pl-6 text-gray-700 space-y-2">
            <li><strong>Clerk:</strong> For user authentication and account management</li>
            <li><strong>Stripe:</strong> For secure payment processing and subscription management</li>
            <li><strong>OpenAI:</strong> For AI service integration and optimization</li>
            <li><strong>YouTube API:</strong> For video transcript processing</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">Managing Your Cookie Preferences</h2>
          <p className="text-gray-700 mb-4">
            You have several options for managing cookies:
          </p>
          
          <div className="bg-gray-50 p-6 rounded-lg mb-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-3">Browser Settings</h3>
            <p className="text-gray-700 mb-3">
              You can control cookies through your browser settings:
            </p>
            <ul className="list-disc pl-6 text-gray-700 space-y-1">
              <li>Block all cookies or specific types</li>
              <li>Delete existing cookies</li>
              <li>Set preferences for individual websites</li>
              <li>Receive notifications when cookies are being set</li>
            </ul>
          </div>

          <div className="bg-yellow-50 border border-yellow-200 p-6 rounded-lg">
            <h3 className="text-lg font-semibold text-yellow-800 mb-2">⚠️ Important Note</h3>
            <p className="text-yellow-700">
              Disabling essential cookies may affect the functionality of ScriptForge AI. 
              Some features may not work properly or may be unavailable.
            </p>
          </div>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">Cookie Retention</h2>
          <p className="text-gray-700 mb-4">
            Different cookies have different retention periods:
          </p>
          <ul className="list-disc pl-6 text-gray-700 space-y-2">
            <li><strong>Session Cookies:</strong> Deleted when you close your browser</li>
            <li><strong>Persistent Cookies:</strong> Stored for a specific period (typically 30 days to 2 years)</li>
            <li><strong>Authentication Cookies:</strong> Remain active while you're logged in</li>
            <li><strong>Preference Cookies:</strong> Stored until you change or delete them</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">Updates to This Policy</h2>
          <p className="text-gray-700 mb-4">
            We may update this Cookie Policy from time to time to reflect changes in our 
            practices or for other operational, legal, or regulatory reasons. We will notify 
            users of any material changes through our website or by email.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">Contact Us</h2>
          <p className="text-gray-700">
            If you have any questions about our use of cookies, please contact us at{' '}
            <a href="mailto:privacy@scriptforge.ai" className="text-blue-600 hover:text-blue-800">
              privacy@scriptforge.ai
            </a>
          </p>
        </section>
      </div>
    </div>
  );
}