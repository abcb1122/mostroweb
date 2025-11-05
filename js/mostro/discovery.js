/**
 * discovery.js
 * Descubre órdenes públicas de Mostro en los relays Nostr
 *
 * Busca eventos Kind 34242 (NIP-33 Replaceable events) con tag #y = "mostrop2p"
 * Agrupa órdenes por pubkey del Mostro daemon que las publicó
 * Cachea resultados en LocalStorage para carga rápida
 */

import { NOSTR_KINDS, MOSTRO_TAGS } from '../utils/constants.js';
import Logger from '../utils/logger.js';
import RelayManager from '../core/relayManager.js';
import Storage from '../core/storage.js';
import Order from '../models/Order.js';
import Mostro from '../models/Mostro.js';

/**
 * Discovery class
 * Gestiona el descubrimiento de órdenes Mostro en la red Nostr
 */
class Discovery {
  constructor() {
    // Map de órdenes: orderId -> Order instance
    this.orders = new Map();

    // Map de Mostros: mostroPubkey -> Mostro instance
    this.mostros = new Map();

    // Suscripción activa al RelayManager
    this.subscription = null;

    // Flag de descubrimiento activo
    this.isDiscovering = false;

    // Timestamp de última vez que se inició discovery
    this.lastDiscoveryTime = null;

    // Contador de eventos procesados
    this.eventsProcessed = 0;

    // Contador de eventos válidos
    this.validOrders = 0;

    // Contador de eventos inválidos
    this.invalidOrders = 0;

    // Flag de EOSE recibido
    this.eoseReceived = false;

    // Configuración
    this.config = {
      maxOrders: 1000, // Máximo de órdenes a mantener en memoria
      cacheEnabled: true, // Habilitar cache en LocalStorage
      autoCleanup: true, // Limpiar órdenes expiradas automáticamente
      cleanupInterval: 5 * 60 * 1000 // Intervalo de limpieza (5 minutos)
    };

    // Timer para cleanup automático
    this.cleanupTimer = null;
  }

  /**
   * Inicializa el sistema de descubrimiento
   * @returns {Promise<boolean>} True si se inicializó correctamente
   */
  async init() {
    Logger.debug('Discovery: Initializing...');

    try {
      // Cargar órdenes cacheadas del storage
      if (this.config.cacheEnabled) {
        await this.loadFromCache();
      }

      Logger.info('Discovery: Initialized');

      return true;
    } catch (error) {
      Logger.error('Discovery: Initialization failed', error);
      throw error;
    }
  }

  /**
   * Carga órdenes desde cache de LocalStorage
   * @returns {Promise<number>} Número de órdenes cargadas
   */
  async loadFromCache() {
    try {
      const cachedOrders = Storage.getOrders();

      if (!cachedOrders || cachedOrders.length === 0) {
        Logger.debug('Discovery: No cached orders found');
        return 0;
      }

      Logger.info(`Discovery: Loading ${cachedOrders.length} cached orders`);

      let loaded = 0;

      cachedOrders.forEach(orderData => {
        try {
          const order = Order.fromJSON(orderData);

          // Verificar si la orden no ha expirado
          if (!order.isExpired()) {
            this.addOrder(order);
            loaded++;
          }
        } catch (error) {
          Logger.error('Discovery: Error loading cached order', error);
        }
      });

      Logger.info(`Discovery: Loaded ${loaded} orders from cache`);

      // Actualizar UI
      this.updateOrderCount();

      return loaded;
    } catch (error) {
      Logger.error('Discovery: Error loading from cache', error);
      return 0;
    }
  }

  /**
   * Inicia el descubrimiento de órdenes en los relays
   * @returns {Promise<Object>} Objeto con subId y método unsub()
   */
  async startDiscovery() {
    if (this.isDiscovering) {
      Logger.warn('Discovery: Already discovering');
      return null;
    }

    Logger.info('Discovery: Starting order discovery...');

    try {
      // Verificar que RelayManager esté conectado
      if (!RelayManager.isConnected()) {
        Logger.warn('Discovery: RelayManager not connected, connecting...');
        await RelayManager.connect();
      }

      // Crear filtro para órdenes públicas Mostro
      // Kind 34242: NIP-33 Replaceable events
      // Tag y: "mostrop2p" - Identificador del marketplace Mostro
      const filter = {
        kinds: [NOSTR_KINDS.REPLACEABLE], // 34242
        '#y': [MOSTRO_TAGS.MARKETPLACE],   // "mostrop2p"
        limit: 500 // Últimas 500 órdenes
      };

      Logger.debug('Discovery: Subscription filter', filter);

      // Suscribirse a eventos de órdenes
      this.subscription = await RelayManager.subscribe(
        filter,
        (event) => this.handleOrderEvent(event),
        () => this.handleEOSE()
      );

      this.isDiscovering = true;
      this.lastDiscoveryTime = Date.now();
      this.eoseReceived = false;

      // Iniciar cleanup automático si está habilitado
      if (this.config.autoCleanup) {
        this.startAutoCleanup();
      }

      Logger.info('Discovery: Order discovery started');

      return this.subscription;
    } catch (error) {
      Logger.error('Discovery: Failed to start discovery', error);
      this.isDiscovering = false;
      throw error;
    }
  }

