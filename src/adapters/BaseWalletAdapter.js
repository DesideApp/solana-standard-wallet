import { Wallet, WalletAccount } from '@wallet-standard/core';
import bs58 from 'bs58';

/**
 * Clase base que todos los adapters concretos extienden
 */
export class BaseWalletAdapter {
  constructor({ name, icon, url, provider }) {
    this.name = name;
    this.icon = icon;
    this.url = url;
    this.provider = provider;

    this.publicKey = null;
    this.connected = false;
    this.available = !!provider;

    this.listeners = {
      connect: [],
      disconnect: [],
      accountChanged: [],
    };

    if (this.provider) {
      this._bindAccountChange();
    }
  }

  /**
   * 🔌 Conecta la wallet manualmente (popup si es necesario)
   */
  async connect() {
    if (!this.provider) throw new Error(`${this.name} provider not available`);

    await this.provider.connect?.();

    this.publicKey = this.provider.publicKey?.toString() || null;
    this.connected = !!this.publicKey;

    this._emit('connect', this.publicKey);
    return this.publicKey;
  }

  /**
   * 🔒 Desconecta la wallet
   */
  async disconnect() {
    if (!this.provider?.disconnect) return;

    await this.provider.disconnect();
    this.publicKey = null;
    this.connected = false;

    this._emit('disconnect');
  }

  /**
   * ✍️ Firma un mensaje usando la wallet conectada
   */
  async signMessage(message) {
    if (!this.provider?.signMessage) {
      throw new Error(`${this.name} does not support message signing`);
    }

    const encoded = new TextEncoder().encode(message);
    const { signature } = await this.provider.signMessage(encoded, 'utf8');
    return bs58.encode(signature); // Exportar en formato string legible
  }

  /**
   * 🕵️‍♂️ Detecta si la wallet está desbloqueada y autorizada (sin popup)
   */
  async isUnlocked() {
    try {
      if (!this.provider?.connect) return false;

      await this.provider.connect({ onlyIfTrusted: true });
      const pk = this.provider.publicKey?.toString();
      return !!pk;
    } catch {
      return false;
    }
  }

  /**
   * 🎧 Suscribe a eventos: connect, disconnect, accountChanged
   */
  on(event, callback) {
    if (this.listeners[event]) {
      this.listeners[event].push(callback);
    }
  }

  /**
   * ❌ Cancela la suscripción a eventos
   */
  off(event, callback) {
    if (this.listeners[event]) {
      this.listeners[event] = this.listeners[event].filter((cb) => cb !== callback);
    }
  }

  /**
   * 📣 Lanza eventos personalizados
   */
  _emit(event, payload) {
    if (this.listeners[event]) {
      for (const cb of this.listeners[event]) cb(payload);
    }
  }

  /**
   * 🔄 Se suscribe al cambio de cuenta dentro del provider
   */
  _bindAccountChange() {
    if (!this.provider?.on) return;

    this.provider.on('accountChanged', (newPubkey) => {
      this.publicKey = newPubkey?.toString() || null;
      this.connected = !!this.publicKey;
      this._emit('accountChanged', this.publicKey);
    });
  }

  /**
   * 🔁 Objeto compatible con el Wallet Standard oficial
   */
  get wallet() {
    return {
      name: this.name,
      icon: this.icon,
      url: this.url,
      accounts: this.publicKey
        ? [
            {
              address: this.publicKey,
              publicKey: bs58.decode(this.publicKey),
              chains: ['solana:mainnet'],
              features: ['solana:signMessage'],
            },
          ]
        : [],
      features: {
        'solana:signMessage': {
          signMessage: async (input) => {
            const encoded = new TextEncoder().encode(input.message);
            const signed = await this.provider.signMessage(encoded, 'utf8');
            return { signature: signed.signature };
          },
        },
      },
    };
  }
}
