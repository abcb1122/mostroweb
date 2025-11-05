/**
 * messaging.js
 * Maneja la comunicación con el bot Mostro usando NIP-59 (Gift Wrap)
 *
 * Protocolo:
 * - Los mensajes a Mostro deben ser Gift Wrap events (kind 1059)
 * - El contenido del rumor es un array: [mensaje_json, firma]
 * - El mensaje sigue la estructura del protocolo Mostro
 */

import { MOSTRO_ACTIONS, MOSTRO_PROTOCOL_VERSION, NOSTR_KINDS } from '../utils/constants.js';
import Logger from '../utils/logger.js';
import RelayManager from '../core/relayManager.js';

/**
 * MostroMessaging class
 * Gestiona el envío de mensajes encriptados a Mostro
 */
class MostroMessaging {
  constructor() {
    // Pubkey del bot Mostro (debe configurarse o descubrirse)
    this.mostroPubkey = null;

    // Contador de request_id
    this.requestCounter = 0;
  }

  /**
   * Configura el pubkey del bot Mostro a usar
   * @param {string} pubkey - Public key del Mostro daemon
   */
  setMostroPubkey(pubkey) {
    this.mostroPubkey = pubkey;
    Logger.info(`MostroMessaging: Mostro pubkey set to ${pubkey.slice(0, 16)}...`);
  }

  /**
   * Obtiene el pubkey de Mostro configurado
   * @returns {string|null} Pubkey de Mostro
   */
  getMostroPubkey() {
    return this.mostroPubkey;
  }

  /**
   * Genera un request_id único
   * @returns {number} Request ID basado en timestamp
   */
  generateRequestId() {
    return Date.now() + this.requestCounter++;
  }

  /**
   * Construye un mensaje para Mostro según el protocolo
   * @param {string} action - Acción a realizar (ej: "NewOrder")
   * @param {Object} payload - Datos del mensaje
   * @param {Object} options - Opciones adicionales
   * @returns {Object} Mensaje en formato Mostro
   */
  buildMessage(action, payload = {}, options = {}) {
    const message = {
      order: {
        version: options.version || MOSTRO_PROTOCOL_VERSION,
        id: options.orderId || null,
        request_id: options.requestId || this.generateRequestId(),
        trade_index: options.tradeIndex || 0,
        action: action,
        payload: payload
      }
    };

    Logger.debug('MostroMessaging: Built message', message);

    return message;
  }

  /**
   * Firma un mensaje usando SHA256
   * @param {Object} message - Mensaje a firmar
   * @param {Uint8Array} secretKey - Clave privada para firmar
   * @returns {Promise<string>} Firma en hex
   */
  async signMessage(message, secretKey) {
    try {
      const { sha256, schnorr } = window.nostrTools;

      // Serializar mensaje a JSON (sin espacios)
      const messageJson = JSON.stringify(message);

      // Calcular hash SHA256 del mensaje
      const messageBytes = new TextEncoder().encode(messageJson);
      const hash = sha256(messageBytes);

      // Firmar el hash con schnorr
      const signature = await schnorr.sign(hash, secretKey);

      // Convertir signature a hex
      const signatureHex = Array.from(signature)
        .map(b => b.toString(16).padStart(2, '0'))
        .join('');

      Logger.debug('MostroMessaging: Message signed');

      return signatureHex;
    } catch (error) {
      Logger.error('MostroMessaging: Error signing message', error);
      throw error;
    }
  }

  /**
   * Crea un Gift Wrap (NIP-59) para enviar a Mostro
   * @param {Object} message - Mensaje a enviar
   * @param {Uint8Array} senderSecretKey - Clave privada del remitente
   * @param {string} receiverPubkey - Pubkey del receptor (Mostro)
   * @returns {Promise<Object>} Evento Gift Wrap firmado
   */
  async createGiftWrap(message, senderSecretKey, receiverPubkey) {
    try {
      const { nip44, finalizeEvent, getPublicKey } = window.nostrTools;

      // 1. Serializar mensaje a JSON
      const messageJson = JSON.stringify(message);

      // 2. Firmar el mensaje
      const signature = await this.signMessage(message, senderSecretKey);

      // 3. Crear el rumor como array [mensaje, firma]
      const rumorContent = JSON.stringify([messageJson, signature]);

      Logger.debug('MostroMessaging: Rumor content created');

      // 4. Crear el rumor (evento sin firmar)
      const rumor = {
        kind: NOSTR_KINDS.GIFT_WRAP, // En realidad el rumor puede ser kind 1, pero lo dejamos como gift wrap
        content: rumorContent,
        tags: [],
        created_at: Math.floor(Date.now() / 1000),
        pubkey: getPublicKey(senderSecretKey)
      };

      // 5. Encriptar el rumor usando NIP-44
      const conversationKey = nip44.v2.utils.getConversationKey(
        senderSecretKey,
        receiverPubkey
      );
      const encryptedContent = nip44.v2.encrypt(
        JSON.stringify(rumor),
        conversationKey
      );

      // 6. Crear el seal (kind 13)
      const seal = {
        kind: NOSTR_KINDS.SEAL,
        content: encryptedContent,
        tags: [],
        created_at: Math.floor(Date.now() / 1000)
      };

      const signedSeal = finalizeEvent(seal, senderSecretKey);

      // 7. Generar una clave temporal aleatoria para el gift wrap
      const { generateSecretKey } = window.nostrTools;
      const randomSecretKey = generateSecretKey();

      // 8. Encriptar el seal con la clave temporal
      const randomConversationKey = nip44.v2.utils.getConversationKey(
        randomSecretKey,
        receiverPubkey
      );
      const encryptedSeal = nip44.v2.encrypt(
        JSON.stringify(signedSeal),
        randomConversationKey
      );

      // 9. Crear el gift wrap final (kind 1059)
      const giftWrap = {
        kind: NOSTR_KINDS.GIFT_WRAP,
        content: encryptedSeal,
        tags: [['p', receiverPubkey]],
        created_at: Math.floor(Date.now() / 1000)
      };

      const signedGiftWrap = finalizeEvent(giftWrap, randomSecretKey);

      Logger.info('MostroMessaging: Gift wrap created successfully');

      return signedGiftWrap;
    } catch (error) {
      Logger.error('MostroMessaging: Error creating gift wrap', error);
      throw error;
    }
  }

