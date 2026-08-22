// Extend Window to include the Midnight wallet injection namespace
declare global {
  interface Window {
    midnight?: Record<string, any>;
  }
}

export interface MidnightWalletProvider {
  enable?: () => Promise<any>;
  connect?: () => Promise<any>;
  name?: string;
  icon?: string;
  apiVersion?: string;
  rdns?: string;
}

export interface WalletInfo {
  provider: MidnightWalletProvider;
  name: string;
}

export function detectWallets(): WalletInfo[] {
  const wallets: WalletInfo[] = [];

  if (typeof window === 'undefined' || !window.midnight) {
    return wallets;
  }

  // Detect Lace
  if (window.midnight.mnLace) {
    wallets.push({
      provider: window.midnight.mnLace as MidnightWalletProvider,
      name: window.midnight.mnLace.name || 'Midnight Lace Wallet',
    });
  }

  // Detect 1AM
  if (window.midnight.oneAm) {
    wallets.push({
      provider: window.midnight.oneAm as MidnightWalletProvider,
      name: window.midnight.oneAm.name || '1AM Wallet',
    });
  }

  // Detect generic standard-compliant injected wallets
  for (const [key, provider] of Object.entries(window.midnight)) {
    if (
      key !== 'mnLace' &&
      key !== 'oneAm' &&
      provider &&
      (typeof provider.enable === 'function' || typeof provider.connect === 'function')
    ) {
      wallets.push({
        provider: provider as MidnightWalletProvider,
        name: (provider as MidnightWalletProvider).name || key,
      });
    }
  }

  return wallets;
}

export async function connectWallet(provider: MidnightWalletProvider) {
  try {
    const api = typeof provider.connect === 'function'
      ? await provider.connect()
      : typeof provider.enable === 'function'
      ? await provider.enable()
      : null;
    if (!api) throw new Error('Wallet did not return an API.');
    return api;
  } catch (error) {
    throw new Error('Failed to connect wallet or user rejected the request.');
  }
}
