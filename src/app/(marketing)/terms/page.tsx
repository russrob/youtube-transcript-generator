import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Terms of Service - ScriptForge AI',
  description: 'Read the terms and conditions for using ScriptForge AI services.',
};

export default function TermsPage() {
  return (
    <div className="max-w-4xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
      <div className="prose prose-lg max-w-none">
        <h1 className="text-4xl font-bold text-gray-900 mb-8">Terms of Service</h1>
        <p className="text-gray-600 mb-8">Last updated: {new Date().toLocaleDateString()}</p>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">Acceptance of Terms</h2>
          <p className="text-gray-700 mb-4">
            By accessing and using ScriptForge AI, you accept and agree to be bound by the terms 
            and provision of this agreement. If you do not agree to abide by the above, please 
            do not use this service.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">Service Description</h2>
          <p className="text-gray-700 mb-4">
            ScriptForge AI is an AI-powered platform that transforms YouTube video transcripts 
            into professional scripts. Our service includes:
          </p>
          <ul className="list-disc pl-6 text-gray-700 space-y-2">
            <li>YouTube transcript extraction and processing</li>
            <li>AI-powered script generation in multiple styles</li>
            <li>Premium features including hook generation and title packs</li>
            <li>Script management and export capabilities</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">User Responsibilities</h2>
          <p className="text-gray-700 mb-4">You agree to:</p>
          <ul className="list-disc pl-6 text-gray-700 space-y-2">
            <li>Use the service only for lawful purposes</li>
            <li>Respect intellectual property rights of video creators</li>
            <li>Not attempt to reverse engineer or exploit the service</li>
            <li>Maintain the security of your account credentials</li>
            <li>Comply with YouTube's Terms of Service when using their content</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">Subscription and Billing</h2>
          <p className="text-gray-700 mb-4">
            ScriptForge AI offers both free and premium subscription tiers:
          </p>
          <ul className="list-disc pl-6 text-gray-700 space-y-2">
            <li><strong>Free Tier:</strong> 2 scripts per month with basic features</li>
            <li><strong>Pro Tier:</strong> 50 scripts per month with premium features</li>
            <li><strong>Business & Enterprise:</strong> Higher limits and team features</li>
          </ul>
          <p className="text-gray-700 mt-4">
            Subscriptions are billed monthly and automatically renew unless cancelled. 
            All payments are processed securely through Stripe.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">Intellectual Property</h2>
          <p className="text-gray-700 mb-4">
            You retain ownership of scripts generated through our service. However, you are 
            responsible for ensuring you have appropriate rights to use the source YouTube content.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">Limitation of Liability</h2>
          <p className="text-gray-700 mb-4">
            ScriptForge AI provides the service "as is" without warranties. We are not liable 
            for any indirect, incidental, or consequential damages arising from your use of the service.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">Termination</h2>
          <p className="text-gray-700 mb-4">
            You may terminate your account at any time. We reserve the right to suspend or 
            terminate accounts that violate these terms or engage in harmful activities.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">Contact Information</h2>
          <p className="text-gray-700">
            For questions about these Terms of Service, please contact us at{' '}
            <a href="mailto:legal@scriptforge.ai" className="text-blue-600 hover:text-blue-800">
              legal@scriptforge.ai
            </a>
          </p>
        </section>
      </div>
    </div>
  );
}