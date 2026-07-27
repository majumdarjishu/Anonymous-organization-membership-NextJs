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

export interface CredentialItem {
  id: string;
  org: string;
  issueDate: string;
  expiryDate: string;
  type: string;
  status: 'Active' | 'Revoked' | 'Expired';
  count: number;
  commitment: string;
}

export interface HistoryRecord {
  id: string;
  timestamp: string;
  org: string;
  result: string;
  hash: string;
  status: string;
  proofType: string;
  blockHeight: number;
}

interface WalletContextType {
  walletAddress: string | null;
  status: string;
  isAdmin: boolean;
  memberCount: number;
  credentials: CredentialItem[];
  history: HistoryRecord[];
  connectWallet: () => Promise<void>;
  connectDemoWallet: () => void;
  disconnectWallet: () => void;
  incrementMemberCount: () => void;
  addCredential: (cred: Omit<CredentialItem, 'id' | 'count'>) => void;
  revokeCredential: (id: string) => void;
  renewCredential: (id: string) => void;
  addHistoryRecord: (record: Omit<HistoryRecord, 'id' | 'timestamp' | 'blockHeight'>) => void;
}

const WalletContext = createContext<WalletContextType | undefined>(undefined);

const DEFAULT_CREDENTIALS: CredentialItem[] = [
  {
    id: 'CRED-8A2F9-001',
    org: 'Jishu Org Alpha',
    issueDate: '2026-07-26',
    expiryDate: '2027-07-26',
    type: 'Premium Member',
    status: 'Active',
    count: 4,
    commitment: '0x3f8a92b1c4e7d5a089124ef5610294ab83c19e47'
  },
  {
    id: 'CRED-4B71E-002',
    org: 'Midnight Privacy Guild',
    issueDate: '2026-06-15',
    expiryDate: '2027-06-15',
    type: 'Core Contributor',
    status: 'Active',
    count: 2,
    commitment: '0x8b21ef490c125a77b8190d6431e5f884a0c2191b'
  }
];

const DEFAULT_HISTORY: HistoryRecord[] = [
  {
    id: 'tx_8a92b1_001',
    timestamp: '2026-07-27 10:42:15',
    org: 'Jishu Org Alpha',
    result: 'Verified',
    hash: '0x3f8a92b1c4e7d5a089124ef5610294ab',
    status: 'Active',
    proofType: 'ZK-SNARK Groth16',
    blockHeight: 1428590
  },
  {
    id: 'tx_9c14d2_002',
    timestamp: '2026-07-26 14:18:02',
    org: 'Midnight Privacy Guild',
    result: 'Verified',
    hash: '0x8b21ef490c125a77b8190d6431e5f88',
    status: 'Active',
    proofType: 'ZK-SNARK Groth16',
    blockHeight: 1427112
  }
];

export function WalletProvider({ children }: { children: ReactNode }) {
  const [walletAddress, setWalletAddress] = useState<string | null>(() => {
    return localStorage.getItem('midnight_wallet_address');
  });
  
  const [status, setStatus] = useState<string>(() => {
    return localStorage.getItem('midnight_wallet_address') ? 'connected' : 'disconnected';
  });
  
  const [isAdmin, setIsAdmin] = useState<boolean>(true);
  const [memberCount, setMemberCount] = useState<number>(6);

  const [credentials, setCredentials] = useState<CredentialItem[]>(() => {
    const saved = localStorage.getItem('midnight_credentials');
    return saved ? JSON.parse(saved) : DEFAULT_CREDENTIALS;
  });

  const [history, setHistory] = useState<HistoryRecord[]>(() => {
    const saved = localStorage.getItem('midnight_history');
    return saved ? JSON.parse(saved) : DEFAULT_HISTORY;
  });

  useEffect(() => {
    localStorage.setItem('midnight_credentials', JSON.stringify(credentials));
  }, [credentials]);

  useEffect(() => {
    localStorage.setItem('midnight_history', JSON.stringify(history));
  }, [history]);

  useEffect(() => {
    if (walletAddress) {
      localStorage.setItem('midnight_wallet_address', walletAddress);
    } else {
      localStorage.removeItem('midnight_wallet_address');
    }
  }, [walletAddress]);

  useEffect(() => {
    if (window.midnight?.mnLace) {
      try {
        if (!walletAddress) setStatus('ready to connect');
      } catch (err) {
        console.error(err);
      }
    }
  }, [walletAddress]);

  const connectWallet = async () => {
    try {
      setStatus('connecting');
      if (!window.midnight?.mnLace) {
        // Automatically switch to demo connection if plugin is not installed
        connectDemoWallet();
        return;
      }
      const api = await window.midnight.mnLace.enable();
      const address = await api.state().then((s: any) => s?.address || 'mn1_lace_0x7a8910b2d');
      setWalletAddress(address);
      setStatus('connected');
      setIsAdmin(true);
    } catch (err) {
      console.error('Connection failed:', err);
      // Fallback to demo mode if extension fails
      connectDemoWallet();
    }
  };

  const connectDemoWallet = () => {
    const demoAddr = 'mn1_demo_member_0x8f2a931c';
    setWalletAddress(demoAddr);
    setStatus('connected');
    setIsAdmin(true);
  };

  const disconnectWallet = () => {
    setWalletAddress(null);
    setStatus('disconnected');
  };

  const incrementMemberCount = () => setMemberCount(prev => prev + 1);

  const addCredential = (cred: Omit<CredentialItem, 'id' | 'count'>) => {
    const newId = `CRED-${Math.random().toString(36).substring(2, 7).toUpperCase()}-${String(credentials.length + 1).padStart(3, '0')}`;
    const newCred: CredentialItem = {
      ...cred,
      id: newId,
      count: 0
    };
    setCredentials(prev => [newCred, ...prev]);
  };

  const revokeCredential = (id: string) => {
    setCredentials(prev => prev.map(c => c.id === id ? { ...c, status: 'Revoked' } : c));
  };

  const renewCredential = (id: string) => {
    const nextYear = new Date();
    nextYear.setFullYear(nextYear.getFullYear() + 1);
    const dateStr = nextYear.toISOString().split('T')[0];
    setCredentials(prev => prev.map(c => c.id === id ? { ...c, expiryDate: dateStr, status: 'Active' } : c));
  };

  const addHistoryRecord = (record: Omit<HistoryRecord, 'id' | 'timestamp' | 'blockHeight'>) => {
    const newRecord: HistoryRecord = {
      ...record,
      id: `tx_${Math.random().toString(36).substring(2, 8)}`,
      timestamp: new Date().toLocaleString(),
      blockHeight: 1428600 + Math.floor(Math.random() * 500)
    };
    setHistory(prev => [newRecord, ...prev]);
    // increment credential verification count if matching org
    setCredentials(prev => prev.map(c => c.org === record.org ? { ...c, count: c.count + 1 } : c));
  };

  return (
    <WalletContext.Provider value={{
      walletAddress,
      status,
      isAdmin,
      memberCount,
      credentials,
      history,
      connectWallet,
      connectDemoWallet,
      disconnectWallet,
      incrementMemberCount,
      addCredential,
      revokeCredential,
      renewCredential,
      addHistoryRecord
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
