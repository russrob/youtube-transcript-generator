import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Contact Us - ScriptForge AI',
  description: 'Get in touch with the ScriptForge AI team for support, partnerships, or general inquiries.',
};

export default function ContactPage() {
  return (
    <div className="max-w-6xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">Contact Us</h1>
        <p className="text-xl text-gray-600 max-w-2xl mx-auto">
          We're here to help! Reach out to us for support, partnerships, or any questions 
          about ScriptForge AI.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        {/* Contact Form */}
        <div className="bg-white p-8 rounded-xl shadow-lg">
          <h2 className="text-2xl font-semibold text-gray-900 mb-6">Send us a message</h2>
          <form className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div>
                <label htmlFor="firstName" className="block text-sm font-medium text-gray-700 mb-2">
                  First Name
                </label>
                <input
                  type="text"
                  id="firstName"
                  name="firstName"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="John"
                />
              </div>
              <div>
                <label htmlFor="lastName" className="block text-sm font-medium text-gray-700 mb-2">
                  Last Name
                </label>
                <input
                  type="text"
                  id="lastName"
                  name="lastName"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Doe"
                />
              </div>
            </div>
            
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                Email Address
              </label>
              <input
                type="email"
                id="email"
                name="email"
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="john@example.com"
              />
            </div>

            <div>
              <label htmlFor="subject" className="block text-sm font-medium text-gray-700 mb-2">
                Subject
              </label>
              <select
                id="subject"
                name="subject"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">Select a topic</option>
                <option value="support">Technical Support</option>
                <option value="billing">Billing & Subscriptions</option>
                <option value="enterprise">Enterprise Solutions</option>
                <option value="partnership">Partnership Opportunities</option>
                <option value="feedback">Product Feedback</option>
                <option value="other">Other</option>
              </select>
            </div>

            <div>
              <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-2">
                Message
              </label>
              <textarea
                id="message"
                name="message"
                rows={5}
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Tell us how we can help you..."
              />
            </div>

            <button
              type="submit"
              className="w-full bg-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            >
              Send Message
            </button>
          </form>
        </div>

        {/* Contact Information */}
        <div className="space-y-8">
          <div className="bg-gradient-to-br from-blue-50 to-purple-50 p-8 rounded-xl">
            <h2 className="text-2xl font-semibold text-gray-900 mb-6">Get in touch</h2>
            <div className="space-y-6">
              <div className="flex items-start">
                <div className="flex-shrink-0 w-10 h-10 bg-blue-600 text-white rounded-lg flex items-center justify-center">
                  📧
                </div>
                <div className="ml-4">
                  <h3 className="text-lg font-medium text-gray-900">Email Support</h3>
                  <p className="text-gray-600 mt-1">
                    <a href="mailto:support@scriptforgeai.co" className="text-blue-600 hover:text-blue-800">
                      support@scriptforgeai.co
                    </a>
                  </p>
                  <p className="text-sm text-gray-500 mt-1">We typically respond within 24 hours</p>
                </div>
              </div>

              <div className="flex items-start">
                <div className="flex-shrink-0 w-10 h-10 bg-green-600 text-white rounded-lg flex items-center justify-center">
                  💬
                </div>
                <div className="ml-4">
                  <h3 className="text-lg font-medium text-gray-900">Live Chat</h3>
                  <p className="text-gray-600 mt-1">Available 9 AM - 6 PM EST</p>
                  <p className="text-sm text-gray-500 mt-1">Monday through Friday</p>
                </div>
              </div>

              <div className="flex items-start">
                <div className="flex-shrink-0 w-10 h-10 bg-purple-600 text-white rounded-lg flex items-center justify-center">
                  🏢
                </div>
                <div className="ml-4">
                  <h3 className="text-lg font-medium text-gray-900">Enterprise Sales</h3>
                  <p className="text-gray-600 mt-1">
                    <a href="mailto:enterprise@scriptforgeai.co" className="text-blue-600 hover:text-blue-800">
                      enterprise@scriptforgeai.co
                    </a>
                  </p>
                  <p className="text-sm text-gray-500 mt-1">For teams and large organizations</p>
                </div>
              </div>
            </div>
          </div>

          {/* FAQ Quick Links */}
          <div className="bg-gray-50 p-8 rounded-xl">
            <h3 className="text-xl font-semibold text-gray-900 mb-4">Quick Help</h3>
            <div className="space-y-3">
              <a 
                href="/studio" 
                className="block text-blue-600 hover:text-blue-800 transition-colors"
              >
                📚 How to generate your first script
              </a>
              <a 
                href="/subscription" 
                className="block text-blue-600 hover:text-blue-800 transition-colors"
              >
                💳 Subscription plans and billing
              </a>
              <a 
                href="/api-docs" 
                className="block text-blue-600 hover:text-blue-800 transition-colors"
              >
                🔧 API documentation
              </a>
              <a 
                href="/privacy" 
                className="block text-blue-600 hover:text-blue-800 transition-colors"
              >
                🔒 Privacy and data security
              </a>
            </div>
          </div>

          {/* Response Time */}
          <div className="bg-yellow-50 border border-yellow-200 p-6 rounded-xl">
            <h3 className="text-lg font-medium text-yellow-800 mb-2">Response Times</h3>
            <ul className="text-yellow-700 space-y-1 text-sm">
              <li>• General inquiries: Within 24 hours</li>
              <li>• Technical support: Within 12 hours</li>
              <li>• Enterprise sales: Within 4 hours</li>
              <li>• Urgent issues: Within 2 hours</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}