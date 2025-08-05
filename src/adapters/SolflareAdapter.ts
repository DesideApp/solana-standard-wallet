import { BaseWalletAdapter } from './BaseWalletAdapter';
import type { WalletAdapterOptions } from './BaseWalletAdapter';
import { solflareIcon } from '@/assets/icons/base64';

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
      icon: solflareIcon,
      chains: ['solana:mainnet'],
      provider,
    } satisfies WalletAdapterOptions);
  }
}
