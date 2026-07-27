import { useState } from 'react';
import { useWallet } from '../context/WalletContext';
import type { HistoryRecord } from '../context/WalletContext';
import { WalletRequired } from '../components/WalletRequired';
import { Search, Copy, CheckCircle, FileText, Download, X, ShieldCheck } from 'lucide-react';

export function History() {
  const { walletAddress, history } = useWallet();
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'All' | 'Verified' | 'Active'>('All');
  const [selectedRecord, setSelectedRecord] = useState<HistoryRecord | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  if (!walletAddress) {
    return <WalletRequired title="Audit Trail Requires Wallet" description="Connect your Lace wallet or Demo Mode to view and audit your confidential verification history." />;
  }

  const copyToClipboard = (text: string, recordId: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(recordId);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const filteredHistory = history.filter(record => {
    const matchesSearch = 
      record.org.toLowerCase().includes(searchQuery.toLowerCase()) ||
      record.hash.toLowerCase().includes(searchQuery.toLowerCase()) ||
      record.proofType.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus = statusFilter === 'All' || record.result === statusFilter || record.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const exportAuditLog = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(history, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `zk-audit-log-${new Date().toISOString().split('T')[0]}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  return (
    <div className="space-y-8 max-w-6xl mx-auto">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end border-b border-gray-200 pb-6 gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Verification History</h1>
          <p className="text-gray-500 mt-1">Immutable cryptographic audit log of your Zero-Knowledge proofs.</p>
        </div>
        <button 
          onClick={exportAuditLog} 
          className="btn-secondary flex items-center space-x-2 py-2.5 px-4 text-sm font-semibold border-gray-300"
        >
          <Download className="h-4 w-4 text-gray-600" />
          <span>Export Audit Log</span>
        </button>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col sm:flex-row justify-between items-center gap-4 bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
        <div className="relative w-full sm:w-80">
          <Search className="h-4 w-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          <input 
            type="text" 
            placeholder="Search by Org, Hash, or Type..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="input-field pl-9 py-2 text-sm w-full m-0" 
            style={{ marginBottom: 0 }}
          />
        </div>

        <div className="flex space-x-2 w-full sm:w-auto">
          {(['All', 'Verified'] as const).map(f => (
            <button
              key={f}
              onClick={() => setStatusFilter(f)}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors ${
                statusFilter === f 
                  ? 'bg-primary-50 text-primary-700 border border-primary-200' 
                  : 'bg-gray-50 text-gray-600 hover:bg-gray-100 border border-gray-200'
              }`}
            >
              {f} ({history.filter(h => f === 'All' || h.result === f).length})
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="card-base p-0 overflow-hidden shadow-md border border-gray-200">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 text-sm">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3.5 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">Timestamp</th>
                <th className="px-6 py-3.5 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">Organization</th>
                <th className="px-6 py-3.5 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">Verification Result</th>
                <th className="px-6 py-3.5 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">Proof Hash</th>
                <th className="px-6 py-3.5 text-right text-xs font-bold text-gray-600 uppercase tracking-wider">Action</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredHistory.length > 0 ? (
                filteredHistory.map((record) => (
                  <tr key={record.id} className="hover:bg-gray-50/80 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap text-gray-500 text-xs">{record.timestamp}</td>
                    <td className="px-6 py-4 whitespace-nowrap font-bold text-gray-900">{record.org}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="inline-flex items-center space-x-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                        <CheckCircle className="h-3.5 w-3.5" />
                        <span>{record.result}</span>
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center space-x-2">
                        <span className="font-mono text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded border border-gray-200">
                          {record.hash.slice(0, 16)}...
                        </span>
                        <button 
                          onClick={() => copyToClipboard(record.hash, record.id)} 
                          className="p-1 rounded text-gray-400 hover:text-primary-600 hover:bg-gray-100 transition-colors"
                          title="Copy Full Hash"
                        >
                          {copiedId === record.id ? <CheckCircle className="h-4 w-4 text-emerald-600" /> : <Copy className="h-4 w-4" />}
                        </button>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right">
                      <button 
                        onClick={() => setSelectedRecord(record)} 
                        className="btn-secondary py-1 px-3 text-xs font-semibold inline-flex items-center space-x-1"
                      >
                        <FileText className="h-3.5 w-3.5 text-primary-600" />
                        <span>Audit Proof</span>
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-gray-500 text-sm">
                    No verification records found matching "{searchQuery}".
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="bg-gray-50 px-6 py-3 border-t border-gray-200 flex items-center justify-between">
          <p className="text-xs text-gray-500 font-medium">Showing {filteredHistory.length} of {history.length} audit entries</p>
          <div className="flex space-x-2">
            <button className="btn-secondary py-1 px-3 text-xs font-medium" disabled>Previous</button>
            <button className="btn-secondary py-1 px-3 text-xs font-medium" disabled>Next</button>
          </div>
        </div>
      </div>

      {/* Audit Detail Modal */}
      {selectedRecord && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-gray-200 space-y-4">
            <div className="flex justify-between items-center border-b pb-3">
              <h3 className="text-lg font-bold text-gray-900 flex items-center">
                <ShieldCheck className="h-5 w-5 text-emerald-600 mr-2" />
                Proof Audit Report
              </h3>
              <button onClick={() => setSelectedRecord(null)} className="text-gray-400 hover:text-gray-600">
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="bg-emerald-50 p-3 rounded-xl border border-emerald-200 flex items-center justify-between">
                <div>
                  <span className="text-gray-500 text-xs block">Organization</span>
                  <span className="text-sm font-bold text-gray-900">{selectedRecord.org}</span>
                </div>
                <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-600 text-white">
                  {selectedRecord.result}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div className="bg-gray-50 p-2.5 rounded-lg border">
                  <span className="text-gray-500 block">Transaction ID</span>
                  <span className="font-mono text-gray-900 font-bold">{selectedRecord.id}</span>
                </div>
                <div className="bg-gray-50 p-2.5 rounded-lg border">
                  <span className="text-gray-500 block">Block Height</span>
                  <span className="font-mono text-gray-900 font-bold">#{selectedRecord.blockHeight}</span>
                </div>
                <div className="bg-gray-50 p-2.5 rounded-lg border">
                  <span className="text-gray-500 block">Timestamp</span>
                  <span className="text-gray-900 font-semibold">{selectedRecord.timestamp}</span>
                </div>
                <div className="bg-gray-50 p-2.5 rounded-lg border">
                  <span className="text-gray-500 block">Proof Scheme</span>
                  <span className="text-gray-900 font-semibold">{selectedRecord.proofType}</span>
                </div>
              </div>

              <div>
                <span className="text-gray-500 block mb-1">Full Proof Commitment Hash</span>
                <div className="bg-gray-900 text-emerald-400 p-3 rounded-lg font-mono text-xs break-all flex justify-between items-center">
                  <span>{selectedRecord.hash}</span>
                  <button onClick={() => copyToClipboard(selectedRecord.hash, selectedRecord.id)} className="ml-2 text-gray-400 hover:text-white">
                    <Copy className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <button onClick={() => setSelectedRecord(null)} className="btn-primary py-2 px-4 text-xs font-semibold">
                Close Report
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
