import { useWallet } from '../context/WalletContext';
import { Navigate } from 'react-router-dom';
import { Search, Filter, Copy, CheckCircle } from 'lucide-react';

export function History() {
  const { walletAddress } = useWallet();

  if (!walletAddress) {
    return <Navigate to="/" replace />;
  }

  const history = [
    {
      id: 'tx_8a92b1...',
      timestamp: new Date().toLocaleString(),
      org: 'AnonOrg Alpha',
      result: 'Verified',
      hash: '0x3f8a92b1c4e7d5...',
      status: 'Active'
    }
  ];

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    alert('Copied to clipboard!');
  };

  return (
    <div className="space-y-8 max-w-6xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-end border-b border-gray-200 pb-6 gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Verification History</h1>
          <p className="text-gray-500 mt-1">Audit log of your Zero-Knowledge proofs.</p>
        </div>
        <div className="flex space-x-3">
          <div className="relative">
            <Search className="h-4 w-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input type="text" placeholder="Search..." className="input-field pl-9 py-2 m-0 h-full w-full sm:w-64" style={{ marginBottom: 0 }} />
          </div>
          <button className="btn-secondary p-2.5 flex items-center justify-center">
            <Filter className="h-4 w-4 text-gray-500" />
          </button>
        </div>
      </div>

      <div className="card-base p-0 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 text-sm">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Timestamp</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Organization</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Result</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Commitment Hash</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {history.map((record, i) => (
                <tr key={i} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap text-gray-500">{record.timestamp}</td>
                  <td className="px-6 py-4 whitespace-nowrap font-medium text-gray-900">{record.org}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="inline-flex items-center space-x-1 text-green-600 font-medium">
                      <CheckCircle className="h-4 w-4" />
                      <span>{record.result}</span>
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center space-x-2">
                      <span className="font-mono text-gray-500 text-xs bg-gray-100 px-2 py-1 rounded">{record.hash}</span>
                      <button onClick={() => copyToClipboard(record.hash)} className="text-gray-400 hover:text-gray-600">
                        <Copy className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                      {record.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        <div className="bg-gray-50 px-6 py-3 border-t border-gray-200 flex items-center justify-between">
          <p className="text-sm text-gray-500">Showing 1 to 1 of 1 entries</p>
          <div className="flex space-x-2">
            <button className="btn-secondary py-1 px-3 text-sm" disabled>Previous</button>
            <button className="btn-secondary py-1 px-3 text-sm" disabled>Next</button>
          </div>
        </div>
      </div>
    </div>
  );
}
