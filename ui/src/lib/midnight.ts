import { findDeployedContract } from '@midnight-ntwrk/midnight-js-contracts';
import { httpClientProofProvider } from '@midnight-ntwrk/midnight-js-http-client-proof-provider';
import { indexerPublicDataProvider } from '@midnight-ntwrk/midnight-js-indexer-public-data-provider';
import { levelPrivateStateProvider } from '@midnight-ntwrk/midnight-js-level-private-state-provider';
import { FetchZkConfigProvider } from '@midnight-ntwrk/midnight-js-fetch-zk-config-provider';
import { CompiledContract } from '@midnight-ntwrk/midnight-js-protocol/compact-js';
import { toHex, fromHex } from '@midnight-ntwrk/midnight-js-utils';
import { MidnightBech32m, ShieldedAddress } from '@midnight-ntwrk/wallet-sdk-address-format';

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
    CompiledContract.withCompiledFileAssets(zkConfigPathUrl)
  );
};

/**
 * Resolve the shielded address string from the wallet API.
 * Tries multiple sources in order:
 *   1. walletApi.getShieldedAddresses()  — preferred, may return string[] or object[]
 *   2. walletApi.state().address         — fallback for wallets that embed it in state
 */
async function resolveShieldedAddress(walletApi: any): Promise<string> {
  // ── Attempt 1: getShieldedAddresses() ──────────────────────────────────────
  try {
    const addrs = await walletApi.getShieldedAddresses();
    if (Array.isArray(addrs) && addrs.length > 0) {
      const first = addrs[0];
      // Addresses may be plain strings or objects like { address: "mn1..." }
      if (typeof first === 'string' && first.length > 0) return first;
      if (first && typeof first === 'object') {
        const candidate = first.address ?? first.bech32 ?? first.value ?? first.shieldedAddress;
        if (typeof candidate === 'string' && candidate.length > 0) return candidate;
      }
    }
  } catch (e) {
    console.warn('[midnight] getShieldedAddresses() failed:', e);
  }

  // ── Attempt 2: wallet state address ────────────────────────────────────────
  try {
    const state = await walletApi.state();
    const stateAddr = state?.address;
    // Midnight shielded addresses start with "mn" (bech32m prefix)
    if (typeof stateAddr === 'string' && stateAddr.startsWith('mn')) {
      console.warn('[midnight] Using state().address as shielded address fallback.');
      return stateAddr;
    }
  } catch (e) {
    console.warn('[midnight] state() fallback failed:', e);
  }

  // ── All attempts exhausted ─────────────────────────────────────────────────
  throw new Error(
    'No shielded addresses found in your wallet.\n\n' +
    'To fix this, open your Lace / 1AM wallet extension and:\n' +
    '  1. Switch to the Midnight Preprod network\n' +
    '  2. Create / enable a Shielded account (not just the transparent/unshielded one)\n' +
    '  3. Wait for the wallet to sync, then try again'
  );
}

export const createMidnightProviders = async (
  walletApi: any,
  networkConfig: { indexer: string; indexerWS: string; proofServer: string; zkConfigPathUrl: string }
) => {
  if (typeof window === 'undefined') throw new Error('Cannot create providers on server');

  const addressString = await resolveShieldedAddress(walletApi);

  const networkInfo = await walletApi.getConfiguration();
  const networkId = networkInfo.networkId;

  const parsedAddress = MidnightBech32m.parse(addressString).decode(ShieldedAddress, networkId);
  const coinPublicKey = parsedAddress.coinPublicKey.data;
  const encryptionPublicKey = parsedAddress.encryptionPublicKey.data;

  const walletProvider = {
    coinPublicKey,
    encryptionPublicKey,
    getCoinPublicKey: () => toHex(coinPublicKey),
    getEncryptionPublicKey: () => toHex(encryptionPublicKey),
    balanceTx: async (tx: any, _newCoins: any): Promise<any> => {
      const txHex = toHex(tx.serialize());
      const recipe = await walletApi.balanceUnsealedTransaction(txHex);
      return fromHex(recipe.tx);
    },
    submitTx: async (tx: any): Promise<string> => {
      const txHex = toHex(tx);
      await walletApi.submitTransaction(txHex);
      return 'submitted';
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

export { findDeployedContract };
