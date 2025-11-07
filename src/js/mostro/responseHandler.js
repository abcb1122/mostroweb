/**
 * responseHandler.js
 * Maneja todas las respuestas del daemon Mostro
 *
 * Sistema de routing de mensajes basado en action type
 * Implementa handlers para las 47 acciones del protocolo Mostro
 */

import Logger from '../utils/logger.js';
import Display from '../ui/display.js';
import Notifications from '../ui/notifications.js';
import { MOSTRO_ACTIONS, ORDER_STATUS } from '../utils/constants.js';
import Discovery from './discovery.js';

/**
 * CantDoReason - Razones de error del daemon Mostro
 * Según mostro-core
 */
export const CANT_DO_REASONS = {
  INVALID_SIGNATURE: 'InvalidSignature',
  INVALID_TRADE_INDEX: 'InvalidTradeIndex',
  INVALID_AMOUNT: 'InvalidAmount',
  INVALID_INVOICE: 'InvalidInvoice',
  INVALID_PAYMENT_REQUEST: 'InvalidPaymentRequest',
  INVALID_PEER: 'InvalidPeer',
  INVALID_RATING: 'InvalidRating',
  INVALID_TEXT_MESSAGE: 'InvalidTextMessage',
  INVALID_ORDER_STATUS: 'InvalidOrderStatus',
  INVALID_PUBKEY: 'InvalidPubkey',
  INVALID_PARAMETERS: 'InvalidParameters',
  ORDER_ALREADY_CANCELED: 'OrderAlreadyCanceled',
  CANT_CREATE_USER: 'CantCreateUser',
  IS_NOT_YOUR_ORDER: 'IsNotYourOrder',
  NOT_ALLOWED_BY_STATUS: 'NotAllowedByStatus',
  OUT_OF_RANGE_FIAT_AMOUNT: 'OutOfRangeFiatAmount',
  OUT_OF_RANGE_SATS_AMOUNT: 'OutOfRangeSatsAmount',
  IS_NOT_YOUR_DISPUTE: 'IsNotYourDispute',
  NOT_FOUND: 'NotFound',
  INVALID_FIAT_CURRENCY: 'InvalidFiatCurrency',
  TOO_MANY_REQUESTS: 'TooManyRequests'
};

/**
 * Mensajes de error traducidos al español
 */
const ERROR_MESSAGES_ES = {
  [CANT_DO_REASONS.INVALID_SIGNATURE]: 'Firma inválida',
  [CANT_DO_REASONS.INVALID_TRADE_INDEX]: 'Índice de trade inválido',
  [CANT_DO_REASONS.INVALID_AMOUNT]: 'Monto inválido',
  [CANT_DO_REASONS.INVALID_INVOICE]: 'Invoice Lightning inválida',
  [CANT_DO_REASONS.INVALID_PAYMENT_REQUEST]: 'Solicitud de pago inválida',
  [CANT_DO_REASONS.INVALID_PEER]: 'Peer inválido',
  [CANT_DO_REASONS.INVALID_RATING]: 'Calificación inválida',
  [CANT_DO_REASONS.INVALID_TEXT_MESSAGE]: 'Mensaje de texto inválido',
  [CANT_DO_REASONS.INVALID_ORDER_STATUS]: 'Estado de orden inválido',
  [CANT_DO_REASONS.INVALID_PUBKEY]: 'Pubkey inválida',
  [CANT_DO_REASONS.INVALID_PARAMETERS]: 'Parámetros inválidos',
  [CANT_DO_REASONS.ORDER_ALREADY_CANCELED]: 'La orden ya fue cancelada',
  [CANT_DO_REASONS.CANT_CREATE_USER]: 'No se pudo crear usuario',
  [CANT_DO_REASONS.IS_NOT_YOUR_ORDER]: 'Esta no es tu orden',
  [CANT_DO_REASONS.NOT_ALLOWED_BY_STATUS]: 'Acción no permitida en este estado',
  [CANT_DO_REASONS.OUT_OF_RANGE_FIAT_AMOUNT]: 'Monto fiat fuera de rango',
  [CANT_DO_REASONS.OUT_OF_RANGE_SATS_AMOUNT]: 'Monto sats fuera de rango',
  [CANT_DO_REASONS.IS_NOT_YOUR_DISPUTE]: 'Esta no es tu disputa',
  [CANT_DO_REASONS.NOT_FOUND]: 'No encontrado',
  [CANT_DO_REASONS.INVALID_FIAT_CURRENCY]: 'Moneda fiat inválida',
  [CANT_DO_REASONS.TOO_MANY_REQUESTS]: 'Demasiadas solicitudes, intenta más tarde'
};

