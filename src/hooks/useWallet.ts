/**
 * @file useWallet.ts
 * @description Custom hook para operaciones Lightning
 *
 * TODO: Implementar hook que proporcione:
 *
 * - connect(): Conectar wallet
 * - disconnect(): Desconectar wallet
 * - sendPayment(invoice): Pagar invoice
 * - makeInvoice(amount, memo): Crear invoice
 * - getInfo(): Info del wallet
 *
 * Returns:
 * {
 *   isConnected: boolean,
 *   walletInfo: WalletInfo | null,
 *   sendPayment: (invoice) => Promise<PaymentResult>,
 *   makeInvoice: (amount) => Promise<string>,
 *   loading: boolean,
 *   error: string | null
 * }
 *
 * - Integración con @getalby/bitcoin-connect
 * - Manejo de eventos del wallet
 */

export {};
