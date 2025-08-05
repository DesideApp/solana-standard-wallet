# 🪙 Solana Standard Wallet Adapter

**⚠️ This project is under active development and not yet production-ready.**  
This modular wallet adapter is being developed for [Deside](https://deside.app)

---

## 🚀 Features

- 🔌 Unified wallet connection: Phantom, Backpack, Magic Eden, Solflare
- 🧩 Modular adapter structure (easy to extend)
- 🔐 Silent auto-reconnect using `onlyIfTrusted: true`
- 🧠 Global wallet state management (`WalletProvider` + `useWallet()` hook)
- 🖼️ UI-ready components: `WalletList`, `WalletModal`, `WalletButton`

---

## 📦 Installation

```bash
# Local usage during development
npm install ../path/to/solana-standard-wallet
```

---

## 🛠️ Usage

### 1. Wrap your app

```tsx
import { WalletProvider } from 'solana-standard-wallet';

<WalletProvider>
  <App />
</WalletProvider>
```

### 2. Use the wallet hook

```tsx
import { useWallet } from 'solana-standard-wallet';

const { connect, disconnect, publicKey, connected, signMessage, status } = useWallet();
```

---

## 🧱 Components

### `WalletButton`

```tsx
import { WalletButton } from 'solana-standard-wallet/components/WalletButton';

<WalletButton />
```

### `WalletModal`

```tsx
import { WalletModal } from 'solana-standard-wallet/components/WalletModal';

<WalletModal isOpen={true} onClose={() => {}} />
```

### `WalletList`

```tsx
import { WalletList } from 'solana-standard-wallet/components/WalletList';

<WalletList />
```

---

## 📁 Project Structure

```bash
src/
├── adapters/          # Individual wallet adapters (Phantom, Backpack, etc.)
├── assets/icons/      # Base64 and SVG wallet icons
├── components/        # WalletList, WalletModal, WalletButton
├── contexts/          # WalletProvider and useWallet()
├── utils/             # AdapterManager and helpers
└── index.ts           # SDK entry point with all exports
```

---

## 🧩 Adding New Wallets

Create a new adapter by extending `BaseWalletAdapter`:

```ts
import { BaseWalletAdapter } from './adapters/BaseWalletAdapter';

export class NewWalletAdapter extends BaseWalletAdapter {
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

## 📌 Project Status

> This SDK is under active development.  
> It is fully functional and used internally at Deside, but **its API and structure may still change**.  
> Not yet recommended for general production use or NPM publishing.

---

## 📜 License

MIT — Deside Team
