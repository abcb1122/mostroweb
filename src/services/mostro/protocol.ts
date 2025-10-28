/**
 * @file protocol.ts
 * @description Implementación del protocolo Mostro
 */

import { Filter, Event as NostrEvent } from 'nostr-tools';

// Mostro daemon public key (this is a placeholder - replace with actual Mostro pubkey)
export const MOSTRO_PUBKEY = 'dbe0b1be7aafd3cfba92d7463edbd4e33b2969f61bd554d37ac56f032e13355a';

// Mostro order event kind
export const MOSTRO_ORDER_KIND = 38383;

// Order status types
export type OrderStatus = 'pending' | 'active' | 'fiat-sent' | 'settled' | 'canceled' | 'dispute';

// Order types
export type OrderType = 'buy' | 'sell';

// Payment methods
export type PaymentMethod = string;

// Mostro Order structure
export interface MostroOrder {
  id: string;
  pubkey: string;
  created_at: number;
  status: OrderStatus;
  kind: 'buy' | 'sell';
  fiat_code: string;
  fiat_amount: number;
  amount: number; // sats
  payment_method: PaymentMethod[];
  premium: number;
  master_buyer_pubkey?: string;
  master_seller_pubkey?: string;
  buyer_invoice?: string;
  created_at_str?: string;
}

/**
 * Parse Mostro event tags into order
 */
export function parseMostroEvent(event: NostrEvent): MostroOrder | null {
  try {
    const tags = event.tags;
    const getTag = (tagName: string): string | undefined => {
      const tag = tags.find(t => t[0] === tagName);
      return tag ? tag[1] : undefined;
    };

    const getAllTags = (tagName: string): string[] => {
      return tags.filter(t => t[0] === tagName).map(t => t[1]).filter((v): v is string => v !== undefined);
    };

    const status = getTag('s') as OrderStatus || 'pending';
    const kind = getTag('k') as 'buy' | 'sell' || 'buy';
    const fiatCode = getTag('f') || 'USD';
    const fiatAmount = parseFloat(getTag('fa') || '0');
    const amount = parseInt(getTag('amt') || '0');
    const paymentMethod = getAllTags('pm');
    const premium = parseFloat(getTag('premium') || '0');

    // Only show pending orders (available to take)
    if (status !== 'pending') {
      return null;
    }

    const order: MostroOrder = {
      id: event.id,
      pubkey: event.pubkey,
      created_at: event.created_at,
      status,
      kind,
      fiat_code: fiatCode,
      fiat_amount: fiatAmount,
      amount,
      payment_method: paymentMethod,
      premium,
      created_at_str: new Date(event.created_at * 1000).toLocaleString(),
    };

    return order;
  } catch (error) {
    console.error('Error parsing Mostro event:', error);
    return null;
  }
}

/**
 * Create subscription filter for Mostro orders
 */
export function createMostroOrdersFilter(): Filter {
  return {
    kinds: [MOSTRO_ORDER_KIND],
    // Get recent orders (last 24 hours)
    since: Math.floor(Date.now() / 1000) - 86400,
  };
}

/**
 * Get all orders filter (no time limit)
 */
export function createAllMostroOrdersFilter(): Filter {
  return {
    kinds: [MOSTRO_ORDER_KIND],
    limit: 100,
  };
}

/**
 * Validate order structure
 */
export function validateOrder(order: Partial<MostroOrder>): boolean {
  return !!(
    order.kind &&
    order.fiat_code &&
    order.fiat_amount &&
    order.fiat_amount > 0 &&
    order.amount &&
    order.amount > 0 &&
    order.payment_method &&
    order.payment_method.length > 0
  );
}

/**
 * Check if event is valid Mostro order event
 */
export function isValidMostroEvent(event: NostrEvent): boolean {
  return event.kind === MOSTRO_ORDER_KIND && event.tags.length > 0;
}