  /**
   * Handler para eventos de órdenes recibidos desde relays
   * @param {Object} event - Evento Nostr Kind 34242
   */
  handleOrderEvent(event) {
    try {
      this.eventsProcessed++;

      Logger.debug(`Discovery: Processing order event ${event.id.slice(0, 8)}...`);

      // Validar evento usando nostr-tools
      const { validateEvent, verifySignature } = window.nostrTools;

      if (!validateEvent(event)) {
        Logger.warn(`Discovery: Invalid event structure: ${event.id}`);
        this.invalidOrders++;
        return;
      }

      if (!verifySignature(event)) {
        Logger.warn(`Discovery: Invalid signature: ${event.id}`);
        this.invalidOrders++;
        return;
      }

      // Verificar que tenga el tag 'y' = 'mostrop2p'
      const yTag = event.tags?.find(t => t[0] === 'y')?.[1];

      if (yTag !== MOSTRO_TAGS.MARKETPLACE) {
        Logger.debug(`Discovery: Event missing mostrop2p tag: ${event.id}`);
        this.invalidOrders++;
        return;
      }

      // Crear objeto Order desde el evento
      const order = Order.fromNostrEvent(event);

      // Validar orden
      if (!order.isValid()) {
        Logger.warn(`Discovery: Invalid order data: ${event.id}`);
        this.invalidOrders++;
        return;
      }

      // Verificar si ya existe (puede ser actualización)
      const existingOrder = this.orders.get(order.id);

      if (existingOrder) {
        // Verificar si es más reciente (replaceable events)
        if (order.createdAt <= existingOrder.createdAt) {
          Logger.debug(`Discovery: Skipping older version of order ${order.id}`);
          return;
        }

        Logger.debug(`Discovery: Updating order ${order.id}`);
      }

      // Añadir/actualizar orden
      this.addOrder(order);

      this.validOrders++;

      Logger.info(`Discovery: Order ${order.id.slice(0, 8)}... from Mostro ${order.mostroPubkey.slice(0, 8)}...`);

    } catch (error) {
      Logger.error('Discovery: Error processing order event', error);
      this.invalidOrders++;
    }
  }

  /**
   * Handler para EOSE (End Of Stored Events)
   * Se ejecuta cuando los relays terminan de enviar eventos almacenados
   */
  handleEOSE() {
    this.eoseReceived = true;

    const orderCount = this.orders.size;
    const mostroCount = this.mostros.size;

    Logger.info('Discovery: EOSE received - Initial sync complete');
    Logger.info(`Discovery: Found ${orderCount} orders from ${mostroCount} Mostro instances`);
    Logger.info(`Discovery: Processed ${this.eventsProcessed} events (${this.validOrders} valid, ${this.invalidOrders} invalid)`);

    // Guardar en cache
    if (this.config.cacheEnabled) {
      this.saveToCache();
    }

    // Actualizar UI
    this.updateOrderCount();
  }

  /**
   * Añade una orden al índice
   * @param {Order} order - Orden a añadir
   */
  addOrder(order) {
    // Guardar orden en el Map
    this.orders.set(order.id, order);

    // Obtener o crear Mostro instance
    let mostro = this.mostros.get(order.mostroPubkey);

    if (!mostro) {
      mostro = new Mostro(order.mostroPubkey);
      this.mostros.set(order.mostroPubkey, mostro);
      Logger.debug(`Discovery: New Mostro discovered: ${mostro.getShortPubkey()}`);
    }

    // Añadir orden al Mostro
    mostro.addOrder(order);

    // Verificar límite de órdenes
    if (this.orders.size > this.config.maxOrders) {
      this.cleanupOldOrders();
    }
  }

