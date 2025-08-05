# 🪙 Solana Standard Wallet Adapter

Modular wallet adapter for Solana built on Wallet Standard — supports Phantom, Backpack, Magic Eden, and Solflare.  
Developed by [Deside](https://deside.app).

---

## 🚀 Features

- Unified connection across major Solana wallets
- Auto-reconnect using `onlyIfTrusted`
- Global state with `WalletProvider` and `useWallet`
- Plug-and-play UI components

---

## 📦 Installation

```bash
npm install ../path/to/solana-standard-wallet
```

---

## ⚙️ Quick Usage

```tsx
import { WalletProvider, useWallet } from 'solana-standard-wallet';

<WalletProvider>
  <App />
</WalletProvider>

const { connect, disconnect, publicKey } = useWallet();
```

---

## 🧩 Components

```tsx
import { WalletButton } from 'solana-standard-wallet/components/WalletButton';
import { WalletModal } from 'solana-standard-wallet/components/WalletModal';
import { WalletList } from 'solana-standard-wallet/components/WalletList';
```

---

## ➕ Add Your Wallet

```ts
class NewWalletAdapter extends BaseWalletAdapter {
  constructor() {
    super({
      name: 'NewWallet',
      icon: 'data:image/svg+xml;base64,...',
      chains: ['solana:mainnet'],
      provider: window?.newwallet,
    });
  }
}
```

---

## 📜 License

MIT — Deside Team
