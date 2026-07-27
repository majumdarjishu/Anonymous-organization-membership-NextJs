import { useState } from 'react';
import { Shield, Eye, Download, RefreshCw, XCircle, Plus, CheckCircle, X, Lock } from 'lucide-react';
import { useWallet } from '../context/WalletContext';
import type { CredentialItem } from '../context/WalletContext';
import { WalletRequired } from '../components/WalletRequired';

export function Credentials() {
  const { walletAddress, credentials, addCredential, revokeCredential, renewCredential } = useWallet();
  const [filter, setFilter] = useState<'All' | 'Active' | 'Revoked'>('All');
  const [selectedCred, setSelectedCred] = useState<CredentialItem | null>(null);
  const [showIssueModal, setShowIssueModal] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  // New Credential Form state
  const [newOrg, setNewOrg] = useState('');
  const [newType, setNewType] = useState('Full Member');

  if (!walletAddress) {
    return <WalletRequired title="Credential Vault Access" description="Connect your Lace wallet or enter Demo Mode to view and manage your confidential credentials." />;
  }

  const showToastMsg = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  };

  const filteredCredentials = credentials.filter(c => {
    if (filter === 'All') return true;
    return c.status === filter;
  });

  const handleExport = (cred: CredentialItem) => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(cred, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `${cred.id}_credential.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
    showToastMsg(`Exported credential ${cred.id} as JSON!`);
  };

  const handleRenew = (id: string) => {
    renewCredential(id);
    showToastMsg(`Credential ${id} renewed for 1 year!`);
  };

  const handleRevoke = (id: string) => {
    if (confirm(`Are you sure you want to revoke credential ${id}?`)) {
      revokeCredential(id);
      showToastMsg(`Credential ${id} has been revoked.`);
    }
  };

  const handleIssueSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newOrg) return;

    const issueDate = new Date().toISOString().split('T')[0];
    const expiry = new Date();
    expiry.setFullYear(expiry.getFullYear() + 1);
    const expiryDate = expiry.toISOString().split('T')[0];

    const commitment = `0x${Array.from({ length: 40 }, () => Math.floor(Math.random() * 16).toString(16)).join('')}`;

    addCredential({
      org: newOrg,
      type: newType,
      issueDate,
      expiryDate,
      status: 'Active',
      commitment
    });

    setNewOrg('');
    setShowIssueModal(false);
    showToastMsg(`Issued new credential for ${newOrg}!`);
  };

  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      {/* Toast Notification */}
      {toast && (
        <div className="fixed bottom-6 right-6 z-50 bg-gray-900 text-white px-4 py-3 rounded-xl shadow-xl flex items-center space-x-2 text-sm border border-gray-700">
          <CheckCircle className="h-4 w-4 text-emerald-400" />
          <span>{toast}</span>
        </div>
      )}

      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end border-b border-gray-200 pb-6 gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Credential Vault</h1>
          <p className="text-gray-500 mt-1">Manage your confidential zero-knowledge membership credentials.</p>
        </div>
        <button 
          onClick={() => setShowIssueModal(true)} 
          className="btn-primary flex items-center space-x-2 py-2.5 px-4 text-sm font-semibold shadow"
        >
          <Plus className="h-4 w-4" />
          <span>Issue New Credential</span>
        </button>
      </div>

      {/* Filter Tabs */}
      <div className="flex space-x-2 border-b border-gray-200 pb-2">
        {(['All', 'Active', 'Revoked'] as const).map(tab => (
          <button
            key={tab}
            onClick={() => setFilter(tab)}
            className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
              filter === tab 
                ? 'bg-primary-50 text-primary-700 font-semibold' 
                : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
            }`}
          >
            {tab} Credentials ({credentials.filter(c => tab === 'All' || c.status === tab).length})
          </button>
        ))}
      </div>

      {/* Credentials Grid */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredCredentials.map(cred => (
          <div key={cred.id} className="card-base flex flex-col h-full shadow-md border border-gray-200 hover:shadow-lg transition-shadow">
            <div className="flex justify-between items-start mb-4">
              <div className="bg-primary-50 p-2.5 rounded-xl">
                <Shield className="h-6 w-6 text-primary-600" />
              </div>
              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                cred.status === 'Active' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-red-50 text-red-700 border border-red-200'
              }`}>
                {cred.status}
              </span>
            </div>
            
            <h3 className="text-lg font-bold text-gray-900">{cred.org}</h3>
            <p className="text-sm font-medium text-primary-600 mb-4">{cred.type}</p>
            
            <div className="space-y-2 text-sm text-gray-500 mb-6 flex-grow bg-gray-50 p-3 rounded-lg border border-gray-100">
              <div className="flex justify-between">
                <span>Credential ID</span>
                <span className="font-mono text-gray-900 font-semibold">{cred.id}</span>
              </div>
              <div className="flex justify-between">
                <span>Issued</span>
                <span className="text-gray-900">{cred.issueDate}</span>
              </div>
              <div className="flex justify-between">
                <span>Expires</span>
                <span className="text-gray-900">{cred.expiryDate}</span>
              </div>
              <div className="flex justify-between">
                <span>Verified</span>
                <span className="text-gray-900 font-semibold">{cred.count} times</span>
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-2 mt-auto pt-2">
              <button 
                onClick={() => setSelectedCred(cred)} 
                className="btn-secondary text-xs flex items-center justify-center space-x-1.5 py-2 font-medium"
              >
                <Eye className="h-3.5 w-3.5 text-primary-600" /> <span>View Details</span>
              </button>
              
              <button 
                onClick={() => handleExport(cred)} 
                className="btn-secondary text-xs flex items-center justify-center space-x-1.5 py-2 font-medium"
              >
                <Download className="h-3.5 w-3.5 text-gray-600" /> <span>Export JSON</span>
              </button>
              
              <button 
                onClick={() => handleRenew(cred.id)} 
                className="btn-secondary text-xs flex items-center justify-center space-x-1.5 py-2 font-medium"
              >
                <RefreshCw className="h-3.5 w-3.5 text-emerald-600" /> <span>Renew</span>
              </button>

              {cred.status === 'Active' ? (
                <button 
                  onClick={() => handleRevoke(cred.id)} 
                  className="btn-secondary text-xs flex items-center justify-center space-x-1.5 py-2 font-medium text-red-600 hover:bg-red-50 border-red-200"
                >
                  <XCircle className="h-3.5 w-3.5" /> <span>Revoke</span>
                </button>
              ) : (
                <button disabled className="btn-secondary text-xs opacity-40 cursor-not-allowed">
                  Revoked
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* View Credential Details Modal */}
      {selectedCred && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-gray-200 space-y-4">
            <div className="flex justify-between items-center border-b pb-3">
              <h3 className="text-lg font-bold text-gray-900 flex items-center">
                <Lock className="h-5 w-5 text-primary-600 mr-2" />
                Credential Details
              </h3>
              <button onClick={() => setSelectedCred(null)} className="text-gray-400 hover:text-gray-600">
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-3 text-sm">
              <div className="bg-primary-50 p-3 rounded-xl border border-primary-100">
                <p className="text-xs text-primary-600 uppercase font-bold tracking-wider">Organization</p>
                <p className="text-base font-bold text-gray-900">{selectedCred.org}</p>
                <p className="text-xs text-primary-700">{selectedCred.type}</p>
              </div>

              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="bg-gray-50 p-2.5 rounded-lg border">
                  <span className="text-gray-500 block">ID</span>
                  <span className="font-mono font-semibold text-gray-900">{selectedCred.id}</span>
                </div>
                <div className="bg-gray-50 p-2.5 rounded-lg border">
                  <span className="text-gray-500 block">Status</span>
                  <span className="font-semibold text-emerald-600">{selectedCred.status}</span>
                </div>
                <div className="bg-gray-50 p-2.5 rounded-lg border">
                  <span className="text-gray-500 block">Issued</span>
                  <span className="text-gray-900">{selectedCred.issueDate}</span>
                </div>
                <div className="bg-gray-50 p-2.5 rounded-lg border">
                  <span className="text-gray-500 block">Expires</span>
                  <span className="text-gray-900">{selectedCred.expiryDate}</span>
                </div>
              </div>

              <div>
                <span className="text-xs text-gray-500 block mb-1">Public Commitment Hash</span>
                <p className="font-mono text-xs bg-gray-900 text-emerald-400 p-2.5 rounded-lg break-all">
                  {selectedCred.commitment}
                </p>
              </div>
            </div>

            <div className="flex justify-end space-x-2 pt-2">
              <button onClick={() => handleExport(selectedCred)} className="btn-secondary py-2 px-4 text-xs font-semibold flex items-center space-x-1">
                <Download className="h-3.5 w-3.5" /> <span>Export JSON</span>
              </button>
              <button onClick={() => setSelectedCred(null)} className="btn-primary py-2 px-4 text-xs font-semibold">
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Issue Credential Modal */}
      {showIssueModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-gray-200 space-y-4">
            <div className="flex justify-between items-center border-b pb-3">
              <h3 className="text-lg font-bold text-gray-900">Issue / Claim Membership Credential</h3>
              <button onClick={() => setShowIssueModal(false)} className="text-gray-400 hover:text-gray-600">
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleIssueSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Organization Name</label>
                <input 
                  type="text" 
                  placeholder="e.g. Midnight Developer Guild" 
                  value={newOrg} 
                  onChange={(e) => setNewOrg(e.target.value)}
                  className="input-field text-sm"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Membership Tier</label>
                <select 
                  value={newType} 
                  onChange={(e) => setNewType(e.target.value)}
                  className="input-field text-sm cursor-pointer"
                >
                  <option value="Full Member">Full Member</option>
                  <option value="Executive Contributor">Executive Contributor</option>
                  <option value="VIP Access">VIP Access</option>
                  <option value="Auditor">Auditor</option>
                </select>
              </div>

              <div className="bg-primary-50 p-3 rounded-lg text-xs text-primary-800">
                A public cryptographic commitment will be derived automatically for this credential.
              </div>

              <div className="flex justify-end space-x-2 pt-2">
                <button type="button" onClick={() => setShowIssueModal(false)} className="btn-secondary py-2 px-4 text-xs font-semibold">
                  Cancel
                </button>
                <button type="submit" className="btn-primary py-2 px-4 text-xs font-semibold">
                  Issue Credential
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
