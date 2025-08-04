import { BaseWalletAdapter } from './BaseWalletAdapter.js';

export class MagicEdenAdapter extends BaseWalletAdapter {
  constructor() {
    const provider =
      typeof window !== 'undefined'
        ? window.magicEden?.isMagicEden
          ? window.magicEden
          : window.magicEden?.solana?.isMagicEden
            ? window.magicEden.solana
            : null
        : null;

    super({
      name: 'Magic Eden Wallet',
      icon: 'https://wallet.magiceden.io/favicon.ico',
      url: 'https://wallet.magiceden.io',
      provider,
    });
  }
}