  /**
   * Detiene el descubrimiento de órdenes
   */
  stopDiscovery() {
    if (!this.isDiscovering) {
      Logger.debug('Discovery: Not discovering, nothing to stop');
      return;
    }

    Logger.info('Discovery: Stopping discovery...');

    // Cancelar suscripción
    if (this.subscription) {
      this.subscription.unsub();
      this.subscription = null;
    }

    // Detener cleanup automático
    if (this.cleanupTimer) {
      clearInterval(this.cleanupTimer);
      this.cleanupTimer = null;
    }

    this.isDiscovering = false;

    Logger.info('Discovery: Discovery stopped');

    // Guardar en cache antes de detener
    if (this.config.cacheEnabled) {
      this.saveToCache();
    }
  }

  /**
   * Refresca las órdenes (detiene y vuelve a iniciar discovery)
   * @returns {Promise<Object>} Resultado de refresh
   */
  async refreshOrders() {
    Logger.info('Discovery: Refreshing orders...');

    // Detener discovery actual
    this.stopDiscovery();

    // Limpiar órdenes y Mostros actuales
    const oldOrderCount = this.orders.size;
    const oldMostroCount = this.mostros.size;

    this.orders.clear();
    this.mostros.clear();

    // Resetear contadores
    this.eventsProcessed = 0;
    this.validOrders = 0;
    this.invalidOrders = 0;
    this.eoseReceived = false;

    Logger.debug(`Discovery: Cleared ${oldOrderCount} orders from ${oldMostroCount} Mostros`);

    // Iniciar discovery de nuevo
    await this.startDiscovery();

    return {
      oldOrderCount,
      oldMostroCount,
      cleared: true
    };
  }

  /**
   * Obtiene todas las órdenes con filtros opcionales
   * @param {Object} filters - Filtros a aplicar
   * @returns {Array<Order>} Array de órdenes filtradas
   */
  getOrders(filters = {}) {
    let orders = Array.from(this.orders.values());

    // Usar método estático de Order para filtrar
    orders = Order.filter(orders, filters);

    // Ordenar por fecha (más recientes primero)
    orders.sort(Order.compareByDate);

    return orders;
  }

  /**
   * Obtiene órdenes de un Mostro específico
   * @param {string} mostroPubkey - Public key del Mostro
   * @param {Object} filters - Filtros opcionales
   * @returns {Array<Order>} Array de órdenes
   */
  getOrdersByMostro(mostroPubkey, filters = {}) {
    const mostro = this.mostros.get(mostroPubkey);

    if (!mostro) {
      return [];
    }

    return mostro.getOrders(filters);
  }

  /**
   * Obtiene una orden por ID
   * @param {string} orderId - ID de la orden
   * @returns {Order|null} Orden encontrada o null
   */
  getOrder(orderId) {
    return this.orders.get(orderId) || null;
  }

  /**
   * Obtiene todas las instancias de Mostro descubiertas
   * @param {Object} filters - Filtros opcionales
   * @returns {Array<Mostro>} Array de Mostros
   */
  getMostroInstances(filters = {}) {
    let mostros = Array.from(this.mostros.values());

    // Aplicar filtros si existen
    if (Object.keys(filters).length > 0) {
      mostros = Mostro.filter(mostros, filters);
    }

    // Ordenar por número de órdenes activas
    mostros.sort(Mostro.compareByActiveOrders);

    return mostros;
  }

  /**
   * Obtiene un Mostro por pubkey
   * @param {string} pubkey - Public key del Mostro
   * @returns {Mostro|null} Mostro encontrado o null
   */
  getMostro(pubkey) {
    return this.mostros.get(pubkey) || null;
  }

  /**
   * Obtiene conteo de órdenes
   * @returns {number} Número de órdenes
   */
  getOrderCount() {
    return this.orders.size;
  }

  /**
   * Obtiene conteo de Mostros
   * @returns {number} Número de Mostros
   */
  getMostroCount() {
    return this.mostros.size;
  }

  /**
   * Obtiene estadísticas del discovery
   * @returns {Object} Estadísticas
   */
  getStats() {
    const orders = Array.from(this.orders.values());
    const orderStats = Order.getStats(orders);

    const mostros = Array.from(this.mostros.values());
    const mostroStats = Mostro.getAggregatedStats(mostros);

    return {
      ...orderStats,
      ...mostroStats,
      eventsProcessed: this.eventsProcessed,
      validOrders: this.validOrders,
      invalidOrders: this.invalidOrders,
      eoseReceived: this.eoseReceived
    };
  }

