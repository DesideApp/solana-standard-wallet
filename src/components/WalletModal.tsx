import { WalletList } from './WalletList';
import { ModalWrapper } from './ModalWrapper';
import {
  sectionTitle,
  chainInfoBox,
  closeButton
} from './styles/wallet-modal';

interface WalletModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const WalletModal = ({ isOpen, onClose }: WalletModalProps) => {
  return (
    <ModalWrapper isOpen={isOpen} onClose={onClose}>
      <button onClick={onClose} className={closeButton} aria-label="Close">
        &times;
      </button>

      <h2 className={sectionTitle}>Select Wallet</h2>

      <div className={chainInfoBox}>
        <span className="text-gray-600 text-sm font-medium">Chain</span>
        <img src="/companys/solanacolor.svg" alt="Solana" className="h-4" />
      </div>

      <WalletList />
    </ModalWrapper>
  );
};
