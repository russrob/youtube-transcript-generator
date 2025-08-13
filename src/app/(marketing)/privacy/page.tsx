import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Privacy Policy - ScriptForge AI',
  description: 'Learn how ScriptForge AI protects your privacy and handles your data responsibly.',
};

export default function PrivacyPage() {
  return (
    <div className="max-w-4xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
      <div className="prose prose-lg max-w-none">
        <h1 className="text-4xl font-bold text-gray-900 mb-8">Privacy Policy</h1>
        <p className="text-gray-600 mb-8">Last updated: {new Date().toLocaleDateString()}</p>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">Information We Collect</h2>
          <p className="text-gray-700 mb-4">
            ScriptForge AI collects information you provide directly, such as when you create an account, 
            use our services, or contact us for support.
          </p>
          <ul className="list-disc pl-6 text-gray-700 space-y-2">
            <li>Account information (email, name, profile details)</li>
            <li>YouTube video URLs you submit for processing</li>
            <li>Generated scripts and associated metadata</li>
            <li>Usage analytics and service interaction data</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">How We Use Your Information</h2>
          <ul className="list-disc pl-6 text-gray-700 space-y-2">
            <li>Provide and improve our script generation services</li>
            <li>Process YouTube videos and generate AI-powered scripts</li>
            <li>Send important service updates and notifications</li>
            <li>Analyze usage patterns to enhance user experience</li>
            <li>Ensure platform security and prevent abuse</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">Data Security</h2>
          <p className="text-gray-700 mb-4">
            We implement industry-standard security measures to protect your personal information 
            and generated content. All data is encrypted in transit and at rest.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">Third-Party Services</h2>
          <p className="text-gray-700 mb-4">We integrate with the following third-party services:</p>
          <ul className="list-disc pl-6 text-gray-700 space-y-2">
            <li><strong>YouTube API:</strong> To fetch video transcripts</li>
            <li><strong>OpenAI:</strong> For AI-powered script generation</li>
            <li><strong>Clerk:</strong> For user authentication and management</li>
            <li><strong>Stripe:</strong> For secure payment processing</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">Your Rights</h2>
          <p className="text-gray-700 mb-4">You have the right to:</p>
          <ul className="list-disc pl-6 text-gray-700 space-y-2">
            <li>Access and review your personal data</li>
            <li>Request corrections to inaccurate information</li>
            <li>Delete your account and associated data</li>
            <li>Export your generated scripts and data</li>
            <li>Opt out of non-essential communications</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">Contact Us</h2>
          <p className="text-gray-700">
            If you have any questions about this Privacy Policy, please contact us at{' '}
            <a href="mailto:privacy@scriptforgeai.co" className="text-blue-600 hover:text-blue-800">
              privacy@scriptforgeai.co
            </a>
          </p>
        </section>
      </div>
    </div>
  );
}