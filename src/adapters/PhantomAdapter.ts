import { BaseWalletAdapter } from './BaseWalletAdapter';
import type { WalletAdapterOptions } from './BaseWalletAdapter';
import { phantomIcon } from '@/assets/icons/base64';

export class PhantomAdapter extends BaseWalletAdapter {
  constructor() {
    const provider =
      typeof window !== 'undefined' ? window?.phantom?.solana : null;

    console.log('🧪 Phantom icon type:', typeof phantomIcon); // 🔍 Debe ser "string"
    console.log('🧪 Phantom icon value:', phantomIcon);        // 👀 Debería ser una ruta relativa o base64

    super({
      name: 'Phantom',
      icon: phantomIcon,
      chains: ['solana:mainnet'],
      provider,
    } satisfies WalletAdapterOptions);
  }
}
