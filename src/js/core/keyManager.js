/**
 * Key Manager
 * Gestión de identidades Nostr con encriptación AES-256
 *
 * Funcionalidades:
 * - Generación de claves secp256k1
 * - Importación/Exportación de claves
 * - Encriptación AES-256 con PBKDF2
 * - Gestión de trade keys derivadas
 * - Almacenamiento seguro en localStorage
 */

import Storage from './storage.js';
import Logger from '../utils/logger.js';
import {
  PATTERNS,
  ERROR_MESSAGES,
  SUCCESS_MESSAGES,
  CRYPTO_CONFIG
} from '../utils/constants.js';

// Referencias a librerías externas
let nostrTools = null;
let nip19 = null;

// Estado interno del KeyManager
const state = {
  hasPassword: false,           // ¿Password configurado?
  isUnlocked: false,            // ¿Clave desencriptada en memoria?
  identityPublicKey: null,      // Public key hex en memoria
  identityPrivateKey: null,     // Private key Uint8Array en memoria (temporal)
  currentTradeKey: null,        // Trade key actual { secretKey, publicKey, index }
  tradeIndex: 0,                // Índice de trade actual
  encryptionSalt: null          // Salt para PBKDF2
};

// ============================================
// INICIALIZACIÓN
// ============================================

/**
 * Inicializar nostr-tools desde window global
 */
async function initNostrTools() {
  if (nostrTools) return; // Ya inicializado

  if (!window.nostrTools) {
    throw new Error(ERROR_MESSAGES.NOSTR_NOT_LOADED);
  }

  nostrTools = window.nostrTools;
  nip19 = nostrTools.nip19;

  Logger.debug('KeyManager: nostr-tools initialized');
}

/**
 * Inicializar KeyManager cargando estado desde storage
 */
async function init() {
  Logger.info('KeyManager: Initializing...');

  try {
    await initNostrTools();

    // Verificar si existe identidad guardada
    const identityData = Storage.getIdentityKey();

    if (identityData) {
      state.hasPassword = true;
      state.encryptionSalt = identityData.salt;
      state.identityPublicKey = identityData.publicKeyHex;
      Logger.info('KeyManager: Identity found in storage (locked)');
    } else {
      Logger.info('KeyManager: No identity found');
    }

    // Cargar trade index
    state.tradeIndex = Storage.getTradeIndex() || 0;

    Logger.info('KeyManager: Initialized successfully');
  } catch (error) {
    Logger.error('KeyManager: Initialization error', error);
    throw error;
  }
}

// ============================================
// FUNCIONES DE ENCRIPTACIÓN
// ============================================

/**
 * Generar salt aleatorio
 * @param {number} length - Longitud en bytes (default: 16)
 * @returns {string} Salt en formato hex
 */
function generateSalt(length = CRYPTO_CONFIG.SALT_LENGTH) {
  const randomBytes = new Uint8Array(length);
  crypto.getRandomValues(randomBytes);

  return Array.from(randomBytes)
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');
}

/**
 * Derivar encryption key desde password usando PBKDF2
 * @param {string} password - Password del usuario
 * @param {string} saltHex - Salt en formato hex
 * @returns {WordArray} Clave de encriptación
 */
function deriveEncryptionKey(password, saltHex) {
  const salt = CryptoJS.enc.Hex.parse(saltHex);

  const key = CryptoJS.PBKDF2(password, salt, {
    keySize: CRYPTO_CONFIG.KEY_SIZE / 32,        // 256 bits = 8 words
    iterations: CRYPTO_CONFIG.PBKDF2_ITERATIONS,
    hasher: CryptoJS.algo.SHA256
  });

  return key;
}

/**
 * Encriptar private key con AES-256
 * @param {Uint8Array} privateKeyBytes - Clave privada
 * @param {string} password - Password del usuario
 * @param {string} saltHex - Salt en formato hex
 * @returns {string} Ciphertext encriptado
 */
function encryptPrivateKey(privateKeyBytes, password, saltHex) {
  const encryptionKey = deriveEncryptionKey(password, saltHex);

  // Convertir private key a hex string
  const privateKeyHex = Array.from(privateKeyBytes)
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');

  // Encriptar con AES-256-CBC
  const ciphertext = CryptoJS.AES.encrypt(
    privateKeyHex,
    encryptionKey,
    {
      mode: CryptoJS.mode.CBC,
      padding: CryptoJS.pad.Pkcs7
    }
  );

  return ciphertext.toString();
}

