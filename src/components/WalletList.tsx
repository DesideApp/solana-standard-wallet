import { useEffect, useState } from 'react';
import { getTrustedAdapters } from '../utils/getTrustedAdapters.js';
import { useWallet } from '../contexts/WalletProvider.js';
import type { BaseWalletAdapter } from '../adapters/BaseWalletAdapter';
import { walletIcons } from '../assets/icons';

export const WalletList = () => {
  const [trusted, setTrusted] = useState<BaseWalletAdapter[]>([]);
  const [untrusted, setUntrusted] = useState<BaseWalletAdapter[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const { connect, status, connected, publicKey } = useWallet();

  useEffect(() => {
    const detect = async () => {
      setLoading(true);
      const { trusted, untrusted } = await getTrustedAdapters();
      setTrusted(trusted);
      setUntrusted(untrusted);
      setLoading(false);
    };

    detect();
  }, []);

  const handleConnect = async (name: string) => {
    try {
      await connect(name);
    } catch (err) {
      console.error(`Error connecting to ${name}:`, err);
    }
  };

  if (connected) {
    return (
      <div className="wallet-connected">
        <strong>Connected:</strong> {publicKey}
      </div>
    );
  }

  return (
    <div className="wallet-list">
      {loading && <div>Detecting wallets...</div>}

      {!loading && (
        <>
          {trusted.length > 0 && (
            <>
              <h3>Connected Wallets</h3>
              <ul>
                {trusted.map((adapter) => {
                  const Icon = walletIcons[adapter.name];
                  return (
                    <li key={adapter.name}>
                      <button onClick={() => handleConnect(adapter.name)}>
                        {Icon && <Icon width={20} height={20} style={{ marginRight: 8 }} />}
                        {adapter.name}
                      </button>
                    </li>
                  );
                })}
              </ul>
            </>
          )}

          {untrusted.length > 0 && (
            <>
              <h3>Other Wallets</h3>
              <ul>
                {untrusted.map((adapter) => {
                  const Icon = walletIcons[adapter.name];
                  return (
                    <li key={adapter.name}>
                      <button onClick={() => handleConnect(adapter.name)}>
                        {Icon && <Icon width={20} height={20} style={{ marginRight: 8 }} />}
                        {adapter.name}
                      </button>
                    </li>
                  );
                })}
              </ul>
            </>
          )}
        </>
      )}

      {status === 'locked' && <div className="warning">Wallet locked. Please unlock it.</div>}
      {status === 'error' && <div className="error">Error connecting to wallet.</div>}
    </div>
  );
};
