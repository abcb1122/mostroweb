/**
 * relayManager.js
 * Gestiona conexiones WebSocket a múltiples relays Nostr
 *
 * Usa SimplePool de nostr-tools para manejar:
 * - Conexiones a múltiples relays en paralelo
 * - Suscripciones a eventos
 * - Publicación de eventos
 * - Auto-reconexión
 */

import { DEFAULT_RELAYS, TIMEOUTS, ERROR_MESSAGES, SUCCESS_MESSAGES } from '../utils/constants.js';
import Logger from '../utils/logger.js';
import Storage from './storage.js';

/**
 * RelayManager class
 * Singleton para gestionar todas las conexiones a relays
 */
class RelayManager {
  constructor() {
    // SimplePool instance de nostr-tools
    this.pool = null;

    // Array de URLs de relays configurados
    this.relayUrls = [];

    // Map de estado de cada relay: url -> {status, lastConnected, errorCount, lastError}
    this.relayStatus = new Map();

    // Map de suscripciones activas: subId -> {filters, sub, onEvent, onEOSE}
    this.subscriptions = new Map();

    // Flag de inicialización
    this.isInitialized = false;

    // Auto-reconexión habilitada
    this.autoReconnect = true;

    // Estadísticas
    this.stats = {
      eventsReceived: 0,
      eventsPublished: 0,
      subscriptionsCreated: 0,
      connectionAttempts: 0,
      errors: 0
    };
  }

  /**
   * Inicializa el RelayManager con lista de relays
   * @param {Array<string>} relayUrls - Array de URLs de relays (opcional)
   * @returns {Promise<boolean>} True si se inicializó correctamente
   */
  async init(relayUrls = null) {
    Logger.debug('RelayManager: Initializing...');

    try {
      // Esperar a que nostr-tools esté disponible
      if (typeof window.nostrTools === 'undefined') {
        throw new Error('nostr-tools library not loaded');
      }

      const { SimplePool } = window.nostrTools;

      if (!SimplePool) {
        throw new Error('SimplePool not available in nostr-tools');
      }

      // Obtener relays desde parámetro, storage o usar defaults
      this.relayUrls = relayUrls || Storage.getRelays() || [...DEFAULT_RELAYS];

      Logger.debug(`RelayManager: Using ${this.relayUrls.length} relays`, this.relayUrls);

      // Crear pool de relays
      this.pool = new SimplePool();

      // Inicializar status de cada relay
      this.relayUrls.forEach(url => {
        this.relayStatus.set(url, {
          status: 'disconnected',
          lastConnected: null,
          errorCount: 0,
          lastError: null
        });
      });

      this.isInitialized = true;

      Logger.info(`RelayManager: Initialized with ${this.relayUrls.length} relays`);

      return true;
    } catch (error) {
      Logger.error('RelayManager: Initialization failed', error);
      throw error;
    }
  }

  /**
   * Conecta a todos los relays configurados
   * @returns {Promise<Object>} Resultado de conexión {connected, failed, total}
   */
  async connect() {
    if (!this.isInitialized) {
      throw new Error('RelayManager not initialized. Call init() first.');
    }

    Logger.info('RelayManager: Connecting to relays...');

    this.stats.connectionAttempts++;

    const connectionPromises = this.relayUrls.map(async (url) => {
      try {
        this.updateRelayStatus(url, 'connecting');

        // SimplePool maneja la conexión automáticamente cuando se usa
        // Aquí solo intentamos asegurar que el relay esté disponible
        const relay = await this.pool.ensureRelay(url);

        if (relay) {
          this.updateRelayStatus(url, 'connected');
          Logger.debug(`RelayManager: Connected to ${url}`);
          return { url, success: true };
        } else {
          throw new Error('ensureRelay returned null');
        }
      } catch (error) {
        Logger.error(`RelayManager: Failed to connect to ${url}`, error);
        this.updateRelayStatus(url, 'error', error.message);
        this.stats.errors++;
        return { url, success: false, error };
      }
    });

    const results = await Promise.allSettled(connectionPromises);

    // Contar resultados
    const connected = results.filter(r =>
      r.status === 'fulfilled' && r.value?.success
    ).length;

    const failed = this.relayUrls.length - connected;

    Logger.info(`RelayManager: Connected to ${connected}/${this.relayUrls.length} relays`);

    if (connected === 0) {
      const error = new Error('Failed to connect to any relay');
      this.stats.errors++;
      throw error;
    }

    // Actualizar UI status
    this.updateUIStatus();

    return {
      connected,
      failed,
      total: this.relayUrls.length
    };
  }

