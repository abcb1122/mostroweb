/**
 * @file lightning.ts
 * @description Tipos TypeScript para Lightning Network y WebLN
 */

// Definición local de WebLNProvider (para evitar dependencia del paquete webln)
export interface WebLNProvider {
  enable(): Promise<void>;
  getInfo(): Promise<{ node: { alias: string; pubkey?: string } }>;
  sendPayment(paymentRequest: string): Promise<{ preimage: string }>;
  makeInvoice(args: { amount?: string | number; defaultMemo?: string }): Promise<{ paymentRequest: string }>;
  signMessage(message: string): Promise<{ message: string; signature: string }>;
  verifyMessage(signature: string, message: string): Promise<void>;
}

// Información del wallet
export interface WalletInfo {
  node: {
    alias?: string;
    pubkey?: string;
    color?: string;
  };
  methods: string[]; // Métodos soportados (sendPayment, makeInvoice, etc)
  version?: string;
}

// Invoice Lightning
export interface Invoice {
  paymentRequest: string; // BOLT11 invoice string
  paymentHash: string;
  amount: number; // msat
  description?: string;
  descriptionHash?: string;
  timestamp: number;
  expiry: number;
  payeeNodeKey?: string;
}

// Resultado de pago
export interface PaymentResult {
  preimage: string;
  paymentHash?: string;
  route?: {
    total_amt: number;
    total_fees: number;
  };
}

// Request para hacer invoice
export interface MakeInvoiceRequest {
  amount: number | string; // sats o msat
  defaultMemo?: string;
  minimumAmount?: number;
  maximumAmount?: number;
}

// Response de crear invoice
export interface MakeInvoiceResponse {
  paymentRequest: string;
  rHash: string;
}

// Request para enviar pago
export interface SendPaymentRequest {
  paymentRequest: string;
}

// Estado del pago
export enum PaymentStatus {
  Pending = 'pending',
  Complete = 'complete',
  Failed = 'failed',
  Unknown = 'unknown',
}

// Información de balance (si el provider lo soporta)
export interface BalanceInfo {
  balance: number; // sats
  pendingIncoming?: number;
  pendingOutgoing?: number;
}

// Providers soportados
export enum LightningProvider {
  Alby = 'alby',
  NWC = 'nwc', // Nostr Wallet Connect
  LNBits = 'lnbits',
  WebLN = 'webln', // Generic WebLN
  Unknown = 'unknown',
}

// Estado de conexión del wallet
export interface WalletConnectionState {
  connected: boolean;
  provider: LightningProvider;
  info: WalletInfo | null;
  balance: BalanceInfo | null;
  error: string | null;
}

// Error de Lightning
export interface LightningError {
  code: string;
  message: string;
  details?: Record<string, unknown>;
}

// Tipos de errores comunes
export enum LightningErrorCode {
  InsufficientBalance = 'INSUFFICIENT_BALANCE',
  RouteNotFound = 'ROUTE_NOT_FOUND',
  Timeout = 'TIMEOUT',
  UserRejected = 'USER_REJECTED',
  InvalidInvoice = 'INVALID_INVOICE',
  AlreadyPaid = 'ALREADY_PAID',
  Expired = 'EXPIRED',
  Unknown = 'UNKNOWN',
}

// Parseo de invoice BOLT11
export interface ParsedInvoice {
  paymentRequest: string;
  network: 'bitcoin' | 'testnet' | 'regtest';
  amount: number | null; // sats (null si es variable)
  timestamp: number;
  expiry: number;
  description?: string;
  paymentHash: string;
  destination: string;
}

// Extender window para webln
declare global {
  interface Window {
    webln?: WebLNProvider;
  }
}

export {};
