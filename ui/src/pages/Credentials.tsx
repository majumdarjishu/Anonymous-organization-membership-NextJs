import { Shield, Eye, Download, RefreshCw, XCircle } from 'lucide-react';
import { useWallet } from '../context/WalletContext';
import { Navigate } from 'react-router-dom';

export function Credentials() {
  const { walletAddress } = useWallet();

  if (!walletAddress) {
    return <Navigate to="/" replace />;
  }

  const credentials = [
    {
      id: 'CRED-8A2F9-001',
      org: 'AnonOrg Alpha',
      issueDate: '2026-07-26',
      expiryDate: '2027-07-26',
      type: 'Premium Member',
      status: 'Active',
      count: 4
    }
  ];

  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      <div className="flex justify-between items-end border-b border-gray-200 pb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Credential Vault</h1>
          <p className="text-gray-500 mt-1">Manage your confidential membership credentials safely.</p>
        </div>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {credentials.map(cred => (
          <div key={cred.id} className="card-base flex flex-col h-full">
            <div className="flex justify-between items-start mb-4">
              <div className="bg-primary-50 p-2 rounded-lg">
                <Shield className="h-6 w-6 text-primary-600" />
              </div>
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-50 text-green-700">
                {cred.status}
              </span>
            </div>
            
            <h3 className="text-lg font-bold text-gray-900">{cred.org}</h3>
            <p className="text-sm font-medium text-primary-600 mb-4">{cred.type}</p>
            
            <div className="space-y-2 text-sm text-gray-500 mb-6 flex-grow">
              <div className="flex justify-between">
                <span>Credential ID</span>
                <span className="font-mono text-gray-900">{cred.id}</span>
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
                <span>Verifications</span>
                <span className="text-gray-900">{cred.count} times</span>
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-2 mt-auto pt-4 border-t border-gray-100">
              <button className="btn-secondary text-xs flex items-center justify-center space-x-1 py-1.5">
                <Eye className="h-3 w-3" /> <span>View</span>
              </button>
              <button className="btn-secondary text-xs flex items-center justify-center space-x-1 py-1.5">
                <Download className="h-3 w-3" /> <span>Export</span>
              </button>
              <button className="btn-secondary text-xs flex items-center justify-center space-x-1 py-1.5">
                <RefreshCw className="h-3 w-3" /> <span>Renew</span>
              </button>
              <button className="btn-secondary text-xs flex items-center justify-center space-x-1 py-1.5 text-red-600 hover:bg-red-50 hover:text-red-700 hover:border-red-200">
                <XCircle className="h-3 w-3" /> <span>Revoke</span>
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
