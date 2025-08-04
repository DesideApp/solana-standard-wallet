import { BaseWalletAdapter } from './BaseWalletAdapter.js';

export class BackpackAdapter extends BaseWalletAdapter {
  constructor() {
    const provider =
      typeof window !== 'undefined'
        ? window.backpack?.isBackpack
          ? window.backpack
          : window.solana?.isBackpack
            ? window.solana
            : null
        : null;

    super({
      name: 'Backpack',
      icon: 'https://www.backpack.app/favicon.ico',
      url: 'https://www.backpack.app',
      provider,
    });
  }
}
