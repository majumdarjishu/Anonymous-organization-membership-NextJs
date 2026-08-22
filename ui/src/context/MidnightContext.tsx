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
  hasShieldedAccount: boolean;
  deployContractAction: () => Promise<string>;
  connectWallet: () => Promise<void>;
  disconnectWallet: () => void;
  setContractAddressManually: (address: string) => void;
}

const MidnightContext = createContext<MidnightContextType | undefined>(undefined);

/** Formats a raw wallet key into a readable name */
function formatWalletKeyName(key: string): string {
  return key
    .replace(/[-_]/g, ' ')
    .replace(/\b\w/g, c => c.toUpperCase())
    .replace(/^1am$/i, '1AM Wallet')
    .replace(/^t1am$/i, '1AM Wallet')
    .replace(/^mnlace$/i, 'Lace Wallet')
    .replace(/^lace$/i, 'Lace Wallet')
    .replace(/^midnight$/i, 'Midnight Wallet');
}

function detectMidnightWallet(): { provider: any; name: string; key: string } | null {
  const w = window as any;

  // Only scan window.midnight to avoid accidentally grabbing Cardano CIP-30 APIs
  if (!w.midnight) return null;

  const candidates = [
    { key: 'mnLace',    label: 'Lace Wallet' },
    { key: 'midnight',  label: 'Midnight Wallet' },
    { key: 't1am',      label: '1AM Wallet' },
    { key: '1am',       label: '1AM Wallet' },
    { key: 'lace',      label: 'Lace Wallet' },
  ];

  for (const c of candidates) {
    const p = w.midnight[c.key];
    if (p && (typeof p.enable === 'function' || typeof p.connect === 'function')) {
      // Prefer the wallet's own name over our hardcoded label
      const name = (typeof p.name === 'string' && p.name.trim()) ? p.name.trim() : c.label;
      console.log(`[wallet] Detected via key "${c.key}": ${name}`);
      return { provider: p, name, key: c.key };
    }
  }

  // Generic fallback: scan all keys in window.midnight
  for (const key of Object.keys(w.midnight)) {
    const p = w.midnight[key];
    if (p && (typeof p.enable === 'function' || typeof p.connect === 'function')) {
      const name = (typeof p.name === 'string' && p.name.trim()) ? p.name.trim() : formatWalletKeyName(key);
      console.log(`[wallet] Detected via fallback key "${key}": ${name}`);
      return { provider: p, name, key };
    }
  }

  // Direct window.midnight check
  if (typeof w.midnight.enable === 'function' || typeof w.midnight.connect === 'function') {
    const name = (typeof w.midnight.name === 'string' && w.midnight.name.trim()) ? w.midnight.name.trim() : 'Midnight Wallet';
    return { provider: w.midnight, name, key: 'midnight' };
  }

  return null;
}

/** Try to extract a shielded address string from any possible return value */
function extractAddressString(raw: any): string | null {
  if (raw === null || raw === undefined) return null;
  if (typeof raw === 'string' && raw.length > 0) return raw;
  if (raw instanceof Uint8Array && raw.length > 0)
    return Array.from(raw as Uint8Array).map((b: number) => b.toString(16).padStart(2, '0')).join('');
  if (Array.isArray(raw) && raw.length > 0) {
    for (const item of raw) { const r = extractAddressString(item); if (r) return r; }
    return null;
  }
  if (typeof raw === 'object') {
    const knownKeys = ['address', 'shieldedAddress', 'bech32', 'value', 'addr', 'coinPublicKey'];
    for (const k of knownKeys) {
      if (typeof raw[k] === 'string' && raw[k].length > 0) return raw[k];
    }
    for (const v of Object.values(raw)) {
      if (typeof v === 'string' && (v.startsWith('mn') || (v as string).length > 20)) return v as string;
    }
  }
  return null;
}