/**
 * Desencriptar private key desde ciphertext
 * @param {string} ciphertext - Texto encriptado
 * @param {string} password - Password del usuario
 * @param {string} saltHex - Salt en formato hex
 * @returns {Uint8Array} Private key desencriptada
 * @throws {Error} Si el password es incorrecto
 */
function decryptPrivateKey(ciphertext, password, saltHex) {
  const encryptionKey = deriveEncryptionKey(password, saltHex);

  // Desencriptar
  const decrypted = CryptoJS.AES.decrypt(
    ciphertext,
    encryptionKey,
    {
      mode: CryptoJS.mode.CBC,
      padding: CryptoJS.pad.Pkcs7
    }
  );

  // Convertir a hex string
  const privateKeyHex = decrypted.toString(CryptoJS.enc.Utf8);

  if (!privateKeyHex || privateKeyHex.length !== 64) {
    throw new Error(ERROR_MESSAGES.DECRYPTION_FAILED);
  }

  // Convertir hex a Uint8Array
  const privateKeyBytes = new Uint8Array(
    privateKeyHex.match(/.{2}/g).map(byte => parseInt(byte, 16))
  );

  return privateKeyBytes;
}

// ============================================
// GENERACIÓN E IMPORTACIÓN DE CLAVES
// ============================================

/**
 * Generar nueva identidad Nostr
 * @returns {Object} { secretKey: Uint8Array, publicKey: string }
 */
async function generateNewIdentity() {
  await initNostrTools();

  Logger.info('KeyManager: Generating new identity...');

  // Generar clave privada (32 bytes aleatorios)
  const secretKey = nostrTools.generateSecretKey();

  // Derivar clave pública
  const publicKey = nostrTools.getPublicKey(secretKey);

  // Guardar en estado (antes de encriptar)
  state.identityPrivateKey = secretKey;
  state.identityPublicKey = publicKey;
  state.isUnlocked = true;

  Logger.info('KeyManager: New identity generated');
  Logger.debug(`Public key: ${getPublicKey('npub').substring(0, 20)}...`);

  return {
    secretKey,
    publicKey
  };
}

/**
 * Importar clave privada existente
 * @param {string} keyInput - nsec o hex
 * @returns {Object} { secretKey: Uint8Array, publicKey: string }
 * @throws {Error} Si el formato es inválido
 */
async function importPrivateKey(keyInput) {
  await initNostrTools();

  Logger.info('KeyManager: Importing private key...');

  let secretKey;

  // Detectar formato
  if (PATTERNS.NSEC.test(keyInput)) {
    // Decodificar nsec
    const decoded = nip19.decode(keyInput);
    if (decoded.type !== 'nsec') {
      throw new Error(ERROR_MESSAGES.INVALID_KEY_FORMAT);
    }
    secretKey = decoded.data;

  } else if (PATTERNS.HEX_KEY.test(keyInput)) {
    // Hex format
    secretKey = new Uint8Array(
      keyInput.match(/.{2}/g).map(byte => parseInt(byte, 16))
    );

  } else {
    throw new Error(ERROR_MESSAGES.INVALID_KEY_FORMAT);
  }

  // Validar que sea válida
  if (!(secretKey instanceof Uint8Array) || secretKey.length !== 32) {
    throw new Error(ERROR_MESSAGES.INVALID_KEY_FORMAT);
  }

  // Derivar clave pública
  const publicKey = nostrTools.getPublicKey(secretKey);

  // Guardar en estado
  state.identityPrivateKey = secretKey;
  state.identityPublicKey = publicKey;
  state.isUnlocked = true;

  Logger.info('KeyManager: Private key imported successfully');

  return {
    secretKey,
    publicKey
  };
}

/**
 * Exportar clave privada
 * @param {string} format - 'nsec' o 'hex'
 * @returns {string} Clave privada en el formato solicitado
 * @throws {Error} Si la sesión está bloqueada
 */
