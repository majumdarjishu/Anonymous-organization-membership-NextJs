import { createContext, useContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';

declare global {
  interface Window {
    midnight?: {
      mnLace?: {
        enable: () => Promise<any>;
      };
    };
  }
}

interface WalletContextType {
  walletAddress: string | null;
  status: string;
  isAdmin: boolean;
  memberCount: number;
  connectWallet: () => Promise<void>;
  disconnectWallet: () => void;
  incrementMemberCount: () => void;
}

const WalletContext = createContext<WalletContextType | undefined>(undefined);

export function WalletProvider({ children }: { children: ReactNode }) {
  const [walletAddress, setWalletAddress] = useState<string | null>(null);
  const [status, setStatus] = useState<string>('disconnected');
  const [isAdmin, setIsAdmin] = useState<boolean>(false);
  const [memberCount, setMemberCount] = useState<number>(0);

  useEffect(() => {
    if (window.midnight?.mnLace) {
      try {
        setStatus('ready to connect');
      } catch (err) {
        console.error(err);
      }
    }
  }, []);

  const connectWallet = async () => {
    try {
      setStatus('connecting');
      if (!window.midnight?.mnLace) {
        alert('Lace wallet with Midnight plugin not found. Please install the Lace Midnight extension.');
        setStatus('error');
        return;
      }
      const api = await window.midnight.mnLace.enable();
      
      const address = await api.state().then((s: any) => s?.address || 'mn1...mock');
      setWalletAddress(address);
      setStatus('connected');
      setIsAdmin(true); 
    } catch (err) {
      console.error('Connection failed:', err);
      setStatus('error');
    }
  };

  const disconnectWallet = () => setWalletAddress(null);
  const incrementMemberCount = () => setMemberCount(prev => prev + 1);

  return (
    <WalletContext.Provider value={{
      walletAddress,
      status,
      isAdmin,
      memberCount,
      connectWallet,
      disconnectWallet,
      incrementMemberCount
    }}>
      {children}
    </WalletContext.Provider>
  );
}

export function useWallet() {
  const context = useContext(WalletContext);
  if (context === undefined) {
    throw new Error('useWallet must be used within a WalletProvider');
  }
  return context;
}
