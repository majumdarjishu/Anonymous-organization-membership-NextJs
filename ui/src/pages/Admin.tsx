import { useState } from 'react';
import { useWallet } from '../context/WalletContext';
import { WalletRequired } from '../components/WalletRequired';
import { Shield, Plus, Key, Copy, Trash2, Download, CheckCircle, Lock, Layers, Sparkles } from 'lucide-react';

export function Admin() {
  const { walletAddress, isAdmin, allowlist, addAllowlistCommitment, removeAllowlistCommitment } = useWallet();
  const [commitmentInput, setCommitmentInput] = useState('');
  const [targetOrg, setTargetOrg] = useState('Jishu Org Alpha');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  if (!walletAddress) {
    return <WalletRequired title="Admin Management Panel" description="Connect your Lace wallet or enter Demo Mode to access the organization allowlist administration tools." />;
  }

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  };

  const handleGenerateRandom = () => {
    const randomHex = `0x${Array.from({ length: 40 }, () => Math.floor(Math.random() * 16).toString(16)).join('')}`;
    setCommitmentInput(randomHex);
  };

  const handleAddCommitment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!commitmentInput) return;
    setIsSubmitting(true);
    
    try {
      await new Promise(resolve => setTimeout(resolve, 1200));
      addAllowlistCommitment(commitmentInput, targetOrg);
      showToast(`Commitment added to ${targetOrg} allowlist!`);
      setCommitmentInput('');
    } catch (err) {
      showToast('Failed to add commitment to contract allowlist.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRemove = (id: string, hex: string) => {
    if (confirm(`Remove commitment ${hex.slice(0, 12)}... from allowlist?`)) {
      removeAllowlistCommitment(id);
      showToast(`Removed commitment ${id} from allowlist.`);
    }
  };

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    showToast('Commitment hash copied to clipboard!');
  };

  const handleExportAllowlist = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(allowlist, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `allowlist-${new Date().toISOString().split('T')[0]}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  if (!isAdmin) {
    return (
      <div className="max-w-xl mx-auto py-12">
        <div className="card-base text-center py-10 border border-red-200 bg-red-50/50">
          <Lock className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Access Denied</h2>
          <p className="text-gray-600 text-sm max-w-md mx-auto mb-6">
            Connected address <code className="bg-white px-2 py-1 rounded text-red-700 font-mono text-xs">{walletAddress}</code> is not authorized as the contract administrator.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-6xl mx-auto">
      {/* Toast */}
      {toast && (
        <div className="fixed bottom-6 right-6 z-50 bg-gray-900 text-white px-4 py-3 rounded-xl shadow-xl flex items-center space-x-2 text-sm border border-gray-700">
          <CheckCircle className="h-4 w-4 text-emerald-400" />
          <span>{toast}</span>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end border-b border-gray-200 pb-6 gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Admin Allowlist Management</h1>
          <p className="text-gray-500 mt-1">Add or remove member public commitments on the Midnight Network smart contract.</p>
        </div>
        <button 
          onClick={handleExportAllowlist} 
          className="btn-secondary flex items-center space-x-2 py-2.5 px-4 text-sm font-semibold border-gray-300"
        >
          <Download className="h-4 w-4 text-gray-600" />
          <span>Export Allowlist JSON</span>
        </button>
      </div>

      {/* Admin Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="card-base bg-gradient-to-br from-gray-900 to-indigo-950 text-white border-none shadow-md">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs text-gray-400 uppercase tracking-wider font-bold">Contract Allowlist Size</span>
            <Shield className="h-5 w-5 text-indigo-400" />
          </div>
          <p className="text-3xl font-bold">{allowlist.length}</p>
          <p className="text-xs text-indigo-300 mt-1">Registered Public Commitments</p>
        </div>

        <div className="card-base border border-gray-200 shadow-sm">
          <div className="flex items-center justify-between mb-3 text-gray-500">
            <span className="text-xs uppercase tracking-wider font-bold">Admin Status</span>
            <Lock className="h-5 w-5 text-emerald-600" />
          </div>
          <p className="text-lg font-bold text-gray-900 truncate font-mono">{walletAddress.slice(0, 14)}...</p>
          <p className="text-xs text-emerald-600 mt-1 flex items-center font-medium">
            <span className="w-2 h-2 rounded-full bg-emerald-500 mr-1.5"></span>
            Contract Deployer Keys Active
          </p>
        </div>

        <div className="card-base border border-gray-200 shadow-sm">
          <div className="flex items-center justify-between mb-3 text-gray-500">
            <span className="text-xs uppercase tracking-wider font-bold">Circuit Version</span>
            <Layers className="h-5 w-5 text-primary-600" />
          </div>
          <p className="text-2xl font-bold text-gray-900">Compact v0.16</p>
          <p className="text-xs text-gray-500 mt-1">Disclose() Operator Enabled</p>
        </div>
      </div>

      {/* Add Commitment Form */}
      <div className="card-base border border-gray-200 shadow-md">
        <div className="flex items-center space-x-3 mb-4 border-b pb-4">
          <div className="bg-primary-100 p-2.5 rounded-xl text-primary-600">
            <Plus className="h-5 w-5" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-gray-900">Add Member Commitment</h2>
            <p className="text-xs text-gray-500">Publish a member's public commitment hash to the contract allowlist.</p>
          </div>
        </div>

        <form onSubmit={handleAddCommitment} className="space-y-4">
          <div className="grid md:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">Target Organization</label>
              <select 
                value={targetOrg} 
                onChange={(e) => setTargetOrg(e.target.value)}
                className="input-field text-sm cursor-pointer"
              >
                <option value="Jishu Org Alpha">Jishu Org Alpha</option>
                <option value="Midnight Privacy Guild">Midnight Privacy Guild</option>
                <option value="Confidential Enterprise">Confidential Enterprise</option>
              </select>
            </div>

            <div className="md:col-span-2">
              <div className="flex justify-between items-center mb-1">
                <label className="block text-xs font-semibold text-gray-700">32-Byte Commitment Hash (Hex)</label>
                <button 
                  type="button" 
                  onClick={handleGenerateRandom}
                  className="text-xs text-primary-600 hover:text-primary-800 font-semibold flex items-center space-x-1"
                >
                  <Sparkles className="h-3 w-3 text-amber-500" />
                  <span>Generate Random Hex</span>
                </button>
              </div>
              <div className="relative">
                <input 
                  type="text" 
                  placeholder="0x3f8a92b1c4e7d5a089124ef56102..." 
                  value={commitmentInput}
                  onChange={(e) => setCommitmentInput(e.target.value)}
                  className="input-field text-sm font-mono pr-10"
                  disabled={isSubmitting}
                  required
                />
                <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                  <Key className="h-4 w-4 text-gray-400" />
                </div>
              </div>
            </div>
          </div>

          <button 
            type="submit" 
            disabled={isSubmitting || !commitmentInput} 
            className="btn-primary w-full py-3 text-sm font-semibold shadow-md flex items-center justify-center space-x-2 disabled:opacity-50"
          >
            <Plus className="h-4 w-4" />
            <span>{isSubmitting ? 'Publishing Commitment to Midnight Contract...' : 'Add Commitment to Allowlist'}</span>
          </button>
        </form>
      </div>

      {/* Existing Commitments Table */}
      <div className="card-base p-0 overflow-hidden shadow-md border border-gray-200">
        <div className="p-4 bg-gray-50 border-b border-gray-200 flex justify-between items-center">
          <h3 className="text-base font-bold text-gray-900">Active Public Allowlist Commitments</h3>
          <span className="text-xs bg-primary-100 text-primary-700 font-bold px-2.5 py-1 rounded-full">
            {allowlist.length} Items
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 text-sm">
            <thead className="bg-gray-100/70">
              <tr>
                <th className="px-6 py-3.5 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">ID</th>
                <th className="px-6 py-3.5 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">Organization</th>
                <th className="px-6 py-3.5 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">Public Commitment Hash</th>
                <th className="px-6 py-3.5 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">Date Added</th>
                <th className="px-6 py-3.5 text-right text-xs font-bold text-gray-600 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {allowlist.map((item) => (
                <tr key={item.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap font-bold text-gray-900 text-xs">{item.id}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-gray-900 font-medium">{item.org}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center space-x-2">
                      <span className="font-mono text-xs bg-gray-100 text-emerald-700 font-semibold px-2 py-1 rounded border border-gray-200">
                        {item.commitment}
                      </span>
                      <button 
                        onClick={() => handleCopy(item.commitment)} 
                        className="text-gray-400 hover:text-gray-600 p-1" 
                        title="Copy Hash"
                      >
                        <Copy className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-gray-500 text-xs">{item.addedAt}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-right">
                    <button 
                      onClick={() => handleRemove(item.id, item.commitment)} 
                      className="text-red-600 hover:bg-red-50 p-1.5 rounded-lg transition-colors inline-flex items-center space-x-1 border border-red-200 text-xs font-medium"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                      <span>Remove</span>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
