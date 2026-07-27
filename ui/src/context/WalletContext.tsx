import { createContext, useContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';

declare global {
  interface Window {
    midnight?: Record<string, {
      enable: () => Promise<any>;
      name?: string;
      icon?: string;
      apiVersion?: string;
    }>;
    cardano?: Record<string, {
      enable: () => Promise<any>;
      name?: string;
      icon?: string;
      apiVersion?: string;
    }>;
  }
}

export interface WalletProviderInfo {
  id: string;
  name: string;
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

export interface AllowlistItem {
  id: string;
  commitment: string;
  org: string;
  addedAt: string;
}

interface WalletContextType {
  walletAddress: string | null;
  walletName: string;
  status: string;
  connectionError: string | null;
  isAdmin: boolean;
  memberCount: number;
  credentials: CredentialItem[];
  history: HistoryRecord[];
  allowlist: AllowlistItem[];
  detectedWallets: WalletProviderInfo[];
  connectWallet: (walletKey?: string) => Promise<void>;
  connectDemoWallet: () => void;
  disconnectWallet: () => void;
  incrementMemberCount: () => void;
  addCredential: (cred: Omit<CredentialItem, 'id' | 'count'>) => void;
  revokeCredential: (id: string) => void;
  renewCredential: (id: string) => void;
  addHistoryRecord: (record: Omit<HistoryRecord, 'id' | 'timestamp' | 'blockHeight'>) => void;
  addAllowlistCommitment: (commitment: string, org: string) => void;
  removeAllowlistCommitment: (id: string) => void;
}

const WalletContext = createContext<WalletContextType | undefined>(undefined);

export function getDetectedWallets(): WalletProviderInfo[] {
  const providers: WalletProviderInfo[] = [];

  if (typeof window !== 'undefined') {
    if (window.midnight) {
      for (const key of Object.keys(window.midnight)) {
        if (window.midnight[key] && typeof window.midnight[key].enable === 'function') {
          const name = window.midnight[key].name || (key === 'mnLace' ? 'Midnight Lace Wallet' : `Midnight Wallet (${key})`);
          providers.push({ id: `midnight.${key}`, name });
        }
      }
    }

    if (window.cardano?.lace && typeof window.cardano.lace.enable === 'function') {
      if (!providers.some(p => p.name.toLowerCase().includes('lace'))) {
        providers.push({ id: 'cardano.lace', name: 'Lace Wallet' });
      }
    }
  }

  return providers;
}

async function extractAddressFromApi(api: any): Promise<string> {
  if (!api) throw new Error("Wallet provider returned empty connection API.");

  // 1. Try api.state() (standard Midnight Lace DApp connector)
  if (typeof api.state === 'function') {
    try {
      const state = await api.state();
      if (typeof state === 'string') return state;
      if (state) {
        const addr = state.address || state.unshieldedAddress || state.shieldedAddress || state.accountAddress || state.coinPublicKey;
        if (addr && typeof addr === 'string') return addr;
      }
    } catch (e) {
      console.warn("api.state() evaluation warning:", e);
    }
  }

  // 2. Try api.getUnshieldedAddress()
  if (typeof api.getUnshieldedAddress === 'function') {
    try {
      const addr = await api.getUnshieldedAddress();
      if (addr && typeof addr === 'string') return addr;
    } catch (e) {
      console.warn("api.getUnshieldedAddress() evaluation warning:", e);
    }
  }

  // 3. Try api.getAddresses() / api.getAccounts()
  if (typeof api.getAddresses === 'function') {
    try {
      const addrs = await api.getAddresses();
      if (Array.isArray(addrs) && addrs.length > 0 && typeof addrs[0] === 'string') return addrs[0];
    } catch (e) {
      console.warn("api.getAddresses() evaluation warning:", e);
    }
  }

  if (typeof api.getAccounts === 'function') {
    try {
      const accs = await api.getAccounts();
      if (Array.isArray(accs) && accs.length > 0 && typeof accs[0] === 'string') return accs[0];
    } catch (e) {
      console.warn("api.getAccounts() evaluation warning:", e);
    }
  }

  // 4. Try synchronous address properties
  if (api.address && typeof api.address === 'string') return api.address;
  if (api.unshieldedAddress && typeof api.unshieldedAddress === 'string') return api.unshieldedAddress;

  throw new Error("Connected to wallet, but could not extract a valid account address from wallet API.");
}

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

const DEFAULT_ALLOWLIST: AllowlistItem[] = [
  {
    id: 'COMMIT-001',
    commitment: '0x3f8a92b1c4e7d5a089124ef5610294ab83c19e47',
    org: 'Jishu Org Alpha',
    addedAt: '2026-07-20'
  },
  {
    id: 'COMMIT-002',
    commitment: '0x8b21ef490c125a77b8190d6431e5f884a0c2191b',
    org: 'Midnight Privacy Guild',
    addedAt: '2026-07-22'
  },
  {
    id: 'COMMIT-003',
    commitment: '0x7e1029a4f61b5c820d9182374e5021fa98c3412d',
    org: 'Confidential Enterprise',
    addedAt: '2026-07-25'
  }
];

export function WalletProvider({ children }: { children: ReactNode }) {
  const [walletAddress, setWalletAddress] = useState<string | null>(() => {
    return localStorage.getItem('midnight_wallet_address');
  });

  const [walletName, setWalletName] = useState<string>(() => {
    return localStorage.getItem('midnight_wallet_name') || 'Midnight Lace Wallet';
  });
  
  const [status, setStatus] = useState<string>(() => {
    return localStorage.getItem('midnight_wallet_address') ? 'connected' : 'disconnected';
  });

  const [connectionError, setConnectionError] = useState<string | null>(null);
  
  const [isAdmin, setIsAdmin] = useState<boolean>(true);
  const [memberCount, setMemberCount] = useState<number>(6);
  const [detectedWallets, setDetectedWallets] = useState<WalletProviderInfo[]>([]);

  const [credentials, setCredentials] = useState<CredentialItem[]>(() => {
    const saved = localStorage.getItem('midnight_credentials');
    return saved ? JSON.parse(saved) : DEFAULT_CREDENTIALS;
  });

  const [history, setHistory] = useState<HistoryRecord[]>(() => {
    const saved = localStorage.getItem('midnight_history');
    return saved ? JSON.parse(saved) : DEFAULT_HISTORY;
  });

  const [allowlist, setAllowlist] = useState<AllowlistItem[]>(() => {
    const saved = localStorage.getItem('midnight_allowlist');
    return saved ? JSON.parse(saved) : DEFAULT_ALLOWLIST;
  });

  useEffect(() => {
    setDetectedWallets(getDetectedWallets());
  }, []);

  useEffect(() => {
    localStorage.setItem('midnight_credentials', JSON.stringify(credentials));
  }, [credentials]);

  useEffect(() => {
    localStorage.setItem('midnight_history', JSON.stringify(history));
  }, [history]);

  useEffect(() => {
    localStorage.setItem('midnight_allowlist', JSON.stringify(allowlist));
  }, [allowlist]);

  useEffect(() => {
    if (walletAddress) {
      localStorage.setItem('midnight_wallet_address', walletAddress);
      localStorage.setItem('midnight_wallet_name', walletName);
    } else {
      localStorage.removeItem('midnight_wallet_address');
      localStorage.removeItem('midnight_wallet_name');
    }
  }, [walletAddress, walletName]);

  const connectWallet = async (walletKeyParam?: string | unknown) => {
    const walletKey = typeof walletKeyParam === 'string' ? walletKeyParam : undefined;
    try {
      setStatus('connecting');
      setConnectionError(null);

      let provider: any = null;
      let connectedWalletName = 'Midnight Lace Wallet';

      if (walletKey) {
        if (walletKey.startsWith('midnight.') && window.midnight) {
          const subKey = walletKey.replace('midnight.', '');
          provider = window.midnight[subKey];
          connectedWalletName = provider?.name || (subKey === 'mnLace' ? 'Midnight Lace Wallet' : subKey);
        } else if (walletKey === 'cardano.lace' && window.cardano?.lace) {
          provider = window.cardano.lace;
          connectedWalletName = 'Lace Wallet';
        }
      } else {
        // Auto-detect available Midnight wallet extension
        if (window.midnight?.mnLace) {
          provider = window.midnight.mnLace;
          connectedWalletName = 'Midnight Lace Wallet';
        } else if (window.midnight) {
          const firstKey = Object.keys(window.midnight)[0];
          if (firstKey && window.midnight[firstKey]) {
            provider = window.midnight[firstKey];
            connectedWalletName = provider?.name || (firstKey === 'mnLace' ? 'Midnight Lace Wallet' : firstKey);
          }
        } else if (window.cardano?.lace) {
          provider = window.cardano.lace;
          connectedWalletName = 'Lace Wallet';
        }
      }

      if (!provider || typeof provider.enable !== 'function') {
        const errorMsg = 'No Midnight or Lace wallet extension detected in your browser. Please install the Lace Midnight extension.';
        setConnectionError(errorMsg);
        setStatus('error');
        throw new Error(errorMsg);
      }

      // Prompt real wallet authorization popup
      const api = await provider.enable();
      const realAddress = await extractAddressFromApi(api);

      setWalletAddress(realAddress);
      setWalletName(connectedWalletName);
      setStatus('connected');
      setIsAdmin(true);
      setConnectionError(null);
    } catch (err: any) {
      console.error('Wallet connection error:', err);
      setStatus('error');
      const msg = err?.message || 'Failed to connect to browser wallet extension.';
      setConnectionError(msg);
      throw err;
    }
  };

  const connectDemoWallet = () => {
    const demoAddr = 'mn1_demo_member_0x8f2a931c';
    setWalletAddress(demoAddr);
    setWalletName('Demo Simulated Wallet');
    setStatus('connected');
    setIsAdmin(true);
    setConnectionError(null);
  };

  const disconnectWallet = () => {
    setWalletAddress(null);
    setWalletName('Midnight Lace Wallet');
    setStatus('disconnected');
    setConnectionError(null);
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
    setCredentials(prev => prev.map(c => c.org === record.org ? { ...c, count: c.count + 1 } : c));
  };

  const addAllowlistCommitment = (commitment: string, org: string) => {
    const newItem: AllowlistItem = {
      id: `COMMIT-${String(allowlist.length + 1).padStart(3, '0')}`,
      commitment,
      org,
      addedAt: new Date().toISOString().split('T')[0]
    };
    setAllowlist(prev => [newItem, ...prev]);
    setMemberCount(prev => prev + 1);
  };

  const removeAllowlistCommitment = (id: string) => {
    setAllowlist(prev => prev.filter(a => a.id !== id));
  };

  return (
    <WalletContext.Provider value={{
      walletAddress,
      walletName,
      status,
      connectionError,
      isAdmin,
      memberCount,
      credentials,
      history,
      allowlist,
      detectedWallets,
      connectWallet,
      connectDemoWallet,
      disconnectWallet,
      incrementMemberCount,
      addCredential,
      revokeCredential,
      renewCredential,
      addHistoryRecord,
      addAllowlistCommitment,
      removeAllowlistCommitment
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