/** Resolve display address from wallet API — tries all known methods and formats */
async function resolveDisplayAddress(api: any): Promise<{ address: string; hasShielded: boolean }> {
  const methodsToTry = ['getShieldedAddresses', 'getShieldedAddress', 'shieldedAddresses', 'getAddresses'];

  for (const methodName of methodsToTry) {
    if (typeof api[methodName] !== 'function') continue;
    try {
      const raw = await api[methodName]();
      console.log(`[wallet-connect] ${methodName}() raw:`, JSON.stringify(raw, (_k, v) =>
        v instanceof Uint8Array ? `Uint8Array(${(v as Uint8Array).length})` : v
      ));
      const addr = extractAddressString(raw);
      if (addr) return { address: addr, hasShielded: true };
    } catch (e) {
      console.warn(`[wallet-connect] ${methodName}() failed:`, e);
    }
  }

  // Fallback: scan state() for any mn-prefixed value or account info
  try {
    const state = await api.state();
    console.log('[wallet-connect] state() raw:', JSON.stringify(state));
    if (state && typeof state === 'object') {
      for (const v of Object.values(state)) {
        if (typeof v === 'string' && (v as string).startsWith('mn') && (v as string).length > 10)
          return { address: v as string, hasShielded: true };
      }
      if (!state.indexer) {
        const addr = state.address || state.coinPublicKey;
        if (addr && typeof addr === 'string') return { address: addr, hasShielded: false };
      }
    }
  } catch (e) {
    console.warn('[wallet-connect] state() failed:', e);
  }

  return { address: 'no-shielded-account', hasShielded: false };
}


export function MidnightProvider({ children }: { children: ReactNode }) {
  const [walletAddress, setWalletAddress] = useState<string | null>(null);
  const [coinPublicKey, setCoinPublicKey] = useState<string | null>(null);
  const [walletName, setWalletName] = useState<string>('');
  const [status, setStatus] = useState<WalletStatus>('disconnected');
  const [connectionError, setConnectionError] = useState<string | null>(null);
  const [walletApi, setWalletApi] = useState<any | null>(null);
  const [hasShieldedAccount, setHasShieldedAccount] = useState(false);

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
      if (typeof window === 'undefined') throw new Error('Browser environment required.');

      const detected = detectMidnightWallet();
      if (!detected) {
        // Debug info for diagnosing wallet injection
        const w = window as any;
        const midnightKeys = w.midnight ? Object.keys(w.midnight).join(', ') : 'none';
        throw new Error(
          `No Midnight wallet detected. ` +
          `Install the Lace or 1AM wallet extension and ensure it is enabled for this site.\n` +
          `(window.midnight keys: [${midnightKeys}])`
        );
      }

      // Trigger the wallet popup
      const api = typeof detected.provider.connect === 'function'
        ? await detected.provider.connect()
        : await detected.provider.enable();

      if (!api) throw new Error('Wallet did not return an API. Authorization may have been rejected.');

      // Guard against Cardano CIP-30 APIs
      if (typeof api.getUtxos === 'function' && typeof api.state !== 'function') {
        throw new Error('Detected a Cardano CIP-30 wallet instead of a Midnight wallet. Please use Lace or 1AM with Midnight support.');
      }

      // Resolve display address (tries shielded first, then state fallback)
      const { address, hasShielded } = await resolveDisplayAddress(api);

      // Try to get coinPublicKey from state() if available
      let cpk: string | null = null;
      try {
        const state = await api.state();
        if (state && !state.indexer) cpk = state.coinPublicKey || null;
      } catch (_) { /* ignore */ }

      setWalletApi(api);
      setWalletAddress(address);
      setCoinPublicKey(cpk);
      setWalletName(detected.name);
      setHasShieldedAccount(hasShielded);
      setStatus('connected');
    } catch (err: any) {
      console.warn('[wallet] Connection error:', err);
      setStatus('error');
      const msg = err?.message || (typeof err === 'string' ? err : JSON.stringify(err)) || 'Connection failed.';
      setConnectionError(msg);
    }
  }, []);

  const deployContractAction = useCallback(async () => {
    if (!walletApi) throw new Error('Wallet not fully connected');

    // Dynamically import to avoid SSR issues with WASM
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
    setHasShieldedAccount(false);
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
      hasShieldedAccount,
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