function exportPrivateKey(format = 'nsec') {
  if (!state.isUnlocked) {
    throw new Error(ERROR_MESSAGES.KEY_LOCKED);
  }

  if (!state.identityPrivateKey) {
    throw new Error(ERROR_MESSAGES.NO_PRIVATE_KEY);
  }

  if (format === 'nsec') {
    return nip19.nsecEncode(state.identityPrivateKey);
  } else if (format === 'hex') {
    return Array.from(state.identityPrivateKey)
      .map(b => b.toString(16).padStart(2, '0'))
      .join('');
  } else {
    throw new Error('Invalid format. Use "nsec" or "hex".');
  }
}

/**
 * Obtener clave pública
 * @param {string} format - 'npub' o 'hex'
 * @returns {string} Clave pública en el formato solicitado
 */
function getPublicKey(format = 'npub') {
  if (!state.identityPublicKey) {
    throw new Error(ERROR_MESSAGES.NO_PRIVATE_KEY);
  }

  if (format === 'npub') {
    return nip19.npubEncode(state.identityPublicKey);
  } else if (format === 'hex') {
    return state.identityPublicKey;
  } else {
    throw new Error('Invalid format. Use "npub" or "hex".');
  }
}

// ============================================
// PASSWORD MANAGEMENT
// ============================================

/**
 * Configurar password y encriptar clave privada
 * @param {string} password - Password del usuario
 * @throws {Error} Si no hay clave para encriptar o password muy corto
 */
async function setPassword(password) {
  if (!state.identityPrivateKey) {
    throw new Error('No identity key to encrypt');
  }

  // Validar password
  if (!password || password.length < CRYPTO_CONFIG.MIN_PASSWORD_LENGTH) {
    throw new Error(ERROR_MESSAGES.PASSWORD_TOO_SHORT);
  }

  Logger.info('KeyManager: Setting password and encrypting key...');

  // Generar salt aleatorio
  const salt = generateSalt();

  // Encriptar private key
  const encryptedPrivateKey = encryptPrivateKey(
    state.identityPrivateKey,
    password,
    salt
  );

  // Guardar en localStorage
  const identityData = {
    encryptedPrivateKey,
    publicKey: nip19.npubEncode(state.identityPublicKey),
    publicKeyHex: state.identityPublicKey,
    salt,
    createdAt: Date.now(),
    version: 1  // Versión del formato de encriptación
  };

  Storage.saveIdentityKey(identityData);

  // Actualizar estado
  state.hasPassword = true;
  state.encryptionSalt = salt;

  Logger.info('KeyManager: Password set and key encrypted');
}

/**
 * Desbloquear claves con password
 * @param {string} password - Password del usuario
 * @throws {Error} Si el password es incorrecto
 */
async function unlockKeys(password) {
  Logger.info('KeyManager: Unlocking keys...');

  // Cargar datos desde storage
  const identityData = Storage.getIdentityKey();

  if (!identityData) {
    throw new Error(ERROR_MESSAGES.NO_IDENTITY_FOUND);
  }

  try {
    await initNostrTools();

    // Desencriptar private key
    const privateKeyBytes = decryptPrivateKey(
      identityData.encryptedPrivateKey,
      password,
      identityData.salt
    );

    // Validar que la clave sea correcta
    const derivedPublicKey = nostrTools.getPublicKey(privateKeyBytes);

    if (derivedPublicKey !== identityData.publicKeyHex) {
      throw new Error(ERROR_MESSAGES.WRONG_PASSWORD);
    }

    // Guardar en memoria
    state.identityPrivateKey = privateKeyBytes;
    state.identityPublicKey = derivedPublicKey;
    state.isUnlocked = true;
    state.hasPassword = true;
    state.encryptionSalt = identityData.salt;

    // Cargar trade index
    state.tradeIndex = Storage.getTradeIndex() || 0;

    Logger.info('KeyManager: Keys unlocked successfully');

  } catch (error) {
    Logger.error('KeyManager: Failed to unlock keys', error);

    if (error.message === ERROR_MESSAGES.DECRYPTION_FAILED) {
      throw new Error(ERROR_MESSAGES.WRONG_PASSWORD);
    }

    throw error;
  }
}

/**
 * Bloquear claves (limpiar memoria)
 */
function lockKeys() {
  Logger.info('KeyManager: Locking keys...');

  // Sobrescribir datos sensibles
  if (state.identityPrivateKey) {
    state.identityPrivateKey.fill(0);
    state.identityPrivateKey = null;
  }

  if (state.currentTradeKey && state.currentTradeKey.secretKey) {
    state.currentTradeKey.secretKey.fill(0);
    state.currentTradeKey = null;
  }

  state.isUnlocked = false;

  Logger.info('KeyManager: Keys locked and cleared from memory');
}

