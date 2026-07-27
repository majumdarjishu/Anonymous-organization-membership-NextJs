import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useWallet } from '../context/WalletContext';
import { Shield, Menu, X, Wallet } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';

export function Navbar() {
  const { walletAddress, status, connectWallet, disconnectWallet } = useWallet();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navLinks = [
    { path: '/', label: 'Home' },
    { path: '/dashboard', label: 'Dashboard' },
    { path: '/verify', label: 'Verify' },
    { path: '/credentials', label: 'Credentials' },
    { path: '/history', label: 'History' },
    { path: '/admin', label: 'Admin' },
    { path: '/privacy', label: 'Privacy' },
    { path: '/about', label: 'About' },
  ];

  const NETWORK = import.meta.env.VITE_NETWORK || 'Midnight Testnet';

  return (
    <>
      <nav className="bg-white border-b border-gray-200 sticky top-0 z-40 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <Link to="/" className="flex items-center space-x-2">
                <Shield className="h-7 w-7 text-primary-600" />
                <span className="text-xl font-bold text-gray-900 tracking-tight">Jishu Org</span>
              </Link>
              
              <div className="hidden md:ml-8 md:flex md:space-x-3">
                {navLinks.map(link => (
                  <Link 
                    key={link.path} 
                    to={link.path}
                    className={`inline-flex items-center px-1.5 pt-1 border-b-2 text-sm font-medium transition-colors ${
                      location.pathname === link.path 
                        ? 'border-primary-500 text-gray-900 font-bold' 
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    {link.label}
                  </Link>
                ))}
              </div>
            </div>

            <div className="hidden md:flex items-center space-x-3">
              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${
                status === 'connected' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 
                status === 'error' ? 'bg-red-50 text-red-700 border-red-200' : 'bg-gray-100 text-gray-700 border-gray-200'
              }`}>
                <span className={`w-2 h-2 rounded-full mr-1.5 ${
                  status === 'connected' ? 'bg-emerald-500' : status === 'error' ? 'bg-red-500' : 'bg-gray-400'
                }`}></span>
                {NETWORK}
              </span>
              
              {!walletAddress ? (
                <button onClick={connectWallet} className="btn-primary flex items-center space-x-2 py-1.5 px-3 text-sm font-semibold">
                  <Wallet className="h-4 w-4" />
                  <span>Connect Lace</span>
                </button>
              ) : (
                <button onClick={disconnectWallet} className="btn-secondary flex items-center space-x-2 py-1.5 px-3 text-sm font-medium">
                  <Wallet className="h-4 w-4 text-primary-600" />
                  <span className="truncate max-w-[100px] font-mono">{walletAddress.slice(0, 8)}...</span>
                </button>
              )}
            </div>

            <div className="flex items-center md:hidden">
              <button 
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 focus:outline-none"
              >
                {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
              </button>
            </div>
          </div>
        </div>
      </nav>

      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div 
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden bg-white border-b border-gray-200 overflow-hidden"
          >
            <div className="pt-2 pb-3 space-y-1">
              {navLinks.map(link => (
                <Link
                  key={link.path}
                  to={link.path}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`block pl-3 pr-4 py-2 border-l-4 text-base font-medium ${
                    location.pathname === link.path
                      ? 'bg-primary-50 border-primary-500 text-primary-700 font-bold'
                      : 'border-transparent text-gray-600 hover:bg-gray-50 hover:border-gray-300 hover:text-gray-800'
                  }`}
                >
                  {link.label}
                </Link>
              ))}
            </div>
            <div className="pt-4 pb-3 border-t border-gray-200">
              <div className="flex items-center px-4 justify-between">
                <span className="text-sm text-gray-500 font-medium">Network: {NETWORK}</span>
                {!walletAddress ? (
                  <button onClick={() => { connectWallet(); setMobileMenuOpen(false); }} className="btn-primary py-1.5 px-3 text-sm">Connect</button>
                ) : (
                  <button onClick={() => { disconnectWallet(); setMobileMenuOpen(false); }} className="btn-secondary py-1.5 px-3 text-sm">Disconnect</button>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
