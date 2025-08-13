import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Security - ScriptForge AI',
  description: 'Learn about ScriptForge AI\'s security measures and commitment to protecting your data.',
};

export default function SecurityPage() {
  return (
    <div className="max-w-4xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
      <div className="prose prose-lg max-w-none">
        <h1 className="text-4xl font-bold text-gray-900 mb-8">Security at ScriptForge AI</h1>
        <p className="text-xl text-gray-600 mb-12">
          We take security seriously. Learn about our comprehensive approach to protecting 
          your data and ensuring the integrity of our services.
        </p>

        <section className="mb-12">
          <h2 className="text-2xl font-semibold text-gray-900 mb-6">Security Overview</h2>
          <p className="text-gray-700 text-lg leading-relaxed mb-6">
            ScriptForge AI implements enterprise-grade security measures to protect your data, 
            scripts, and personal information. Our security framework covers data encryption, 
            access controls, infrastructure security, and compliance standards.
          </p>
        </section>

        <section className="mb-12">
          <h2 className="text-2xl font-semibold text-gray-900 mb-6">Data Protection</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="bg-blue-50 p-6 rounded-xl">
              <h3 className="text-xl font-semibold text-blue-900 mb-3">🔒 Encryption</h3>
              <ul className="text-blue-800 space-y-2">
                <li>• TLS 1.3 encryption for data in transit</li>
                <li>• AES-256 encryption for data at rest</li>
                <li>• End-to-end encryption for sensitive operations</li>
                <li>• Encrypted database storage</li>
              </ul>
            </div>
            
            <div className="bg-green-50 p-6 rounded-xl">
              <h3 className="text-xl font-semibold text-green-900 mb-3">🛡️ Access Control</h3>
              <ul className="text-green-800 space-y-2">
                <li>• Multi-factor authentication (MFA)</li>
                <li>• Role-based access control (RBAC)</li>
                <li>• Regular access reviews and audits</li>
                <li>• Principle of least privilege</li>
              </ul>
            </div>
          </div>
        </section>

        <section className="mb-12">
          <h2 className="text-2xl font-semibold text-gray-900 mb-6">Infrastructure Security</h2>
          <div className="bg-gradient-to-r from-purple-50 to-blue-50 p-8 rounded-xl">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="w-16 h-16 bg-purple-600 text-white rounded-full flex items-center justify-center mx-auto mb-4 text-2xl">
                  🏗️
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Secure Architecture</h3>
                <p className="text-gray-700 text-sm">
                  Cloud-native architecture with security built-in from the ground up
                </p>
              </div>
              
              <div className="text-center">
                <div className="w-16 h-16 bg-blue-600 text-white rounded-full flex items-center justify-center mx-auto mb-4 text-2xl">
                  🔍
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Monitoring</h3>
                <p className="text-gray-700 text-sm">
                  24/7 security monitoring and automated threat detection
                </p>
              </div>
              
              <div className="text-center">
                <div className="w-16 h-16 bg-green-600 text-white rounded-full flex items-center justify-center mx-auto mb-4 text-2xl">
                  🔄
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Backups</h3>
                <p className="text-gray-700 text-sm">
                  Automated backups with encryption and disaster recovery
                </p>
              </div>
            </div>
          </div>
        </section>

        <section className="mb-12">
          <h2 className="text-2xl font-semibold text-gray-900 mb-6">Application Security</h2>
          <div className="space-y-6">
            <div className="border border-gray-200 p-6 rounded-lg">
              <h3 className="text-xl font-semibold text-gray-900 mb-3">🔐 Authentication & Authorization</h3>
              <ul className="text-gray-700 space-y-2">
                <li>• Secure authentication provided by Clerk</li>
                <li>• Session management with automatic expiration</li>
                <li>• API rate limiting and abuse prevention</li>
                <li>• Input validation and sanitization</li>
              </ul>
            </div>

            <div className="border border-gray-200 p-6 rounded-lg">
              <h3 className="text-xl font-semibold text-gray-900 mb-3">🛠️ Secure Development</h3>
              <ul className="text-gray-700 space-y-2">
                <li>• Security code reviews for all changes</li>
                <li>• Automated security scanning in CI/CD pipeline</li>
                <li>• Regular dependency updates and vulnerability patching</li>
                <li>• Secure coding standards and best practices</li>
              </ul>
            </div>
          </div>
        </section>

        <section className="mb-12">
          <h2 className="text-2xl font-semibold text-gray-900 mb-6">Third-Party Security</h2>
          <p className="text-gray-700 mb-6">
            We carefully vet all third-party services and ensure they meet our security standards:
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-gray-50 p-6 rounded-lg">
              <h4 className="font-semibold text-gray-900 mb-3">Trusted Partners</h4>
              <ul className="text-gray-700 space-y-1 text-sm">
                <li>• <strong>Clerk:</strong> SOC 2 Type II certified authentication</li>
                <li>• <strong>Stripe:</strong> PCI DSS Level 1 certified payments</li>
                <li>• <strong>OpenAI:</strong> Enterprise-grade AI security</li>
                <li>• <strong>Vercel:</strong> Secure edge hosting platform</li>
              </ul>
            </div>
            
            <div className="bg-gray-50 p-6 rounded-lg">
              <h4 className="font-semibold text-gray-900 mb-3">Security Assessments</h4>
              <ul className="text-gray-700 space-y-1 text-sm">
                <li>• Regular third-party security audits</li>
                <li>• Vendor security questionnaires</li>
                <li>• Compliance verification</li>
                <li>• Data processing agreements (DPAs)</li>
              </ul>
            </div>
          </div>
        </section>

        <section className="mb-12">
          <h2 className="text-2xl font-semibold text-gray-900 mb-6">Incident Response</h2>
          <div className="bg-red-50 border border-red-200 p-6 rounded-xl">
            <h3 className="text-lg font-semibold text-red-900 mb-4">🚨 Security Incident Protocol</h3>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-center">
              <div>
                <div className="font-semibold text-red-800">1. Detection</div>
                <div className="text-red-700 text-sm mt-1">Automated monitoring & alerts</div>
              </div>
              <div>
                <div className="font-semibold text-red-800">2. Response</div>
                <div className="text-red-700 text-sm mt-1">Immediate containment</div>
              </div>
              <div>
                <div className="font-semibold text-red-800">3. Investigation</div>
                <div className="text-red-700 text-sm mt-1">Root cause analysis</div>
              </div>
              <div>
                <div className="font-semibold text-red-800">4. Recovery</div>
                <div className="text-red-700 text-sm mt-1">Remediation & notification</div>
              </div>
            </div>
          </div>
        </section>

        <section className="mb-12">
          <h2 className="text-2xl font-semibold text-gray-900 mb-6">Compliance & Certifications</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-blue-50 p-6 rounded-lg text-center">
              <div className="text-3xl mb-3">🇪🇺</div>
              <h3 className="font-semibold text-blue-900 mb-2">GDPR</h3>
              <p className="text-blue-800 text-sm">EU data protection compliance</p>
            </div>
            
            <div className="bg-green-50 p-6 rounded-lg text-center">
              <div className="text-3xl mb-3">🇺🇸</div>
              <h3 className="font-semibold text-green-900 mb-2">CCPA</h3>
              <p className="text-green-800 text-sm">California privacy law compliance</p>
            </div>
            
            <div className="bg-purple-50 p-6 rounded-lg text-center">
              <div className="text-3xl mb-3">🔒</div>
              <h3 className="font-semibold text-purple-900 mb-2">SOC 2</h3>
              <p className="text-purple-800 text-sm">Security controls framework</p>
            </div>
          </div>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold text-gray-900 mb-6">Report a Security Issue</h2>
          <div className="bg-yellow-50 border border-yellow-200 p-6 rounded-xl">
            <h3 className="text-lg font-semibold text-yellow-800 mb-3">🔍 Responsible Disclosure</h3>
            <p className="text-yellow-700 mb-4">
              If you discover a security vulnerability, please help us keep ScriptForge AI secure 
              by reporting it responsibly.
            </p>
            <div className="space-y-2">
              <p className="text-yellow-700">
                <strong>Email:</strong>{' '}
                <a href="mailto:security@scriptforgeai.co" className="text-yellow-800 hover:text-yellow-900">
                  security@scriptforgeai.co
                </a>
              </p>
              <p className="text-yellow-700 text-sm">
                We appreciate responsible disclosure and will acknowledge receipt within 24 hours.
              </p>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}