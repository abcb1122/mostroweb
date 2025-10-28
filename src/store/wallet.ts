/**
 * @file wallet.ts
 * @description Zustand store para estado del wallet Lightning
 *
 * TODO: Implementar store con:
 *
 * State:
 * - isConnected: boolean
 * - walletInfo: WalletInfo | null
 * - balance: number | null (si disponible)
 * - provider: string | null ('alby', 'nwc', etc.)
 *
 * Actions:
 * - setConnected(connected): Actualizar estado conexión
 * - setWalletInfo(info): Guardar info del wallet
 * - updateBalance(balance): Actualizar balance
 * - disconnect(): Desconectar wallet
 *
 * Persistence:
 * - Guardar preferencia de provider en localStorage
 */

export {};
