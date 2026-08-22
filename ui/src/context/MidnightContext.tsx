"use client";

import React, { createContext, useContext, useState, useCallback, useEffect, ReactNode } from 'react';

export interface NetworkConfig {
  name: string;
  indexer: string;
  indexerWS: string;
  proofServer: string;
  zkConfigPathUrl: string;
}

const NETWORKS: Record<string, NetworkConfig> = {
  local: {
    name: 'Local Devnet',
    indexer: 'http://localhost:8088/api/v1/graphql',
    indexerWS: 'ws://localhost:8088/api/v1/graphql/ws',
    proofServer: 'http://localhost:6300',
    zkConfigPathUrl: '/contracts/managed/anonymous-membership-organisation',
  },
  testnet: {
    name: 'Midnight Testnet',
    indexer: 'https://indexer.testnet.midnight.network/api/v1/graphql',
    indexerWS: 'wss://indexer.testnet.midnight.network/api/v1/graphql/ws',
    proofServer: 'http://localhost:6300',
    zkConfigPathUrl: '/contracts/managed/anonymous-membership-organisation',
  },
  preprod: {
    name: 'Midnight Preprod',
    indexer: 'https://indexer.preprod.midnight.network/api/v1/graphql',
    indexerWS: 'wss://indexer.preprod.midnight.network/api/v1/graphql/ws',
    proofServer: 'http://localhost:6300',
    zkConfigPathUrl: '/contracts/managed/anonymous-membership-organisation',
  },
};

const CONTRACT_ADDRESS_STORAGE_KEY = 'midnight_contract_address';

export type WalletStatus = 'disconnected' | 'connecting' | 'connected' | 'error';

interface MidnightContextType {
  walletAddress: string | null;
  walletName: string;
  coinPublicKey: string | null;
  status: WalletStatus;
  connectionError: string | null;
  network: NetworkConfig;
  contractAddress: string | null;
  walletApi: any | null;
  deployContractAction: () => Promise<string>;
  connectWallet: () => Promise<void>;
  disconnectWallet: () => void;
  setContractAddressManually: (address: string) => void;
}

const MidnightContext = createContext<MidnightContextType | undefined>(undefined);

function detectMidnightWallet(): { provider: any; name: string; key: string } | null {
  const w = window as any;

  // Potential objects where wallets inject themselves
  // We ONLY scan w.midnight to avoid accidentally grabbing Cardano CIP-30 APIs from w.cardano
  const spaces = [w.midnight].filter(Boolean);

  const candidates = [
    { key: 'mnLace', name: 'Lace/1AM Wallet' },
    { key: 'midnight', name: 'Midnight Wallet' },
    { key: 't1am', name: '1AM Wallet (Fallback)' },
    { key: '1am', name: '1AM Wallet (Fallback)' },
    { key: 'lace', name: 'Lace Wallet (Fallback)' }
  ];

  for (const space of spaces) {
    for (const c of candidates) {
      const p = space[c.key];
      // Check if it's an object with an enable or connect function
      if (p && (typeof p.enable === 'function' || typeof p.connect === 'function')) {
        console.log(`Detected wallet via known key: ${c.key}`);
        return { provider: p, name: c.name, key: c.key };
      }
    }
  }

  // Fallback: scan all keys in window.midnight
  if (w.midnight) {
    for (const key of Object.keys(w.midnight)) {
      const p = w.midnight[key];
      if (p && (typeof p.enable === 'function' || typeof p.connect === 'function')) {
        console.log(`Detected wallet via fallback key: ${key}`);
        return { provider: p, name: p.name || key, key };
      }
    }

    if (typeof w.midnight.enable === 'function' || typeof w.midnight.connect === 'function') {
      console.log(`Detected wallet directly on window.midnight`);
      return { provider: w.midnight, name: w.midnight.name || 'Midnight Wallet', key: 'midnight' };
    }
  }

  return null;
}