/**
 * Cambiar password de encriptación
 * @param {string} oldPassword - Password actual
 * @param {string} newPassword - Password nuevo
 * @throws {Error} Si no está unlocked o password incorrecto
 */
async function changePassword(oldPassword, newPassword) {
  if (!state.isUnlocked) {
    throw new Error(ERROR_MESSAGES.KEY_LOCKED);
  }

  // Validar nuevo password
  if (!newPassword || newPassword.length < CRYPTO_CONFIG.MIN_PASSWORD_LENGTH) {
    throw new Error(ERROR_MESSAGES.PASSWORD_TOO_SHORT);
  }

  Logger.info('KeyManager: Changing password...');

  // Verificar old password
  const identityData = Storage.getIdentityKey();

  try {
    const privateKeyBytes = decryptPrivateKey(
      identityData.encryptedPrivateKey,
      oldPassword,
      identityData.salt
    );

    // Comparar bytes
    const currentKeyHex = Array.from(state.identityPrivateKey)
      .map(b => b.toString(16).padStart(2, '0'))
      .join('');
    const decryptedKeyHex = Array.from(privateKeyBytes)
      .map(b => b.toString(16).padStart(2, '0'))
      .join('');

    if (currentKeyHex !== decryptedKeyHex) {
      throw new Error(ERROR_MESSAGES.WRONG_PASSWORD);
    }

  } catch (error) {
    throw new Error(ERROR_MESSAGES.WRONG_PASSWORD);
  }

  // Generar nuevo salt
  const newSalt = generateSalt();

  // Re-encriptar con nuevo password
  const encryptedPrivateKey = encryptPrivateKey(
    state.identityPrivateKey,
    newPassword,
    newSalt
  );

  // Guardar en localStorage
  const newIdentityData = {
    ...identityData,
    encryptedPrivateKey,
    salt: newSalt,
    updatedAt: Date.now()
  };

  Storage.saveIdentityKey(newIdentityData);

  // Actualizar estado
  state.encryptionSalt = newSalt;

  Logger.info('KeyManager: Password changed successfully');
}

// ============================================
// TRADE KEYS
// ============================================

/**
 * Generar trade key derivada desde identity key + índice
 * @param {number} tradeIndex - Índice del trade
 * @returns {Object} { publicKey: string, index: number }
 * @throws {Error} Si la sesión está bloqueada
 */
function generateTradeKey(tradeIndex) {
  if (!state.isUnlocked) {
    throw new Error(ERROR_MESSAGES.KEY_LOCKED);
  }

  Logger.debug(`KeyManager: Generating trade key for index ${tradeIndex}...`);

  const message = `mostro_trade_${tradeIndex}`;

  // HMAC-SHA256
  const hmac = CryptoJS.HmacSHA256(
    message,
    CryptoJS.lib.WordArray.create(state.identityPrivateKey)
  );

  // Convertir a Uint8Array(32)
  const bytes = [];
  for (let i = 0; i < 8; i++) {
    const word = hmac.words[i];
    bytes.push((word >>> 24) & 0xff);
    bytes.push((word >>> 16) & 0xff);
    bytes.push((word >>> 8) & 0xff);
    bytes.push(word & 0xff);
  }

  const tradeSecretKey = new Uint8Array(bytes);
  const tradePublicKey = nostrTools.getPublicKey(tradeSecretKey);

  // Guardar en estado
  state.currentTradeKey = {
    secretKey: tradeSecretKey,
    publicKey: tradePublicKey,
    index: tradeIndex
  };

  // Guardar en storage
  Storage.saveTradeKey({
    publicKey: nip19.npubEncode(tradePublicKey),
    publicKeyHex: tradePublicKey,
    index: tradeIndex,
    createdAt: Date.now()
  });

  Logger.info(`KeyManager: Trade key generated for index ${tradeIndex}`);

  return {
    publicKey: tradePublicKey,
    index: tradeIndex
  };
}

/**
 * Obtener trade key actual
 * @returns {Object|null} Trade key actual
 */
function getCurrentTradeKey() {
  return state.currentTradeKey;
}

/**
 * Iniciar nuevo trade (incrementar índice y generar nueva trade key)
 * @returns {Object} { publicKey: string, index: number }
 */
