import type { Wallet, WalletAccount, WalletIcon } from '@wallet-standard/core';
import {
  SolanaSignMessage,
  type SolanaSignMessageFeature,
  type SolanaSignMessageInput,
  type SolanaSignMessageOutput
} from '@solana/wallet-standard-features';
import bs58 from 'bs58';

export interface WalletAdapterOptions {
  name: string;
  icon: WalletIcon;
  url?: string;
  chains: `${string}:${string}`[];
  provider: WalletProviderInterface | null;
}

export interface WalletProviderInterface {
  connect: (args?: any) => Promise<void>;
  disconnect?: () => Promise<void>;
  publicKey?: { toString: () => string };
  signMessage?: (
    msg: Uint8Array,
    encoding: string
  ) => Promise<Uint8Array | { signature: Uint8Array }>;
  on?: (event: string, cb: (arg: any) => void) => void;
}

type WalletEvent = 'connect' | 'disconnect' | 'accountChanged' | 'readyStateChange';

type WalletListeners = {
  [K in WalletEvent]: Array<(payload: any) => void>;
};

export class BaseWalletAdapter {
  name: string;
  icon: WalletIcon;
  chains: `${string}:${string}`[];
  provider: WalletProviderInterface | null;
  publicKey: string | null;
  connected: boolean;
  listeners: WalletListeners;

  constructor({ name, icon, chains, provider }: WalletAdapterOptions) {
    this.name = name;
    this.icon = icon;
    this.chains = chains;
    this.provider = provider;

    this.publicKey = null;
    this.connected = false;

    this.listeners = {
      connect: [],
      disconnect: [],
      accountChanged: [],
      readyStateChange: [],
    };

    if (this.provider) {
      this.bindAccountChange();
      this.bindReadyStateChange();
    }
  }

  /** ✅ Método oficial para comprobar si está desbloqueado (trusted) */
  async isUnlocked(): Promise<boolean> {
    try {
      if (!this.provider?.connect) return false;
      await this.provider.connect({ onlyIfTrusted: true });
      const pk = this.provider.publicKey?.toString();
      return !!pk;
    } catch {
      return false;
    }
  }

  /** ✅ Getter instantáneo: sólo indica si hay provider */
  get available(): boolean {
    return !!this.provider;
  }

  /** ✅ Opcional: útil si quieres precargar isUnlocked al inicio */
  async getTrustedStatus(): Promise<boolean> {
    const trusted = await this.isUnlocked();
    this.connected = trusted;
    this.publicKey = trusted ? this.provider?.publicKey?.toString() || null : null;
    return trusted;
  }

  isReady(): boolean {
    return this.available;
  }

  async connect(): Promise<string | null> {
    if (!this.provider) throw new Error(`${this.name} provider not available`);

    await this.provider.connect?.();
    this.publicKey = this.provider.publicKey?.toString() || null;
    this.connected = !!this.publicKey;

    this.emit('connect', this.publicKey);
    return this.publicKey;
  }

  async disconnect(): Promise<void> {
    if (!this.provider?.disconnect) return;
    await this.provider.disconnect();

    this.publicKey = null;
    this.connected = false;

    this.emit('disconnect', null);
  }

  async signMessage(message: string): Promise<string> {
    if (!this.provider?.signMessage) {
      throw new Error(`${this.name} does not support message signing`);
    }

    const encoded = new TextEncoder().encode(message);
    const result = await this.provider.signMessage(encoded, 'utf8');
    const signature = 'signature' in result ? result.signature : result;

    return bs58.encode(signature);
  }

  on(event: WalletEvent, callback: (payload: any) => void): void {
    this.listeners[event].push(callback);
  }

  off(event: WalletEvent, callback: (payload: any) => void): void {
    this.listeners[event] = this.listeners[event].filter((cb) => cb !== callback);
  }

  protected emit(event: WalletEvent, payload: any): void {
    this.listeners[event].forEach((cb) => cb(payload));
  }

  protected bindAccountChange(): void {
    this.provider?.on?.('accountChanged', (newPubkey: string) => {
      this.publicKey = newPubkey?.toString() || null;
      this.connected = !!this.publicKey;
      this.emit('accountChanged', this.publicKey);
    });
  }

  protected bindReadyStateChange(): void {
    this.provider?.on?.('readyStateChange', (state: any) => {
      this.emit('readyStateChange', state);
    });
  }

  get wallet(): Wallet & SolanaSignMessageFeature {
    const accounts: WalletAccount[] = this.publicKey
      ? [
          {
            address: this.publicKey,
            publicKey: bs58.decode(this.publicKey),
            chains: this.chains,
            features: ['solana:signMessage'],
          },
        ]
      : [];

    const signMessageFeature: SolanaSignMessageFeature[typeof SolanaSignMessage] = {
      version: '1.1.0',
      signMessage: async (
        ...inputs: readonly SolanaSignMessageInput[]
      ): Promise<readonly SolanaSignMessageOutput[]> => {
        return Promise.all(
          inputs.map(async ({ message }) => {
            const signed = await this.provider!.signMessage!(message, 'utf8');
            const signature = 'signature' in signed ? signed.signature : signed;
            return {
              signedMessage: message,
              signature,
              signatureType: 'ed25519',
              publicKey: bs58.decode(this.publicKey!),
            };
          })
        );
      },
    };

    return {
      version: '1.0.0',
      name: this.name,
      icon: this.icon,
      chains: this.chains,
      accounts,
      features: {
        'solana:signMessage': signMessageFeature,
      },
      [SolanaSignMessage]: signMessageFeature,
    };
  }
}