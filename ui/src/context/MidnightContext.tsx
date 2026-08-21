"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { createMidnightProviders, getCompiledContract, PRIVATE_STATE_ID } from '../lib/midnight';
import { findDeployedContract } from '@midnight-ntwrk/midnight-js-contracts';

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
    proofServer: 'http://localhost:6300', // Local proof server for browser extension usually
    zkConfigPathUrl: '/contracts/managed/anonymous-membership-organisation',
  },
  preprod: {
    name: 'Midnight Preprod',
    indexer: 'https://indexer.preprod.midnight.network/api/v1/graphql',
    indexerWS: 'wss://indexer.preprod.midnight.network/api/v1/graphql/ws',
    proofServer: 'http://localhost:6300',
    zkConfigPathUrl: '/contracts/managed/anonymous-membership-organisation',
  }
};

interface MidnightContextType {
  walletAddress: string | null;
  walletName: string;
  status: 'disconnected' | 'connecting' | 'connected' | 'error';
  connectionError: string | null;
  network: NetworkConfig;
  contractAddress: string | null;
  deployedContract: any | null; // Replace with proper type when possible
  deployContractAction: () => Promise<string>;
  connectWallet: () => Promise<void>;
  disconnectWallet: () => void;
}

const MidnightContext = createContext<MidnightContextType | undefined>(undefined);

export function MidnightProvider({ children }: { children: ReactNode }) {
  const [walletAddress, setWalletAddress] = useState<string | null>(null);
  const [walletName, setWalletName] = useState<string>('Midnight Wallet');
  const [status, setStatus] = useState<'disconnected' | 'connecting' | 'connected' | 'error'>('disconnected');
  const [connectionError, setConnectionError] = useState<string | null>(null);
  const [deployedContract, setDeployedContract] = useState<any | null>(null);
  const [providers, setProviders] = useState<any | null>(null);

  const envNetwork = process.env.NEXT_PUBLIC_MIDNIGHT_NETWORK || 'local';
  const network = NETWORKS[envNetwork] || NETWORKS.local;
  
  // The contract address can be passed in via env or loaded elsewhere
  const contractAddress = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS || null;

  const connectWallet = async () => {
    try {
      setStatus('connecting');
      setConnectionError(null);

      // Auto-detect Midnight Lace Wallet
      let provider: any = null;
      let detectedName = 'Midnight Lace Wallet';
      
      if (window.midnight?.mnLace) {
        provider = window.midnight.mnLace;
      } else if (window.midnight) {
        const firstKey = Object.keys(window.midnight)[0];
        if (firstKey && window.midnight[firstKey]) {
          provider = window.midnight[firstKey];
          detectedName = provider.name || firstKey;
        }
      }

      if (!provider || typeof provider.enable !== 'function') {
        throw new Error('No Midnight wallet extension detected. Please install the Lace Midnight extension.');
      }

      // Authorize
      const api = await provider.enable();
      
      // Initialize providers
      const newProviders = await createMidnightProviders(api, network);
      setProviders(newProviders);
      
      // Load contract if address exists
      let deployed: any = null;
      if (contractAddress) {
        const compiledContract = await getCompiledContract(network.zkConfigPathUrl);
        deployed = await findDeployedContract(newProviders, {
          compiledContract: compiledContract as any,
          contractAddress,
          privateStateId: PRIVATE_STATE_ID,
          initialPrivateState: {},
        });
        setDeployedContract(deployed);
      }

      // Update state
      let addr = 'unknown';
      try {
          const state = await api.state();
          addr = state.address || 'unknown';
      } catch (e) {
          console.error("Could not get address from state:", e);
      }
      
      setWalletAddress(addr);
      setWalletName(detectedName);
      setStatus('connected');
    } catch (err: any) {
      console.error('Wallet connection error:', err);
      setStatus('error');
      setConnectionError(err.message || 'Failed to connect wallet');
    }
  };

  const deployContractAction = async () => {
    if (!providers) throw new Error("Wallet not fully connected (providers missing)");
    
    // Dynamically import deployContract here if needed, or we already imported it
    // Wait, deployContract is NOT imported at the top! I need to import it.
    const { deployContract } = await import('@midnight-ntwrk/midnight-js-contracts');
    
    const compiledContract = await getCompiledContract(network.zkConfigPathUrl);
    const deployed = await deployContract(providers, {
      compiledContract: compiledContract as any,
      args: [providers.walletProvider.getCoinPublicKey()],
      privateStateId: PRIVATE_STATE_ID,
      initialPrivateState: {},
    });
    
    setDeployedContract(deployed);
    return deployed.deployTxData.public.contractAddress;
  };

  const disconnectWallet = () => {
    setWalletAddress(null);
    setDeployedContract(null);
    setStatus('disconnected');
  };

  return (
    <MidnightContext.Provider value={{
      walletAddress,
      walletName,
      status,
      connectionError,
      network,
      contractAddress,
      deployedContract,
      deployContractAction,
      connectWallet,
      disconnectWallet
    }}>
      {children}
    </MidnightContext.Provider>
  );
}

export function useMidnight() {
  const context = useContext(MidnightContext);
  if (context === undefined) {
    throw new Error('useMidnight must be used within a MidnightProvider');
  }
  return context;
}
