import { BaseWalletAdapter } from './BaseWalletAdapter';
import type { WalletAdapterOptions } from './BaseWalletAdapter';
import { magicEdenIcon } from '@/assets/icons/base64';

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
      icon: magicEdenIcon,
      chains: ['solana:mainnet'],
      provider,
    } satisfies WalletAdapterOptions);
  }
}
