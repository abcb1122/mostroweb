/**
 * Mostro.js
 * Modelo para instancias de Mostro daemon
 *
 * Representa un daemon Mostro descubierto en la red
 * Agrupa todas las órdenes publicadas por ese daemon
 */

import { ORDER_STATUS } from '../utils/constants.js';
import Logger from '../utils/logger.js';

export default class Mostro {
  /**
   * Constructor de Mostro
   * @param {string} pubkey - Public key del Mostro daemon
   * @param {Object} options - Opciones adicionales
   */
  constructor(pubkey, options = {}) {
    // Public key del Mostro daemon (hex format)
    this.pubkey = pubkey;

    // Array de órdenes publicadas por este Mostro
    this.orders = [];

    // Última vez que se vio una orden de este Mostro
    this.lastSeen = options.lastSeen || Date.now();

    // Primera vez que se descubrió este Mostro
    this.firstSeen = options.firstSeen || Date.now();

    // Metadata adicional del Mostro
    this.metadata = options.metadata || {};

    // Estadísticas
    this.stats = {
      totalOrders: 0,
      buyOrders: 0,
      sellOrders: 0,
      activeOrders: 0
    };
  }

  /**
   * Añade una orden a este Mostro
   * @param {Order} order - Orden a añadir
   * @returns {boolean} True si se añadió, false si ya existía
   */
  addOrder(order) {
    // Verificar que la orden pertenece a este Mostro
    if (order.mostroPubkey !== this.pubkey) {
      Logger.warn(`Mostro: Order pubkey mismatch. Expected ${this.pubkey}, got ${order.mostroPubkey}`);
      return false;
    }

    // Verificar si la orden ya existe
    const existingIndex = this.orders.findIndex(o => o.id === order.id);

    if (existingIndex !== -1) {
      // Orden ya existe, actualizarla
      Logger.debug(`Mostro: Updating existing order ${order.id}`);
      this.orders[existingIndex] = order;
      this.lastSeen = Date.now();
      this.updateStats();
      return false;
    }

    // Añadir nueva orden
    this.orders.push(order);
    this.lastSeen = Date.now();

    Logger.debug(`Mostro: Added order ${order.id} to Mostro ${this.getShortPubkey()}`);

    // Actualizar estadísticas
    this.updateStats();

    return true;
  }

  /**
   * Elimina una orden de este Mostro
   * @param {string} orderId - ID de la orden a eliminar
   * @returns {boolean} True si se eliminó
   */
  removeOrder(orderId) {
    const initialLength = this.orders.length;
    this.orders = this.orders.filter(o => o.id !== orderId);

    if (this.orders.length < initialLength) {
      Logger.debug(`Mostro: Removed order ${orderId}`);
      this.updateStats();
      return true;
    }

    return false;
  }

  /**
   * Obtiene una orden por ID
   * @param {string} orderId - ID de la orden
   * @returns {Order|null} Orden encontrada o null
   */
  getOrder(orderId) {
    return this.orders.find(o => o.id === orderId) || null;
  }

  /**
   * Obtiene todas las órdenes
   * @param {Object} filters - Filtros opcionales
   * @returns {Array<Order>} Array de órdenes
   */
  getOrders(filters = {}) {
    let filtered = [...this.orders];

    // Filtrar por tipo
    if (filters.type) {
      filtered = filtered.filter(o => o.type === filters.type);
    }

    // Filtrar por status
    if (filters.status) {
      filtered = filtered.filter(o => o.status === filters.status);
    }

    // Filtrar por fiatCode
    if (filters.fiatCode) {
      filtered = filtered.filter(o => o.fiatCode === filters.fiatCode);
    }

    // Solo órdenes completas
    if (filters.onlyComplete) {
      filtered = filtered.filter(o => o.isComplete());
    }

    // Excluir expiradas
    if (filters.excludeExpired) {
      filtered = filtered.filter(o => !o.isExpired());
    }

    return filtered;
  }

  /**
   * Obtiene órdenes activas (pending o active status)
   * @returns {Array<Order>} Órdenes activas
   */
  getActiveOrders() {
    return this.orders.filter(o =>
      (o.status === ORDER_STATUS.PENDING || o.status === ORDER_STATUS.ACTIVE) &&
      !o.isExpired()
    );
  }

