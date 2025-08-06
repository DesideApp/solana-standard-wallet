import { PhantomAdapter } from '../adapters/PhantomAdapter.js';
import { BackpackAdapter } from '../adapters/BackpackAdapter.js';
import { MagicEdenAdapter } from '../adapters/MagicEdenAdapter.js';
import { SolflareAdapter } from '../adapters/SolflareAdapter.js';
import type { BaseWalletAdapter } from '../adapters/BaseWalletAdapter.js';

const PRIORITY = ['Phantom', 'Backpack', 'Solflare', 'MagicEden'];

const ADAPTERS: BaseWalletAdapter[] = [
  new PhantomAdapter(),
  new BackpackAdapter(),
  new MagicEdenAdapter(),
  new SolflareAdapter(),
];

export class AdapterManager {
  private listeners: (() => void)[] = [];
  private trusted: BaseWalletAdapter[] = [];
  private untrusted: BaseWalletAdapter[] = [];

  constructor(private onUpdate: (trusted: BaseWalletAdapter[], untrusted: BaseWalletAdapter[]) => void) {
    this.init();
  }

  private async init() {
    await this.checkAll();
    this.subscribeToReadyStateChanges();
  }

  private async checkAll() {
    const checks = await Promise.all(
      ADAPTERS.map(async (adapter) => {
        const trusted = await adapter.isUnlocked?.();
        return { adapter, trusted };
      })
    );

    this.trusted = checks.filter((r) => r.trusted).map((r) => r.adapter);
    this.untrusted = checks.filter((r) => !r.trusted).map((r) => r.adapter);

    this.sortAdapters();
    this.onUpdate(this.trusted, this.untrusted);
  }

  private sortAdapters() {
    const sorter = (a: BaseWalletAdapter, b: BaseWalletAdapter) => {
      return PRIORITY.indexOf(a.name) - PRIORITY.indexOf(b.name);
    };
    this.trusted.sort(sorter);
    this.untrusted.sort(sorter);
  }

  private subscribeToReadyStateChanges() {
    for (const adapter of ADAPTERS) {
      const handler = () => this.checkAll();
      adapter.on?.('readyStateChange', handler);
      this.listeners.push(() => adapter.off?.('readyStateChange', handler));
    }
  }

  dispose() {
    this.listeners.forEach((off) => off());
  }

  // ✅ Este es el método público que querías
  getTrustedAdapters(): BaseWalletAdapter[] {
    return this.trusted;
  }
}