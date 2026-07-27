import { Shield, Wallet, PlayCircle } from 'lucide-react';
import { useWallet } from '../context/WalletContext';

interface WalletRequiredProps {
  title?: string;
  description?: string;
}

export function WalletRequired({
  title = 'Wallet Connection Required',
  description = 'Connect your Midnight Lace wallet or launch in Demo Mode to view and interact with your confidential membership credentials.'
}: WalletRequiredProps) {
  const { connectWallet, connectDemoWallet } = useWallet();

  return (
    <div className="max-w-2xl mx-auto py-12 px-4 sm:px-6">
      <div className="card-base text-center py-10 px-6 sm:px-10 border border-gray-200 shadow-md">
        <div className="w-16 h-16 mx-auto bg-primary-50 rounded-2xl flex items-center justify-center text-primary-600 mb-6 shadow-sm">
          <Shield className="h-8 w-8" />
        </div>
        
        <h2 className="text-2xl font-bold text-gray-900 mb-2">{title}</h2>
        <p className="text-gray-500 mb-8 max-w-md mx-auto text-sm leading-relaxed">{description}</p>
        
        <div className="flex flex-col sm:flex-row justify-center items-center gap-4">
          <button 
            onClick={connectWallet} 
            className="btn-primary w-full sm:w-auto flex items-center justify-center space-x-2 py-2.5 px-6 text-sm font-semibold shadow"
          >
            <Wallet className="h-4 w-4" />
            <span>Connect Lace Wallet</span>
          </button>
          
          <button 
            onClick={connectDemoWallet} 
            className="btn-secondary w-full sm:w-auto flex items-center justify-center space-x-2 py-2.5 px-6 text-sm font-semibold border-gray-300 hover:bg-gray-50 text-gray-700"
          >
            <PlayCircle className="h-4 w-4 text-primary-600" />
            <span>Launch Demo Mode</span>
          </button>
        </div>
        
        <div className="mt-8 pt-6 border-t border-gray-100 flex items-center justify-center space-x-2 text-xs text-gray-400">
          <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
          <span>Zero-Knowledge Proof Environment Ready</span>
        </div>
      </div>
    </div>
  );
}