  /**
   * Actualiza el contador de órdenes en la UI
   */
  updateOrderCount() {
    const statusElement = document.getElementById('status-orders-text');

    if (statusElement) {
      const count = this.getOrderCount();
      const mostroCount = this.getMostroCount();
      statusElement.textContent = `Orders: ${count} | Mostros: ${mostroCount}`;
    }
  }

  /**
   * Guarda órdenes en cache de LocalStorage
   * @returns {boolean} True si se guardó correctamente
   */
  saveToCache() {
    try {
      const orders = Array.from(this.orders.values()).map(o => o.toJSON());
      Storage.saveOrders(orders);

      Logger.debug(`Discovery: Saved ${orders.length} orders to cache`);

      return true;
    } catch (error) {
      Logger.error('Discovery: Error saving to cache', error);
      return false;
    }
  }

  /**
   * Limpia órdenes antiguas o expiradas
   * @returns {number} Número de órdenes eliminadas
   */
  cleanupOldOrders() {
    Logger.debug('Discovery: Cleaning up old orders...');

    const initialCount = this.orders.size;
    const now = Date.now();
    const maxAge = 24 * 60 * 60 * 1000; // 24 horas

    // Array para almacenar IDs de órdenes a eliminar
    const toRemove = [];

    this.orders.forEach((order, orderId) => {
      // Eliminar si está expirada
      if (order.isExpired()) {
        toRemove.push(orderId);
        return;
      }

      // Eliminar si es muy antigua
      const age = now - order.createdAt;
      if (age > maxAge) {
        toRemove.push(orderId);
        return;
      }
    });

    // Eliminar órdenes
    toRemove.forEach(orderId => {
      const order = this.orders.get(orderId);

      // Eliminar del Map de órdenes
      this.orders.delete(orderId);

      // Eliminar del Mostro
      const mostro = this.mostros.get(order.mostroPubkey);
      if (mostro) {
        mostro.removeOrder(orderId);

        // Si el Mostro no tiene más órdenes, eliminarlo
        if (mostro.getOrderCount() === 0) {
          this.mostros.delete(order.mostroPubkey);
        }
      }
    });

    const removed = toRemove.length;

    if (removed > 0) {
      Logger.info(`Discovery: Cleaned up ${removed} old orders`);
      this.updateOrderCount();

      // Guardar en cache
      if (this.config.cacheEnabled) {
        this.saveToCache();
      }
    }

    return removed;
  }

  /**
   * Inicia cleanup automático periódico
   */
  startAutoCleanup() {
    if (this.cleanupTimer) {
      return;
    }

    Logger.debug('Discovery: Starting auto cleanup');

    this.cleanupTimer = setInterval(() => {
      this.cleanupOldOrders();
    }, this.config.cleanupInterval);
  }

  /**
   * Detiene cleanup automático
   */
  stopAutoCleanup() {
    if (this.cleanupTimer) {
      clearInterval(this.cleanupTimer);
      this.cleanupTimer = null;
      Logger.debug('Discovery: Auto cleanup stopped');
    }
  }

  /**
   * Verifica si el discovery está activo
   * @returns {boolean} True si está activo
   */
  isActive() {
    return this.isDiscovering;
  }

  /**
   * Obtiene el estado completo del discovery
   * @returns {Object} Estado completo
   */
  getState() {
    return {
      isDiscovering: this.isDiscovering,
      orderCount: this.orders.size,
      mostroCount: this.mostros.size,
      lastDiscoveryTime: this.lastDiscoveryTime,
      hasSubscription: !!this.subscription,
      eoseReceived: this.eoseReceived,
      eventsProcessed: this.eventsProcessed,
      validOrders: this.validOrders,
      invalidOrders: this.invalidOrders,
      config: this.config
    };
  }

  /**
   * Limpia todos los datos
   */
  cleanup() {
    Logger.info('Discovery: Cleaning up...');

    // Detener discovery
    this.stopDiscovery();

    // Limpiar datos
    this.orders.clear();
    this.mostros.clear();

    // Resetear flags
    this.eventsProcessed = 0;
    this.validOrders = 0;
    this.invalidOrders = 0;
    this.eoseReceived = false;
    this.lastDiscoveryTime = null;

    Logger.info('Discovery: Cleaned up');
  }
}

// Crear instancia singleton
const instance = new Discovery();

// Exportar como default
export default instance;
