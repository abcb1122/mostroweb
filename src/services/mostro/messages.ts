/**
 * @file messages.ts
 * @description Gestión de mensajes bidireccionales con Mostro daemon
 *
 * TODO: Implementar:
 * - MostroMessenger class
 *   - sendMessage(action, data): Enviar mensaje al daemon
 *   - onMessage(callback): Subscribirse a mensajes del daemon
 *   - getMessageHistory(orderId): Historial de mensajes por orden
 *
 * - Message types handlers:
 *   - handleOrderCreated(message): Orden creada exitosamente
 *   - handleOrderTaken(message): Alguien tomó tu orden
 *   - handleInvoiceRequest(message): Daemon solicita invoice
 *   - handlePaymentConfirmed(message): Pago confirmado
 *   - handleDisputeOpened(message): Disputa iniciada
 *
 * - Queue de mensajes pendientes (offline support)
 */

export {};