  /**
   * Suscribirse a eventos que coincidan con filtros
   * @param {Object} filters - Filtros Nostr (kinds, authors, tags, etc.)
   * @param {Function} onEvent - Callback para cada evento recibido
   * @param {Function} onEOSE - Callback opcional para End Of Stored Events
   * @returns {Promise<Object>} Objeto con subId y método unsub()
   */
  async subscribe(filters, onEvent, onEOSE = null) {
    if (!this.isInitialized) {
      throw new Error('RelayManager not initialized');
    }

    if (!onEvent || typeof onEvent !== 'function') {
      throw new Error('onEvent callback is required');
    }

    Logger.debug('RelayManager: Creating subscription', filters);

    try {
      // Crear ID único para la suscripción
      const subId = `sub_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

      // Crear suscripción usando SimplePool
      // sub() acepta: relays, filters[], opts
      const sub = this.pool.sub(this.relayUrls, [filters]);

      // Guardar referencia
      this.subscriptions.set(subId, {
        filters,
        sub,
        onEvent,
        onEOSE,
        createdAt: Date.now()
      });

      this.stats.subscriptionsCreated++;

      // Handler para eventos recibidos
      sub.on('event', (event) => {
        Logger.debug(`RelayManager: Event received (kind: ${event.kind}, id: ${event.id.slice(0, 8)}...)`);
        this.stats.eventsReceived++;

        try {
          onEvent(event);
        } catch (error) {
          Logger.error('RelayManager: Error in onEvent callback', error);
          this.stats.errors++;
        }
      });

      // Handler para EOSE (End Of Stored Events)
      if (onEOSE && typeof onEOSE === 'function') {
        sub.on('eose', () => {
          Logger.debug('RelayManager: EOSE received for subscription', subId);

          try {
            onEOSE();
          } catch (error) {
            Logger.error('RelayManager: Error in onEOSE callback', error);
            this.stats.errors++;
          }
        });
      }

      Logger.info(`RelayManager: Subscription created: ${subId}`);

      // Retornar objeto con método para cancelar suscripción
      return {
        subId,
        unsub: () => this.unsubscribe(subId)
      };
    } catch (error) {
      Logger.error('RelayManager: Failed to create subscription', error);
      this.stats.errors++;
      throw error;
    }
  }

  /**
   * Cancelar una suscripción
   * @param {string} subId - ID de la suscripción
   * @returns {boolean} True si se canceló correctamente
   */
  unsubscribe(subId) {
    const subscription = this.subscriptions.get(subId);

    if (!subscription) {
      Logger.warn(`RelayManager: Subscription not found: ${subId}`);
      return false;
    }

    try {
      // Cerrar suscripción en SimplePool
      subscription.sub.unsub();

      // Eliminar de mapa
      this.subscriptions.delete(subId);

      Logger.info(`RelayManager: Unsubscribed: ${subId}`);

      return true;
    } catch (error) {
      Logger.error(`RelayManager: Error unsubscribing ${subId}`, error);
      this.stats.errors++;
      return false;
    }
  }

  /**
   * Cancelar todas las suscripciones activas
   * @returns {number} Número de suscripciones canceladas
   */
  unsubscribeAll() {
    Logger.info('RelayManager: Unsubscribing from all subscriptions...');

    let count = 0;

    this.subscriptions.forEach((_, subId) => {
      if (this.unsubscribe(subId)) {
        count++;
      }
    });

    Logger.info(`RelayManager: Unsubscribed from ${count} subscriptions`);

    return count;
  }

  /**
   * Publicar un evento a todos los relays
   * @param {Object} event - Evento Nostr firmado
   * @returns {Promise<Array>} Array de promesas de publicación
   */
  async publish(event) {
    if (!this.isInitialized) {
      throw new Error('RelayManager not initialized');
    }

    if (!event || !event.id || !event.sig) {
      throw new Error('Invalid event: must be signed with id and sig');
    }

    Logger.debug(`RelayManager: Publishing event (kind: ${event.kind}, id: ${event.id.slice(0, 8)}...)`);

    try {
      // Publicar usando SimplePool
      // publish() retorna array de promesas
      const pubs = this.pool.publish(this.relayUrls, event);

      this.stats.eventsPublished++;

      // Esperar a que al menos 1 relay confirme (race)
      await Promise.race(pubs);

      Logger.info('RelayManager: Event published successfully to at least 1 relay');

      return pubs;
    } catch (error) {
      Logger.error('RelayManager: Failed to publish event', error);
      this.stats.errors++;
      throw error;
    }
  }

  /**
   * Obtener un evento específico por ID
   * @param {string} eventId - ID del evento
   * @param {Object} options - Opciones (timeout, relays)
   * @returns {Promise<Object|null>} Evento encontrado o null
   */
  async getEvent(eventId, options = {}) {
    if (!this.isInitialized) {
      throw new Error('RelayManager not initialized');
    }

    const timeout = options.timeout || TIMEOUTS.MESSAGE_RESPONSE;
    const relays = options.relays || this.relayUrls;

    Logger.debug(`RelayManager: Fetching event ${eventId.slice(0, 8)}...`);

    try {
      // Usar get() de SimplePool
      const event = await this.pool.get(relays, { ids: [eventId] });

      if (event) {
        Logger.debug(`RelayManager: Event ${eventId.slice(0, 8)}... found`);
        this.stats.eventsReceived++;
        return event;
      } else {
        Logger.debug(`RelayManager: Event ${eventId.slice(0, 8)}... not found`);
        return null;
      }
    } catch (error) {
      Logger.error('RelayManager: Error fetching event', error);
      this.stats.errors++;
      throw error;
    }
  }

  /**
   * Actualiza el estado de un relay
   * @param {string} url - URL del relay
   * @param {string} status - Nuevo status (connecting, connected, disconnected, error)
   * @param {string} error - Mensaje de error opcional
   */
  updateRelayStatus(url, status, error = null) {
    const current = this.relayStatus.get(url) || {};

    this.relayStatus.set(url, {
      ...current,
      status,
      lastConnected: status === 'connected' ? Date.now() : current.lastConnected,
      errorCount: error ? (current.errorCount || 0) + 1 : current.errorCount,
      lastError: error || current.lastError
    });

    // Actualizar UI si hay cambio significativo
    if (status === 'connected' || status === 'error' || status === 'disconnected') {
      this.updateUIStatus();
    }
  }

  /**
   * Actualiza el indicador de status en la UI
   */
  updateUIStatus() {
    const connectedCount = this.getConnectedRelays().length;
    const totalCount = this.relayUrls.length;

    const statusElement = document.getElementById('status-relays-text');
    const statusIcon = document.querySelector('.status-relays .status-icon');

    if (statusElement && statusIcon) {
      if (connectedCount === 0) {
        statusElement.textContent = 'OFFLINE';
        statusIcon.textContent = '🔴';
      } else if (connectedCount === totalCount) {
        statusElement.textContent = `ONLINE (${connectedCount})`;
        statusIcon.textContent = '🟢';
      } else {
        statusElement.textContent = `ONLINE (${connectedCount}/${totalCount})`;
        statusIcon.textContent = '🟡';
      }
    }
  }

  /**
   * Obtener lista de relays conectados
   * @returns {Array<string>} Array de URLs de relays conectados
   */
  getConnectedRelays() {
    return Array.from(this.relayStatus.entries())
      .filter(([url, status]) => status.status === 'connected')
      .map(([url]) => url);
  }

  /**
   * Obtener lista de relays desconectados
   * @returns {Array<string>} Array de URLs
   */
  getDisconnectedRelays() {
    return Array.from(this.relayStatus.entries())
      .filter(([url, status]) => status.status !== 'connected')
      .map(([url]) => url);
  }

  /**
   * Obtener estado de un relay específico
   * @param {string} url - URL del relay
   * @returns {Object|null} Estado del relay
   */
  getRelayStatus(url) {
    return this.relayStatus.get(url) || null;
  }

  /**
   * Añadir un nuevo relay
   * @param {string} url - URL del relay
   * @returns {Promise<boolean>} True si se añadió correctamente
   */
  async addRelay(url) {
    // Validar URL
    if (!url || !url.startsWith('wss://') && !url.startsWith('ws://')) {
      throw new Error('Invalid relay URL. Must start with wss:// or ws://');
    }

    // Verificar si ya existe
    if (this.relayUrls.includes(url)) {
      Logger.warn(`RelayManager: Relay already exists: ${url}`);
      return false;
    }

    Logger.info(`RelayManager: Adding relay: ${url}`);

    // Añadir a lista
    this.relayUrls.push(url);

    // Inicializar status
    this.relayStatus.set(url, {
      status: 'disconnected',
      lastConnected: null,
      errorCount: 0,
      lastError: null
    });

    // Guardar en storage
    Storage.saveRelays(this.relayUrls);

    // Intentar conectar
    try {
      this.updateRelayStatus(url, 'connecting');
      const relay = await this.pool.ensureRelay(url);

      if (relay) {
        this.updateRelayStatus(url, 'connected');
        Logger.info(`RelayManager: Relay ${url} added and connected`);
        return true;
      }
    } catch (error) {
      Logger.error(`RelayManager: Failed to connect to new relay ${url}`, error);
      this.updateRelayStatus(url, 'error', error.message);
    }

    return true;
  }

  /**
   * Eliminar un relay
   * @param {string} url - URL del relay
   * @returns {boolean} True si se eliminó
   */
  async removeRelay(url) {
    const index = this.relayUrls.indexOf(url);

    if (index === -1) {
      Logger.warn(`RelayManager: Relay not found: ${url}`);
      return false;
    }

    Logger.info(`RelayManager: Removing relay: ${url}`);

    // Eliminar de lista
    this.relayUrls.splice(index, 1);

    // Eliminar status
    this.relayStatus.delete(url);

    // Guardar en storage
    Storage.saveRelays(this.relayUrls);

    // Cerrar conexión
    try {
      this.pool.close([url]);
    } catch (error) {
      Logger.error(`RelayManager: Error closing relay ${url}`, error);
    }

    Logger.info(`RelayManager: Relay ${url} removed`);

    this.updateUIStatus();

    return true;
  }

  /**
   * Desconectar de todos los relays
   */
  disconnect() {
    Logger.info('RelayManager: Disconnecting from all relays...');

    // Cancelar todas las suscripciones
    this.unsubscribeAll();

    // Cerrar el pool
    if (this.pool) {
      try {
        this.pool.close(this.relayUrls);
      } catch (error) {
        Logger.error('RelayManager: Error closing pool', error);
      }
    }

    // Resetear estados
    this.relayStatus.forEach((status, url) => {
      this.updateRelayStatus(url, 'disconnected');
    });

    this.updateUIStatus();

    Logger.info('RelayManager: Disconnected from all relays');
  }

  /**
   * Verificar si hay conexión a al menos un relay
   * @returns {boolean} True si hay conexión
   */
  isConnected() {
    return this.getConnectedRelays().length > 0;
  }

  /**
   * Obtener número de relays conectados
   * @returns {number} Número de relays conectados
   */
  getRelayCount() {
    return this.relayUrls.length;
  }

  /**
   * Obtener número de conexiones activas
   * @returns {number} Número de relays conectados
   */
  getConnectedCount() {
    return this.getConnectedRelays().length;
  }

  /**
   * Obtener número de suscripciones activas
   * @returns {number} Número de suscripciones
   */
  getSubscriptionCount() {
    return this.subscriptions.size;
  }

  /**
   * Obtener estado completo del manager
   * @returns {Object} Estado completo
   */
  getState() {
    const relays = Array.from(this.relayStatus.entries()).map(([url, status]) => ({
      url,
      ...status
    }));

    const subscriptions = Array.from(this.subscriptions.entries()).map(([subId, sub]) => ({
      subId,
      filters: sub.filters,
      createdAt: sub.createdAt
    }));

    return {
      isInitialized: this.isInitialized,
      relayCount: this.relayUrls.length,
      connectedCount: this.getConnectedCount(),
      subscriptionCount: this.subscriptions.size,
      relays,
      subscriptions,
      stats: this.stats
    };
  }

  /**
   * Obtener información resumida para display
   * @returns {Object} Resumen
   */
  getSummary() {
    return {
      relays: this.relayUrls.length,
      connected: this.getConnectedCount(),
      subscriptions: this.subscriptions.size,
      eventsReceived: this.stats.eventsReceived,
      eventsPublished: this.stats.eventsPublished,
      errors: this.stats.errors
    };
  }

  /**
   * Limpiar y resetear el manager
   */
  cleanup() {
    Logger.info('RelayManager: Cleaning up...');

    // Desconectar
    this.disconnect();

    // Limpiar referencias
    this.pool = null;
    this.relayUrls = [];
    this.relayStatus.clear();
    this.subscriptions.clear();
    this.isInitialized = false;

    // Resetear stats
    this.stats = {
      eventsReceived: 0,
      eventsPublished: 0,
      subscriptionsCreated: 0,
      connectionAttempts: 0,
      errors: 0
    };

    Logger.info('RelayManager: Cleaned up');
  }
}

// Crear instancia singleton
const instance = new RelayManager();

// Exportar como default
export default instance;
