/**
 * @file formatting.ts
 * @description Utilidades para formateo de datos
 */

import { SATS_PER_BTC, CURRENCY_FORMATS, LOCALE } from './constants';

type FiatCurrency = 'USD' | 'EUR' | 'GBP' | 'MXN' | 'ARS' | 'BRL';

// ============================================
// FORMATEO DE BITCOIN
// ============================================

/**
 * Formatea satoshis con separadores de miles
 * @example formatSats(1000000) → "1,000,000 sats"
 */
export function formatSats(amount: number): string {
  return `${amount.toLocaleString(LOCALE)} sats`;
}

/**
 * Formatea satoshis como BTC
 * @example formatBTC(100000000) → "1.00000000 BTC"
 */
export function formatBTC(sats: number): string {
  const btc = sats / SATS_PER_BTC;
  return `${btc.toFixed(8)} BTC`;
}

/**
 * Formatea satoshis de forma compacta (auto BTC o sats)
 * @example formatSatsCompact(100000000) → "1 BTC"
 * @example formatSatsCompact(50000) → "50k sats"
 */
export function formatSatsCompact(sats: number): string {
  if (sats >= SATS_PER_BTC) {
    const btc = sats / SATS_PER_BTC;
    return `${btc.toFixed(btc >= 1 ? 2 : 4)} BTC`;
  }

  if (sats >= 1_000_000) {
    return `${(sats / 1_000_000).toFixed(1)}M sats`;
  }

  if (sats >= 1_000) {
    return `${(sats / 1_000).toFixed(1)}k sats`;
  }

  return `${sats} sats`;
}

// ============================================
// FORMATEO DE FIAT
// ============================================

/**
 * Formatea cantidad fiat con símbolo de moneda
 * @example formatFiat(100, 'USD') → "$100.00"
 */
export function formatFiat(amount: number, currency: FiatCurrency | string): string {
  const format = CURRENCY_FORMATS[currency];
  if (!format) {
    return `${amount.toFixed(2)} ${currency}`;
  }

  return new Intl.NumberFormat(LOCALE, format).format(amount);
}

// ============================================
// FORMATEO DE FECHAS
// ============================================

/**
 * Formatea timestamp Unix a fecha legible
 * @example formatDate(1609459200) → "Jan 1, 2021"
 */
export function formatDate(timestamp: number): string {
  const date = new Date(timestamp * 1000);
  return date.toLocaleDateString(LOCALE, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

/**
 * Formatea timestamp Unix a fecha y hora
 * @example formatDateTime(1609459200) → "Jan 1, 2021, 12:00 PM"
 */
export function formatDateTime(timestamp: number): string {
  const date = new Date(timestamp * 1000);
  return date.toLocaleDateString(LOCALE, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });
}

/**
 * Formatea timestamp a tiempo relativo
 * @example formatRelativeTime(Date.now() / 1000 - 3600) → "1 hour ago"
 */
export function formatRelativeTime(timestamp: number): string {
  const now = Date.now() / 1000;
  const diff = now - timestamp;

  if (diff < 60) {
    return 'just now';
  }

  if (diff < 3600) {
    const minutes = Math.floor(diff / 60);
    return `${minutes} ${minutes === 1 ? 'minute' : 'minutes'} ago`;
  }

  if (diff < 86400) {
    const hours = Math.floor(diff / 3600);
    return `${hours} ${hours === 1 ? 'hour' : 'hours'} ago`;
  }

  if (diff < 2592000) {
    const days = Math.floor(diff / 86400);
    return `${days} ${days === 1 ? 'day' : 'days'} ago`;
  }

  return formatDate(timestamp);
}

// ============================================
// FORMATEO DE STRINGS
// ============================================

/**
 * Trunca un string largo
 * @example truncateString('Hello World', 5) → "Hello..."
 */
export function truncateString(str: string, maxLength: number): string {
  if (str.length <= maxLength) {
    return str;
  }
  return `${str.slice(0, maxLength)}...`;
}

/**
 * Acorta una public key para display
 * @example shortenPubkey('abc123...xyz789') → "abc123...xyz789"
 */
export function shortenPubkey(pubkey: string, startChars: number = 8, endChars: number = 8): string {
  if (pubkey.length <= startChars + endChars) {
    return pubkey;
  }
  return `${pubkey.slice(0, startChars)}...${pubkey.slice(-endChars)}`;
}

/**
 * Formatea un ID de orden para display
 */
export function formatOrderId(id: string): string {
  return shortenPubkey(id, 6, 6);
}

// ============================================
// CONVERSIONES
// ============================================

/**
 * Convierte sats a fiat según tasa
 */
export function satsToFiat(sats: number, rate: number): number {
  const btc = sats / SATS_PER_BTC;
  return btc * rate;
}

/**
 * Convierte fiat a sats según tasa
 */
export function fiatToSats(fiat: number, rate: number): number {
  const btc = fiat / rate;
  return Math.round(btc * SATS_PER_BTC);
}

/**
 * Calcula precio con prima aplicada
 */
export function applyPremium(basePrice: number, premiumPercent: number): number {
  return basePrice * (1 + premiumPercent / 100);
}

/**
 * Formatea porcentaje de prima
 * @example formatPremium(5) → "+5%"
 * @example formatPremium(-3) → "-3%"
 */
export function formatPremium(premium: number): string {
  const sign = premium > 0 ? '+' : '';
  return `${sign}${premium.toFixed(2)}%`;
}

// ============================================
// VALIDACIÓN DE FORMATOS
// ============================================

/**
 * Parsea string de cantidad a número
 */
export function parseAmount(value: string): number | null {
  const cleaned = value.replace(/[^0-9.]/g, '');
  const parsed = parseFloat(cleaned);
  return isNaN(parsed) ? null : parsed;
}

export {};
