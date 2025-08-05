import { useState, useEffect } from 'react';
import { useWallet } from '@/contexts/WalletProvider';
import { WalletModal } from './WalletModal';

export const WalletButton = () => {
  const { connected, publicKey, disconnect } = useWallet();
  const [modalOpen, setModalOpen] = useState(false);

  // 🔁 Escucha evento global 'openWalletModal'
  useEffect(() => {
    const openModal = () => setModalOpen(true);
    window.addEventListener('openWalletModal', openModal);
    return () => window.removeEventListener('openWalletModal', openModal);
  }, []);

  // 👆 Click del botón abre modal (si no está conectado)
  const handleClick = () => {
    if (!connected) setModalOpen(true);
  };

  return (
    <>
      <button
        className="px-4 py-2 rounded bg-black text-white hover:bg-gray-800 transition"
        onClick={handleClick}
      >
        {connected ? shorten(publicKey!) : 'Connect Wallet'}
      </button>

      {connected && (
        <button
          className="ml-2 px-4 py-2 rounded bg-red-500 text-white hover:bg-red-600 transition"
          onClick={disconnect}
        >
          Disconnect
        </button>
      )}

      {/* ✅ FIX: Faltaba pasar isOpen */}
      <WalletModal isOpen={modalOpen} onClose={() => setModalOpen(false)} />
    </>
  );
};

function shorten(key: string): string {
  return key.slice(0, 4) + '...' + key.slice(-4);
}
