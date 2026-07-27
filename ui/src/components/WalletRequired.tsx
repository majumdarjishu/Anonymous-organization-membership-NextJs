import { useState } from 'react';
import { Shield, Wallet, PlayCircle, AlertCircle, ExternalLink } from 'lucide-react';
import { useWallet } from '../context/WalletContext';

interface WalletRequiredProps {
  title?: string;
  description?: string;
}

export function WalletRequired({
  title = 'Wallet Connection Required',
  description = 'Connect your Midnight Lace wallet extension or launch in Demo Mode to view and interact with your confidential membership credentials.'
}: WalletRequiredProps) {
  const { connectWallet, connectDemoWallet, connectionError, status } = useWallet();
  const [isConnecting, setIsConnecting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleConnect = async () => {
    setIsConnecting(true);
    setErrorMsg(null);
    try {
      await connectWallet();
    } catch (err: any) {
      setErrorMsg(err?.message || 'Failed to connect to Lace wallet extension.');
    } finally {
      setIsConnecting(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto py-12 px-4 sm:px-6">
      <div className="card-base text-center py-10 px-6 sm:px-10 border border-gray-200 shadow-md">
        <div className="w-16 h-16 mx-auto bg-primary-50 rounded-2xl flex items-center justify-center text-primary-600 mb-6 shadow-sm">
          <Shield className="h-8 w-8" />
        </div>
        
        <h2 className="text-2xl font-bold text-gray-900 mb-2">{title}</h2>
        <p className="text-gray-500 mb-6 max-w-md mx-auto text-sm leading-relaxed">{description}</p>
        
        {(errorMsg || connectionError) && (
          <div className="mb-6 bg-red-50 text-red-700 p-4 rounded-xl text-xs border border-red-200 text-left flex items-start space-x-3">
            <AlertCircle className="h-5 w-5 text-red-500 shrink-0 mt-0.5" />
            <div>
              <p className="font-bold mb-1">Extension Connection Error:</p>
              <p>{errorMsg || connectionError}</p>
              <a 
                href="https://chromewebstore.google.com/detail/lace/gafhhkghbfjjkeiendhlofajokpaflmk" 
                target="_blank" 
                rel="noreferrer"
                className="inline-flex items-center space-x-1 text-primary-700 font-semibold mt-2 hover:underline"
              >
                <span>Install Midnight Lace Wallet Extension</span>
                <ExternalLink className="h-3 w-3" />
              </a>
            </div>
          </div>
        )}

        <div className="flex flex-col sm:flex-row justify-center items-center gap-4">
          <button 
            onClick={handleConnect} 
            disabled={isConnecting || status === 'connecting'}
            className="btn-primary w-full sm:w-auto flex items-center justify-center space-x-2 py-2.5 px-6 text-sm font-semibold shadow disabled:opacity-50"
          >
            <Wallet className="h-4 w-4" />
            <span>{isConnecting || status === 'connecting' ? 'Connecting to Extension...' : 'Connect Original Lace Wallet'}</span>
          </button>
          
          <button 
            onClick={connectDemoWallet} 
            className="btn-secondary w-full sm:w-auto flex items-center justify-center space-x-2 py-2.5 px-6 text-sm font-semibold border-gray-300 hover:bg-gray-50 text-gray-700"
          >
            <PlayCircle className="h-4 w-4 text-primary-600" />
            <span>Launch Simulated Demo</span>
          </button>
        </div>
        
        <div className="mt-8 pt-6 border-t border-gray-100 flex items-center justify-center space-x-2 text-xs text-gray-400">
          <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
          <span>Midnight DApp Connector API Protocol (`window.midnight`)</span>
        </div>
      </div>
    </div>
  );
}
