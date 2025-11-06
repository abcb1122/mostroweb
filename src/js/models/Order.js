/**
 * Order.js
 * Modelo de datos para órdenes Mostro
 *
 * Representa una orden pública descubierta en la red Nostr
 * Parsea eventos Kind 38383 (NIP-69 P2P Order events)
 */

import { ORDER_STATUS, ORDER_TYPES } from '../utils/constants.js';
import Logger from '../utils/logger.js';

export default class Order {
  /**
   * Constructor de Order
   * @param {Object} data - Datos de la orden (objeto plano o con evento Nostr)
   */
  constructor(data) {
    // Evento Nostr original (Kind 38383)
    this.event = data.event || null;

    // Identificador único del evento
    this.id = data.id || data.event?.id;

    // Pubkey del Mostro daemon que publicó esta orden
    this.mostroPubkey = data.mostroPubkey || data.event?.pubkey;

    // Kind del evento (debe ser 38383)
    this.kind = data.kind || data.event?.kind || 38383;

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
   * Crea una instancia de Order desde un evento Nostr Kind 38383 (NIP-69)
   * @param {Object} event - Evento Nostr
   * @returns {Order} Instancia de Order
   */
  static fromNostrEvent(event) {
    try {
      // Validar que sea el kind correcto
      if (event.kind !== 38383) {
        throw new Error(`Invalid event kind: ${event.kind}. Expected 38383 (NIP-69)`);
      }

      // NIP-69: El contenido debe estar vacío, todos los datos en tags
      // Parseamos content solo para compatibilidad con eventos antiguos
      let content = {};

      if (event.content && event.content.trim() !== '') {
        Logger.warn('Order: NIP-69 violation - content should be empty');
        try {
          content = JSON.parse(event.content);
        } catch (parseError) {
          Logger.debug('Order: Content is not valid JSON, ignoring');
        }
      }

      // Extraer tags NIP-69 (todos los datos deben estar aquí)
      const tags = event.tags || [];

      // Tags requeridos NIP-69
      const dTag = tags.find(t => t[0] === 'd')?.[1];     // Order ID único
      const kTag = tags.find(t => t[0] === 'k')?.[1];     // buy/sell
      const fTag = tags.find(t => t[0] === 'f')?.[1];     // Fiat currency (ISO 4217)
      const sTag = tags.find(t => t[0] === 's')?.[1];     // Status
      const amtTag = tags.find(t => t[0] === 'amt')?.[1]; // Satoshis amount
      const faTag = tags.find(t => t[0] === 'fa')?.[1];   // Fiat amount
      const pmTag = tags.find(t => t[0] === 'pm')?.[1];   // Payment method
      const premiumTag = tags.find(t => t[0] === 'premium')?.[1]; // Premium %
      const expirationTag = tags.find(t => t[0] === 'expiration')?.[1]; // Expiration timestamp
      const networkTag = tags.find(t => t[0] === 'network')?.[1]; // mainnet/testnet/signet
      const layerTag = tags.find(t => t[0] === 'layer')?.[1];     // onchain/lightning/liquid

      // Tags de identificación
      const yTag = tags.find(t => t[0] === 'y')?.[1];     // "mostrop2p"
      const zTag = tags.find(t => t[0] === 'z')?.[1];     // "order"

      // Tags opcionales
      const sourceTag = tags.find(t => t[0] === 'source')?.[1];  // URL referencia
      const ratingTag = tags.find(t => t[0] === 'rating')?.[1];  // Rating info
      const nameTag = tags.find(t => t[0] === 'name')?.[1];      // Maker name
      const geoTag = tags.find(t => t[0] === 'g')?.[1];          // Geohash
      const bondTag = tags.find(t => t[0] === 'bond')?.[1];      // Bond amount

      // Determinar tipo de orden (buy/sell)
      // NIP-69: debe venir en tag 'k', pero soportamos content para retrocompatibilidad
      let orderType = kTag || content.kind || content.type;

      // Normalizar a 'buy' o 'sell'
      if (orderType) {
        orderType = orderType.toLowerCase();
        if (orderType !== 'buy' && orderType !== 'sell') {
          Logger.warn(`Order: Unknown order type: ${orderType}`);
          orderType = null;
        }
      }

      // Parsear fiat amount (puede incluir rango min-max)
      let fiatAmount = null;
      let minAmount = null;
      let maxAmount = null;

      if (faTag) {
        // NIP-69: fa tag puede contener rango "100-500" o valor único "100"
        const faStr = String(faTag);
        if (faStr.includes('-')) {
          const [min, max] = faStr.split('-').map(s => parseFloat(s.trim()));
          minAmount = min;
          maxAmount = max;
        } else {
          fiatAmount = parseFloat(faStr);
        }
      } else if (content.fiat_amount) {
        // Retrocompatibilidad con content
        fiatAmount = content.fiat_amount;
        minAmount = content.min_amount || null;
        maxAmount = content.max_amount || null;
      }

      // Parsear premium (convertir a número)
      let premium = 0;
      if (premiumTag) {
        premium = parseFloat(premiumTag) || 0;
      } else if (content.premium) {
        premium = content.premium;
      }

      // Parsear amounts en satoshis
      let amountSats = null;
      if (amtTag) {
        amountSats = parseInt(amtTag, 10) || null;
      } else if (content.amount) {
        amountSats = content.amount;
      }

      // Parsear expiration (Unix timestamp)
      let expiresAt = null;
      if (expirationTag) {
        expiresAt = parseInt(expirationTag, 10) * 1000; // Convertir a ms
      } else if (content.expires_at) {
        expiresAt = content.expires_at * 1000;
      }

      // Construir objeto Order con datos NIP-69
      return new Order({
        event,
        id: event.id,
        mostroPubkey: event.pubkey,
        kind: event.kind,
        status: sTag || content.status || ORDER_STATUS.PENDING,
        type: orderType,
        fiatCode: fTag || content.fiat_code,
        fiatAmount,
        minAmount,
        maxAmount,
        paymentMethod: pmTag || content.payment_method,
        premium,
        amountSats,
        createdAt: event.created_at * 1000, // Convertir Unix timestamp a ms
        expiresAt,
        metadata: {
          // Tags requeridos
          dTag,
          kTag,
          fTag,
          sTag,
          amtTag,
          faTag,
          pmTag,
          premiumTag,
          expirationTag,
          networkTag,
          layerTag,
          // Tags de identificación
          yTag,
          zTag,
          // Tags opcionales
          sourceTag,
          ratingTag,
          nameTag,
          geoTag,
          bondTag,
          // Datos adicionales
          network: networkTag,
          layer: layerTag,
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
      this.kind === 38383
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
