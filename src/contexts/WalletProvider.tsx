import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  type ReactNode,
} from 'react';

import { PhantomAdapter } from '../adapters/PhantomAdapter.js';
import { BackpackAdapter } from '../adapters/BackpackAdapter.js';
import { MagicEdenAdapter } from '../adapters/MagicEdenAdapter.js';
import { SolflareAdapter } from '../adapters/SolflareAdapter.js';
import type { BaseWalletAdapter } from '../adapters/BaseWalletAdapter.js';

// Context types
type WalletStatus = 'idle' | 'connecting' | 'connected' | 'locked' | 'error';

interface WalletContextType {
  adapter: BaseWalletAdapter | null;
  publicKey: string | null;
  connected: boolean;
  status: WalletStatus;
  connect: (walletName: string) => Promise<void>;
  disconnect: () => Promise<void>;
  signMessage: (message: string) => Promise<string>;
  availableWallets: string[];
}

// Typed context
const WalletContext = createContext<WalletContextType | null>(null);

// 💼 Registered adapters
const ADAPTERS: BaseWalletAdapter[] = [
  new PhantomAdapter(),
  new BackpackAdapter(),
  new MagicEdenAdapter(),
  new SolflareAdapter(),
];

// Main provider
export const WalletProvider = ({ children }: { children: ReactNode }) => {
  const [adapter, setAdapter] = useState<BaseWalletAdapter | null>(null);
  const [publicKey, setPublicKey] = useState<string | null>(null);
  const [connected, setConnected] = useState(false);
  const [status, setStatus] = useState<WalletStatus>('idle');
  const [availableWallets, setAvailableWallets] = useState<BaseWalletAdapter[]>([]);

  const connect = useCallback(async (walletName: string) => {
    const selected = ADAPTERS.find((a) => a.name === walletName && a.available);
    if (!selected) throw new Error(`Wallet ${walletName} not found or unavailable`);

    try {
      setStatus('connecting');
      await selected.connect();

      localStorage.setItem('lastConnectedWallet', walletName);
      setAdapter(selected);
      setPublicKey(selected.publicKey);
      setConnected(true);
      setStatus('connected');
    } catch (err: any) {
      if (err?.message?.includes('user rejected') || err?.code === 4001) {
        setStatus('locked');
      } else {
        setStatus('error');
      }
      throw err;
    }
  }, []);

  const disconnect = useCallback(async () => {
    if (!adapter) return;

    await adapter.disconnect();
    localStorage.removeItem('lastConnectedWallet');
    setPublicKey(null);
    setConnected(false);
    setAdapter(null);
    setStatus('idle');
  }, [adapter]);

  const signMessage = useCallback(
    async (message: string): Promise<string> => {
      if (!adapter) throw new Error('Wallet not connected');
      return await adapter.signMessage(message);
    },
    [adapter]
  );

  // Dynamic sync with readyStateChange
  const detectAvailableWallets = useCallback(async () => {
    for (const a of ADAPTERS) {
      const trusted = await a.isUnlocked?.();
      if (trusted) {
        setAvailableWallets((prev) =>
          prev.some((w) => w.name === a.name) ? prev : [...prev, a]
        );
      }

      a.on?.('readyStateChange', async () => {
        const updated = await a.isUnlocked?.();
        setAvailableWallets((prev) => {
          const filtered = prev.filter((w) => w.name !== a.name);
          return updated ? [...filtered, a] : filtered;
        });
      });
    }
  }, []);

  useEffect(() => {
    if (!adapter) return;

    const onAccountChange = (newPubkey: string) => {
      setPublicKey(newPubkey);
      setConnected(!!newPubkey);
      setStatus(newPubkey ? 'connected' : 'idle');
    };

    adapter.on('accountChanged', onAccountChange);
    return () => adapter.off('accountChanged', onAccountChange);
  }, [adapter]);

  useEffect(() => {
    const autoReconnect = async () => {
      if (adapter || connected) return;

      const lastUsed = localStorage.getItem('lastConnectedWallet');
      const candidates = lastUsed
        ? ADAPTERS.filter((a) => a.name === lastUsed)
        : ADAPTERS;

      for (const a of candidates) {
        const trusted = await a.isUnlocked?.();
        if (trusted) {
          try {
            await a.connect();
            setAdapter(a);
            setPublicKey(a.publicKey);
            setConnected(true);
            setStatus('connected');
            return;
          } catch {
            setStatus('error');
          }
        }
      }
    };

    autoReconnect();
    detectAvailableWallets();
  }, [adapter, connected, detectAvailableWallets]);

  return (
    <WalletContext.Provider
      value={{
        adapter,
        publicKey,
        connected,
        status,
        connect,
        disconnect,
        signMessage,
        availableWallets: availableWallets.map((w) => w.name),
      }}
    >
      {children}
    </WalletContext.Provider>
  );
};

// Custom hook to access the context
export const useWallet = (): WalletContextType => {
  const ctx = useContext(WalletContext);
  if (!ctx) throw new Error('useWallet must be used inside WalletProvider');
  return ctx;
};