  /**
   * Obtiene órdenes de compra
   * @returns {Array<Order>} Órdenes de compra
   */
  getBuyOrders() {
    return this.orders.filter(o => o.isBuyOrder());
  }

  /**
   * Obtiene órdenes de venta
   * @returns {Array<Order>} Órdenes de venta
   */
  getSellOrders() {
    return this.orders.filter(o => o.isSellOrder());
  }

  /**
   * Obtiene el conteo total de órdenes
   * @returns {number} Número de órdenes
   */
  getOrderCount() {
    return this.orders.length;
  }

  /**
   * Obtiene el conteo de órdenes activas
   * @returns {number} Número de órdenes activas
   */
  getActiveOrderCount() {
    return this.getActiveOrders().length;
  }

  /**
   * Actualiza las estadísticas del Mostro
   */
  updateStats() {
    this.stats = {
      totalOrders: this.orders.length,
      buyOrders: this.getBuyOrders().length,
      sellOrders: this.getSellOrders().length,
      activeOrders: this.getActiveOrders().length
    };
  }

  /**
   * Obtiene pubkey en formato corto para display
   * @returns {string} Pubkey truncado
   */
  getShortPubkey() {
    if (!this.pubkey) return 'N/A';
    return `${this.pubkey.slice(0, 8)}...${this.pubkey.slice(-8)}`;
  }

  /**
   * Obtiene la edad del Mostro (desde firstSeen)
   * @returns {number} Edad en milisegundos
   */
  getAge() {
    return Date.now() - this.firstSeen;
  }

  /**
   * Obtiene el tiempo desde la última orden
   * @returns {number} Tiempo en milisegundos
   */
  getTimeSinceLastSeen() {
    return Date.now() - this.lastSeen;
  }

  /**
   * Verifica si el Mostro está activo recientemente
   * @param {number} maxAge - Edad máxima en ms (default: 1 hora)
   * @returns {boolean} True si está activo
   */
  isActive(maxAge = 60 * 60 * 1000) {
    return this.getTimeSinceLastSeen() < maxAge;
  }

  /**
   * Obtiene información resumida del Mostro
   * @returns {Object} Resumen
   */
  getSummary() {
    return {
      pubkey: this.pubkey,
      shortPubkey: this.getShortPubkey(),
      orderCount: this.getOrderCount(),
      activeOrderCount: this.getActiveOrderCount(),
      buyOrders: this.stats.buyOrders,
      sellOrders: this.stats.sellOrders,
      lastSeen: this.lastSeen,
      isActive: this.isActive()
    };
  }

  /**
   * Formatea el Mostro para display en terminal
   * @returns {string} String formateado
   */
  toDisplayString() {
    const pubkey = this.getShortPubkey();
    const active = this.getActiveOrderCount();
    const total = this.getOrderCount();
    const buy = this.stats.buyOrders;
    const sell = this.stats.sellOrders;

    const statusIcon = this.isActive() ? '🟢' : '⚪';

    return `${statusIcon} ${pubkey} | ${active}/${total} active | 📗${buy} 📕${sell}`;
  }

  /**
   * Formatea el Mostro para display detallado
   * @returns {Array<string>} Array de líneas
   */
  toDetailedDisplay() {
    const lines = [];

    lines.push(`Mostro Daemon`);
    lines.push(`Pubkey: ${this.pubkey}`);
    lines.push(`Short: ${this.getShortPubkey()}`);
    lines.push('');
    lines.push(`Total Orders: ${this.stats.totalOrders}`);
    lines.push(`Active Orders: ${this.stats.activeOrders}`);
    lines.push(`Buy Orders: 📗 ${this.stats.buyOrders}`);
    lines.push(`Sell Orders: 📕 ${this.stats.sellOrders}`);
    lines.push('');

    const lastSeenAgo = Math.floor(this.getTimeSinceLastSeen() / 1000);
    lines.push(`Last Seen: ${lastSeenAgo}s ago`);

    const ageSeconds = Math.floor(this.getAge() / 1000);
    lines.push(`First Discovered: ${ageSeconds}s ago`);

    lines.push(`Status: ${this.isActive() ? '🟢 Active' : '⚪ Inactive'}`);

    return lines;
  }