function startNewTrade() {
  if (!state.isUnlocked) {
    throw new Error(ERROR_MESSAGES.KEY_LOCKED);
  }

  // Incrementar índice
  const newIndex = state.tradeIndex + 1;
  state.tradeIndex = newIndex;

  // Guardar índice en storage
  Storage.saveTradeIndex(newIndex);

  // Generar trade key
  return generateTradeKey(newIndex);
}

/**
 * Restaurar trade key desde índice específico
 * @param {number} index - Índice del trade
 * @returns {Object} { publicKey: string, index: number }
 */
function restoreTradeFromIndex(index) {
  if (!state.isUnlocked) {
    throw new Error(ERROR_MESSAGES.KEY_LOCKED);
  }

  Logger.info(`KeyManager: Restoring trade from index ${index}`);

  return generateTradeKey(index);
}

// ============================================
// QUERIES Y ESTADO
// ============================================

/**
 * Verificar si existe identidad guardada
 * @returns {boolean}
 */
function hasIdentity() {
  const identityData = Storage.getIdentityKey();
  return identityData !== null;
}

/**
 * Verificar si la sesión está desbloqueada
 * @returns {boolean}
 */
function isUnlocked() {
  return state.isUnlocked;
}

/**
 * Obtener trade index actual
 * @returns {number}
 */
function getTradeIndex() {
  return state.tradeIndex;
}

/**
 * Eliminar identidad completamente
 * @throws {Error} Si la sesión no está desbloqueada
 */
function deleteIdentity() {
  if (!state.isUnlocked) {
    throw new Error(ERROR_MESSAGES.KEY_LOCKED);
  }

  Logger.warn('KeyManager: Deleting identity...');

  // Limpiar storage
  Storage.removeIdentityKey();
  Storage.remove('mostro_trade_key');
  Storage.saveTradeIndex(0);

  // Limpiar estado
  lockKeys();
  state.hasPassword = false;
  state.identityPublicKey = null;
  state.encryptionSalt = null;
  state.tradeIndex = 0;

  Logger.info('KeyManager: Identity deleted');
}

/**
 * Limpiar datos sensibles de memoria
 */
function clearMemory() {
  lockKeys();
}

/**
 * Obtener estado actual del KeyManager (para debugging)
 * @returns {Object}
 */
function getState() {
  return {
    hasPassword: state.hasPassword,
    isUnlocked: state.isUnlocked,
    hasPublicKey: state.identityPublicKey !== null,
    tradeIndex: state.tradeIndex,
    hasCurrentTradeKey: state.currentTradeKey !== null
  };
}

// ============================================
// VALIDACIÓN
// ============================================

/**
 * Validar formato de private key
 * @param {string} key - Clave a validar
 * @returns {Object} { valid: boolean, format?: string, error?: string }
 */
function validatePrivateKey(key) {
  if (PATTERNS.NSEC.test(key)) {
    return { valid: true, format: 'nsec' };
  }
  if (PATTERNS.HEX_KEY.test(key)) {
    return { valid: true, format: 'hex' };
  }
  return { valid: false, error: ERROR_MESSAGES.INVALID_KEY_FORMAT };
}

/**
 * Validar formato de public key
 * @param {string} key - Clave a validar
 * @returns {Object} { valid: boolean, format?: string, error?: string }
 */
function validatePublicKey(key) {
  if (PATTERNS.NPUB.test(key)) {
    return { valid: true, format: 'npub' };
  }
  if (PATTERNS.HEX_KEY.test(key)) {
    return { valid: true, format: 'hex' };
  }
  return { valid: false, error: 'Invalid public key format' };
}

// ============================================
// EXPORTAR API PÚBLICA
// ============================================

export const KeyManager = {
  // Inicialización
  init,

  // Generación e importación
  generateNewIdentity,
  importPrivateKey,
  exportPrivateKey,
  getPublicKey,

  // Password management
  setPassword,
  unlockKeys,
  lockKeys,
  changePassword,

  // Trade keys
  generateTradeKey,
  getCurrentTradeKey,
  startNewTrade,
  restoreTradeFromIndex,
  getTradeIndex,

  // Queries
  hasIdentity,
  isUnlocked,
  deleteIdentity,
  clearMemory,
  getState,

  // Validación
  validatePrivateKey,
  validatePublicKey
};

export default KeyManager;
