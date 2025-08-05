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

// 🔠 Tipos del contexto
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

// 🧠 Contexto tipado
const WalletContext = createContext<WalletContextType | null>(null);

// 💼 Adaptadores registrados
const ADAPTERS: BaseWalletAdapter[] = [
  new PhantomAdapter(),
  new BackpackAdapter(),
  new MagicEdenAdapter(),
  new SolflareAdapter(),
];

// 🧩 Proveedor principal
export const WalletProvider = ({ children }: { children: ReactNode }) => {
  const [adapter, setAdapter] = useState<BaseWalletAdapter | null>(null);
  const [publicKey, setPublicKey] = useState<string | null>(null);
  const [connected, setConnected] = useState(false);
  const [status, setStatus] = useState<WalletStatus>('idle');

  const connect = useCallback(async (walletName: string) => {
    const selected = ADAPTERS.find((a) => a.name === walletName && a.available);
    if (!selected) throw new Error(`Wallet ${walletName} not found or unavailable`);

    try {
      setStatus('connecting');
      await selected.connect();

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

      for (const a of ADAPTERS) {
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
  }, [adapter, connected]);

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
        availableWallets: ADAPTERS.filter((a) => a.available).map((a) => a.name),
      }}
    >
      {children}
    </WalletContext.Provider>
  );
};

// 🪝 Hook personalizado para acceder al contexto
export const useWallet = (): WalletContextType => {
  const ctx = useContext(WalletContext);
  if (!ctx) throw new Error('useWallet must be used inside WalletProvider');
  return ctx;
};