export function MidnightProvider({ children }: { children: ReactNode }) {
  const [walletAddress, setWalletAddress] = useState<string | null>(null);
  const [coinPublicKey, setCoinPublicKey] = useState<string | null>(null);
  const [walletName, setWalletName] = useState<string>('');
  const [status, setStatus] = useState<WalletStatus>('disconnected');
  const [connectionError, setConnectionError] = useState<string | null>(null);
  const [walletApi, setWalletApi] = useState<any | null>(null);

  // contractAddress: env var takes priority, then localStorage, then null
  const [contractAddress, setContractAddress] = useState<string | null>(
    process.env.NEXT_PUBLIC_CONTRACT_ADDRESS || null
  );

  // Hydrate from localStorage on mount (client-only)
  useEffect(() => {
    if (!contractAddress) {
      const saved = localStorage.getItem(CONTRACT_ADDRESS_STORAGE_KEY);
      if (saved) setContractAddress(saved);
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const setContractAddressManually = useCallback((address: string) => {
    const trimmed = address.trim();
    if (trimmed) {
      localStorage.setItem(CONTRACT_ADDRESS_STORAGE_KEY, trimmed);
      setContractAddress(trimmed);
    }
  }, []);

  const envNetwork = process.env.NEXT_PUBLIC_MIDNIGHT_NETWORK || 'preprod';
  const network = NETWORKS[envNetwork] || NETWORKS.preprod;

  const connectWallet = useCallback(async () => {
    setStatus('connecting');
    setConnectionError(null);

    try {
      // Wallet must be injected by browser extension, must run client-side
      if (typeof window === 'undefined') throw new Error('Browser environment required.');

      const detected = detectMidnightWallet();
      if (!detected) {
        const p1am = typeof window !== 'undefined' && (window as any).midnight && (window as any).midnight['1am'];
        const keys = p1am ? Object.keys(p1am).join(', ') : 'null';
        const typeOfEnable = p1am ? typeof p1am.enable : 'undefined';
        throw new Error(
          `No Midnight wallet detected. 1am keys: [${keys}], type of enable: ${typeOfEnable}.`
        );
      }

      // Call connect() or enable() — this triggers the wallet popup
      const api = typeof detected.provider.connect === 'function' 
        ? await detected.provider.connect() 
        : await detected.provider.enable();
      
      if (!api) throw new Error('Wallet did not return an API. Authorization may have been rejected.');

      if (typeof api.getUtxos === 'function' && typeof api.state !== 'function') {
        throw new Error('Detected Cardano CIP-30 API instead of Midnight API. Please ensure your wallet supports Midnight and provides the Midnight API.');
      }

      // Retrieve account state
      let address = 'unknown';
      let cpk: string | null = null;
      try {
        const state = await api.state();
        address = state.address || state.coinPublicKey || 'unknown';
        cpk = state.coinPublicKey || null;
      } catch (e) {
        console.warn('Could not retrieve wallet state:', e);
      }

      setWalletApi(api);
      setWalletAddress(address);
      setCoinPublicKey(cpk);
      setWalletName(detected.name);
      setStatus('connected');
    } catch (err: any) {
      console.warn('Wallet connection error:', err);
      setStatus('error');
      let msg = 'Connection failed. Please try again.';
      if (err?.message) {
        msg = err.message;
      } else if (typeof err === 'string') {
        msg = err;
      } else if (err && typeof err === 'object') {
        msg = JSON.stringify(err);
      }
      setConnectionError(msg);
    }
  }, []);

  const deployContractAction = useCallback(async () => {
    if (!walletApi) throw new Error("Wallet not fully connected");
    
    // dynamically import to avoid SSR issues with wasm
    const { deployContract } = await import('@midnight-ntwrk/midnight-js-contracts');
    const { createMidnightProviders, getCompiledContract, PRIVATE_STATE_ID } = await import('../lib/midnight');

    const providers = await createMidnightProviders(walletApi, network);
    const compiledContract = await getCompiledContract(network.zkConfigPathUrl);
    
    const deployed = await deployContract(providers, {
      privateStateId: PRIVATE_STATE_ID,
      initialPrivateState: {},
      compiledContract: compiledContract as any,
      args: [providers.walletProvider.coinPublicKey],
    });
    
    const address = deployed.deployTxData.public.contractAddress;

    // Persist across sessions
    localStorage.setItem(CONTRACT_ADDRESS_STORAGE_KEY, address);
    setContractAddress(address);

    return address;
  }, [walletApi, network]);

  const disconnectWallet = useCallback(() => {
    setWalletApi(null);
    setWalletAddress(null);
    setCoinPublicKey(null);
    setWalletName('');
    setStatus('disconnected');
    setConnectionError(null);
  }, []);

  return (
    <MidnightContext.Provider value={{
      walletAddress,
      walletName,
      coinPublicKey,
      status,
      connectionError,
      network,
      contractAddress,
      walletApi,
      deployContractAction,
      connectWallet,
      disconnectWallet,
      setContractAddressManually,
    }}>
      {children}
    </MidnightContext.Provider>
  );
}

export function useMidnight() {
  const ctx = useContext(MidnightContext);
  if (!ctx) throw new Error('useMidnight must be used within MidnightProvider');
  return ctx;
}
