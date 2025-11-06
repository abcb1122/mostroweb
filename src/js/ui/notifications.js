/**
 * notifications.js
 * Sistema de notificaciones visuales mejorado
 * Muestra notificaciones ricas con emojis e iconos para eventos importantes
 */

import Display from './display.js';
import Logger from '../utils/logger.js';

/**
 * NotificationSystem class
 * Maneja notificaciones visuales mejoradas
 */
class NotificationSystem {
  constructor() {
    this.notificationHistory = [];
    this.maxHistory = 50;
  }

  /**
   * Guarda notificación en historial
   * @param {string} type - Tipo de notificación
   * @param {string} message - Mensaje
   */
  addToHistory(type, message) {
    this.notificationHistory.unshift({
      type,
      message,
      timestamp: Date.now()
    });

    if (this.notificationHistory.length > this.maxHistory) {
      this.notificationHistory.pop();
    }
  }

  /**
   * Notificación de orden tomada
   * @param {string} orderId - ID de la orden
   * @param {string} orderType - 'buy' o 'sell'
   */
  orderTaken(orderId, orderType) {
    const isBuying = orderType === 'sell'; // Si tomas una orden de venta, estás comprando
    const action = isBuying ? 'COMPRANDO' : 'VENDIENDO';
    const emoji = isBuying ? '💰' : '⚡';

    Display.blank();
    Display.addLine('╔════════════════════════════════════════════════════════════╗', 'success');
    Display.addLine(`║  ${emoji} ORDEN TOMADA - ${action} BITCOIN ${emoji}                      ║`, 'success');
    Display.addLine('╚════════════════════════════════════════════════════════════╝', 'success');
    Display.blank();
    Display.addLine(`   Order ID: ${orderId.slice(0, 16)}...`, 'dim');
    Display.blank();

    this.addToHistory('order_taken', `Orden tomada: ${orderId}`);
  }

  /**
   * Notificación de invoice aceptada
   * @param {string} orderId - ID de la orden
   * @param {string} invoice - Lightning invoice (opcional)
   */
  invoiceAccepted(orderId, invoice = null) {
    Display.blank();
    Display.addLine('╔════════════════════════════════════════════════════════════╗', 'success');
    Display.addLine('║  ✅ INVOICE ACEPTADA POR MOSTRO                           ║', 'success');
    Display.addLine('╚════════════════════════════════════════════════════════════╝', 'success');
    Display.blank();
    Display.addLine(`   Order ID: ${orderId.slice(0, 16)}...`, 'dim');

    if (invoice) {
      Display.blank();
      Display.addLine('   Invoice Lightning:', 'info');
      Display.addLine(`   ${invoice.slice(0, 40)}...`, 'dim');
    }

    Display.blank();
    Display.addLine('   ⏳ Estado: Esperando pago...', 'warning');
    Display.blank();

    this.addToHistory('invoice_accepted', `Invoice aceptada: ${orderId}`);
  }

  /**
   * Notificación de pago hold retenido
   * @param {string} orderId - ID de la orden
   */
  holdInvoicePaymentAccepted(orderId) {
    Display.blank();
    Display.addLine('╔════════════════════════════════════════════════════════════╗', 'warning');
    Display.addLine('║  🔒 PAGO RETENIDO EN ESCROW                                ║', 'warning');
    Display.addLine('╚════════════════════════════════════════════════════════════╝', 'warning');
    Display.blank();
    Display.addLine(`   Order ID: ${orderId.slice(0, 16)}...`, 'dim');
    Display.blank();
    Display.addLine('   Los satoshis están seguros en hold invoice', 'info');
    Display.addLine('   Esperando que el comprador envíe el pago fiat...', 'dim');
    Display.blank();

    this.addToHistory('hold_payment', `Pago en escrow: ${orderId}`);
  }

  /**
   * Notificación de pago fiat enviado
   * @param {string} orderId - ID de la orden
   */
  fiatSent(orderId) {
    Display.blank();
    Display.addLine('╔════════════════════════════════════════════════════════════╗', 'info');
    Display.addLine('║  💸 COMPRADOR ENVIÓ PAGO FIAT                              ║', 'info');
    Display.addLine('╚════════════════════════════════════════════════════════════╝', 'info');
    Display.blank();
    Display.addLine(`   Order ID: ${orderId.slice(0, 16)}...`, 'dim');
    Display.blank();
    Display.addLine('   ⚠️  VENDEDOR: Verifica que recibiste el pago', 'warning');
    Display.addLine('   Solo libera Bitcoin si confirmaste la recepción', 'warning');
    Display.blank();
    Display.addLine('   Para liberar fondos:', 'info');
    Display.addLine(`   /release ${orderId.slice(0, 8)}`, 'success');
    Display.blank();

    this.addToHistory('fiat_sent', `Fiat enviado: ${orderId}`);
  }

