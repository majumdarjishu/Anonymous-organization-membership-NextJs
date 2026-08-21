"use client";

import { useMidnight } from '@/context/MidnightContext';
import { motion } from 'framer-motion';
import { Activity, Shield, Key, History, Plus } from 'lucide-react';
import Link from 'next/link';
import { useEffect, useState } from 'react';

export default function DashboardPage() {
  const { status, contractAddress, walletName, network } = useMidnight();
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  if (!mounted) return null;

  if (status !== 'connected') {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <div className="glass-panel p-10 max-w-md w-full text-center">
          <Shield className="w-16 h-16 text-primary-300 mx-auto mb-6" />
          <h2 className="text-2xl font-bold text-slate-900 mb-4">Wallet Required</h2>
          <p className="text-slate-500 mb-8">Please connect your wallet to access your anonymous membership dashboard.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div>
        <h1 className="text-3xl font-bold text-slate-900">Member Dashboard</h1>
        <p className="text-slate-500 mt-2">Manage your anonymous identity and verifications.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <motion.div whileHover={{ y: -2 }} className="glass-panel p-6 border-l-4 border-l-primary-500">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-medium text-slate-500">Wallet Status</h3>
            <Activity className="w-5 h-5 text-primary-500" />
          </div>
          <p className="text-2xl font-bold text-slate-900">Connected</p>
          <p className="text-xs text-slate-400 mt-1">{walletName}</p>
        </motion.div>
        
        <motion.div whileHover={{ y: -2 }} className="glass-panel p-6 border-l-4 border-l-indigo-500">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-medium text-slate-500">Network</h3>
            <Shield className="w-5 h-5 text-indigo-500" />
          </div>
          <p className="text-2xl font-bold text-slate-900">{network.name}</p>
          <p className="text-xs text-slate-400 mt-1">Proof Server Online</p>
        </motion.div>

        <motion.div whileHover={{ y: -2 }} className="glass-panel p-6 border-l-4 border-l-green-500">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-medium text-slate-500">Contract</h3>
            <Key className="w-5 h-5 text-green-500" />
          </div>
          <p className="text-2xl font-bold text-slate-900 truncate" title={contractAddress || 'Not Deployed'}>
            {contractAddress ? `${contractAddress.slice(0, 10)}...` : 'None'}
          </p>
          <p className="text-xs text-slate-400 mt-1">Organization Contract</p>
        </motion.div>
      </div>

      <h2 className="text-xl font-bold text-slate-900 pt-6">Quick Actions</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Link href="/register" className="glass-panel p-6 flex flex-col items-center justify-center text-center hover:bg-slate-50 transition-colors group">
          <div className="bg-primary-50 w-12 h-12 rounded-full flex items-center justify-center text-primary-600 mb-4 group-hover:scale-110 transition-transform">
            <Plus className="w-6 h-6" />
          </div>
          <h3 className="font-bold text-slate-900">Register Membership</h3>
          <p className="text-sm text-slate-500 mt-2">Generate a commitment to join</p>
        </Link>
        <Link href="/verify" className="glass-panel p-6 flex flex-col items-center justify-center text-center hover:bg-slate-50 transition-colors group">
          <div className="bg-indigo-50 w-12 h-12 rounded-full flex items-center justify-center text-indigo-600 mb-4 group-hover:scale-110 transition-transform">
            <Shield className="w-6 h-6" />
          </div>
          <h3 className="font-bold text-slate-900">Verify Membership</h3>
          <p className="text-sm text-slate-500 mt-2">Prove you are a member</p>
        </Link>
        <Link href="/history" className="glass-panel p-6 flex flex-col items-center justify-center text-center hover:bg-slate-50 transition-colors group">
          <div className="bg-slate-100 w-12 h-12 rounded-full flex items-center justify-center text-slate-600 mb-4 group-hover:scale-110 transition-transform">
            <History className="w-6 h-6" />
          </div>
          <h3 className="font-bold text-slate-900">View History</h3>
          <p className="text-sm text-slate-500 mt-2">Check past verifications</p>
        </Link>
      </div>
    </div>
  );
}
