import { useEffect, useState } from 'react';
import { useWallet } from '../contexts/WalletProvider';
import { walletIcons } from '../assets/icons';
import { useStandardWallets } from '../hooks/useStandardWallets';
import type { Wallet } from '@wallet-standard/core';
import {
  SolanaSignMessage,
  type SolanaSignMessageFeature,
  type SolanaSignMessageInput,
} from '@solana/wallet-standard-features';

export const WalletList = () => {
  const { connect, status, connected, publicKey } = useWallet();
  const allWallets = useStandardWallets();
  const [trusted, setTrusted] = useState<Wallet[]>([]);
  const [untrusted, setUntrusted] = useState<Wallet[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkTrusted = async () => {
      const results = await Promise.all(
        allWallets.map(async (wallet) => {
          const feature = wallet.features[SolanaSignMessage] as
            | SolanaSignMessageFeature[typeof SolanaSignMessage]
            | undefined;

          const account = wallet.accounts[0];
          if (!account || !feature?.signMessage) {
            return { wallet, trusted: false };
          }

          try {
            const input: SolanaSignMessageInput = {
              account,
              message: new Uint8Array([0]),
            };
            await feature.signMessage(input);
            return { wallet, trusted: true };
          } catch {
            return { wallet, trusted: false };
          }
        })
      );

      setTrusted(results.filter((r) => r.trusted).map((r) => r.wallet));
      setUntrusted(results.filter((r) => !r.trusted).map((r) => r.wallet));
      setLoading(false);
    };

    checkTrusted();
  }, [allWallets]);

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
              <h3>Installed Wallets</h3>
              <ul>
                {trusted.map((wallet) => {
                  const Icon = walletIcons[wallet.name];
                  return (
                    <li key={wallet.accounts[0]?.address ?? wallet.name}>
                      <button onClick={() => handleConnect(wallet.name)}>
                        {Icon && <Icon width={20} height={20} style={{ marginRight: 8 }} />}
                        {wallet.name}
                      </button>
                    </li>
                  );
                })}
              </ul>
            </>
          )}

          {untrusted.length > 0 && (
            <>
              <h3>Detected Wallets</h3>
              <ul>
                {untrusted.map((wallet) => {
                  const Icon = walletIcons[wallet.name];
                  return (
                    <li key={wallet.accounts[0]?.address ?? wallet.name}>
                      <button onClick={() => handleConnect(wallet.name)}>
                        {Icon && <Icon width={20} height={20} style={{ marginRight: 8 }} />}
                        {wallet.name}
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
