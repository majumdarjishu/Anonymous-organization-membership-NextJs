"use client";

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useMidnight } from '@/context/MidnightContext';
import { Activity, Shield, Key, History, Wallet, UserCircle, Building2 } from 'lucide-react';
import { motion } from 'framer-motion';

export function Navbar() {
  const pathname = usePathname();
  const { walletAddress, walletName, status, connectWallet, disconnectWallet } = useMidnight();

  const navItems = [
    { name: 'Dashboard', path: '/dashboard', icon: <Activity className="w-4 h-4 mr-2" /> },
    { name: 'Register', path: '/register', icon: <Key className="w-4 h-4 mr-2" /> },
    { name: 'Verify', path: '/verify', icon: <Shield className="w-4 h-4 mr-2" /> },
    { name: 'Org Admin', path: '/organization', icon: <Building2 className="w-4 h-4 mr-2" /> },
    { name: 'History', path: '/history', icon: <History className="w-4 h-4 mr-2" /> },
  ];

  return (
    <nav className="sticky top-0 z-50 w-full glass-panel border-x-0 border-t-0 rounded-none mb-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center space-x-8">
            <Link href="/" className="flex items-center space-x-3 group">
              <div className="bg-gradient-to-tr from-primary-600 to-primary-400 p-2 rounded-xl text-white shadow-md group-hover:scale-105 transition-transform">
                <Shield className="w-5 h-5" />
              </div>
              <span className="text-xl font-bold text-slate-900">
                AnonOrg
              </span>
            </Link>

            {status === 'connected' && (
              <div className="hidden md:flex space-x-1">
                {navItems.map((item) => {
                  const isActive = pathname === item.path;
                  return (
                    <Link
                      key={item.path}
                      href={item.path}
                      className={`relative flex items-center px-3 py-2 text-sm font-medium transition-colors ${
                        isActive ? 'text-primary-700' : 'text-slate-500 hover:text-slate-900'
                      }`}
                    >
                      {item.icon}
                      {item.name}
                      {isActive && (
                        <motion.div
                          layoutId="nav-pill"
                          className="absolute inset-0 bg-primary-50 border border-primary-200 rounded-lg -z-10"
                          initial={false}
                          transition={{ type: "spring", stiffness: 300, damping: 30 }}
                        />
                      )}
                    </Link>
                  );
                })}
              </div>
            )}
          </div>

          <div>
            {status === 'connected' ? (
              <div className="flex items-center space-x-4">
                <div className="hidden md:flex flex-col items-end">
                  <span className="text-xs text-slate-500 font-medium uppercase tracking-wider">{walletName}</span>
                  <span className="text-sm text-slate-900 font-mono font-medium">
                    {walletAddress?.slice(0, 8)}...{walletAddress?.slice(-6)}
                  </span>
                </div>
                <button
                  onClick={disconnectWallet}
                  className="btn-secondary px-4 py-2 text-sm flex items-center"
                >
                  <UserCircle className="w-4 h-4 mr-2 text-slate-500" />
                  Disconnect
                </button>
              </div>
            ) : (
              <button
                onClick={connectWallet}
                className="btn-primary px-6 py-2.5 text-sm flex items-center"
                disabled={status === 'connecting'}
              >
                <Wallet className="w-4 h-4 mr-2" />
                {status === 'connecting' ? 'Connecting...' : 'Connect Wallet'}
              </button>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
