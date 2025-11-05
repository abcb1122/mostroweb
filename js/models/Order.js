/**
 * Order.js
 * Modelo de datos para órdenes Mostro
 *
 * Representa una orden pública descubierta en la red Nostr
 * Parsea eventos Kind 34242 (NIP-33 Replaceable events)
 */

import { ORDER_STATUS, ORDER_TYPES } from '../utils/constants.js';
import Logger from '../utils/logger.js';

export default class Order {
  /**
   * Constructor de Order
   * @param {Object} data - Datos de la orden (objeto plano o con evento Nostr)
   */
  constructor(data) {
    // Evento Nostr original (Kind 34242)
    this.event = data.event || null;

    // Identificador único del evento
    this.id = data.id || data.event?.id;

    // Pubkey del Mostro daemon que publicó esta orden
    this.mostroPubkey = data.mostroPubkey || data.event?.pubkey;

    // Kind del evento (debe ser 34242)
    this.kind = data.kind || data.event?.kind || 34242;

    // Status de la orden
    this.status = data.status || ORDER_STATUS.PENDING;

    // Tipo de orden: 'buy' o 'sell'
    this.type = data.type;

    // Información de moneda fiat
    this.fiatCode = data.fiatCode; // Ej: "USD", "ARS", "EUR"
    this.fiatAmount = data.fiatAmount; // Cantidad en fiat (puede ser null para range orders)
    this.minAmount = data.minAmount || null; // Mínimo para range orders
    this.maxAmount = data.maxAmount || null; // Máximo para range orders

    // Método de pago
    this.paymentMethod = data.paymentMethod; // Ej: "Strike", "Bank Transfer"

    // Premium (porcentaje sobre precio de mercado)
    this.premium = data.premium || 0;

    // Cantidad en satoshis
    this.amountSats = data.amountSats || null;

    // Timestamps
    this.createdAt = data.createdAt || data.event?.created_at || Date.now();
    this.expiresAt = data.expiresAt || null;

    // Metadata adicional extraída de tags
    this.metadata = data.metadata || {};
  }

  /**
   * Crea una instancia de Order desde un evento Nostr Kind 34242
   * @param {Object} event - Evento Nostr
   * @returns {Order} Instancia de Order
   */
  static fromNostrEvent(event) {
    try {
      // Validar que sea el kind correcto
      if (event.kind !== 34242) {
        throw new Error(`Invalid event kind: ${event.kind}. Expected 34242`);
      }

      // El contenido del evento Kind 34242 puede estar en formato JSON
      let content = {};

      try {
        // Intentar parsear como JSON
        if (event.content && event.content.trim() !== '') {
          content = JSON.parse(event.content);
        }
      } catch (parseError) {
        // Si no es JSON válido, el contenido puede estar vacío
        // y toda la info está en los tags
        Logger.debug('Order: Content is not JSON, using tags only');
      }

      // Extraer tags relevantes
      const tags = event.tags || [];

      // Tag 'y' debe ser "mostrop2p"
      const yTag = tags.find(t => t[0] === 'y')?.[1];

      // Tag 'z' debe ser "order"
      const zTag = tags.find(t => t[0] === 'z')?.[1];

      // Tag 'd' es el identificador único (usado en replaceable events)
      const dTag = tags.find(t => t[0] === 'd')?.[1];

      // Tag 's' puede contener el status
      const sTag = tags.find(t => t[0] === 's')?.[1];

      // Tag 'k' puede contener el kind/type (buy/sell)
      const kTag = tags.find(t => t[0] === 'k')?.[1];

      // Tag 'f' puede contener fiat code
      const fTag = tags.find(t => t[0] === 'f')?.[1];

      // Tag 'pm' puede contener payment method
      const pmTag = tags.find(t => t[0] === 'pm')?.[1];

      // Determinar tipo de orden (buy/sell)
      // Puede venir en content.kind, content.type, tag 'k', o inferirse
      let orderType = content.kind || content.type || kTag;

      // Normalizar a 'buy' o 'sell'
      if (orderType) {
        orderType = orderType.toLowerCase();
        if (orderType !== 'buy' && orderType !== 'sell') {
          Logger.warn(`Order: Unknown order type: ${orderType}`);
          orderType = null;
        }
      }

      // Construir objeto Order
      return new Order({
        event,
        id: event.id,
        mostroPubkey: event.pubkey,
        kind: event.kind,
        status: content.status || sTag || ORDER_STATUS.PENDING,
        type: orderType,
        fiatCode: content.fiat_code || fTag,
        fiatAmount: content.fiat_amount || null,
        minAmount: content.min_amount || null,
        maxAmount: content.max_amount || null,
        paymentMethod: content.payment_method || pmTag,
        premium: content.premium || 0,
        amountSats: content.amount || null,
        createdAt: event.created_at * 1000, // Convertir Unix timestamp a ms
        expiresAt: content.expires_at ? content.expires_at * 1000 : null,
        metadata: {
          yTag,
          zTag,
          dTag,
          sTag,
          kTag,
          fTag,
          pmTag,
          rawContent: event.content
        }
      });
    } catch (error) {
      Logger.error('Order: Error parsing Nostr event', error);
      Logger.error('Order: Event data:', event);
      throw error;
    }
  }

