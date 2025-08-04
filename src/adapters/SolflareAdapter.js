import { BaseWalletAdapter } from './BaseWalletAdapter.js';

export class SolflareAdapter extends BaseWalletAdapter {
  constructor() {
    const provider =
      typeof window !== 'undefined'
        ? window.solflare?.isSolflare
          ? window.solflare
          : window.solana?.isSolflare
            ? window.solana
            : null
        : null;

    super({
      name: 'Solflare',
      icon: 'https://solflare.com/favicon.ico',
      url: 'https://solflare.com',
      provider,
    });
  }
}
