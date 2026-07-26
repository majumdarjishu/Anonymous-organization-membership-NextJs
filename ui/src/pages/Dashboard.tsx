import { useWallet } from '../context/WalletContext';
import { Shield, Activity, Users, Clock, ArrowRight, Lock, CheckCircle } from 'lucide-react';
import { Link } from 'react-router-dom';

export function Dashboard() {
  const { walletAddress, memberCount } = useWallet();
  const NETWORK = import.meta.env.VITE_NETWORK || 'undeployed';

  if (!walletAddress) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <Shield className="h-16 w-16 text-gray-300 mb-6" />
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Wallet Disconnected</h2>
        <p className="text-gray-500 mb-6">Please connect your Lace wallet to view your dashboard.</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Member Dashboard</h1>
          <p className="text-gray-500 mt-1">Overview of your confidential credentials and activity.</p>
        </div>
        <div className="hidden sm:block">
          <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-50 text-green-700">
            Membership Status: Active
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="card-base bg-gradient-to-br from-primary-600 to-indigo-700 text-white border-none">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-medium text-primary-100">Active Credentials</h3>
            <Shield className="h-5 w-5 text-primary-200" />
          </div>
          <p className="text-3xl font-bold">1</p>
          <p className="text-sm text-primary-200 mt-2">Confidential Membership</p>
        </div>
        
        <div className="card-base">
          <div className="flex items-center justify-between mb-4 text-gray-500">
            <h3 className="font-medium">Total Org Members</h3>
            <Users className="h-5 w-5" />
          </div>
          <p className="text-3xl font-bold text-gray-900">{memberCount}</p>
          <p className="text-sm text-gray-500 mt-2">Verified anonymously</p>
        </div>

        <div className="card-base">
          <div className="flex items-center justify-between mb-4 text-gray-500">
            <h3 className="font-medium">Network Status</h3>
            <Activity className="h-5 w-5" />
          </div>
          <p className="text-3xl font-bold text-gray-900 capitalize">{NETWORK}</p>
          <p className="text-sm text-green-600 mt-2 flex items-center">
            <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
            Contract Online
          </p>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-8">
        <div className="card-base">
          <h3 className="text-lg font-bold text-gray-900 mb-4 border-b pb-4">Quick Actions</h3>
          <div className="space-y-3">
            <Link to="/verify" className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg transition-colors border border-transparent hover:border-gray-200">
              <div className="flex items-center space-x-3">
                <div className="bg-primary-50 p-2 rounded-lg text-primary-600">
                  <Shield className="h-5 w-5" />
                </div>
                <div>
                  <p className="font-medium text-gray-900">Verify Membership</p>
                  <p className="text-sm text-gray-500">Generate a new ZK proof</p>
                </div>
              </div>
              <ArrowRight className="h-4 w-4 text-gray-400" />
            </Link>
            
            <Link to="/credentials" className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg transition-colors border border-transparent hover:border-gray-200">
              <div className="flex items-center space-x-3">
                <div className="bg-gray-100 p-2 rounded-lg text-gray-600">
                  <Lock className="h-5 w-5" />
                </div>
                <div>
                  <p className="font-medium text-gray-900">Open Credential Vault</p>
                  <p className="text-sm text-gray-500">Manage your private data</p>
                </div>
              </div>
              <ArrowRight className="h-4 w-4 text-gray-400" />
            </Link>
          </div>
        </div>

        <div className="card-base">
          <h3 className="text-lg font-bold text-gray-900 mb-4 border-b pb-4">Recent Activity</h3>
          <div className="space-y-4">
            <div className="flex items-start space-x-3">
              <div className="mt-1 bg-green-100 text-green-600 p-1.5 rounded-full">
                <CheckCircle className="h-4 w-4" />
              </div>
              <div>
                <p className="font-medium text-gray-900 text-sm">Membership Verified</p>
                <p className="text-xs text-gray-500 flex items-center mt-1">
                  <Clock className="h-3 w-3 mr-1" /> Today at 10:42 AM
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
