/**
 * Storage Module
 * Wrapper para LocalStorage con funcionalidades adicionales
 */

import { STORAGE_KEYS, DEFAULT_SETTINGS } from '../utils/constants.js';
import Logger from '../utils/logger.js';

/**
 * Storage Manager
 */
export const Storage = {
  /**
   * Guardar dato en LocalStorage
   */
  set(key, value) {
    try {
      const serialized = JSON.stringify(value);
      localStorage.setItem(key, serialized);
      Logger.debug(`Storage: Saved ${key}`);
      return true;
    } catch (error) {
      Logger.error(`Storage: Error saving ${key}`, error);
      return false;
    }
  },

  /**
   * Obtener dato de LocalStorage
   */
  get(key, defaultValue = null) {
    try {
      const item = localStorage.getItem(key);
      if (item === null) {
        return defaultValue;
      }
      return JSON.parse(item);
    } catch (error) {
      Logger.error(`Storage: Error reading ${key}`, error);
      return defaultValue;
    }
  },

  /**
   * Eliminar dato de LocalStorage
   */
  remove(key) {
    try {
      localStorage.removeItem(key);
      Logger.debug(`Storage: Removed ${key}`);
      return true;
    } catch (error) {
      Logger.error(`Storage: Error removing ${key}`, error);
      return false;
    }
  },

  /**
   * Limpiar todo el LocalStorage
   */
  clear() {
    try {
      localStorage.clear();
      Logger.info('Storage: Cleared all data');
      return true;
    } catch (error) {
      Logger.error('Storage: Error clearing data', error);
      return false;
    }
  },

  /**
   * Verificar si una key existe
   */
  has(key) {
    return localStorage.getItem(key) !== null;
  },

  /**
   * Obtener todas las keys
   */
  keys() {
    return Object.keys(localStorage);
  },

  /**
   * Obtener tamaño usado en bytes (aproximado)
   */
  size() {
    let total = 0;
    for (let key in localStorage) {
      if (localStorage.hasOwnProperty(key)) {
        total += localStorage[key].length + key.length;
      }
    }
    return total;
  },

  // ===== Métodos específicos de la app =====

  /**
   * Guardar settings
   */
  saveSettings(settings) {
    const current = this.getSettings();
    const merged = { ...current, ...settings };
    return this.set(STORAGE_KEYS.SETTINGS, merged);
  },

  /**
   * Obtener settings
   */
  getSettings() {
    return this.get(STORAGE_KEYS.SETTINGS, DEFAULT_SETTINGS);
  },

  /**
   * Guardar historial de comandos
   */
  saveCommandHistory(commands) {
    const settings = this.getSettings();
    const maxSize = settings.commandHistorySize || 100;
    const trimmed = commands.slice(-maxSize);
    return this.set(STORAGE_KEYS.COMMAND_HISTORY, trimmed);
  },

  /**
   * Obtener historial de comandos
   */
  getCommandHistory() {
    return this.get(STORAGE_KEYS.COMMAND_HISTORY, []);
  },

  /**
   * Añadir comando al historial
   */
  addToCommandHistory(command) {
    const history = this.getCommandHistory();
    // No agregar duplicados consecutivos
    if (history[history.length - 1] !== command) {
      history.push(command);
    }
    return this.saveCommandHistory(history);
  },

  /**
   * Guardar relays configurados
   */
  saveRelays(relays) {
    return this.set(STORAGE_KEYS.RELAYS, relays);
  },

  /**
   * Obtener relays configurados
   */
  getRelays() {
    return this.get(STORAGE_KEYS.RELAYS, null);
  },

  /**
   * Guardar trade index
   */
  saveTradeIndex(index) {
    return this.set(STORAGE_KEYS.TRADE_INDEX, index);
  },

  /**
   * Obtener trade index
   */
  getTradeIndex() {
    return this.get(STORAGE_KEYS.TRADE_INDEX, 0);
  },

  /**
   * Incrementar trade index
   */
  incrementTradeIndex() {
    const current = this.getTradeIndex();
    const next = current + 1;
    this.saveTradeIndex(next);
    return next;
  },

  /**
   * Guardar identity key (encriptada)
   * NOTA: En Fase 2 se implementará encriptación con password
   */
  saveIdentityKey(encryptedKey) {
    Logger.warn('Storage: Saving identity key (encryption not yet implemented)');
    return this.set(STORAGE_KEYS.IDENTITY_KEY, encryptedKey);
  },

  /**
   * Obtener identity key (encriptada)
   */
  getIdentityKey() {
    return this.get(STORAGE_KEYS.IDENTITY_KEY, null);
  },

  /**
   * Eliminar identity key
   */
  removeIdentityKey() {
    return this.remove(STORAGE_KEYS.IDENTITY_KEY);
  },

  /**
   * Guardar trade key
   */
  saveTradeKey(publicKey) {
    return this.set(STORAGE_KEYS.TRADE_KEY, publicKey);
  },

  /**
   * Obtener trade key
   */
  getTradeKey() {
    return this.get(STORAGE_KEYS.TRADE_KEY, null);
  },

  /**
   * Guardar órdenes cacheadas
   */
  saveOrders(orders) {
    return this.set(STORAGE_KEYS.ORDERS, orders);
  },

  /**
   * Obtener órdenes cacheadas
   */
  getOrders() {
    return this.get(STORAGE_KEYS.ORDERS, []);
  },

  /**
   * Limpiar solo datos de usuario (mantener settings)
   */
  clearUserData() {
    this.removeIdentityKey();
    this.remove(STORAGE_KEYS.TRADE_KEY);
    this.remove(STORAGE_KEYS.TRADE_INDEX);
    this.remove(STORAGE_KEYS.ORDERS);
    Logger.info('Storage: Cleared user data');
    return true;
  },

  /**
   * Exportar todos los datos como JSON
   */
  export() {
    const data = {};
    for (let key in localStorage) {
      if (localStorage.hasOwnProperty(key)) {
        try {
          data[key] = JSON.parse(localStorage[key]);
        } catch (e) {
          data[key] = localStorage[key];
        }
      }
    }
    return data;
  },

  /**
   * Importar datos desde JSON
   */
  import(data) {
    try {
      for (let key in data) {
        if (data.hasOwnProperty(key)) {
          this.set(key, data[key]);
        }
      }
      Logger.info('Storage: Imported data successfully');
      return true;
    } catch (error) {
      Logger.error('Storage: Error importing data', error);
      return false;
    }
  },

  /**
   * Obtener información de uso del storage
   */
  getInfo() {
    return {
      keys: this.keys().length,
      size: this.size(),
      sizeFormatted: `${(this.size() / 1024).toFixed(2)} KB`,
      hasIdentityKey: this.has(STORAGE_KEYS.IDENTITY_KEY),
      hasTradeKey: this.has(STORAGE_KEYS.TRADE_KEY),
      tradeIndex: this.getTradeIndex(),
      commandHistorySize: this.getCommandHistory().length,
      ordersCount: this.getOrders().length
    };
  }
};

// Exportar como default también
export default Storage;