/**
 * MostroResponseHandler
 * Gestiona todas las respuestas del daemon Mostro
 */
class MostroResponseHandler {
  constructor() {
    // Map de órdenes activas: orderId -> orderState
    this.activeOrders = new Map();

    // Map de request_id -> orderId para tracking
    this.pendingRequests = new Map();

    // Stats
    this.stats = {
      messagesReceived: 0,
      errorsHandled: 0,
      tradesCompleted: 0
    };
  }

  /**
   * Unwrap Gift Wrap message (NIP-59)
   * @param {Object} giftWrapEvent - Event kind 1059
   * @returns {Object} Mensaje desencriptado
   */
  async unwrapGiftWrap(giftWrapEvent) {
    try {
      const { nip44, sha256, schnorr } = window.nostrTools;

      Logger.debug('ResponseHandler: Unwrapping Gift Wrap event', giftWrapEvent.id.slice(0, 8));

      // 0. Obtener clave privada del usuario
      const identityData = sessionStorage.getItem('mostro_identity');
      if (!identityData) {
        throw new Error('No identity found');
      }

      const identity = JSON.parse(identityData);
      const userSecretKey = new Uint8Array(identity.secretKey);

      // 1. Decrypt gift wrap usando la clave privada del user y el pubkey del gift wrap
      const giftWrapSenderPubkey = giftWrapEvent.pubkey;
      const conversationKey1 = nip44.v2.utils.getConversationKey(
        userSecretKey,
        giftWrapSenderPubkey
      );
      const decryptedGiftWrap = nip44.v2.decrypt(
        giftWrapEvent.content,
        conversationKey1
      );

      // 2. Parse seal (kind 13) del contenido desencriptado
      const seal = JSON.parse(decryptedGiftWrap);

      if (seal.kind !== 13) {
        throw new Error(`Invalid seal kind: ${seal.kind}, expected 13`);
      }

      Logger.debug('ResponseHandler: Seal extracted', seal);

      // 3. Decrypt seal para obtener el rumor
      const sealSenderPubkey = seal.pubkey;
      const conversationKey2 = nip44.v2.utils.getConversationKey(
        userSecretKey,
        sealSenderPubkey
      );
      const decryptedSeal = nip44.v2.decrypt(seal.content, conversationKey2);

      // 4. Parse rumor
      const rumor = JSON.parse(decryptedSeal);

      Logger.debug('ResponseHandler: Rumor extracted', rumor);

      // 5. Parse rumor content: [messageJson, signature]
      const rumorContentArray = JSON.parse(rumor.content);

      if (!Array.isArray(rumorContentArray) || rumorContentArray.length !== 2) {
        throw new Error('Invalid rumor content format: expected [message, signature]');
      }

      const [messageJson, signatureHex] = rumorContentArray;
      const message = JSON.parse(messageJson);

      Logger.debug('ResponseHandler: Message extracted', message);

      // 6. Verificar firma (opcional pero recomendado)
      try {
        const messageBytes = new TextEncoder().encode(messageJson);
        const hash = sha256(messageBytes);
        const signature = new Uint8Array(
          signatureHex.match(/.{1,2}/g).map(byte => parseInt(byte, 16))
        );

        const isValid = schnorr.verify(signature, hash, rumor.pubkey);

        if (!isValid) {
          Logger.warn('ResponseHandler: Invalid signature detected');
        } else {
          Logger.debug('ResponseHandler: Signature verified successfully');
        }
      } catch (verifyError) {
        Logger.warn('ResponseHandler: Could not verify signature', verifyError);
        // Continuar de todas formas
      }

      // 7. Retornar mensaje parseado
      return message;

    } catch (error) {
      Logger.error('ResponseHandler: Error unwrapping Gift Wrap', error);
      throw error;
    }
  }

