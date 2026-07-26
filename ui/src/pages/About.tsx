export function About() {
  return (
    <div className="max-w-3xl mx-auto space-y-8">
      <div className="text-center mb-12">
        <h1 className="text-3xl font-bold text-gray-900">About & Architecture</h1>
        <p className="text-gray-500 mt-2">The engineering behind Anonymous Organization Membership</p>
      </div>

      <div className="prose prose-indigo max-w-none text-gray-600 space-y-6">
        <div className="card-base">
          <h2 className="text-xl font-bold text-gray-900 mb-3">Problem Statement</h2>
          <p>
            Why Traditional Membership Systems Leak Privacy? Traditional centralized membership databases act as honeypots for identity theft. Even Web3 DAOs typically expose all member wallets on public ledgers, linking real-world financial activity to organization affiliation.
          </p>
        </div>

        <div className="card-base">
          <h2 className="text-xl font-bold text-gray-900 mb-3">The Solution</h2>
          <p className="mb-4">
            Our <strong>Anonymous Organization Membership Solution</strong> leverages the Midnight Network to sever the link between an individual's identity and their organizational affiliation, while still allowing the organization to definitively verify that the individual belongs to an authorized allowlist.
          </p>
          <ul className="list-disc pl-5 space-y-2 text-sm">
            <li><strong>Midnight Confidential Credentials:</strong> Organizations issue a cryptographic commitment rather than storing plaintext emails or names.</li>
            <li><strong>Zero-Knowledge Membership Verification:</strong> Users generate a proof locally in their browser. Only the mathematical certainty of their membership is published on-chain.</li>
          </ul>
        </div>

        <div className="card-base">
          <h2 className="text-xl font-bold text-gray-900 mb-3">Technical Architecture</h2>
          <p className="mb-4">
            The platform is composed of a robust, modern technology stack designed for security and scalability:
          </p>
          <div className="bg-gray-50 rounded-lg p-6 border border-gray-100">
            <h3 className="font-semibold text-gray-900 mb-2">Technology Stack</h3>
            <ul className="space-y-3 text-sm">
              <li className="flex justify-between border-b border-gray-200 pb-2">
                <span className="font-medium">Smart Contracts</span>
                <span>Compact Language (ZK circuits & Ledger State)</span>
              </li>
              <li className="flex justify-between border-b border-gray-200 pb-2">
                <span className="font-medium">Frontend Framework</span>
                <span>React + Vite (Multi-page SPA via React Router)</span>
              </li>
              <li className="flex justify-between border-b border-gray-200 pb-2">
                <span className="font-medium">Design System</span>
                <span>TailwindCSS + Lucide Icons</span>
              </li>
              <li className="flex justify-between">
                <span className="font-medium">Wallet Integration</span>
                <span>Midnight Lace Wallet Extension</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          <div className="card-base bg-primary-50 border-primary-100">
            <h3 className="font-bold text-gray-900 mb-2">Key Benefits</h3>
            <ul className="list-disc pl-5 text-sm space-y-1">
              <li>Complete identity decoupling</li>
              <li>Immutability via public ledger</li>
              <li>GDPR / CCPA compliance by default</li>
              <li>No central database honeypot</li>
            </ul>
          </div>
          
          <div className="card-base bg-gray-50 border-gray-200">
            <h3 className="font-bold text-gray-900 mb-2">Future Roadmap</h3>
            <ul className="list-disc pl-5 text-sm space-y-1">
              <li>Dynamic credential revocation</li>
              <li>Multi-organization support</li>
              <li>Mobile-native verification app</li>
              <li>Cross-chain ZK bridges</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
