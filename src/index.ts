// Individual adapters
export { PhantomAdapter } from './adapters/PhantomAdapter.js';
export { BackpackAdapter } from './adapters/BackpackAdapter.js';
export { MagicEdenAdapter } from './adapters/MagicEdenAdapter.js';
export { SolflareAdapter } from './adapters/SolflareAdapter.js';

// Plug-and-play connection context
export { WalletProvider, useWallet } from './contexts/WalletProvider.jsx';

// Utilities
export { AdapterManager } from './utils/AdapterManager.js';