  /**
   * Valida si la orden tiene datos mínimos requeridos
   * @returns {boolean} True si la orden es válida
   */
  isValid() {
    const hasBasicFields = !!(
      this.id &&
      this.mostroPubkey &&
      this.kind === 34242
    );

    // Validar tipo si está presente
    const hasValidType = !this.type ||
      (this.type === ORDER_TYPES.BUY || this.type === ORDER_TYPES.SELL);

    // Una orden puede no tener todos los campos si está incompleta
    // pero debe tener al menos: id, mostroPubkey, kind
    return hasBasicFields && hasValidType;
  }

  /**
   * Verifica si la orden está completa (tiene todos los campos necesarios)
   * @returns {boolean} True si tiene fiatCode y paymentMethod
   */
  isComplete() {
    return !!(
      this.isValid() &&
      this.type &&
      this.fiatCode &&
      this.paymentMethod
    );
  }

  /**
   * Verifica si es orden de compra
   * @returns {boolean} True si es BUY order
   */
  isBuyOrder() {
    return this.type === ORDER_TYPES.BUY;
  }

  /**
   * Verifica si es orden de venta
   * @returns {boolean} True si es SELL order
   */
  isSellOrder() {
    return this.type === ORDER_TYPES.SELL;
  }

  /**
   * Verifica si es una orden de rango (min/max amounts)
   * @returns {boolean} True si tiene minAmount y maxAmount
   */
  isRangeOrder() {
    return !!(this.minAmount && this.maxAmount);
  }

  /**
   * Verifica si la orden ha expirado
   * @returns {boolean} True si ha expirado
   */
  isExpired() {
    if (!this.expiresAt) return false;
    return Date.now() > this.expiresAt;
  }

  /**
   * Obtiene el tipo de orden como texto legible
   * @returns {string} "BUY" o "SELL" o "UNKNOWN"
   */
  getTypeText() {
    if (this.isBuyOrder()) return 'BUY';
    if (this.isSellOrder()) return 'SELL';
    return 'UNKNOWN';
  }

  /**
   * Obtiene el ícono apropiado para el tipo de orden
   * @returns {string} Emoji icon
   */
  getTypeIcon() {
    if (this.isBuyOrder()) return '📗'; // Green book for buy
    if (this.isSellOrder()) return '📕'; // Red book for sell
    return '📘'; // Blue book for unknown
  }

  /**
   * Formatea la cantidad para display
   * @returns {string} Cantidad formateada
   */
  getAmountDisplay() {
    // Si es orden de rango
    if (this.isRangeOrder()) {
      return `${this.minAmount}-${this.maxAmount} ${this.fiatCode}`;
    }

    // Si tiene fiatAmount
    if (this.fiatAmount) {
      return `${this.fiatAmount} ${this.fiatCode}`;
    }

    // Si solo tiene sats
    if (this.amountSats) {
      return `${this.amountSats} sats`;
    }

    return 'Amount not specified';
  }

  /**
   * Formatea el premium para display
   * @returns {string} Premium formateado (ej: "+2.5%" o "")
   */
  getPremiumDisplay() {
    if (!this.premium || this.premium === 0) return '';

    const sign = this.premium > 0 ? '+' : '';
    return `${sign}${this.premium}%`;
  }

  /**
   * Obtiene una representación corta del ID
   * @returns {string} ID truncado
   */
  getShortId() {
    if (!this.id) return 'N/A';
    return `${this.id.slice(0, 8)}...${this.id.slice(-8)}`;
  }

  /**
   * Formatea la orden como string de una línea para terminal
   * @returns {string} Orden formateada para display
   */
  toDisplayString() {
    const icon = this.getTypeIcon();
    const type = this.getTypeText().padEnd(5);
    const amount = this.getAmountDisplay().padEnd(20);
    const premium = this.getPremiumDisplay().padEnd(7);
    const payment = (this.paymentMethod || 'N/A').padEnd(20);
    const id = this.getShortId();

    return `${icon} ${type} | ${amount} ${premium} | ${payment} | ${id}`;
  }

  /**
   * Formatea la orden para display detallado
   * @returns {Array<string>} Array de líneas para mostrar
   */
  toDetailedDisplay() {
    const lines = [];

    lines.push(`Order ID: ${this.id}`);
    lines.push(`Type: ${this.getTypeIcon()} ${this.getTypeText()}`);
    lines.push(`Amount: ${this.getAmountDisplay()}`);

    if (this.premium !== 0) {
      lines.push(`Premium: ${this.getPremiumDisplay()}`);
    }

    lines.push(`Payment Method: ${this.paymentMethod || 'N/A'}`);
    lines.push(`Status: ${this.status}`);

    const date = new Date(this.createdAt).toLocaleString();
    lines.push(`Created: ${date}`);

    if (this.expiresAt) {
      const expDate = new Date(this.expiresAt).toLocaleString();
      lines.push(`Expires: ${expDate}`);
    }

    lines.push(`Mostro: ${this.mostroPubkey.slice(0, 16)}...`);

    return lines;
  }

