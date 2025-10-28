/**
 * @file orders.ts
 * @description Lógica de negocio para gestión de órdenes
 */

import { Event as NostrEvent } from 'nostr-tools';
import { getNostrService } from '../nostr';
import {
  MostroOrder,
  parseMostroEvent,
  createAllMostroOrdersFilter,
} from './protocol';

/**
 * Subscribe to Mostro orders and return them via callback
 */
export async function subscribeToOrders(
  onOrder: (order: MostroOrder) => void,
  onError?: (error: Error) => void
): Promise<() => void> {
  try {
    const nostrService = getNostrService();
    const filter = createAllMostroOrdersFilter();

    const unsubscribe = await nostrService.subscribe([filter], (event: NostrEvent) => {
      const order = parseMostroEvent(event);
      if (order) {
        onOrder(order);
      }
    });

    return unsubscribe;
  } catch (error) {
    console.error('Error subscribing to orders:', error);
    if (onError) {
      onError(error as Error);
    }
    return () => {};
  }
}

/**
 * Get all available orders (one-time fetch)
 */
export async function fetchOrders(): Promise<MostroOrder[]> {
  try {
    const nostrService = getNostrService();
    const filter = createAllMostroOrdersFilter();

    const events = await nostrService.fetchEvents([filter]);
    const orders: MostroOrder[] = [];

    for (const event of events) {
      const order = parseMostroEvent(event);
      if (order) {
        orders.push(order);
      }
    }

    return orders;
  } catch (error) {
    console.error('Error fetching orders:', error);
    return [];
  }
}

/**
 * Calculate price with premium
 */
export function calculatePremium(basePrice: number, premium: number): number {
  return basePrice * (1 + premium / 100);
}

/**
 * Format order for display
 */
export function formatOrderForDisplay(order: MostroOrder): {
  title: string;
  subtitle: string;
  amount: string;
  fiatAmount: string;
  premium: string;
  paymentMethods: string;
} {
  const typeLabel = order.kind === 'buy' ? 'Compra' : 'Venta';

  return {
    title: `${typeLabel} ${order.fiat_code}`,
    subtitle: `${order.amount.toLocaleString()} sats`,
    amount: `${order.amount.toLocaleString()} sats`,
    fiatAmount: `${order.fiat_amount.toLocaleString()} ${order.fiat_code}`,
    premium: order.premium > 0 ? `+${order.premium}%` : `${order.premium}%`,
    paymentMethods: order.payment_method.join(', '),
  };
}
