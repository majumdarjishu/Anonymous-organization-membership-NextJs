export interface MidnightWalletProvider {
  enable: () => Promise<any>;
  name?: string;
  icon?: string;
  apiVersion?: string;
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
      provider: window.midnight.mnLace,
      name: window.midnight.mnLace.name || 'Midnight Lace Wallet',
    });
  }

  // Detect 1AM
  if (window.midnight.oneAm) {
    wallets.push({
      provider: window.midnight.oneAm,
      name: window.midnight.oneAm.name || '1AM Wallet',
    });
  }

  // Detect generic standard-compliant injected wallets
  for (const [key, provider] of Object.entries(window.midnight)) {
    if (key !== 'mnLace' && key !== 'oneAm' && provider && typeof provider.enable === 'function') {
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
    const api = await provider.enable();
    return api;
  } catch (error) {
    throw new Error('Failed to connect wallet or user rejected the request.');
  }
}
