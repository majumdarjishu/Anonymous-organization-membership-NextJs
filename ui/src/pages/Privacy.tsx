import { Eye, EyeOff, ShieldAlert } from 'lucide-react';

export function Privacy() {
  return (
    <div className="max-w-4xl mx-auto space-y-12">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-900">Midnight Privacy Model</h1>
        <p className="text-gray-500 mt-2 text-lg">Understanding what is shared and what remains confidential.</p>
      </div>

      <div className="card-base bg-primary-50 border-primary-100">
        <div className="flex items-start space-x-4">
          <ShieldAlert className="h-6 w-6 text-primary-600 shrink-0 mt-1" />
          <div>
            <h3 className="text-lg font-bold text-gray-900">The Zero-Knowledge Guarantee</h3>
            <p className="text-gray-600 mt-2 leading-relaxed">
              When you verify your membership, the Midnight Network executes a cryptographic circuit locally on your machine. This circuit proves that you hold a valid, non-expired credential that exists in the organization's public allowlist. Only the mathematical proof of this fact is submitted to the blockchain, alongside a unique nullifier to prevent double-usage.
            </p>
          </div>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-8">
        <div className="card-base border-t-4 border-t-red-400">
          <div className="flex items-center space-x-3 mb-6">
            <Eye className="h-6 w-6 text-red-500" />
            <h2 className="text-xl font-bold text-gray-900">What Observers Learn</h2>
          </div>
          <p className="text-sm text-gray-500 mb-6">This data is visible on the public ledger state.</p>
          
          <ul className="space-y-4">
            {[
              'Membership Verified status (Yes/No)',
              'Organization Identifier (Public Key)',
              'Verification Timestamp',
              'Commitment Hash (Not the pre-image)',
              'Credential Status (Active/Revoked)'
            ].map((item, i) => (
              <li key={i} className="flex items-center space-x-3 p-3 bg-red-50 text-red-800 rounded-lg text-sm font-medium">
                <span className="w-1.5 h-1.5 rounded-full bg-red-500 shrink-0"></span>
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="card-base border-t-4 border-t-green-400">
          <div className="flex items-center space-x-3 mb-6">
            <EyeOff className="h-6 w-6 text-green-500" />
            <h2 className="text-xl font-bold text-gray-900">What Remains Private</h2>
          </div>
          <p className="text-sm text-gray-500 mb-6">This data never leaves your local device.</p>
          
          <ul className="space-y-4">
            {[
              'Your true Member Identity',
              'Member Name & Real World ID',
              'Email Address or Phone Number',
              'Internal Membership Number',
              'Personal Information',
              'Private Wallet Keys',
              'Witness Data & Credential Secrets'
            ].map((item, i) => (
              <li key={i} className="flex items-center space-x-3 p-3 bg-green-50 text-green-800 rounded-lg text-sm font-medium">
                <span className="w-1.5 h-1.5 rounded-full bg-green-500 shrink-0"></span>
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
      
      <div className="card-base">
        <h3 className="text-lg font-bold text-gray-900 mb-4">Code Architecture: How we use disclose()</h3>
        <p className="text-gray-600 mb-4 text-sm leading-relaxed">
          In our smart contract architecture, we explicitly use the `disclose()` operator for the administrator's inputs when adding members to the allowlist, as this map needs to be public. However, the user's secret pre-image is kept strictly as a `Witness` and is never disclosed.
        </p>
        <pre className="bg-gray-900 text-gray-300 p-4 rounded-lg text-sm font-mono overflow-x-auto">
{`export circuit joinOrganization(secretWitness: Bytes<32>): [] {
  // Hash the secret locally to derive the commitment
  const commitment = persistentHash<Bytes<32>>(secretWitness);
  
  // Assert the commitment exists in the public allowlist
  assert allowlist.member(commitment), "Commitment not in allowlist";
  
  // The secretWitness is NEVER disclosed to the public ledger
  memberCount = memberCount + 1;
}`}
        </pre>
      </div>
    </div>
  );
}
