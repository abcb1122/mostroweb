/**
 * @file relays.ts
 * @description Zustand store para estado de relays Nostr
 *
 * TODO: Implementar store con:
 *
 * State:
 * - relays: Record<string, RelayStatus> (url -> status)
 * - connectedCount: number
 * - isHealthy: boolean (al menos 2 conectados)
 *
 * RelayStatus:
 * - url: string
 * - status: 'connecting' | 'connected' | 'disconnected' | 'error'
 * - latency: number | null
 * - lastError: string | null
 * - reconnectAttempts: number
 *
 * Actions:
 * - updateRelayStatus(url, status): Actualizar estado de relay
 * - setLatency(url, latency): Actualizar latencia
 * - incrementReconnectAttempts(url): Incrementar intentos
 * - resetReconnectAttempts(url): Reset al conectar
 */

export {};