  /**
   * Notificación de trade completado
   * @param {string} orderId - ID de la orden
   */
  purchaseCompleted(orderId) {
    Display.blank();
    Display.addLine('╔════════════════════════════════════════════════════════════╗', 'success');
    Display.addLine('║  🎉 ¡TRADE COMPLETADO EXITOSAMENTE! 🎉                     ║', 'success');
    Display.addLine('╚════════════════════════════════════════════════════════════╝', 'success');
    Display.blank();
    Display.addLine(`   Order ID: ${orderId.slice(0, 16)}...`, 'dim');
    Display.blank();
    Display.addLine('   ✅ Bitcoin transferido', 'success');
    Display.addLine('   ✅ Pago fiat confirmado', 'success');
    Display.addLine('   ✅ Trade finalizado', 'success');
    Display.blank();
    Display.addLine('   🌟 ¡Gracias por usar MostroWeb!', 'primary');
    Display.blank();

    this.addToHistory('purchase_completed', `Trade completado: ${orderId}`);
  }

  /**
   * Notificación de error genérico
   * @param {string} reason - Razón del error
   * @param {string} message - Mensaje descriptivo
   * @param {string} orderId - ID de la orden (opcional)
   */
  error(reason, message, orderId = null) {
    Display.blank();
    Display.addLine('╔════════════════════════════════════════════════════════════╗', 'error');
    Display.addLine('║  ❌ ERROR EN TRADE                                         ║', 'error');
    Display.addLine('╚════════════════════════════════════════════════════════════╝', 'error');
    Display.blank();

    if (orderId) {
      Display.addLine(`   Order ID: ${orderId.slice(0, 16)}...`, 'dim');
      Display.blank();
    }

    Display.addLine(`   Error: ${reason}`, 'error');
    Display.addLine(`   ${message}`, 'warning');
    Display.blank();
    Display.addLine('   💡 Sugerencias:', 'info');

    // Sugerencias basadas en el tipo de error
    if (reason.includes('Invoice')) {
      Display.addLine('   • Verifica que la invoice sea válida', 'dim');
      Display.addLine('   • Usa una invoice de Lightning Network', 'dim');
      Display.addLine('   • Verifica que coincida con la cantidad de la orden', 'dim');
    } else if (reason.includes('Status')) {
      Display.addLine('   • Verifica el estado actual de la orden', 'dim');
      Display.addLine('   • Usa /listorders para ver órdenes activas', 'dim');
      Display.addLine('   • Algunos comandos solo funcionan en ciertos estados', 'dim');
    } else if (reason.includes('Amount')) {
      Display.addLine('   • Verifica el monto de la orden', 'dim');
      Display.addLine('   • Para órdenes con rango, especifica la cantidad', 'dim');
    } else {
      Display.addLine('   • Revisa los parámetros del comando', 'dim');
      Display.addLine('   • Usa /help para ver la sintaxis correcta', 'dim');
    }

    Display.blank();

    this.addToHistory('error', `Error: ${reason} - ${message}`);
  }

  /**
   * Notificación de orden cancelada
   * @param {string} orderId - ID de la orden
   * @param {boolean} isCooperative - Si fue cancelación cooperativa
   */
  orderCanceled(orderId, isCooperative = false) {
    const cancelType = isCooperative ? 'CANCELACIÓN COOPERATIVA' : 'ORDEN CANCELADA';

    Display.blank();
    Display.addLine('╔════════════════════════════════════════════════════════════╗', 'warning');
    Display.addLine(`║  ⚠️  ${cancelType.padEnd(47)}  ║`, 'warning');
    Display.addLine('╚════════════════════════════════════════════════════════════╝', 'warning');
    Display.blank();
    Display.addLine(`   Order ID: ${orderId.slice(0, 16)}...`, 'dim');
    Display.blank();

    if (isCooperative) {
      Display.addLine('   Ambas partes acordaron cancelar el trade', 'info');
      Display.addLine('   Los fondos serán devueltos automáticamente', 'dim');
    } else {
      Display.addLine('   La orden ha sido cancelada', 'info');
    }

    Display.blank();

    this.addToHistory('canceled', `Orden cancelada: ${orderId}`);
  }

