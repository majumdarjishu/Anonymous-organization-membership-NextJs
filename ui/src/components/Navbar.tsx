import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useWallet } from '../context/WalletContext';
import { Shield, Menu, X, Wallet, AlertCircle, ExternalLink, PlayCircle, CheckCircle } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';

export function Navbar() {
  const { 
    walletAddress, 
    walletName, 
    status, 
    connectWallet, 
    connectDemoWallet, 
    disconnectWallet, 
    detectedWallets, 
    connectionError 
  } = useWallet();

  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [showWalletModal, setShowWalletModal] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);

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

  const handleConnectRealWallet = async (walletId?: string) => {
    setIsConnecting(true);
    try {
      await connectWallet(walletId);
      setShowWalletModal(false);
    } catch (err) {
      console.error(err);
    } finally {
      setIsConnecting(false);
    }
  };

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
                <button 
                  onClick={() => setShowWalletModal(true)} 
                  className="btn-primary flex items-center space-x-2 py-1.5 px-3.5 text-sm font-semibold shadow-sm"
                >
                  <Wallet className="h-4 w-4" />
                  <span>Connect Wallet</span>
                </button>
              ) : (
                <button 
                  onClick={disconnectWallet} 
                  className="btn-secondary flex items-center space-x-2 py-1.5 px-3 text-sm font-medium border-gray-300 hover:bg-gray-50"
                  title={`Connected to ${walletName}: ${walletAddress}`}
                >
                  <Wallet className="h-4 w-4 text-emerald-600" />
                  <span className="truncate max-w-[110px] font-mono text-xs font-bold">{walletAddress.slice(0, 8)}...</span>
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

      {/* Mobile Menu */}
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
                  <button onClick={() => { setShowWalletModal(true); setMobileMenuOpen(false); }} className="btn-primary py-1.5 px-3 text-sm">Connect</button>
                ) : (
                  <button onClick={() => { disconnectWallet(); setMobileMenuOpen(false); }} className="btn-secondary py-1.5 px-3 text-sm">Disconnect</button>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Wallet Selector Modal */}
      {showWalletModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-gray-200 space-y-5">
            <div className="flex justify-between items-center border-b pb-3">
              <h3 className="text-lg font-bold text-gray-900 flex items-center">
                <Wallet className="h-5 w-5 text-primary-600 mr-2" />
                Connect Wallet
              </h3>
              <button onClick={() => setShowWalletModal(false)} className="text-gray-400 hover:text-gray-600">
                <X className="h-5 w-5" />
              </button>
            </div>

            {connectionError && (
              <div className="bg-red-50 text-red-700 p-3.5 rounded-xl text-xs border border-red-200 flex items-start space-x-2.5">
                <AlertCircle className="h-4 w-4 text-red-500 shrink-0 mt-0.5" />
                <div>
                  <p className="font-bold mb-1">Extension Error</p>
                  <p>{connectionError}</p>
                  <a 
                    href="https://chromewebstore.google.com/detail/lace/gafhhkghbfjjkeiendhlofajokpaflmk" 
                    target="_blank" 
                    rel="noreferrer"
                    className="inline-flex items-center space-x-1 text-primary-700 font-semibold mt-2 hover:underline"
                  >
                    <span>Get Midnight Lace Extension</span>
                    <ExternalLink className="h-3 w-3" />
                  </a>
                </div>
              </div>
            )}

            <div className="space-y-3">
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Detected Browser Extensions</p>

              {detectedWallets.length > 0 ? (
                detectedWallets.map(w => (
                  <button
                    key={w.id}
                    onClick={() => handleConnectRealWallet(w.id)}
                    disabled={isConnecting}
                    className="w-full flex items-center justify-between p-3.5 rounded-xl border border-primary-200 bg-primary-50/40 hover:bg-primary-100/60 transition-colors text-left"
                  >
                    <div className="flex items-center space-x-3">
                      <div className="bg-primary-600 text-white p-2 rounded-lg">
                        <Wallet className="h-4 w-4" />
                      </div>
                      <div>
                        <p className="font-bold text-gray-900 text-sm">{w.name}</p>
                        <p className="text-xs text-primary-700">Official Browser Extension (`window.midnight`)</p>
                      </div>
                    </div>
                    <CheckCircle className="h-4 w-4 text-primary-600" />
                  </button>
                ))
              ) : (
                <button
                  onClick={() => handleConnectRealWallet()}
                  disabled={isConnecting}
                  className="w-full flex items-center justify-between p-3.5 rounded-xl border border-gray-300 hover:border-primary-500 bg-white hover:bg-primary-50/30 transition-colors text-left"
                >
                  <div className="flex items-center space-x-3">
                    <div className="bg-primary-100 text-primary-600 p-2 rounded-lg">
                      <Wallet className="h-4 w-4" />
                    </div>
                    <div>
                      <p className="font-bold text-gray-900 text-sm">Midnight Lace Wallet</p>
                      <p className="text-xs text-gray-500">Connect via `window.midnight.mnLace`</p>
                    </div>
                  </div>
                  <span className="text-xs font-semibold text-primary-600 bg-primary-50 px-2 py-1 rounded">Connect</span>
                </button>
              )}

              <div className="relative py-2">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-200"></div>
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-white px-2 text-gray-400 font-semibold">Or for Testing</span>
                </div>
              </div>

              <button
                onClick={() => { connectDemoWallet(); setShowWalletModal(false); }}
                className="w-full flex items-center justify-between p-3 rounded-xl border border-dashed border-gray-300 hover:bg-gray-50 transition-colors text-left"
              >
                <div className="flex items-center space-x-3">
                  <div className="bg-gray-100 text-gray-600 p-2 rounded-lg">
                    <PlayCircle className="h-4 w-4 text-primary-600" />
                  </div>
                  <div>
                    <p className="font-semibold text-gray-800 text-sm">Launch Demo Mode</p>
                    <p className="text-xs text-gray-500">Simulate wallet session with pre-loaded credentials</p>
                  </div>
                </div>
              </button>
            </div>

            <div className="flex justify-end pt-2 border-t border-gray-100">
              <button 
                onClick={() => setShowWalletModal(false)} 
                className="btn-secondary py-2 px-4 text-xs font-semibold"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