  /**
   * Limpia órdenes expiradas o antiguas
   * @param {number} maxAge - Edad máxima en ms (default: 24 horas)
   * @returns {number} Número de órdenes eliminadas
   */
  cleanupOldOrders(maxAge = 24 * 60 * 60 * 1000) {
    const initialCount = this.orders.length;
    const now = Date.now();

    this.orders = this.orders.filter(order => {
      // Eliminar si está expirada
      if (order.isExpired()) return false;

      // Eliminar si es muy antigua
      const age = now - order.createdAt;
      if (age > maxAge) return false;

      return true;
    });

    const removed = initialCount - this.orders.length;

    if (removed > 0) {
      Logger.info(`Mostro: Cleaned up ${removed} old orders from ${this.getShortPubkey()}`);
      this.updateStats();
    }

    return removed;
  }

  /**
   * Convierte a objeto plano para storage/serialización
   * @returns {Object} Objeto plano
   */
  toJSON() {
    return {
      pubkey: this.pubkey,
      orders: this.orders.map(o => o.toJSON()),
      lastSeen: this.lastSeen,
      firstSeen: this.firstSeen,
      metadata: this.metadata,
      stats: this.stats
    };
  }

  /**
   * Crea una instancia de Mostro desde JSON
   * @param {Object} json - Objeto JSON
   * @returns {Mostro} Instancia de Mostro
   */
  static fromJSON(json) {
    const mostro = new Mostro(json.pubkey, {
      lastSeen: json.lastSeen,
      firstSeen: json.firstSeen,
      metadata: json.metadata
    });

    // Reconstruir órdenes
    if (json.orders) {
      // Importar Order dinámicamente para evitar dependencia circular
      import('./Order.js').then(({ default: Order }) => {
        json.orders.forEach(orderData => {
          const order = Order.fromJSON(orderData);
          mostro.addOrder(order);
        });
      });
    }

    mostro.stats = json.stats || mostro.stats;

    return mostro;
  }

  /**
   * Compara dos Mostros por número de órdenes activas
   * @param {Mostro} a - Primer Mostro
   * @param {Mostro} b - Segundo Mostro
   * @returns {number} Resultado de comparación
   */
  static compareByActiveOrders(a, b) {
    return b.getActiveOrderCount() - a.getActiveOrderCount();
  }

  /**
   * Compara dos Mostros por última actividad
   * @param {Mostro} a - Primer Mostro
   * @param {Mostro} b - Segundo Mostro
   * @returns {number} Resultado de comparación
   */
  static compareByLastSeen(a, b) {
    return b.lastSeen - a.lastSeen;
  }

  /**
   * Obtiene estadísticas agregadas de múltiples Mostros
   * @param {Array<Mostro>} mostros - Array de Mostros
   * @returns {Object} Estadísticas agregadas
   */
  static getAggregatedStats(mostros) {
    const stats = {
      totalMostros: mostros.length,
      activeMostros: 0,
      totalOrders: 0,
      totalActiveOrders: 0,
      totalBuyOrders: 0,
      totalSellOrders: 0
    };

    mostros.forEach(mostro => {
      if (mostro.isActive()) {
        stats.activeMostros++;
      }

      stats.totalOrders += mostro.stats.totalOrders;
      stats.totalActiveOrders += mostro.stats.activeOrders;
      stats.totalBuyOrders += mostro.stats.buyOrders;
      stats.totalSellOrders += mostro.stats.sellOrders;
    });

    return stats;
  }

  /**
   * Filtra Mostros por criterios
   * @param {Array<Mostro>} mostros - Array de Mostros
   * @param {Object} filters - Filtros a aplicar
   * @returns {Array<Mostro>} Mostros filtrados
   */
  static filter(mostros, filters = {}) {
    let filtered = [...mostros];

    // Solo Mostros activos
    if (filters.onlyActive) {
      filtered = filtered.filter(m => m.isActive(filters.maxAge));
    }

    // Mostros con al menos N órdenes
    if (filters.minOrders) {
      filtered = filtered.filter(m => m.getOrderCount() >= filters.minOrders);
    }

    // Mostros con órdenes activas
    if (filters.hasActiveOrders) {
      filtered = filtered.filter(m => m.getActiveOrderCount() > 0);
    }

    return filtered;
  }
}
