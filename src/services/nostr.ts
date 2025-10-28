import { SimplePool, Event, nip19, Filter, generateSecretKey, getPublicKey as getPublicKeyFromPrivate, finalizeEvent } from 'nostr-tools';

// Relays por defecto para Mostro
const DEFAULT_RELAYS = [
  'wss://relay.damus.io',
  'wss://relay.nostr.band',
  'wss://nos.lol',
];

const PRIVATE_KEY_STORAGE = 'nostr_private_key';

export class NostrClient {
  private pool: SimplePool;
  private relays: string[];
  private privateKey: Uint8Array | null = null;

  constructor(relays: string[] = DEFAULT_RELAYS) {
    this.pool = new SimplePool();
    this.relays = relays;
    this.loadStoredPrivateKey();
  }

  // Conectar a los relays
  async connect(): Promise<void> {
    console.log('Connecting to Nostr relays:', this.relays);
  }

  // Desconectar
  disconnect(): void {
    this.pool.close(this.relays);
  }

  // Load stored private key from localStorage
  private loadStoredPrivateKey(): void {
    try {
      const stored = localStorage.getItem(PRIVATE_KEY_STORAGE);
      if (stored) {
        // Convert hex string to Uint8Array
        const bytes = new Uint8Array(stored.match(/.{1,2}/g)!.map(byte => parseInt(byte, 16)));
        this.privateKey = bytes;
      }
    } catch (error) {
      console.error('Error loading private key:', error);
    }
  }

  // Generate new keypair
  generateKeypair(): { privateKey: string; publicKey: string; nsec: string; npub: string } {
    const privateKeyBytes = generateSecretKey();
    const publicKeyHex = getPublicKeyFromPrivate(privateKeyBytes);

    // Convert private key to hex string
    const privateKeyHex = Array.from(privateKeyBytes)
      .map(b => b.toString(16).padStart(2, '0'))
      .join('');

    const nsec = nip19.nsecEncode(privateKeyBytes);
    const npub = nip19.npubEncode(publicKeyHex);

    return {
      privateKey: privateKeyHex,
      publicKey: publicKeyHex,
      nsec,
      npub,
    };
  }

  // Login with nsec
  async loginWithNsec(nsec: string): Promise<{ publicKey: string; npub: string }> {
    try {
      const decoded = nip19.decode(nsec);
      if (decoded.type !== 'nsec') {
        throw new Error('Invalid nsec format');
      }

      const privateKeyBytes = decoded.data as Uint8Array;
      const publicKeyHex = getPublicKeyFromPrivate(privateKeyBytes);

      // Store private key
      this.privateKey = privateKeyBytes;
      const privateKeyHex = Array.from(privateKeyBytes)
        .map(b => b.toString(16).padStart(2, '0'))
        .join('');
      localStorage.setItem(PRIVATE_KEY_STORAGE, privateKeyHex);

      const npub = nip19.npubEncode(publicKeyHex);

      return {
        publicKey: publicKeyHex,
        npub,
      };
    } catch (error) {
      console.error('Error logging in with nsec:', error);
      throw new Error('Formato de nsec inválido');
    }
  }

  // Store keypair and login
  storeKeypair(privateKeyHex: string): { publicKey: string; npub: string } {
    // Convert hex to Uint8Array
    const privateKeyBytes = new Uint8Array(
      privateKeyHex.match(/.{1,2}/g)!.map(byte => parseInt(byte, 16))
    );

    this.privateKey = privateKeyBytes;
    localStorage.setItem(PRIVATE_KEY_STORAGE, privateKeyHex);

    const publicKeyHex = getPublicKeyFromPrivate(privateKeyBytes);
    const npub = nip19.npubEncode(publicKeyHex);

    return {
      publicKey: publicKeyHex,
      npub,
    };
  }

  // Get public key from stored private key
  getPublicKeyFromStorage(): string | null {
    if (!this.privateKey) {
      return null;
    }
    return getPublicKeyFromPrivate(this.privateKey);
  }

  // Logout and clear stored key
  logoutUser(): void {
    this.privateKey = null;
    localStorage.removeItem(PRIVATE_KEY_STORAGE);
  }

  // Check if user has stored private key
  hasStoredKey(): boolean {
    return this.privateKey !== null;
  }

  // Obtener public key desde extensión NIP-07
  async getPublicKey(): Promise<string | null> {
    if (typeof window === 'undefined' || !window.nostr) {
      throw new Error('Nostr extension not found. Please install a Nostr extension like Alby or nos2x.');
    }

    try {
      const pubkey = await window.nostr.getPublicKey();
      return pubkey;
    } catch (error) {
      console.error('Error getting public key:', error);
      return null;
    }
  }

  // Firmar evento con clave privada almacenada o extensión NIP-07
  async signEvent(event: Event): Promise<Event | null> {
    try {
      // Try to sign with stored private key first
      if (this.privateKey) {
        const signedEvent = finalizeEvent(event, this.privateKey);
        return signedEvent;
      }

      // Fallback to extension
      if (typeof window !== 'undefined' && window.nostr) {
        const signedEvent = await window.nostr.signEvent(event);
        return signedEvent;
      }

      throw new Error('No signing method available');
    } catch (error) {
      console.error('Error signing event:', error);
      return null;
    }
  }

  // Publicar evento
  async publishEvent(event: Event): Promise<void> {
    const pubs = this.pool.publish(this.relays, event);
    await Promise.all(pubs);
  }

  // Suscribirse a eventos con filtros
  async subscribe(
    filters: Filter[],
    onEvent: (event: Event) => void,
    onEose?: () => void
  ): Promise<() => void> {
    const sub = this.pool.subscribeMany(
      this.relays,
      filters as any,
      {
        onevent: onEvent,
        oneose: onEose,
      }
    );

    return () => sub.close();
  }

  // Obtener eventos (fetch one-time)
  async fetchEvents(filters: Filter[]): Promise<Event[]> {
    const filter = filters[0];
    if (!filter) {
      return [];
    }
    const events = await this.pool.querySync(this.relays, filter);
    return events;
  }

  // Decodificar npub a hex
  decodeNpub(npub: string): string {
    try {
      const decoded = nip19.decode(npub);
      if (decoded.type === 'npub') {
        return decoded.data as string;
      }
      throw new Error('Invalid npub format');
    } catch (error) {
      console.error('Error decoding npub:', error);
      throw error;
    }
  }

  // Encodear hex a npub
  encodeNpub(hex: string): string {
    try {
      return nip19.npubEncode(hex);
    } catch (error) {
      console.error('Error encoding npub:', error);
      throw error;
    }
  }
}

// Instancia singleton
export const nostrClient = new NostrClient();

// Get nostr service instance
export function getNostrService(): NostrClient {
  return nostrClient;
}
