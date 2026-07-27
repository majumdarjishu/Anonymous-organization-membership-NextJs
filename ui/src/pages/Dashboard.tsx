import { useWallet } from '../context/WalletContext';
import { WalletRequired } from '../components/WalletRequired';
import { Shield, Activity, Users, Clock, ArrowRight, Lock, CheckCircle, FileText } from 'lucide-react';
import { Link } from 'react-router-dom';

export function Dashboard() {
  const { walletAddress, memberCount, credentials, history } = useWallet();
  const NETWORK = import.meta.env.VITE_NETWORK || 'Midnight Testnet';

  if (!walletAddress) {
    return <WalletRequired title="Dashboard Requires Wallet" description="Connect your Lace wallet or launch in Demo Mode to view your member status and credentials." />;
  }

  const activeCredentials = credentials.filter(c => c.status === 'Active').length;

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-end border-b border-gray-200 pb-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Member Dashboard</h1>
          <p className="text-gray-500 mt-1">Overview of your confidential credentials and zero-knowledge activity.</p>
        </div>
        <div className="hidden sm:block">
          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
            <span className="w-2 h-2 rounded-full bg-emerald-500 mr-2"></span>
            Membership Active
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="card-base bg-gradient-to-br from-primary-600 to-indigo-700 text-white border-none shadow-lg">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-medium text-primary-100 text-sm">Active Credentials</h3>
            <Shield className="h-5 w-5 text-primary-200" />
          </div>
          <p className="text-3xl font-bold">{activeCredentials}</p>
          <p className="text-xs text-primary-200 mt-2">Confidential Zero-Knowledge Vault</p>
        </div>
        
        <div className="card-base shadow-sm border border-gray-200">
          <div className="flex items-center justify-between mb-4 text-gray-500">
            <h3 className="font-medium text-sm">Total Allowlist Members</h3>
            <Users className="h-5 w-5 text-primary-600" />
          </div>
          <p className="text-3xl font-bold text-gray-900">{memberCount}</p>
          <p className="text-xs text-gray-500 mt-2">Verified anonymously via Midnight</p>
        </div>

        <div className="card-base shadow-sm border border-gray-200">
          <div className="flex items-center justify-between mb-4 text-gray-500">
            <h3 className="font-medium text-sm">Network Status</h3>
            <Activity className="h-5 w-5 text-emerald-600" />
          </div>
          <p className="text-2xl font-bold text-gray-900 capitalize">{NETWORK}</p>
          <p className="text-xs text-emerald-600 mt-2 flex items-center font-medium">
            <span className="w-2 h-2 bg-emerald-500 rounded-full mr-2 animate-pulse"></span>
            ZK-Prover Circuit Online
          </p>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-8">
        <div className="card-base shadow-md border border-gray-200">
          <h3 className="text-lg font-bold text-gray-900 mb-4 border-b pb-3">Quick Navigation Actions</h3>
          <div className="space-y-3">
            <Link to="/verify" className="flex items-center justify-between p-3.5 hover:bg-primary-50/60 rounded-xl transition-colors border border-gray-100 hover:border-primary-200 group">
              <div className="flex items-center space-x-3">
                <div className="bg-primary-100 p-2.5 rounded-xl text-primary-600 group-hover:bg-primary-600 group-hover:text-white transition-colors">
                  <Shield className="h-5 w-5" />
                </div>
                <div>
                  <p className="font-bold text-gray-900 text-sm">Verify Membership</p>
                  <p className="text-xs text-gray-500">Generate a new Zero-Knowledge proof</p>
                </div>
              </div>
              <ArrowRight className="h-4 w-4 text-gray-400 group-hover:text-primary-600 transition-colors" />
            </Link>
            
            <Link to="/credentials" className="flex items-center justify-between p-3.5 hover:bg-primary-50/60 rounded-xl transition-colors border border-gray-100 hover:border-primary-200 group">
              <div className="flex items-center space-x-3">
                <div className="bg-indigo-100 p-2.5 rounded-xl text-indigo-600 group-hover:bg-indigo-600 group-hover:text-white transition-colors">
                  <Lock className="h-5 w-5" />
                </div>
                <div>
                  <p className="font-bold text-gray-900 text-sm">Credential Vault</p>
                  <p className="text-xs text-gray-500">Manage and export your credentials</p>
                </div>
              </div>
              <ArrowRight className="h-4 w-4 text-gray-400 group-hover:text-primary-600 transition-colors" />
            </Link>

            <Link to="/history" className="flex items-center justify-between p-3.5 hover:bg-primary-50/60 rounded-xl transition-colors border border-gray-100 hover:border-primary-200 group">
              <div className="flex items-center space-x-3">
                <div className="bg-emerald-100 p-2.5 rounded-xl text-emerald-600 group-hover:bg-emerald-600 group-hover:text-white transition-colors">
                  <FileText className="h-5 w-5" />
                </div>
                <div>
                  <p className="font-bold text-gray-900 text-sm">Audit History</p>
                  <p className="text-xs text-gray-500">View proof logs and verification history</p>
                </div>
              </div>
              <ArrowRight className="h-4 w-4 text-gray-400 group-hover:text-primary-600 transition-colors" />
            </Link>
          </div>
        </div>

        <div className="card-base shadow-md border border-gray-200">
          <h3 className="text-lg font-bold text-gray-900 mb-4 border-b pb-3">Recent ZK Verification Activity</h3>
          <div className="space-y-4">
            {history.slice(0, 3).map((item) => (
              <div key={item.id} className="flex items-start space-x-3 p-3 bg-gray-50 rounded-xl border border-gray-100">
                <div className="mt-0.5 bg-emerald-100 text-emerald-600 p-1.5 rounded-full shrink-0">
                  <CheckCircle className="h-4 w-4" />
                </div>
                <div className="flex-grow min-w-0">
                  <div className="flex justify-between items-center">
                    <p className="font-bold text-gray-900 text-sm truncate">{item.org}</p>
                    <span className="text-xs font-semibold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">{item.result}</span>
                  </div>
                  <p className="text-xs text-gray-500 font-mono mt-1 truncate">Proof: {item.hash}</p>
                  <p className="text-xs text-gray-400 flex items-center mt-1">
                    <Clock className="h-3 w-3 mr-1" /> {item.timestamp}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