  /**
   * Convierte a objeto plano para storage/serialización
   * @returns {Object} Objeto plano
   */
  toJSON() {
    return {
      id: this.id,
      mostroPubkey: this.mostroPubkey,
      kind: this.kind,
      status: this.status,
      type: this.type,
      fiatCode: this.fiatCode,
      fiatAmount: this.fiatAmount,
      minAmount: this.minAmount,
      maxAmount: this.maxAmount,
      paymentMethod: this.paymentMethod,
      premium: this.premium,
      amountSats: this.amountSats,
      createdAt: this.createdAt,
      expiresAt: this.expiresAt,
      metadata: this.metadata,
      event: this.event // Guardar evento completo para referencia
    };
  }

  /**
   * Crea una Order desde JSON (desde storage)
   * @param {Object} json - Objeto JSON
   * @returns {Order} Instancia de Order
   */
  static fromJSON(json) {
    return new Order(json);
  }

  /**
   * Compara dos órdenes por fecha de creación (para sorting)
   * @param {Order} a - Primera orden
   * @param {Order} b - Segunda orden
   * @returns {number} Resultado de comparación
   */
  static compareByDate(a, b) {
    return b.createdAt - a.createdAt; // Más recientes primero
  }

  /**
   * Compara dos órdenes por premium (para sorting)
   * @param {Order} a - Primera orden
   * @param {Order} b - Segunda orden
   * @returns {number} Resultado de comparación
   */
  static compareByPremium(a, b) {
    return a.premium - b.premium; // Menor premium primero
  }

  /**
   * Filtra órdenes por criterios
   * @param {Array<Order>} orders - Array de órdenes
   * @param {Object} filters - Filtros a aplicar
   * @returns {Array<Order>} Órdenes filtradas
   */
  static filter(orders, filters = {}) {
    let filtered = [...orders];

    // Filtrar por tipo
    if (filters.type) {
      filtered = filtered.filter(o => o.type === filters.type);
    }

    // Filtrar por fiatCode
    if (filters.fiatCode) {
      filtered = filtered.filter(o => o.fiatCode === filters.fiatCode);
    }

    // Filtrar por payment method
    if (filters.paymentMethod) {
      filtered = filtered.filter(o =>
        o.paymentMethod?.toLowerCase().includes(filters.paymentMethod.toLowerCase())
      );
    }

    // Filtrar por mostroPubkey
    if (filters.mostroPubkey) {
      filtered = filtered.filter(o => o.mostroPubkey === filters.mostroPubkey);
    }

    // Filtrar por status
    if (filters.status) {
      filtered = filtered.filter(o => o.status === filters.status);
    }

    // Excluir expiradas
    if (filters.excludeExpired) {
      filtered = filtered.filter(o => !o.isExpired());
    }

    // Solo órdenes completas
    if (filters.onlyComplete) {
      filtered = filtered.filter(o => o.isComplete());
    }

    return filtered;
  }

  /**
   * Agrupa órdenes por Mostro pubkey
   * @param {Array<Order>} orders - Array de órdenes
   * @returns {Map<string, Array<Order>>} Map de pubkey -> array de órdenes
   */
  static groupByMostro(orders) {
    const grouped = new Map();

    orders.forEach(order => {
      const pubkey = order.mostroPubkey;

      if (!grouped.has(pubkey)) {
        grouped.set(pubkey, []);
      }

      grouped.get(pubkey).push(order);
    });

    return grouped;
  }

  /**
   * Obtiene estadísticas de un array de órdenes
   * @param {Array<Order>} orders - Array de órdenes
   * @returns {Object} Estadísticas
   */
  static getStats(orders) {
    const buyOrders = orders.filter(o => o.isBuyOrder());
    const sellOrders = orders.filter(o => o.isSellOrder());
    const completeOrders = orders.filter(o => o.isComplete());
    const expiredOrders = orders.filter(o => o.isExpired());

    // Agrupar por fiatCode
    const byCurrency = {};
    orders.forEach(order => {
      if (order.fiatCode) {
        byCurrency[order.fiatCode] = (byCurrency[order.fiatCode] || 0) + 1;
      }
    });

    return {
      total: orders.length,
      buyOrders: buyOrders.length,
      sellOrders: sellOrders.length,
      completeOrders: completeOrders.length,
      expiredOrders: expiredOrders.length,
      currencies: byCurrency,
      mostroCount: Order.groupByMostro(orders).size
    };
  }
}
