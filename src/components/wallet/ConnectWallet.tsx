/**
 * @file ConnectWallet.tsx
 * @description Componente para conectar wallet Lightning
 *
 * TODO: Implementar componente que:
 *
 * - Integra @getalby/bitcoin-connect
 * - Botón "Conectar Wallet"
 * - Modal automático de bitcoin-connect con opciones:
 *   - WebLN extensions (Alby)
 *   - NWC (Nostr Wallet Connect) - QR code
 *   - Mobile wallets
 *
 * - Manejo de eventos:
 *   - onConnected: guardar en store
 *   - onDisconnected: actualizar estado
 *   - onError: mostrar error
 *
 * - UI states:
 *   - Disconnected: botón connect
 *   - Connecting: spinner
 *   - Connected: mostrar provider y balance (si disponible)
 */

export {};
