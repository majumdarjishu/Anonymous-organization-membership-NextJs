import { findDeployedContract } from '@midnight-ntwrk/midnight-js-contracts';
import { httpClientProofProvider } from '@midnight-ntwrk/midnight-js-http-client-proof-provider';
import { indexerPublicDataProvider } from '@midnight-ntwrk/midnight-js-indexer-public-data-provider';
import { levelPrivateStateProvider } from '@midnight-ntwrk/midnight-js-level-private-state-provider';
import { FetchZkConfigProvider } from '@midnight-ntwrk/midnight-js-fetch-zk-config-provider';
import { CompiledContract } from '@midnight-ntwrk/midnight-js-protocol/compact-js';

// The compiled contract is loaded dynamically to avoid Next.js bundling issues.
// The contract output is copied into ui/src/contracts/ so Webpack can resolve it.
// Original source: contracts/managed/anonymous-membership-organisation/contract/index.js
export const PRIVATE_STATE_ID = 'anonymousMembershipPrivateState';

// Since we are running in the browser, the zkConfigPath should be an HTTP URL
// pointing to where Next.js serves the 'zkir' and 'keys' directories (e.g., inside public/contracts/)
export const getCompiledContract = async (zkConfigPathUrl: string) => {
  const Contract_Module = await import('../contracts/index');
  return CompiledContract.make('anonymous-membership-organisation', Contract_Module.Contract).pipe(
    CompiledContract.withVacantWitnesses,
    CompiledContract.withCompiledFileAssets(zkConfigPathUrl),
  );
};

import { toHex, fromHex, parseCoinPublicKeyToHex, parseEncPublicKeyToHex } from '@midnight-ntwrk/midnight-js-utils';
import { Transaction } from '@midnight-ntwrk/midnight-js-types';

export const createMidnightProviders = async (
  walletApi: any,
  networkConfig: { indexer: string; indexerWS: string; proofServer: string; zkConfigPathUrl: string }
) => {
  if (typeof window === 'undefined') throw new Error('Cannot create providers on server');

  const shieldedAddresses = await walletApi.getShieldedAddresses();
  if (!shieldedAddresses || shieldedAddresses.length === 0) {
    throw new Error('No shielded addresses available from wallet');
  }

  const networkInfo = await walletApi.getConfiguration();
  const networkId = networkInfo.networkId;

  const addressString = shieldedAddresses[0];

  const coinPublicKey = fromHex(parseCoinPublicKeyToHex(addressString, networkId));
  const encryptionPublicKey = fromHex(parseEncPublicKeyToHex(addressString, networkId));

  const walletProvider = {
    getCoinPublicKey: () => coinPublicKey,
    getEncryptionPublicKey: () => encryptionPublicKey,
    balanceTx: async (tx: any, ttl?: Date) => {
      const txHex = toHex(tx.serialize());
      const recipe = await walletApi.balanceUnsealedTransaction(txHex);
      return Transaction.deserialize(fromHex(recipe.tx));
    },
    submitTx: async (tx: any) => {
      const txHex = toHex(tx.serialize());
      await walletApi.submitTransaction(txHex);
      return tx.transactionHash; // Transaction hash
    },
  };

  const zkConfigProvider = new FetchZkConfigProvider(
    networkConfig.zkConfigPathUrl,
    fetch.bind(window)
  );

  return {
    privateStateProvider: levelPrivateStateProvider({
      privateStateStoreName: 'anonymous-membership-organisation-state',
      accountId: addressString,
      privateStoragePasswordProvider: () => 'local-development-password-1',
    }),
    publicDataProvider: indexerPublicDataProvider(networkConfig.indexer, networkConfig.indexerWS),
    zkConfigProvider,
    proofProvider: httpClientProofProvider(networkConfig.proofServer, zkConfigProvider),
    walletProvider,
    midnightProvider: walletProvider,
  };
};
