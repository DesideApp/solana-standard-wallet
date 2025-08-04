import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { PhantomAdapter } from '../adapters/PhantomAdapter.js';
import { BackpackAdapter } from '../adapters/BackpackAdapter.js';
import { MagicEdenAdapter } from '../adapters/MagicEdenAdapter.js';
import { SolflareAdapter } from '../adapters/SolflareAdapter.js';

const WalletContext = createContext();

const ADAPTERS = [
  new PhantomAdapter(),
  new BackpackAdapter(),
  new MagicEdenAdapter(),
  new SolflareAdapter(),
];

export const WalletProvider = ({ children }) => {
  const [adapter, setAdapter] = useState(null);
  const [publicKey, setPublicKey] = useState(null);
  const [connected, setConnected] = useState(false);
  const [status, setStatus] = useState('idle'); // idle | connecting | connected | locked | error

  const connect = useCallback(async (walletName) => {
    const selected = ADAPTERS.find((a) => a.name === walletName && a.available);
    if (!selected) throw new Error(`Wallet ${walletName} not found or unavailable`);

    try {
      setStatus('connecting');
      await selected.connect();

      setAdapter(selected);
      setPublicKey(selected.publicKey);
      setConnected(true);
      setStatus('connected');
    } catch (err) {
      if (err.message?.includes('user rejected') || err.code === 4001) {
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
    async (message) => {
      if (!adapter) throw new Error('Wallet not connected');
      return await adapter.signMessage(message);
    },
    [adapter]
  );

  useEffect(() => {
    if (!adapter) return;

    const onAccountChange = (newPubkey) => {
      setPublicKey(newPubkey);
      setConnected(!!newPubkey);
      setStatus(newPubkey ? 'connected' : 'idle');
    };

    adapter.on('accountChanged', onAccountChange);
    return () => adapter.off('accountChanged', onAccountChange);
  }, [adapter]);

  // 🔄 Auto-reconexión segura
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

export const useWallet = () => {
  const ctx = useContext(WalletContext);
  if (!ctx) throw new Error('useWallet must be used inside WalletProvider');
  return ctx;
};
