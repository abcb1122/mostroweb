/**
 * @file nostr.ts
 * @description Tipos TypeScript para eventos Nostr y estructuras relacionadas
 */

import { Event as NostrToolsEvent } from 'nostr-tools';

// Re-export del tipo Event de nostr-tools
export type NostrEvent = NostrToolsEvent;

// Event kinds relevantes para Mostro
export enum EventKind {
  Metadata = 0,
  Text = 1,
  RecommendRelay = 2,
  Contacts = 3,
  EncryptedDirectMessage = 4,
  Delete = 5,
  Repost = 6,
  Reaction = 7,
  MostroOrder = 38383, // Kind específico para órdenes Mostro
}

// Estructura de un evento Nostr sin firmar
export interface UnsignedEvent {
  kind: number;
  created_at: number;
  tags: string[][];
  content: string;
  pubkey: string;
}

// Filtro para subscripciones
export interface Filter {
  ids?: string[];
  authors?: string[];
  kinds?: number[];
  since?: number;
  until?: number;
  limit?: number;
  [key: `#${string}`]: string[] | undefined;
}

// Estado de un relay
export enum RelayStatus {
  Connecting = 'connecting',
  Connected = 'connected',
  Disconnected = 'disconnected',
  Error = 'error',
}

// Información de un relay
export interface RelayInfo {
  url: string;
  status: RelayStatus;
  latency: number | null;
  lastError: string | null;
  reconnectAttempts: number;
  lastConnected: number | null;
}

// Configuración de relays
export interface RelayConfig {
  primary: string[]; // Relays prioritarios (Mostro)
  fallback: string[]; // Relays generales
  minConnected: number; // Mínimo de relays conectados
  timeout: number; // Timeout de conexión (ms)
  retryInterval: number; // Intervalo de reintento (ms)
  maxRetries: number; // Máximo de reintentos
}

// Resultado de publicación de evento
export interface PublishResult {
  success: boolean;
  relays: string[]; // Relays que aceptaron el evento
  errors: Record<string, string>; // Errores por relay
}

// Usuario Nostr
export interface NostrUser {
  pubkey: string;
  npub?: string;
  metadata?: {
    name?: string;
    about?: string;
    picture?: string;
    nip05?: string;
    lud16?: string; // Lightning address
  };
}

// Subscripción activa
export interface Subscription {
  id: string;
  filters: Filter[];
  onEvent: (event: NostrEvent) => void;
  onEose?: () => void;
  active: boolean;
  createdAt: number;
}

// Provider NIP-07 (window.nostr)
export interface NIP07Provider {
  getPublicKey(): Promise<string>;
  signEvent(event: UnsignedEvent): Promise<NostrEvent>;
  getRelays?(): Promise<Record<string, { read: boolean; write: boolean }>>;
  nip04?: {
    encrypt(pubkey: string, plaintext: string): Promise<string>;
    decrypt(pubkey: string, ciphertext: string): Promise<string>;
  };
}

// Extender window para window.nostr
declare global {
  interface Window {
    nostr?: NIP07Provider;
  }
}

export {};