  /**
   * Ruta el mensaje al handler apropiado basado en action
   * @param {Object} giftWrapEvent - Evento Gift Wrap recibido
   */
  async handleIncomingMessage(giftWrapEvent) {
    try {
      this.stats.messagesReceived++;

      // Unwrap gift wrap para obtener mensaje
      const message = await this.unwrapGiftWrap(giftWrapEvent);

      const { action, id: orderId, request_id, payload } = message.order;

      Logger.info(`ResponseHandler: Received action '${action}' for order ${orderId}`);

      // Router de acciones
      switch (action) {
        // === ERRORES Y VALIDACIONES ===
        case 'CantDo':
          return this.handleCantDo(message);

        // === FLUJO BÁSICO DE ORDEN ===
        case 'OrderCreated':
          return this.handleOrderCreated(message);
        case 'Canceled':
          return this.handleCanceled(message);

        // === FLUJO TOMAR ORDEN ===
        case 'BuyerTookOrder':
          return this.handleBuyerTookOrder(message);
        case 'WaitingSellerToPay':
          return this.handleWaitingSellerToPay(message);
        case 'WaitingBuyerInvoice':
          return this.handleWaitingBuyerInvoice(message);

        // === FLUJO LIGHTNING INVOICES ===
        case 'BuyerInvoiceAccepted':
          return this.handleBuyerInvoiceAccepted(message);
        case 'HoldInvoicePaymentAccepted':
          return this.handleHoldInvoicePaymentAccepted(message);
        case 'HoldInvoicePaymentSettled':
          return this.handleHoldInvoicePaymentSettled(message);
        case 'HoldInvoicePaymentCanceled':
          return this.handleHoldInvoicePaymentCanceled(message);
        case 'InvoiceUpdated':
          return this.handleInvoiceUpdated(message);
        case 'PaymentFailed':
          return this.handlePaymentFailed(message);

        // === FLUJO FIAT ===
        case 'FiatSentOk':
          return this.handleFiatSentOk(message);

        // === FLUJO RELEASE ===
        case 'Released':
          return this.handleReleased(message);
        case 'PurchaseCompleted':
          return this.handlePurchaseCompleted(message);

        // === FLUJO COOPERATIVO ===
        case 'CooperativeCancelInitiatedByPeer':
          return this.handleCooperativeCancelInitiatedByPeer(message);
        case 'CooperativeCancelAccepted':
          return this.handleCooperativeCancelAccepted(message);

        // === FLUJO DISPUTAS ===
        case 'DisputeInitiatedByPeer':
          return this.handleDisputeInitiatedByPeer(message);
        case 'DisputeInitiatedByYou':
          return this.handleDisputeInitiatedByYou(message);

        // === ADMIN ===
        case 'AdminCanceled':
          return this.handleAdminCanceled(message);
        case 'AdminSettled':
          return this.handleAdminSettled(message);
        case 'AdminTookDispute':
          return this.handleAdminTookDispute(message);

        // === RATINGS ===
        case 'RateReceived':
          return this.handleRateReceived(message);

        // === SESIÓN ===
        case 'TradePubkey':
          return this.handleTradePubkey(message);

        // === MENSAJERÍA ===
        case 'DmReceived':
          return this.handleDmReceived(message);

        // === NO IMPLEMENTADO ===
        default:
          Logger.warn(`ResponseHandler: Unhandled action '${action}'`);
          Display.warning(`Acción no implementada: ${action}`);
          return null;
      }
    } catch (error) {
      Logger.error('ResponseHandler: Error handling message', error);
      Display.error('Error procesando respuesta del daemon');
      this.stats.errorsHandled++;
      return null;
    }
  }

  // ========================================
  // HANDLERS CRÍTICOS
  // ========================================

  /**
   * Handler: CantDo
   * El daemon no pudo procesar la solicitud
   */
  handleCantDo(message) {
    const { id: orderId, payload } = message.order;
    const reason = payload?.cant_do_reason || 'Unknown';

    const errorMessage = ERROR_MESSAGES_ES[reason] || reason;

    Logger.error(`ResponseHandler: CantDo - ${errorMessage}`, payload);

    // Usar sistema de notificaciones mejorado
    Notifications.error(
      reason,
      errorMessage,
      orderId
    );

    this.stats.errorsHandled++;

    return {
      success: false,
      reason,
      errorMessage
    };
  }

