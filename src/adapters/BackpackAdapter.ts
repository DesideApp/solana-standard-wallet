import { BaseWalletAdapter } from './BaseWalletAdapter';
import type { WalletAdapterOptions } from './BaseWalletAdapter';
import { backpackIcon } from '@/assets/icons/base64';

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
      icon: backpackIcon,
      chains: ['solana:mainnet'],
      provider,
    } satisfies WalletAdapterOptions);
  }
}
