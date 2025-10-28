/**
 * @file orders.ts
 * @description Zustand store para gestión de órdenes
 */

import { create } from 'zustand';
import { MostroOrder } from '../services/mostro/protocol';
import { subscribeToOrders, fetchOrders } from '../services/mostro/orders';

export interface OrderFilters {
  type?: 'buy' | 'sell';
  fiatCode?: string;
  paymentMethod?: string;
  minAmount?: number;
  maxAmount?: number;
}

interface OrdersState {
  // State
  orders: MostroOrder[];
  myOrders: MostroOrder[];
  activeOrder: MostroOrder | null;
  loading: boolean;
  error: string | null;
  filters: OrderFilters;
  isSubscribed: boolean;

  // Actions
  setOrders: (orders: MostroOrder[]) => void;
  addOrder: (order: MostroOrder) => void;
  updateOrder: (orderId: string, updates: Partial<MostroOrder>) => void;
  removeOrder: (orderId: string) => void;
  setActiveOrder: (order: MostroOrder | null) => void;
  setFilters: (filters: OrderFilters) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  clearError: () => void;

  // Async actions
  loadOrders: () => Promise<void>;
  startSubscription: () => Promise<void>;
  stopSubscription: () => void;

  // Selectors
  getFilteredOrders: () => MostroOrder[];
  getOrderById: (id: string) => MostroOrder | undefined;
}

let unsubscribeFn: (() => void) | null = null;

export const useOrdersStore = create<OrdersState>((set, get) => ({
  // Initial state
  orders: [],
  myOrders: [],
  activeOrder: null,
  loading: false,
  error: null,
  filters: {},
  isSubscribed: false,

  // Actions
  setOrders: (orders) => set({ orders }),

  addOrder: (order) => set((state) => {
    // Check if order already exists
    const exists = state.orders.some(o => o.id === order.id);
    if (exists) {
      return state;
    }
    return { orders: [...state.orders, order] };
  }),

  updateOrder: (orderId, updates) => set((state) => ({
    orders: state.orders.map(order =>
      order.id === orderId ? { ...order, ...updates } : order
    ),
  })),

  removeOrder: (orderId) => set((state) => ({
    orders: state.orders.filter(order => order.id !== orderId),
  })),

  setActiveOrder: (order) => set({ activeOrder: order }),

  setFilters: (filters) => set({ filters }),

  setLoading: (loading) => set({ loading }),

  setError: (error) => set({ error }),

  clearError: () => set({ error: null }),

  // Async actions
  loadOrders: async () => {
    set({ loading: true, error: null });
    try {
      const orders = await fetchOrders();
      set({ orders, loading: false });
    } catch (error) {
      set({ error: 'Error al cargar órdenes', loading: false });
      console.error('Error loading orders:', error);
    }
  },

  startSubscription: async () => {
    if (get().isSubscribed) {
      return;
    }

    set({ loading: true, error: null });

    try {
      unsubscribeFn = await subscribeToOrders(
        (order) => {
          get().addOrder(order);
        },
        (error) => {
          set({ error: 'Error en la suscripción de órdenes' });
          console.error('Subscription error:', error);
        }
      );

      set({ isSubscribed: true, loading: false });
    } catch (error) {
      set({ error: 'Error al iniciar suscripción', loading: false });
      console.error('Error starting subscription:', error);
    }
  },

  stopSubscription: () => {
    if (unsubscribeFn) {
      unsubscribeFn();
      unsubscribeFn = null;
    }
    set({ isSubscribed: false });
  },

  // Selectors
  getFilteredOrders: () => {
    const { orders, filters } = get();
    let filtered = [...orders];

    if (filters.type) {
      filtered = filtered.filter(order => order.kind === filters.type);
    }

    if (filters.fiatCode) {
      filtered = filtered.filter(order => order.fiat_code === filters.fiatCode);
    }

    if (filters.paymentMethod) {
      filtered = filtered.filter(order =>
        order.payment_method.includes(filters.paymentMethod!)
      );
    }

    if (filters.minAmount) {
      filtered = filtered.filter(order => order.amount >= filters.minAmount!);
    }

    if (filters.maxAmount) {
      filtered = filtered.filter(order => order.amount <= filters.maxAmount!);
    }

    // Sort by created_at (newest first)
    filtered.sort((a, b) => b.created_at - a.created_at);

    return filtered;
  },

  getOrderById: (id) => {
    return get().orders.find(order => order.id === id);
  },
}));