  /**
   * Handler: BuyerInvoiceAccepted
   * El daemon aceptó la invoice del buyer
   */
  handleBuyerInvoiceAccepted(message) {
    const { id: orderId, payload } = message.order;

    Logger.info(`ResponseHandler: BuyerInvoiceAccepted for order ${orderId}`);

    // Usar sistema de notificaciones mejorado
    Notifications.invoiceAccepted(orderId, payload?.invoice);

    // Actualizar estado local
    this.updateOrderState(orderId, {
      status: ORDER_STATUS.WAITING_PAYMENT,
      invoice: payload?.invoice,
      lastUpdate: Date.now()
    });

    return {
      success: true,
      orderId,
      status: ORDER_STATUS.WAITING_PAYMENT
    };
  }

  /**
   * Handler: PurchaseCompleted
   * Trade completado exitosamente
   */
  handlePurchaseCompleted(message) {
    const { id: orderId, payload } = message.order;

    Logger.info(`ResponseHandler: PurchaseCompleted for order ${orderId}`);

    // Usar sistema de notificaciones mejorado
    Notifications.purchaseCompleted(orderId);

    // Actualizar estado local
    this.updateOrderState(orderId, {
      status: ORDER_STATUS.SUCCESS,
      completedAt: Date.now(),
      lastUpdate: Date.now()
    });

    this.stats.tradesCompleted++;

    return {
      success: true,
      orderId,
      status: ORDER_STATUS.SUCCESS
    };
  }

  // ========================================
  // HANDLERS LIGHTNING INVOICES
  // ========================================

  /**
   * Handler: HoldInvoicePaymentAccepted
   * Seller pagó la hold invoice
   */
  handleHoldInvoicePaymentAccepted(message) {
    const { id: orderId, payload } = message.order;

    Logger.info(`ResponseHandler: HoldInvoicePaymentAccepted for order ${orderId}`);

    // Usar sistema de notificaciones mejorado
    Notifications.holdInvoicePaymentAccepted(orderId);

    // Actualizar estado local
    this.updateOrderState(orderId, {
      status: ORDER_STATUS.ACTIVE,
      holdInvoicePaid: true,
      lastUpdate: Date.now()
    });

    return {
      success: true,
      orderId,
      status: ORDER_STATUS.ACTIVE
    };
  }

  /**
   * Handler: HoldInvoicePaymentSettled
   * Hold invoice fue liquidada (fondos liberados)
   */
  handleHoldInvoicePaymentSettled(message) {
    const { id: orderId } = message.order;

    Logger.info(`ResponseHandler: HoldInvoicePaymentSettled for order ${orderId}`);

    Display.success(`💰 Fondos liberados`);
    Display.info(`   Order ID: ${orderId}`);

    this.updateOrderState(orderId, {
      holdInvoiceSettled: true,
      lastUpdate: Date.now()
    });

    return {
      success: true,
      orderId
    };
  }

  /**
   * Handler: HoldInvoicePaymentCanceled
   * Hold invoice fue cancelada
   */
  handleHoldInvoicePaymentCanceled(message) {
    const { id: orderId } = message.order;

    Logger.warn(`ResponseHandler: HoldInvoicePaymentCanceled for order ${orderId}`);

    Display.warning(`⚠️ Hold invoice cancelada`);
    Display.info(`   Order ID: ${orderId}`);
    Display.info(`   Los fondos fueron devueltos al seller`);

    this.updateOrderState(orderId, {
      status: ORDER_STATUS.CANCELED,
      holdInvoiceCanceled: true,
      lastUpdate: Date.now()
    });

    return {
      success: true,
      orderId,
      status: ORDER_STATUS.CANCELED
    };
  }

  /**
   * Handler: InvoiceUpdated
   * Invoice fue actualizada
   */
  handleInvoiceUpdated(message) {
    const { id: orderId, payload } = message.order;

    Logger.info(`ResponseHandler: InvoiceUpdated for order ${orderId}`);

    Display.info(`📝 Invoice actualizada`);
    Display.info(`   Order ID: ${orderId}`);

    this.updateOrderState(orderId, {
      invoice: payload?.invoice,
      lastUpdate: Date.now()
    });

    return {
      success: true,
      orderId
    };
  }

