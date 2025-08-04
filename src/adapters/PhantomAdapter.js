import { BaseWalletAdapter } from './BaseWalletAdapter.js';

export class PhantomAdapter extends BaseWalletAdapter {
  constructor() {
    const provider = typeof window !== 'undefined' ? window?.phantom?.solana : null;

    super({
      name: 'Phantom',
      icon: 'https://www.phantom.app/favicon.ico',
      url: 'https://phantom.app',
      provider,
    });
  }
}
