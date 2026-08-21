import { findDeployedContract } from '@midnight-ntwrk/midnight-js-contracts';
import { httpClientProofProvider } from '@midnight-ntwrk/midnight-js-http-client-proof-provider';
import { indexerPublicDataProvider } from '@midnight-ntwrk/midnight-js-indexer-public-data-provider';
import { levelPrivateStateProvider } from '@midnight-ntwrk/midnight-js-level-private-state-provider';
import { FetchZkConfigProvider } from '@midnight-ntwrk/midnight-js-fetch-zk-config-provider';
import { CompiledContract } from '@midnight-ntwrk/midnight-js-protocol/compact-js';

// The compiled contract is loaded dynamically to avoid Next.js bundling issues.
// The contract output is copied into ui/src/contracts/ so Webpack can resolve it.
// Original source: contracts/managed/anonymous-membership-organisation/contract/index.js
export const PRIVATE_STATE_ID = 'helloWorldPrivateState';

// Since we are running in the browser, the zkConfigPath should be an HTTP URL
// pointing to where Next.js serves the 'zkir' and 'keys' directories (e.g., inside public/contracts/)
export const getCompiledContract = async (zkConfigPathUrl: string) => {
  const Contract_Module = await import('../contracts/index.js');
  return CompiledContract.make('anonymous-membership-organisation', Contract_Module.Contract).pipe(
    CompiledContract.withVacantWitnesses,
    CompiledContract.withCompiledFileAssets(zkConfigPathUrl),
  );
};

export const createMidnightProviders = async (
  walletApi: any,
  networkConfig: { indexer: string; indexerWS: string; proofServer: string; zkConfigPathUrl: string }
) => {
  if (typeof window === 'undefined') throw new Error('Cannot create providers on server');

  const walletState = await walletApi.state();

  const walletProvider = {
    getCoinPublicKey: () => walletState.coinPublicKey,
    getEncryptionPublicKey: () => walletState.encryptionPublicKey,
    balanceTx: async (tx: any, ttl?: Date) => {
      const recipe = await walletApi.balanceTransaction(tx, ttl);
      return recipe;
    },
    submitTx: async (tx: any) => {
      return walletApi.submitTransaction(tx);
    },
  };

  const zkConfigProvider = new FetchZkConfigProvider(
    networkConfig.zkConfigPathUrl,
    fetch.bind(window)
  );
  
  // Try to get address for private state storage
  let accountId = 'unknown';
  try {
     const state = await walletApi.state();
     accountId = state.address || 'unknown';
  } catch (e) {
     console.error("Failed to get wallet state", e);
  }

  return {
    privateStateProvider: levelPrivateStateProvider({
      privateStateStoreName: 'anonymous-membership-organisation-state',
      accountId,
      privateStoragePasswordProvider: () => 'local-development-password-1',
    }),
    publicDataProvider: indexerPublicDataProvider(networkConfig.indexer, networkConfig.indexerWS),
    zkConfigProvider,
    proofProvider: httpClientProofProvider(networkConfig.proofServer, zkConfigProvider),
    walletProvider,
    midnightProvider: walletProvider,
  };
};