  /**
   * Handler: PaymentFailed
   * Pago falló
   */
  handlePaymentFailed(message) {
    const { id: orderId, payload } = message.order;

    Logger.error(`ResponseHandler: PaymentFailed for order ${orderId}`, payload);

    Display.error(`❌ Pago falló`);
    Display.error(`   Order ID: ${orderId}`);

    if (payload?.reason) {
      Display.error(`   Razón: ${payload.reason}`);
    }

    this.updateOrderState(orderId, {
      paymentFailed: true,
      failureReason: payload?.reason,
      lastUpdate: Date.now()
    });

    this.stats.errorsHandled++;

    return {
      success: false,
      orderId,
      reason: payload?.reason
    };
  }

  // ========================================
  // HANDLERS FLUJO BÁSICO
  // ========================================

  /**
   * Handler: OrderCreated
   * Orden creada exitosamente
   */
  handleOrderCreated(message) {
    const { id: orderId, payload } = message.order;

    Logger.info(`ResponseHandler: OrderCreated ${orderId}`);

    Display.success(`✅ Orden creada exitosamente`);
    Display.info(`   Order ID: ${orderId}`);
    Display.info(`   Tu orden está ahora visible en la red`);

    return {
      success: true,
      orderId
    };
  }

  /**
   * Handler: Canceled
   * Orden cancelada
   */
  handleCanceled(message) {
    const { id: orderId } = message.order;

    Logger.info(`ResponseHandler: Canceled ${orderId}`);

    Display.success(`✅ Orden cancelada`);
    Display.info(`   Order ID: ${orderId}`);

    this.updateOrderState(orderId, {
      status: ORDER_STATUS.CANCELED,
      lastUpdate: Date.now()
    });

    return {
      success: true,
      orderId,
      status: ORDER_STATUS.CANCELED
    };
  }

  /**
   * Handler: BuyerTookOrder
   * Un buyer tomó tu orden (notificación a seller)
   */
  handleBuyerTookOrder(message) {
    const { id: orderId, payload } = message.order;

    Logger.info(`ResponseHandler: BuyerTookOrder ${orderId}`);

    Display.success(`🤝 ¡Un buyer tomó tu orden!`);
    Display.info(`   Order ID: ${orderId}`);
    Display.info(`   Siguiente paso: Paga la hold invoice para iniciar el trade`);

    this.updateOrderState(orderId, {
      status: ORDER_STATUS.WAITING_PAYMENT,
      buyerPubkey: payload?.buyer_pubkey,
      lastUpdate: Date.now()
    });

    return {
      success: true,
      orderId
    };
  }

  /**
   * Handler: WaitingSellerToPay
   * Esperando que seller pague hold invoice
   */
  handleWaitingSellerToPay(message) {
    const { id: orderId, payload } = message.order;

    Logger.info(`ResponseHandler: WaitingSellerToPay ${orderId}`);

    Display.info(`⏳ Esperando hold invoice del seller`);
    Display.info(`   Order ID: ${orderId}`);

    if (payload?.hold_invoice) {
      Display.info(`   Hold Invoice: ${payload.hold_invoice}`);
    }

    this.updateOrderState(orderId, {
      status: ORDER_STATUS.WAITING_PAYMENT,
      holdInvoice: payload?.hold_invoice,
      lastUpdate: Date.now()
    });

    return {
      success: true,
      orderId
    };
  }

  /**
   * Handler: WaitingBuyerInvoice
   * Esperando que buyer envíe invoice
   */
  handleWaitingBuyerInvoice(message) {
    const { id: orderId } = message.order;

    Logger.info(`ResponseHandler: WaitingBuyerInvoice ${orderId}`);

    Display.info(`📄 Mostro espera tu invoice`);
    Display.info(`   Order ID: ${orderId}`);
    Display.info(`   Envía tu invoice con: /addinvoice ${orderId} <tu-invoice>`);

    this.updateOrderState(orderId, {
      status: ORDER_STATUS.WAITING_PAYMENT,
      waitingInvoice: true,
      lastUpdate: Date.now()
    });

    return {
      success: true,
      orderId
    };
  }

  // ========================================
  // HANDLERS FIAT
  // ========================================

  /**
   * Handler: FiatSentOk
   * Daemon confirmó notificación de fiat enviado
   */
  handleFiatSentOk(message) {
    const { id: orderId } = message.order;

    Logger.info(`ResponseHandler: FiatSentOk ${orderId}`);

    // Usar sistema de notificaciones mejorado
    Notifications.fiatSent(orderId);

    this.updateOrderState(orderId, {
      status: ORDER_STATUS.FIAT_SENT,
      lastUpdate: Date.now()
    });

    return {
      success: true,
      orderId,
      status: ORDER_STATUS.FIAT_SENT
    };
  }