  /**
   * Notificación de disputa iniciada
   * @param {string} orderId - ID de la orden
   */
  disputeInitiated(orderId) {
    Display.blank();
    Display.addLine('╔════════════════════════════════════════════════════════════╗', 'error');
    Display.addLine('║  ⚖️  DISPUTA INICIADA                                      ║', 'error');
    Display.addLine('╚════════════════════════════════════════════════════════════╝', 'error');
    Display.blank();
    Display.addLine(`   Order ID: ${orderId.slice(0, 16)}...`, 'dim');
    Display.blank();
    Display.addLine('   Un administrador de Mostro revisará el caso', 'warning');
    Display.addLine('   Proporciona toda la evidencia necesaria', 'info');
    Display.addLine('   • Capturas de pantalla de pagos', 'dim');
    Display.addLine('   • Comprobantes de transacción', 'dim');
    Display.addLine('   • Comunicación con la contraparte', 'dim');
    Display.blank();

    this.addToHistory('dispute', `Disputa iniciada: ${orderId}`);
  }

  /**
   * Notificación de nueva orden creada
   * @param {string} orderId - ID de la orden
   * @param {Object} orderDetails - Detalles de la orden
   */
  orderCreated(orderId, orderDetails = {}) {
    const { kind, fiat_amount, fiat_code, payment_method } = orderDetails;
    const action = kind === 'buy' ? 'COMPRA' : 'VENTA';
    const emoji = kind === 'buy' ? '🛒' : '💰';

    Display.blank();
    Display.addLine('╔════════════════════════════════════════════════════════════╗', 'success');
    Display.addLine(`║  ${emoji} ORDEN DE ${action} CREADA ${emoji}                              ║`, 'success');
    Display.addLine('╚════════════════════════════════════════════════════════════╝', 'success');
    Display.blank();
    Display.addLine(`   Order ID: ${orderId.slice(0, 16)}...`, 'dim');

    if (fiat_amount && fiat_code) {
      Display.blank();
      Display.addLine(`   Monto: ${fiat_amount} ${fiat_code}`, 'info');
    }

    if (payment_method) {
      Display.addLine(`   Método de pago: ${payment_method}`, 'info');
    }

    Display.blank();
    Display.addLine('   ✅ Orden publicada en Nostr', 'success');
    Display.addLine('   ⏳ Esperando que alguien tome la orden...', 'dim');
    Display.blank();
    Display.addLine('   Usa /listorders para ver tus órdenes activas', 'info');
    Display.blank();

    this.addToHistory('order_created', `Orden creada: ${orderId}`);
  }

  /**
   * Muestra el historial de notificaciones
   * @param {number} limit - Número de notificaciones a mostrar
   */
  showHistory(limit = 10) {
    Display.blank();
    Display.addLine('📜 Historial de Notificaciones', 'primary');
    Display.addLine('═══════════════════════════════════════', 'dim');
    Display.blank();

    const recent = this.notificationHistory.slice(0, limit);

    if (recent.length === 0) {
      Display.addLine('  No hay notificaciones recientes', 'dim');
      Display.blank();
      return;
    }

    recent.forEach((notif, index) => {
      const date = new Date(notif.timestamp);
      const timeStr = date.toLocaleTimeString('es-ES');

      const typeEmoji = {
        'order_taken': '📦',
        'invoice_accepted': '✅',
        'hold_payment': '🔒',
        'fiat_sent': '💸',
        'purchase_completed': '🎉',
        'error': '❌',
        'canceled': '⚠️',
        'dispute': '⚖️',
        'order_created': '🆕'
      };

      const emoji = typeEmoji[notif.type] || '📌';

      Display.addLine(`  ${emoji} [${timeStr}] ${notif.message}`, 'dim');
    });

    Display.blank();
    Display.addLine(`Mostrando ${recent.length} notificaciones más recientes`, 'dim');
    Display.blank();
  }

  /**
   * Limpia el historial de notificaciones
   */
  clearHistory() {
    this.notificationHistory = [];
    Logger.info('Notifications: History cleared');
  }
}

// Crear instancia singleton
const instance = new NotificationSystem();

// Exportar como default
export default instance;
