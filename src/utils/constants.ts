/**
 * @file constants.ts
 * @description Constantes globales de la aplicación
 */

interface RelayConfig {
  primary: string[];
  fallback: string[];
  minConnected: number;
  timeout: number;
  retryInterval: number;
  maxRetries: number;
}

// ============================================
// NOSTR RELAYS
// ============================================

// Relays prioritarios para Mostro
export const PRIMARY_RELAYS = [
  'wss://relay.mostro.network',
  'wss://nostr.bilthon.dev',
];

// Relays generales como fallback
export const FALLBACK_RELAYS = [
  'wss://relay.damus.io',
  'wss://nos.lol',
  'wss://relay.nostr.band',
  'wss://nostr.wine',
];

// Configuración de relays
export const RELAY_CONFIG: RelayConfig = {
  primary: PRIMARY_RELAYS,
  fallback: FALLBACK_RELAYS,
  minConnected: 2,
  timeout: 5000, // 5 segundos
  retryInterval: 30000, // 30 segundos
  maxRetries: 5,
};

// ============================================
// MOSTRO PROTOCOL
// ============================================

// Public key del daemon Mostro (placeholder - debe configurarse)
export const MOSTRO_PUBKEY =
  import.meta.env.VITE_MOSTRO_PUBKEY ||
  '8850ca4791dc2dc8b5800de42cf5972920f84e0964c0c8e509f1c5031d50c4c9'; // Ejemplo

// Event kinds
export const ORDER_EVENT_KIND = 38383;
export const DM_EVENT_KIND = 4;

// Versión del protocolo Mostro
export const MOSTRO_PROTOCOL_VERSION = 1;

// ============================================
// LIMITS & VALIDATION
// ============================================

// Límites de órdenes (en sats)
export const MIN_ORDER_AMOUNT = 10000; // 10k sats
export const MAX_ORDER_AMOUNT = 10000000; // 10M sats (0.1 BTC)

// Prima máxima permitida (porcentaje)
export const MAX_PREMIUM_PERCENT = 20; // +/- 20%
export const MIN_PREMIUM_PERCENT = -20;

// Duración de órdenes
export const ORDER_EXPIRY_HOURS = 24;
export const ORDER_EXPIRY_MS = ORDER_EXPIRY_HOURS * 60 * 60 * 1000;

// ============================================
// UI CONFIGURATION
// ============================================

// Paginación
export const ORDERS_PER_PAGE = 20;
export const MAX_VISIBLE_PAGES = 5;

// Tiempos
export const DEBOUNCE_DELAY = 300; // ms
export const NOTIFICATION_DURATION = 5000; // ms
export const LOADING_DEBOUNCE = 200; // ms antes de mostrar loader

// ============================================
// STORAGE KEYS
// ============================================

export const STORAGE_KEYS = {
  AUTH: 'mostro_auth',
  PUBKEY: 'mostro_pubkey',
  PRIVATE_KEY: 'mostro_privkey_ephemeral', // Solo para claves efímeras
  WALLET_PROVIDER: 'mostro_wallet_provider',
  PREFERENCES: 'mostro_preferences',
  ORDERS_CACHE: 'mostro_orders_cache',
} as const;

// ============================================
// URLS
// ============================================

export const EXTERNAL_URLS = {
  docs: 'https://mostro.network/docs-english/',
  protocol: 'https://mostro.network/protocol/',
  github: 'https://github.com/MostroP2P',
  alby: 'https://getalby.com',
  nos2x: 'https://github.com/fiatjaf/nos2x',
} as const;

// ============================================
// REGEXES
// ============================================

// Validación de public key hex
export const HEX_PUBKEY_REGEX = /^[0-9a-f]{64}$/i;

// Validación de npub (bech32)
export const NPUB_REGEX = /^npub1[ac-hj-np-z02-9]{58}$/;

// Validación de Lightning invoice (BOLT11)
export const BOLT11_REGEX = /^(lnbc|lntb|lnbcrt)[0-9a-z]+$/i;

// ============================================
// FORMATEO
// ============================================

export const LOCALE = 'en-US';

// Formatos de moneda
export const CURRENCY_FORMATS: Record<string, Intl.NumberFormatOptions> = {
  USD: { style: 'currency', currency: 'USD' },
  EUR: { style: 'currency', currency: 'EUR' },
  GBP: { style: 'currency', currency: 'GBP' },
  MXN: { style: 'currency', currency: 'MXN' },
  ARS: { style: 'currency', currency: 'ARS' },
  BRL: { style: 'currency', currency: 'BRL' },
};

// Formato de números
export const NUMBER_FORMAT: Intl.NumberFormatOptions = {
  minimumFractionDigits: 0,
  maximumFractionDigits: 8,
};

// ============================================
// BITCOIN
// ============================================

export const SATS_PER_BTC = 100_000_000;

// Conversiones
export const MSATS_PER_SAT = 1000;

export {};