  /**
   * Handler: Released
   * Seller liberó los fondos
   */
  handleReleased(message) {
    const { id: orderId } = message.order;

    Logger.info(`ResponseHandler: Released ${orderId}`);

    Display.success(`💸 Fondos liberados por el seller`);
    Display.info(`   Order ID: ${orderId}`);
    Display.info(`   El pago está siendo procesado...`);

    this.updateOrderState(orderId, {
      released: true,
      lastUpdate: Date.now()
    });

    return {
      success: true,
      orderId
    };
  }

  // ========================================
  // HANDLERS COOPERATIVOS Y DISPUTAS
  // ========================================

  /**
   * Handler: CooperativeCancelInitiatedByPeer
   * Contraparte inició cancelación cooperativa
   */
  handleCooperativeCancelInitiatedByPeer(message) {
    const { id: orderId } = message.order;

    Logger.info(`ResponseHandler: CooperativeCancelInitiatedByPeer ${orderId}`);

    Display.warning(`⚠️ Tu contraparte inició cancelación cooperativa`);
    Display.info(`   Order ID: ${orderId}`);
    Display.info(`   Acepta con: /cooperativecancel ${orderId}`);

    return {
      success: true,
      orderId
    };
  }

  /**
   * Handler: CooperativeCancelAccepted
   * Cancelación cooperativa aceptada
   */
  handleCooperativeCancelAccepted(message) {
    const { id: orderId } = message.order;

    Logger.info(`ResponseHandler: CooperativeCancelAccepted ${orderId}`);

    Display.success(`✅ Cancelación cooperativa completada`);
    Display.info(`   Order ID: ${orderId}`);

    this.updateOrderState(orderId, {
      status: ORDER_STATUS.CANCELED,
      lastUpdate: Date.now()
    });

    return {
      success: true,
      orderId,
      status: ORDER_STATUS.CANCELED
    };
  }

  /**
   * Handler: DisputeInitiatedByPeer
   * Contraparte inició disputa
   */
  handleDisputeInitiatedByPeer(message) {
    const { id: orderId } = message.order;

    Logger.warn(`ResponseHandler: DisputeInitiatedByPeer ${orderId}`);

    Display.warning(`⚠️ Tu contraparte inició una disputa`);
    Display.info(`   Order ID: ${orderId}`);
    Display.info(`   Un admin revisará el caso`);

    this.updateOrderState(orderId, {
      status: ORDER_STATUS.DISPUTE,
      lastUpdate: Date.now()
    });

    return {
      success: true,
      orderId,
      status: ORDER_STATUS.DISPUTE
    };
  }

  /**
   * Handler: DisputeInitiatedByYou
   * Confirmación de disputa iniciada por ti
   */
  handleDisputeInitiatedByYou(message) {
    const { id: orderId } = message.order;

    Logger.info(`ResponseHandler: DisputeInitiatedByYou ${orderId}`);

    Display.success(`✅ Disputa iniciada`);
    Display.info(`   Order ID: ${orderId}`);
    Display.info(`   Un admin revisará tu caso`);

    this.updateOrderState(orderId, {
      status: ORDER_STATUS.DISPUTE,
      lastUpdate: Date.now()
    });

    return {
      success: true,
      orderId,
      status: ORDER_STATUS.DISPUTE
    };
  }

  // ========================================
  // HANDLERS ADMIN
  // ========================================

  /**
   * Handler: AdminCanceled
   * Admin canceló la orden
   */
  handleAdminCanceled(message) {
    const { id: orderId } = message.order;

    Logger.info(`ResponseHandler: AdminCanceled ${orderId}`);

    Display.warning(`⚠️ Un admin canceló la orden`);
    Display.info(`   Order ID: ${orderId}`);

    this.updateOrderState(orderId, {
      status: ORDER_STATUS.CANCELED,
      adminAction: true,
      lastUpdate: Date.now()
    });

    return {
      success: true,
      orderId,
      status: ORDER_STATUS.CANCELED
    };
  }