  /**
   * Envía un mensaje a Mostro
   * @param {string} action - Acción del protocolo Mostro
   * @param {Object} payload - Datos del mensaje
   * @param {Object} options - Opciones (orderId, tradeIndex, etc.)
   * @returns {Promise<Object>} Resultado del envío
   */
  async sendToMostro(action, payload = {}, options = {}) {
    try {
      // Verificar que tengamos pubkey de Mostro
      if (!this.mostroPubkey) {
        throw new Error('Mostro pubkey not set. Use setMostroPubkey() first.');
      }

      // Verificar que tengamos identidad del usuario
      const identityData = sessionStorage.getItem('mostro_identity');
      if (!identityData) {
        throw new Error('No identity found. Use /start or /login first.');
      }

      const identity = JSON.parse(identityData);
      const secretKey = new Uint8Array(identity.secretKey);

      Logger.info(`MostroMessaging: Sending ${action} to Mostro...`);

      // 1. Construir mensaje
      const message = this.buildMessage(action, payload, options);

      // 2. Crear Gift Wrap
      const giftWrap = await this.createGiftWrap(
        message,
        secretKey,
        this.mostroPubkey
      );

      // 3. Publicar a relays
      await RelayManager.publish(giftWrap);

      Logger.info(`MostroMessaging: ${action} sent successfully`);

      return {
        success: true,
        action,
        requestId: message.order.request_id,
        eventId: giftWrap.id
      };
    } catch (error) {
      Logger.error('MostroMessaging: Error sending to Mostro', error);
      throw error;
    }
  }

  /**
   * Crea una nueva orden de compra
   * @param {Object} orderParams - Parámetros de la orden
   * @returns {Promise<Object>} Resultado del envío
   */
  async createBuyOrder(orderParams) {
    const payload = {
      order: {
        kind: 'buy',
        fiat_code: orderParams.fiatCode,
        fiat_amount: orderParams.fiatAmount,
        payment_method: orderParams.paymentMethod,
        premium: orderParams.premium || 0
      }
    };

    // Si es range order
    if (orderParams.minAmount && orderParams.maxAmount) {
      payload.order.min_amount = orderParams.minAmount;
      payload.order.max_amount = orderParams.maxAmount;
      delete payload.order.fiat_amount;
    }

    return await this.sendToMostro(MOSTRO_ACTIONS.NEW_ORDER, payload);
  }

  /**
   * Crea una nueva orden de venta
   * @param {Object} orderParams - Parámetros de la orden
   * @returns {Promise<Object>} Resultado del envío
   */
  async createSellOrder(orderParams) {
    const payload = {
      order: {
        kind: 'sell',
        fiat_code: orderParams.fiatCode,
        fiat_amount: orderParams.fiatAmount,
        payment_method: orderParams.paymentMethod,
        premium: orderParams.premium || 0
      }
    };

    // Si es range order
    if (orderParams.minAmount && orderParams.maxAmount) {
      payload.order.min_amount = orderParams.minAmount;
      payload.order.max_amount = orderParams.maxAmount;
      delete payload.order.fiat_amount;
    }

    return await this.sendToMostro(MOSTRO_ACTIONS.NEW_ORDER, payload);
  }

  /**
   * Toma una orden de compra existente
   * @param {string} orderId - ID de la orden
   * @param {number} amount - Cantidad a tomar (opcional para range orders)
   * @returns {Promise<Object>} Resultado del envío
   */
  async takeBuyOrder(orderId, amount = null) {
    const payload = amount ? { amount } : {};

    return await this.sendToMostro(MOSTRO_ACTIONS.TAKE_BUY, payload, {
      orderId
    });
  }

  /**
   * Toma una orden de venta existente
   * @param {string} orderId - ID de la orden
   * @param {number} amount - Cantidad a tomar (opcional para range orders)
   * @returns {Promise<Object>} Resultado del envío
   */
  async takeSellOrder(orderId, amount = null) {
    const payload = amount ? { amount } : {};

    return await this.sendToMostro(MOSTRO_ACTIONS.TAKE_SELL, payload, {
      orderId
    });
  }

  /**
   * Cancela una orden pendiente
   * @param {string} orderId - ID de la orden
   * @returns {Promise<Object>} Resultado del envío
   */
  async cancelOrder(orderId) {
    return await this.sendToMostro(MOSTRO_ACTIONS.CANCEL, {}, {
      orderId
    });
  }
}

// Crear instancia singleton
const instance = new MostroMessaging();

// Exportar como default
export default instance;
