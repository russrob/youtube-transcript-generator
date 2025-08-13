import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'API Documentation - ScriptForge AI',
  description: 'Learn how to integrate ScriptForge AI into your applications with our REST API.',
};

export default function ApiDocsPage() {
  return (
    <div className="max-w-6xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
      <div className="prose prose-lg max-w-none">
        <h1 className="text-4xl font-bold text-gray-900 mb-8">API Documentation</h1>
        <p className="text-xl text-gray-600 mb-12">
          Integrate ScriptForge AI's powerful script generation capabilities into your applications 
          with our RESTful API.
        </p>

        <div className="bg-blue-50 border border-blue-200 p-6 rounded-xl mb-12">
          <h2 className="text-xl font-semibold text-blue-900 mb-3">🚀 Getting Started</h2>
          <p className="text-blue-800 mb-4">
            Our API is currently in development and will be available to Pro and Business subscribers. 
            Sign up for early access notifications.
          </p>
          <a 
            href="/contact" 
            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Request Early Access
          </a>
        </div>

        <section className="mb-12">
          <h2 className="text-2xl font-semibold text-gray-900 mb-6">API Overview</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="bg-white border border-gray-200 p-6 rounded-xl">
              <h3 className="text-xl font-semibold text-gray-900 mb-4">⚡ Features</h3>
              <ul className="space-y-2 text-gray-700">
                <li>• Generate scripts from YouTube URLs</li>
                <li>• Multiple script styles and formats</li>
                <li>• Hook generation and title packs</li>
                <li>• Bulk processing capabilities</li>
                <li>• Real-time status updates</li>
              </ul>
            </div>
            
            <div className="bg-white border border-gray-200 p-6 rounded-xl">
              <h3 className="text-xl font-semibold text-gray-900 mb-4">🔧 Technical Details</h3>
              <ul className="space-y-2 text-gray-700">
                <li>• RESTful API with JSON responses</li>
                <li>• Rate limiting and usage quotas</li>
                <li>• Webhook support for async operations</li>
                <li>• Comprehensive error handling</li>
                <li>• OpenAPI 3.0 specification</li>
              </ul>
            </div>
          </div>
        </section>

        <section className="mb-12">
          <h2 className="text-2xl font-semibold text-gray-900 mb-6">Authentication</h2>
          <div className="bg-gray-50 p-6 rounded-xl">
            <h3 className="text-lg font-semibold text-gray-900 mb-3">API Key Authentication</h3>
            <p className="text-gray-700 mb-4">
              All API requests require authentication using an API key in the Authorization header:
            </p>
            <div className="bg-gray-900 text-green-400 p-4 rounded-lg font-mono text-sm overflow-x-auto">
              <div>curl -X POST https://api.scriptforgeai.co/v1/scripts/generate \</div>
              <div>  -H "Authorization: Bearer sk_live_YOUR_API_KEY" \</div>
              <div>  -H "Content-Type: application/json"</div>
            </div>
          </div>
        </section>

        <section className="mb-12">
          <h2 className="text-2xl font-semibold text-gray-900 mb-6">Core Endpoints</h2>
          
          <div className="space-y-8">
            <div className="border border-gray-200 p-6 rounded-xl">
              <div className="flex items-center mb-4">
                <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-medium mr-3">
                  POST
                </span>
                <code className="text-lg font-mono text-gray-900">/v1/scripts/generate</code>
              </div>
              <p className="text-gray-700 mb-4">Generate a script from a YouTube URL</p>
              
              <h4 className="font-semibold text-gray-900 mb-2">Request Body:</h4>
              <div className="bg-gray-900 text-green-400 p-4 rounded-lg font-mono text-sm overflow-x-auto mb-4">
{`{
  "youtubeUrl": "https://youtube.com/watch?v=VIDEO_ID",
  "style": "PROFESSIONAL",
  "includeHooks": true,
  "includeTitlePack": true,
  "targetDuration": 300
}`}
              </div>
              
              <h4 className="font-semibold text-gray-900 mb-2">Response:</h4>
              <div className="bg-gray-900 text-green-400 p-4 rounded-lg font-mono text-sm overflow-x-auto">
{`{
  "id": "script_abc123",
  "status": "completed",
  "script": {
    "title": "Generated Script Title",
    "content": "Full script content...",
    "hooks": ["Hook 1", "Hook 2", "Hook 3"],
    "titlePack": ["Title 1", "Title 2", "Title 3"]
  },
  "metadata": {
    "duration": 285,
    "wordCount": 1250,
    "createdAt": "2025-01-01T12:00:00Z"
  }
}`}
              </div>
            </div>

            <div className="border border-gray-200 p-6 rounded-xl">
              <div className="flex items-center mb-4">
                <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium mr-3">
                  GET
                </span>
                <code className="text-lg font-mono text-gray-900">/v1/scripts/{'{id}'}</code>
              </div>
              <p className="text-gray-700 mb-4">Retrieve a specific script by ID</p>
              
              <h4 className="font-semibold text-gray-900 mb-2">Response:</h4>
              <div className="bg-gray-900 text-green-400 p-4 rounded-lg font-mono text-sm overflow-x-auto">
{`{
  "id": "script_abc123",
  "status": "completed",
  "script": { ... },
  "createdAt": "2025-01-01T12:00:00Z",
  "updatedAt": "2025-01-01T12:05:00Z"
}`}
              </div>
            </div>

            <div className="border border-gray-200 p-6 rounded-xl">
              <div className="flex items-center mb-4">
                <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium mr-3">
                  GET
                </span>
                <code className="text-lg font-mono text-gray-900">/v1/scripts</code>
              </div>
              <p className="text-gray-700 mb-4">List all scripts with pagination support</p>
              
              <h4 className="font-semibold text-gray-900 mb-2">Query Parameters:</h4>
              <ul className="text-gray-700 space-y-1 mb-4">
                <li>• <code>limit</code>: Number of results (default: 20, max: 100)</li>
                <li>• <code>offset</code>: Pagination offset</li>
                <li>• <code>status</code>: Filter by status (pending, processing, completed, failed)</li>
              </ul>
            </div>
          </div>
        </section>

        <section className="mb-12">
          <h2 className="text-2xl font-semibold text-gray-900 mb-6">Script Styles</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-gradient-to-br from-blue-50 to-purple-50 p-6 rounded-xl">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Basic Styles (Free)</h3>
              <ul className="space-y-2 text-gray-700">
                <li>• <code>PROFESSIONAL</code> - Clean, business-appropriate</li>
                <li>• <code>CASUAL</code> - Conversational and friendly</li>
                <li>• <code>EDUCATIONAL</code> - Clear, instructional format</li>
              </ul>
            </div>
            
            <div className="bg-gradient-to-br from-yellow-50 to-orange-50 p-6 rounded-xl">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Premium Styles (Pro+)</h3>
              <ul className="space-y-2 text-gray-700">
                <li>• <code>PERSUASIVE</code> - Influence and convince</li>
                <li>• <code>NARRATIVE</code> - Rich storytelling format</li>
                <li>• <code>ACADEMIC</code> - Scholarly analysis style</li>
              </ul>
            </div>
          </div>
        </section>

        <section className="mb-12">
          <h2 className="text-2xl font-semibold text-gray-900 mb-6">Rate Limits & Quotas</h2>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Subscription Tier
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Monthly Quota
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Rate Limit
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Premium Features
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                <tr>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    Pro
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    50 scripts
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    10 requests/min
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    ✅ Hooks, Titles
                  </td>
                </tr>
                <tr>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    Business
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    200 scripts
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    30 requests/min
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    ✅ All Features
                  </td>
                </tr>
                <tr>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    Enterprise
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    Unlimited
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    Custom
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    ✅ Custom Models
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        <section className="mb-12">
          <h2 className="text-2xl font-semibold text-gray-900 mb-6">Error Handling</h2>
          <p className="text-gray-700 mb-6">
            The API uses standard HTTP status codes and provides detailed error messages:
          </p>
          <div className="bg-gray-900 text-green-400 p-4 rounded-lg font-mono text-sm overflow-x-auto">
{`{
  "error": {
    "type": "invalid_request",
    "code": "invalid_youtube_url",
    "message": "The provided YouTube URL is not valid or accessible",
    "details": {
      "url": "https://invalid-url",
      "suggestion": "Please check the URL and ensure the video is public"
    }
  }
}`}
          </div>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold text-gray-900 mb-6">Support & Resources</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-blue-50 p-6 rounded-xl">
              <h3 className="text-lg font-semibold text-blue-900 mb-3">📧 Developer Support</h3>
              <p className="text-blue-800 mb-3">
                Get help integrating our API into your applications.
              </p>
              <a 
                href="mailto:api-support@scriptforgeai.co" 
                className="text-blue-600 hover:text-blue-800 font-medium"
              >
                api-support@scriptforgeai.co
              </a>
            </div>
            
            <div className="bg-green-50 p-6 rounded-xl">
              <h3 className="text-lg font-semibold text-green-900 mb-3">🚀 Coming Soon</h3>
              <ul className="text-green-800 space-y-1">
                <li>• Interactive API explorer</li>
                <li>• SDK libraries (Python, Node.js)</li>
                <li>• Webhook documentation</li>
                <li>• Code examples and tutorials</li>
              </ul>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}