  /**
   * Handler: AdminSettled
   * Admin resolvió manualmente
   */
  handleAdminSettled(message) {
    const { id: orderId } = message.order;

    Logger.info(`ResponseHandler: AdminSettled ${orderId}`);

    Display.success(`✅ Un admin resolvió la orden`);
    Display.info(`   Order ID: ${orderId}`);

    this.updateOrderState(orderId, {
      status: ORDER_STATUS.SUCCESS,
      adminAction: true,
      lastUpdate: Date.now()
    });

    return {
      success: true,
      orderId,
      status: ORDER_STATUS.SUCCESS
    };
  }

  /**
   * Handler: AdminTookDispute
   * Admin tomó la disputa
   */
  handleAdminTookDispute(message) {
    const { id: orderId } = message.order;

    Logger.info(`ResponseHandler: AdminTookDispute ${orderId}`);

    Display.info(`👤 Un admin está revisando la disputa`);
    Display.info(`   Order ID: ${orderId}`);

    return {
      success: true,
      orderId
    };
  }

  // ========================================
  // HANDLERS MISC
  // ========================================

  /**
   * Handler: RateReceived
   * Calificación recibida
   */
  handleRateReceived(message) {
    const { payload } = message.order;

    Logger.info('ResponseHandler: RateReceived', payload);

    Display.success(`⭐ Calificación recibida`);

    if (payload?.rating) {
      Display.info(`   Rating: ${payload.rating}/5`);
    }

    return {
      success: true
    };
  }

  /**
   * Handler: TradePubkey
   * Pubkey de trade recibida
   */
  handleTradePubkey(message) {
    const { payload } = message.order;

    Logger.info('ResponseHandler: TradePubkey', payload);

    if (payload?.pubkey) {
      Display.info(`🔑 Trade Pubkey: ${payload.pubkey}`);
    }

    return {
      success: true,
      pubkey: payload?.pubkey
    };
  }

  /**
   * Handler: DmReceived
   * Mensaje directo recibido
   */
  handleDmReceived(message) {
    const { payload } = message.order;

    Logger.info('ResponseHandler: DmReceived');

    Display.info(`💬 Mensaje recibido:`);

    if (payload?.message) {
      Display.info(`   "${payload.message}"`);
    }

    return {
      success: true
    };
  }

  // ========================================
  // UTILIDADES
  // ========================================

  /**
   * Actualiza el estado local de una orden
   * @param {string} orderId - ID de la orden
   * @param {Object} updates - Actualizaciones al estado
   */
  updateOrderState(orderId, updates) {
    const currentState = this.activeOrders.get(orderId) || {};

    const newState = {
      ...currentState,
      ...updates
    };

    this.activeOrders.set(orderId, newState);

    Logger.debug(`ResponseHandler: Updated order ${orderId} state`, newState);
  }

  /**
   * Obtiene el estado de una orden
   * @param {string} orderId - ID de la orden
   * @returns {Object|null} Estado de la orden
   */
  getOrderState(orderId) {
    return this.activeOrders.get(orderId) || null;
  }

  /**
   * Limpia órdenes completadas antiguas
   * @param {number} maxAge - Edad máxima en ms (default: 24 horas)
   */
  cleanupOldOrders(maxAge = 24 * 60 * 60 * 1000) {
    const now = Date.now();
    let cleaned = 0;

    for (const [orderId, state] of this.activeOrders.entries()) {
      if (state.lastUpdate && (now - state.lastUpdate) > maxAge) {
        if (state.status === ORDER_STATUS.SUCCESS || state.status === ORDER_STATUS.CANCELED) {
          this.activeOrders.delete(orderId);
          cleaned++;
        }
      }
    }

    if (cleaned > 0) {
      Logger.info(`ResponseHandler: Cleaned up ${cleaned} old orders`);
    }
  }

  /**
   * Obtiene estadísticas del handler
   * @returns {Object} Estadísticas
   */
  getStats() {
    return {
      ...this.stats,
      activeOrders: this.activeOrders.size
    };
  }
  /**
   * Obtener estadísticas de respuestas procesadas
   * @returns {Object} Estadísticas
   */
  getStats() {
    return {
      messagesReceived: this.stats.messagesReceived,
      errorsHandled: this.stats.errorsHandled,
      tradesCompleted: this.stats.tradesCompleted
    };
  }

  /**
   * Obtener órdenes activas
   * @returns {Map} Mapa de órdenes activas
   */
  getActiveOrders() {
    return this.activeOrders;
  }
}

// Singleton instance
const responseHandler = new MostroResponseHandler();

export default responseHandler;
