# Solana Standard Wallet Adapter

**⚠️ This project is under active development and not yet production-ready.**  
This modular adapter is being developed for [Deside](https://deside.app) and is inspired by Jupiter's Unified Wallet Kit.

---

## 🚀 Features

- 🔌 Unified wallet connection: Phantom, Backpack, MagicEden, Solflare
- 🧩 Modular adapter structure (easy to extend)
- 🔐 Silent auto-reconnect using `onlyIfTrusted: true`
- 🧠 Global state management via `WalletProvider` and `useWallet()` hook
- 📋 Plug-and-play `WalletList` component for UI integration

---

## 📦 Installation

```bash
npm install solana-standard-wallet
# or if you're using it locally:
pnpm add ../path/to/this-repo
```

---

## 🛠️ Usage

### 1. Wrap your app

```jsx
import { WalletProvider } from 'solana-standard-wallet';

<WalletProvider>
  <App />
</WalletProvider>
```

### 2. Use the wallet hook

```jsx
import { useWallet } from 'solana-standard-wallet';

const { connect, disconnect, publicKey, connected, signMessage, status } = useWallet();
```

---

## 🧱 Components

### `WalletList`

Renders trusted (previously authorized) wallets and all others. Allows connect-on-click.

```jsx
import { WalletList } from 'solana-standard-wallet/components/WalletList';

<WalletList />
```

---

## 📁 Project Structure

```bash
src/
├── adapters/          # Individual wallet adapters (Phantom, Backpack, etc.)
├── components/        # UI components: WalletList, WalletButton (coming soon)
├── contexts/          # WalletProvider and useWallet()
├── utils/             # getTrustedAdapters(), helpers
└── index.js           # Entry point of the SDK
```

---

## 🧩 Adding New Wallets

Create a new adapter by extending `BaseWalletAdapter`:

```js
export class NewWalletAdapter extends BaseWalletAdapter {
  constructor() {
    super({
      name: 'NewWallet',
      icon: 'https://...',
      url: 'https://...',
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
