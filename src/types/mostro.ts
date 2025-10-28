/**
 * @file mostro.ts
 * @description Tipos TypeScript específicos del protocolo Mostro
 */

// Tipo de orden
export enum OrderType {
  Buy = 'buy',
  Sell = 'sell',
}

// Estado de una orden
export enum OrderStatus {
  Pending = 'pending',
  Active = 'active',
  WaitingBuyerInvoice = 'waiting-buyer-invoice',
  WaitingPayment = 'waiting-payment',
  FiatSent = 'fiat-sent',
  SettledHoldInvoice = 'settled-hold-invoice',
  Success = 'success',
  Canceled = 'canceled',
  CanceledByAdmin = 'canceled-by-admin',
  Dispute = 'dispute',
  Expired = 'expired',
}

// Monedas fiat soportadas
export enum FiatCurrency {
  USD = 'USD',
  EUR = 'EUR',
  GBP = 'GBP',
  MXN = 'MXN',
  ARS = 'ARS',
  BRL = 'BRL',
  CLP = 'CLP',
  COP = 'COP',
  VES = 'VES',
}

// Métodos de pago
export enum PaymentMethod {
  Zelle = 'Zelle',
  Revolut = 'Revolut',
  CashApp = 'Cash App',
  Venmo = 'Venmo',
  PayPal = 'PayPal',
  SEPA = 'SEPA',
  BankTransfer = 'Bank Transfer',
  Mercadopago = 'Mercadopago',
  Nequi = 'Nequi',
  Pix = 'Pix',
  Bizum = 'Bizum',
  Strike = 'Strike',
}

// Acciones del protocolo Mostro
export enum MostroAction {
  NewOrder = 'new-order',
  TakeOrder = 'take-order',
  FiatSent = 'fiat-sent',
  Release = 'release',
  Cancel = 'cancel',
  Dispute = 'dispute',
  AdminCancel = 'admin-cancel',
  AddInvoice = 'add-invoice',
  RateUser = 'rate-user',
}

// Estructura de una orden
export interface Order {
  id: string;
  kind: number; // 38383
  pubkey: string; // Creador de la orden
  createdAt: number;
  status: OrderStatus;
  type: OrderType;
  fiatAmount: number;
  fiatCurrency: FiatCurrency;
  paymentMethod: PaymentMethod;
  premium: number; // Porcentaje de prima
  minAmount?: number; // Monto mínimo (si es rango)
  maxAmount?: number; // Monto máximo (si es rango)
  satsAmount?: number; // Calculado según tasa BTC
  rate?: number; // Tasa BTC/Fiat
  invoice?: string; // Lightning invoice
  hash?: string; // Hash del invoice
  takerPubkey?: string; // Pubkey del que tomó la orden
  expiresAt?: number; // Timestamp de expiración
  metadata?: {
    description?: string;
    disputeReason?: string;
    rating?: number;
  };
}

// Datos para crear una orden
export interface CreateOrderData {
  type: OrderType;
  fiatAmount: number;
  fiatCurrency: FiatCurrency;
  paymentMethod: PaymentMethod;
  premium?: number;
  minAmount?: number;
  maxAmount?: number;
}

// Mensaje del daemon Mostro
export interface MostroMessage {
  version: number;
  action: MostroAction;
  payload?: {
    order?: Order;
    orderId?: string;
    invoice?: string;
    amount?: number;
    rating?: number;
    reason?: string;
    [key: string]: unknown;
  };
}

// Respuesta de Mostro
export interface MostroResponse {
  success: boolean;
  message?: string;
  order?: Order;
  invoice?: string;
  error?: string;
}

// Filtros para órdenes
export interface OrderFilters {
  type?: OrderType;
  fiatCurrency?: FiatCurrency;
  paymentMethod?: PaymentMethod;
  minAmount?: number;
  maxAmount?: number;
  status?: OrderStatus[];
}

// Rating de usuario
export interface UserRating {
  pubkey: string;
  orderId: string;
  rating: number; // 1-5
  comment?: string;
  timestamp: number;
}

// Disputa
export interface Dispute {
  orderId: string;
  initiatorPubkey: string;
  reason: string;
  timestamp: number;
  status: 'open' | 'resolved' | 'canceled';
  resolution?: string;
}

// Estadísticas de orden
export interface OrderStats {
  total: number;
  active: number;
  completed: number;
  volume: number; // Total en sats
}

export {};
