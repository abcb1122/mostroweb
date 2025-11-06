# KEYMANAGER.JS - ANÁLISIS TÉCNICO E IMPLEMENTACIÓN
## Issue #2: Sprint 1 - Implementar Frontend para Mostros Existentes

---

## 📋 TABLA DE CONTENIDOS

1. [Resumen Ejecutivo](#1-resumen-ejecutivo)
2. [Funciones Específicas del KeyManager](#2-funciones-específicas-del-keymanager)
3. [Integración con Arquitectura Existente](#3-integración-con-arquitectura-existente)
4. [Implementación de nostr-tools](#4-implementación-de-nostr-tools)
5. [Sistema de Encriptación AES-256](#5-sistema-de-encriptación-aes-256)
6. [Comandos de Terminal](#6-comandos-de-terminal)
7. [Plan de Implementación Paso a Paso](#7-plan-de-implementación-paso-a-paso)
8. [Casos de Prueba](#8-casos-de-prueba)
9. [Consideraciones de Seguridad](#9-consideraciones-de-seguridad)
10. [Archivos a Modificar/Crear](#10-archivos-a-modificarcrear)

---

## 1. RESUMEN EJECUTIVO

### Objetivo
Implementar `js/core/keyManager.js` para gestionar identidades Nostr con almacenamiento seguro mediante encriptación AES-256, cumpliendo los requerimientos del Issue #2.

### Alcance
- ✅ Generación de claves secp256k1 (nostr-tools)
- ✅ Importación de claves (nsec/hex)
- ✅ Encriptación AES-256 con password
- ✅ Derivación de claves con PBKDF2
- ✅ Gestión de trade keys por sesión
- ✅ Integración con LocalStorage existente
- ✅ Comandos de terminal para usuarios

### Dependencias Disponibles
```javascript
// Ya cargadas desde CDN:
window.nostrTools        // nostr-tools v2.5.2
window.CryptoJS          // crypto-js v4.2.0
window.uuid              // uuid v10.0.0

// Módulos existentes:
Storage                  // js/core/storage.js
constants.js             // Patrones de validación
helpers.js               // Utilidades
Logger                   // Sistema de logs
```

---

## 2. FUNCIONES ESPECÍFICAS DEL KEYMANAGER

### 2.1 Estructura del Módulo

```javascript
// js/core/keyManager.js

export const KeyManager = {
  // === Estado Interno ===
  state: {
    hasPassword: false,           // ¿Password configurado?
    isUnlocked: false,            // ¿Clave desencriptada en memoria?
    identityPublicKey: null,      // npub/hex en memoria
    identityPrivateKey: null,     // nsec/hex en memoria (temporal)
    currentTradeKey: null,        // Trade key actual
    tradeIndex: 0,                // Índice de trade actual
    encryptionSalt: null          // Salt para PBKDF2
  },

  // === Inicialización ===
  init(),                         // Cargar estado desde storage

  // === Generación de Claves ===
  generateNewIdentity(),          // Generar nuevo par de claves
  generateTradeKey(index),        // Generar trade key derivada

  // === Importación/Exportación ===
  importPrivateKey(nsecOrHex),    // Importar clave existente
  exportPrivateKey(format),       // Exportar nsec o hex
  exportPublicKey(format),        // Exportar npub o hex

  // === Encriptación ===
  setPassword(password),          // Configurar password inicial
  changePassword(oldPass, newPass), // Cambiar password
  unlockKeys(password),           // Desencriptar claves a memoria
  lockKeys(),                     // Limpiar claves de memoria

  // === Validación ===
  validatePrivateKey(key),        // Validar formato nsec/hex
  validatePublicKey(key),         // Validar formato npub/hex

  // === Estado y Queries ===
  hasIdentity(),                  // ¿Existe clave guardada?
  isUnlocked(),                   // ¿Clave en memoria?
  getPublicKey(format),           // Obtener pubkey (npub/hex)
  getCurrentTradeKey(),           // Obtener trade key actual
  getTradeIndex(),                // Obtener índice actual

  // === Trade Session Management ===
  startNewTrade(),                // Incrementar índice + nueva trade key
  restoreTradeFromIndex(index),   // Regenerar trade key desde índice

  // === Limpieza ===
  deleteIdentity(),               // Eliminar todo (con confirmación)
  clearMemory()                   // Limpiar datos sensibles de memoria
};
```

### 2.2 Flujos de Usuario Principales

#### Flujo 1: Primera Vez (Generar Nueva Identidad)
```
1. Usuario: /start
2. KeyManager: No hay password → pedir password
3. Usuario: ingresa password
4. KeyManager:
   - Generar par de claves secp256k1
   - Generar salt aleatorio
   - Derivar encryption key desde password (PBKDF2)
   - Encriptar private key con AES-256
   - Guardar en localStorage: { encryptedPrivateKey, publicKey, salt }
5. Display: Mostrar npub generado + advertencia de backup
```

#### Flujo 2: Usuario Existente (Importar Clave)
```
1. Usuario: /import
2. KeyManager: Pedir nsec o hex
3. Usuario: pega nsec1...
4. KeyManager: Validar formato
5. KeyManager: Pedir password
6. Usuario: ingresa password
7. KeyManager:
   - Validar clave con nostr-tools
   - Generar salt
   - Encriptar con AES-256
   - Guardar en localStorage
8. Display: Confirmación + npub
```

#### Flujo 3: Unlock para Usar (Cada Sesión)
```
1. Usuario: /start
2. KeyManager: Detecta clave guardada → pedir password
3. Usuario: ingresa password
4. KeyManager:
   - Cargar salt desde storage
   - Derivar encryption key con PBKDF2
   - Desencriptar private key
   - Guardar en memoria (state.identityPrivateKey)
   - Marcar state.isUnlocked = true
5. Display: ✓ Sesión iniciada - Listo para operar
```

#### Flujo 4: Crear Trade Key
```
1. Usuario: /newsell o /newbuy
2. KeyManager:
   - Verificar isUnlocked === true
   - Obtener tradeIndex desde storage
   - Generar trade key: derivada de identity key + index
   - Guardar trade key en memoria
   - Incrementar tradeIndex en storage
3. Return: { tradePublicKey, tradeIndex }
4. Usar para firmar evento Mostro
```

---

## 3. INTEGRACIÓN CON ARQUITECTURA EXISTENTE

### 3.1 Integración con storage.js

**storage.js YA TIENE métodos preparados**:
```javascript
// Métodos existentes en storage.js que usaremos:
Storage.saveIdentityKey(encryptedData)    // Guardar clave encriptada
Storage.getIdentityKey()                  // Obtener clave encriptada
Storage.removeIdentityKey()               // Eliminar clave

Storage.saveTradeKey(tradeKeyData)        // Guardar trade key
Storage.getTradeKey()                     // Obtener trade key

Storage.saveTradeIndex(index)             // Guardar índice
Storage.getTradeIndex()                   // Obtener índice
Storage.incrementTradeIndex()             // Incrementar índice

Storage.clearUserData()                   // Limpiar todos los datos
```

**Formato de datos a guardar**:
```javascript
// En localStorage['mostro_identity_key']:
{
  encryptedPrivateKey: "U2FsdGVkX1...",  // AES-256 encrypted nsec
  publicKey: "npub1abc...",              // Public key (npub format)
  publicKeyHex: "a1b2c3...",             // Public key (hex format)
  salt: "f4e3d2...",                     // PBKDF2 salt (hex)
  createdAt: 1730217600000,              // Timestamp
  version: 1                             // Formato de encriptación
}

// En localStorage['mostro_trade_index']:
42  // Número simple

// En localStorage['mostro_trade_key']:
{
  publicKey: "npub1xyz...",              // Trade public key
  createdAt: 1730217600000,
  index: 42                              // Índice usado para generarla
}
```

### 3.2 Integración con constants.js

**Usar patrones de validación existentes**:
```javascript
import { PATTERNS } from './utils/constants.js';

// En keyManager.js:
validatePrivateKey(key) {
  if (PATTERNS.NSEC.test(key)) {
    return { valid: true, format: 'nsec' };
  }
  if (PATTERNS.HEX_KEY.test(key)) {
    return { valid: true, format: 'hex' };
  }
  return { valid: false, error: 'Invalid key format' };
}
```

**Usar mensajes de error/éxito**:
```javascript
import { ERROR_MESSAGES, SUCCESS_MESSAGES } from './utils/constants.js';

// En keyManager.js:
if (!this.hasIdentity()) {
  throw new Error(ERROR_MESSAGES.NO_PRIVATE_KEY);
}

Display.success(SUCCESS_MESSAGES.KEY_GENERATED);
```

### 3.3 Integración con commands.js

**Nuevos comandos a agregar**:

| Comando | Handler | Descripción |
|---------|---------|-------------|
| `/start` | `handleStart()` | Inicializar sesión (generar o unlock) |
| `/import` | `handleImport()` | Importar clave existente |
| `/export` | `handleExport()` | Exportar clave privada |
| `/identity` | `handleIdentity()` | Ver información de identidad |
| `/changepass` | `handleChangePassword()` | Cambiar password |
| `/backup` | `handleBackup()` | Mostrar backup de nsec |

**Estructura de cada handler**:
```javascript
// En js/ui/commands.js

async function handleStart(args) {
  try {
    // Verificar si KeyManager ya está inicializado
    const hasIdentity = KeyManager.hasIdentity();

    if (!hasIdentity) {
      // Primera vez: generar nueva identidad
      Display.info('No identity found. Creating new identity...');
      Display.blank();
      Display.dim('Enter a password to encrypt your private key:');

      // TODO: Implementar input de password seguro
      const password = await promptPassword();

      await KeyManager.generateNewIdentity();
      await KeyManager.setPassword(password);

      const npub = KeyManager.getPublicKey('npub');
      Display.success(SUCCESS_MESSAGES.KEY_GENERATED);
      Display.info(`Your Nostr public key (npub):`);
      Display.addLine(npub, 'success');
      Display.blank();
      Display.warning('⚠️  BACKUP YOUR KEY:');
      Display.dim('Use /export to show your private key for backup.');

    } else {
      // Ya existe: unlock
      Display.info('Identity found. Enter your password to unlock:');
      const password = await promptPassword();

      await KeyManager.unlockKeys(password);

      Display.success('✓ Session unlocked successfully');
      const npub = KeyManager.getPublicKey('npub');
      Display.info(`Logged in as: ${npub.substring(0, 20)}...`);
    }

  } catch (error) {
    Logger.error('Start command error:', error);
    Display.error(`Failed to start: ${error.message}`);
  }
}

async function handleImport(args) {
  try {
    Display.info('Import existing Nostr identity');
    Display.dim('Enter your private key (nsec or hex):');

    const privateKey = await promptPrivateKey();

    Display.dim('Enter a password to encrypt this key:');
    const password = await promptPassword();

    await KeyManager.importPrivateKey(privateKey);
    await KeyManager.setPassword(password);

    Display.success(SUCCESS_MESSAGES.KEY_IMPORTED);
    const npub = KeyManager.getPublicKey('npub');
    Display.info(`Your public key: ${npub}`);

  } catch (error) {
    Logger.error('Import command error:', error);
    Display.error(`Import failed: ${error.message}`);
  }
}

async function handleExport(args) {
  try {
    // Verificar que esté unlocked
    if (!KeyManager.isUnlocked()) {
      Display.error('Session locked. Use /start to unlock first.');
      return;
    }

    // Pedir confirmación
    Display.warning('⚠️  WARNING: This will display your PRIVATE KEY');
    Display.dim('Anyone with this key can control your identity.');
    Display.blank();
    Display.dim('Type "I UNDERSTAND" to continue:');

    const confirmation = await promptConfirmation();

    if (confirmation !== 'I UNDERSTAND') {
      Display.info('Export cancelled.');
      return;
    }

    const nsec = KeyManager.exportPrivateKey('nsec');
    const hex = KeyManager.exportPrivateKey('hex');

    Display.blank();
    Display.success('Your private key (nsec format):');
    Display.addLine(nsec, 'warning');
    Display.blank();
    Display.dim('Hex format:');
    Display.addLine(hex, 'dim');
    Display.blank();
    Display.warning('⚠️  Store this in a safe place!');

  } catch (error) {
    Logger.error('Export command error:', error);
    Display.error(`Export failed: ${error.message}`);
  }
}

async function handleIdentity(args) {
  try {
    if (!KeyManager.hasIdentity()) {
      Display.error(ERROR_MESSAGES.NO_PRIVATE_KEY);
      Display.dim('Use /start to create or import an identity.');
      return;
    }

    const npub = KeyManager.getPublicKey('npub');
    const hex = KeyManager.getPublicKey('hex');
    const isUnlocked = KeyManager.isUnlocked();
    const tradeIndex = KeyManager.getTradeIndex();

    Display.info('=== IDENTITY INFO ===');
    Display.blank();
    Display.addLine(`Status: ${isUnlocked ? '🟢 Unlocked' : '🔴 Locked'}`, 'normal');
    Display.blank();
    Display.addLine('Public Key (npub):', 'dim');
    Display.addLine(npub, 'normal');
    Display.blank();
    Display.addLine('Public Key (hex):', 'dim');
    Display.addLine(hex, 'dim');
    Display.blank();
    Display.addLine(`Trade Index: ${tradeIndex}`, 'info');

    if (isUnlocked) {
      const tradeKey = KeyManager.getCurrentTradeKey();
      if (tradeKey) {
        Display.blank();
        Display.addLine('Current Trade Key:', 'dim');
        Display.addLine(tradeKey, 'dim');
      }
    }

  } catch (error) {
    Logger.error('Identity command error:', error);
    Display.error(`Failed to show identity: ${error.message}`);
  }
}
```

### 3.4 Integración con Logger

**Logging seguro (sin exponer claves)**:
```javascript
// NUNCA loggear claves privadas
Logger.debug('Generated new identity');  // ✓ OK
Logger.debug(`Generated key: ${privateKey}`);  // ✗ NUNCA

// Loggear solo datos públicos
Logger.info(`Public key: ${npub}`);  // ✓ OK
Logger.debug(`Trade index incremented to ${index}`);  // ✓ OK

// En producción, sanitizar logs automáticamente
function sanitizeForLog(data) {
  const sensitive = ['privateKey', 'nsec', 'password', 'encryptionKey'];
  const sanitized = { ...data };

  sensitive.forEach(key => {
    if (sanitized[key]) {
      sanitized[key] = '***REDACTED***';
    }
  });

  return sanitized;
}
```

---

## 4. IMPLEMENTACIÓN DE NOSTR-TOOLS

### 4.1 API de nostr-tools Disponible

**Librería cargada desde CDN**:
```javascript
// Disponible globalmente:
window.nostrTools
```

**Funciones relevantes para KeyManager**:

#### Generación de Claves
```javascript
import { generateSecretKey, getPublicKey } from 'nostr-tools/pure';

// Generar clave privada (32 bytes Uint8Array)
const secretKey = generateSecretKey();
// Output: Uint8Array(32) [45, 123, 78, ...]

// Derivar clave pública desde privada
const publicKey = getPublicKey(secretKey);
// Output: "a1b2c3d4..." (hex string, 64 chars)
```

#### Conversión de Formatos
```javascript
import { nip19 } from 'nostr-tools';

// Hex → nsec (bech32)
const nsec = nip19.nsecEncode(secretKeyBytes);
// Output: "nsec1abc123..."

// Hex → npub (bech32)
const npub = nip19.npubEncode(publicKeyHex);
// Output: "npub1xyz789..."

// nsec → hex
const { type, data } = nip19.decode('nsec1...');
// type: 'nsec'
// data: Uint8Array(32)

// npub → hex
const { type, data } = nip19.decode('npub1...');
// type: 'npub'
// data: string (hex)
```

#### Validación de Claves
```javascript
// Validar formato de clave privada
function isValidSecretKey(bytes) {
  return bytes instanceof Uint8Array && bytes.length === 32;
}

// Validar formato de clave pública
function isValidPublicKey(hex) {
  return /^[a-f0-9]{64}$/i.test(hex);
}
```

#### Derivación de Trade Keys

**Estrategia recomendada**: Usar HMAC-SHA256 con índice
```javascript
import { getPublicKey } from 'nostr-tools/pure';

// Derivar trade key desde identity key + índice
function deriveTradeKey(identitySecretKey, tradeIndex) {
  // Crear mensaje: "trade" + índice
  const message = `mostro_trade_${tradeIndex}`;

  // HMAC-SHA256(identitySecretKey, message)
  const hmac = CryptoJS.HmacSHA256(message,
    CryptoJS.lib.WordArray.create(identitySecretKey)
  );

  // Convertir a Uint8Array(32)
  const tradeSecretKey = new Uint8Array(
    hmac.words.map((word, i) => (word >>> (24 - (i % 4) * 8)) & 0xff)
  );

  // Derivar clave pública
  const tradePublicKey = getPublicKey(tradeSecretKey);

  return {
    secretKey: tradeSecretKey,
    publicKey: tradePublicKey
  };
}
```

**Ventaja de este enfoque**:
- Determinístico: mismo índice = misma trade key
- Permite recuperación con solo la identity key + índice
- Compatible con NIP-46 (futuro)

### 4.2 Implementación en KeyManager

```javascript
// === js/core/keyManager.js ===

// Importar nostr-tools dinámicamente
let nostrTools;
let nip19;

async function initNostrTools() {
  if (!window.nostrTools) {
    throw new Error('nostr-tools not loaded. Check CDN connection.');
  }

  nostrTools = window.nostrTools;
  nip19 = nostrTools.nip19;

  Logger.debug('KeyManager: nostr-tools initialized');
}

// === Generar nueva identidad ===
async function generateNewIdentity() {
  await initNostrTools();

  // Generar clave privada (32 bytes aleatorios)
  const secretKey = nostrTools.generateSecretKey();

  // Derivar clave pública
  const publicKey = nostrTools.getPublicKey(secretKey);

  // Guardar en estado (antes de encriptar)
  this.state.identityPrivateKey = secretKey;
  this.state.identityPublicKey = publicKey;

  Logger.info('KeyManager: New identity generated');
  Logger.debug(`Public key: ${this.getPublicKey('npub')}`);

  return {
    secretKey,
    publicKey
  };
}

// === Importar clave existente ===
async function importPrivateKey(keyInput) {
  await initNostrTools();

  let secretKey;

  // Detectar formato
  if (keyInput.startsWith('nsec1')) {
    // Decodificar nsec
    const decoded = nip19.decode(keyInput);
    if (decoded.type !== 'nsec') {
      throw new Error('Invalid nsec format');
    }
    secretKey = decoded.data;

  } else if (/^[a-f0-9]{64}$/i.test(keyInput)) {
    // Hex format
    secretKey = new Uint8Array(
      keyInput.match(/.{2}/g).map(byte => parseInt(byte, 16))
    );

  } else {
    throw new Error('Invalid key format. Use nsec or hex.');
  }

  // Validar que sea válida
  if (!isValidSecretKey(secretKey)) {
    throw new Error('Invalid secret key');
  }

  // Derivar clave pública
  const publicKey = nostrTools.getPublicKey(secretKey);

  // Guardar en estado
  this.state.identityPrivateKey = secretKey;
  this.state.identityPublicKey = publicKey;

  Logger.info('KeyManager: Private key imported');

  return {
    secretKey,
    publicKey
  };
}

// === Exportar clave privada ===
function exportPrivateKey(format = 'nsec') {
  if (!this.state.isUnlocked) {
    throw new Error('Keys are locked. Use unlockKeys() first.');
  }

  if (!this.state.identityPrivateKey) {
    throw new Error('No private key in memory');
  }

  if (format === 'nsec') {
    return nip19.nsecEncode(this.state.identityPrivateKey);
  } else if (format === 'hex') {
    return Array.from(this.state.identityPrivateKey)
      .map(b => b.toString(16).padStart(2, '0'))
      .join('');
  } else {
    throw new Error('Invalid format. Use "nsec" or "hex".');
  }
}

// === Exportar clave pública ===
function getPublicKey(format = 'npub') {
  if (!this.state.identityPublicKey) {
    throw new Error('No public key available');
  }

  if (format === 'npub') {
    return nip19.npubEncode(this.state.identityPublicKey);
  } else if (format === 'hex') {
    return this.state.identityPublicKey;
  } else {
    throw new Error('Invalid format. Use "npub" or "hex".');
  }
}

// === Generar trade key ===
function generateTradeKey(tradeIndex) {
  if (!this.state.isUnlocked) {
    throw new Error('Session locked');
  }

  const message = `mostro_trade_${tradeIndex}`;

  // HMAC-SHA256
  const hmac = CryptoJS.HmacSHA256(
    message,
    CryptoJS.lib.WordArray.create(this.state.identityPrivateKey)
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
  this.state.currentTradeKey = {
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
```

---

## 5. SISTEMA DE ENCRIPTACIÓN AES-256

### 5.1 Arquitectura de Seguridad

**Objetivo**: Almacenar claves privadas encriptadas en localStorage, desbloqueables solo con password del usuario.

**Componentes**:
1. **Password** → Usuario ingresa (no se guarda)
2. **Salt** → Random 16 bytes (se guarda en localStorage)
3. **PBKDF2** → Deriva encryption key desde password + salt
4. **AES-256** → Encripta private key con encryption key
5. **Ciphertext** → Se guarda en localStorage

**Flujo de Encriptación**:
```
Password (user input)
    ↓
PBKDF2(password, salt, 100000 iterations, SHA256)
    ↓
Encryption Key (256 bits)
    ↓
AES-256-CBC(privateKey, encryptionKey, iv)
    ↓
Ciphertext → localStorage
```

**Flujo de Desencriptación**:
```
Password (user input)
    ↓
PBKDF2(password, salt_from_storage, 100000, SHA256)
    ↓
Encryption Key (256 bits)
    ↓
AES-256-CBC-Decrypt(ciphertext, encryptionKey, iv)
    ↓
Private Key → memoria (temporal)
```

### 5.2 Implementación con CryptoJS

**CryptoJS disponible globalmente**:
```javascript
// Ya cargado desde CDN:
window.CryptoJS
```

#### Función: Generar Salt
```javascript
function generateSalt(length = 16) {
  // Generar bytes aleatorios
  const randomBytes = new Uint8Array(length);
  crypto.getRandomValues(randomBytes);

  // Convertir a hex
  return Array.from(randomBytes)
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');
}
```

#### Función: Derivar Encryption Key (PBKDF2)
```javascript
function deriveEncryptionKey(password, saltHex, iterations = 100000) {
  // Convertir salt hex a WordArray
  const salt = CryptoJS.enc.Hex.parse(saltHex);

  // PBKDF2 con SHA256, 100k iteraciones, 256 bits
  const key = CryptoJS.PBKDF2(password, salt, {
    keySize: 256 / 32,        // 256 bits = 8 words
    iterations: iterations,
    hasher: CryptoJS.algo.SHA256
  });

  return key;  // CryptoJS WordArray
}
```

#### Función: Encriptar Private Key
```javascript
function encryptPrivateKey(privateKeyBytes, password, saltHex) {
  // Derivar encryption key
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

  // Retornar ciphertext como string
  return ciphertext.toString();
}
```

#### Función: Desencriptar Private Key
```javascript
function decryptPrivateKey(ciphertext, password, saltHex) {
  // Derivar encryption key
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
    throw new Error('Decryption failed. Wrong password?');
  }

  // Convertir hex a Uint8Array
  const privateKeyBytes = new Uint8Array(
    privateKeyHex.match(/.{2}/g).map(byte => parseInt(byte, 16))
  );

  return privateKeyBytes;
}
```

### 5.3 Implementación en KeyManager

```javascript
// === Configurar password (primera vez) ===
async function setPassword(password) {
  if (!this.state.identityPrivateKey) {
    throw new Error('No identity key to encrypt');
  }

  // Validar password
  if (!password || password.length < 8) {
    throw new Error('Password must be at least 8 characters');
  }

  // Generar salt aleatorio
  const salt = generateSalt(16);

  // Encriptar private key
  const encryptedPrivateKey = encryptPrivateKey(
    this.state.identityPrivateKey,
    password,
    salt
  );

  // Guardar en localStorage
  const identityData = {
    encryptedPrivateKey,
    publicKey: nip19.npubEncode(this.state.identityPublicKey),
    publicKeyHex: this.state.identityPublicKey,
    salt,
    createdAt: Date.now(),
    version: 1  // Versión del formato de encriptación
  };

  Storage.saveIdentityKey(identityData);

  // Actualizar estado
  this.state.hasPassword = true;
  this.state.encryptionSalt = salt;

  Logger.info('KeyManager: Password set and key encrypted');
}

// === Desbloquear claves con password ===
async function unlockKeys(password) {
  // Cargar datos desde storage
  const identityData = Storage.getIdentityKey();

  if (!identityData) {
    throw new Error('No identity found');
  }

  try {
    // Desencriptar private key
    const privateKeyBytes = decryptPrivateKey(
      identityData.encryptedPrivateKey,
      password,
      identityData.salt
    );

    // Validar que la clave sea correcta
    const derivedPublicKey = nostrTools.getPublicKey(privateKeyBytes);

    if (derivedPublicKey !== identityData.publicKeyHex) {
      throw new Error('Wrong password');
    }

    // Guardar en memoria
    this.state.identityPrivateKey = privateKeyBytes;
    this.state.identityPublicKey = derivedPublicKey;
    this.state.isUnlocked = true;
    this.state.hasPassword = true;
    this.state.encryptionSalt = identityData.salt;

    // Cargar trade index
    this.state.tradeIndex = Storage.getTradeIndex() || 0;

    Logger.info('KeyManager: Keys unlocked successfully');

  } catch (error) {
    Logger.error('KeyManager: Failed to unlock keys', error);
    throw new Error('Wrong password or corrupted data');
  }
}

// === Bloquear claves (limpiar memoria) ===
function lockKeys() {
  // Sobrescribir datos sensibles
  if (this.state.identityPrivateKey) {
    this.state.identityPrivateKey.fill(0);
    this.state.identityPrivateKey = null;
  }

  if (this.state.currentTradeKey) {
    this.state.currentTradeKey.secretKey.fill(0);
    this.state.currentTradeKey = null;
  }

  this.state.isUnlocked = false;

  Logger.info('KeyManager: Keys locked and cleared from memory');
}

// === Cambiar password ===
async function changePassword(oldPassword, newPassword) {
  if (!this.state.isUnlocked) {
    throw new Error('Unlock keys first');
  }

  // Validar nuevo password
  if (!newPassword || newPassword.length < 8) {
    throw new Error('New password must be at least 8 characters');
  }

  // Verificar old password
  const identityData = Storage.getIdentityKey();

  try {
    const privateKeyBytes = decryptPrivateKey(
      identityData.encryptedPrivateKey,
      oldPassword,
      identityData.salt
    );

    if (privateKeyBytes !== this.state.identityPrivateKey) {
      throw new Error('Wrong password');
    }

  } catch (error) {
    throw new Error('Wrong old password');
  }

  // Generar nuevo salt
  const newSalt = generateSalt(16);

  // Re-encriptar con nuevo password
  const encryptedPrivateKey = encryptPrivateKey(
    this.state.identityPrivateKey,
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
  this.state.encryptionSalt = newSalt;

  Logger.info('KeyManager: Password changed successfully');
}
```

### 5.4 Consideraciones de Seguridad

**✓ Buenas prácticas implementadas**:
- PBKDF2 con 100,000 iteraciones (resistente a brute force)
- Salt aleatorio único por usuario
- AES-256-CBC con padding correcto
- Private keys solo en memoria cuando desbloqueado
- Sobrescribir memoria al bloquear

**⚠️ Limitaciones del navegador**:
- localStorage no es seguro contra malware local
- JavaScript puede ser interceptado (XSS)
- No hay HSM (Hardware Security Module)

**Mitigaciones**:
- Sanitizar todo input (ya implementado en helpers.js)
- No loggear datos sensibles
- Advertir al usuario sobre seguridad de la contraseña
- Implementar timeout de sesión (future)
- Considerar IndexedDB con encriptación adicional (future)

---

## 6. COMANDOS DE TERMINAL

### 6.1 Comandos Nuevos a Implementar

| Comando | Descripción | Args | Prioridad |
|---------|-------------|------|-----------|
| `/start` | Iniciar sesión (generar o unlock) | - | 🔴 Alta |
| `/import` | Importar clave privada existente | - | 🔴 Alta |
| `/identity` | Ver información de identidad | - | 🟡 Media |
| `/export` | Exportar clave privada (backup) | - | 🟡 Media |
| `/changepass` | Cambiar password de encriptación | - | 🟢 Baja |
| `/backup` | Alias de /export | - | 🟢 Baja |
| `/lock` | Bloquear sesión (limpiar memoria) | - | 🟢 Baja |

### 6.2 Flujo de Interacción por Comando

#### Comando: /start

**Caso 1: Primera vez (sin identidad)**
```
mostro> /start

[INFO] No identity found. Let's create one!
[INFO] You will need a password to encrypt your private key.

[PROMPT] Enter password (min 8 chars):
> ********

[PROMPT] Confirm password:
> ********

[SUCCESS] ✓ New identity generated!

Your Nostr public key (npub):
npub1a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6q7r8s9t0u1v2w3x4y5z6

[WARNING] ⚠️  BACKUP YOUR KEY
[DIM] Your private key is encrypted and stored locally.
[DIM] Use /export to show your private key for backup.
[DIM] Without this backup, you cannot recover your identity!

[SUCCESS] ✓ Session started. Ready to trade!
```

**Caso 2: Usuario existente (con identidad)**
```
mostro> /start

[INFO] Identity found. Unlocking session...

[PROMPT] Enter your password:
> ********

[SUCCESS] ✓ Session unlocked successfully!
[INFO] Logged in as: npub1a1b2c3d4e...

[INFO] Trade index: 5
[DIM] Ready to create orders and trades.
```

**Caso 3: Password incorrecto**
```
mostro> /start

[INFO] Identity found. Unlocking session...

[PROMPT] Enter your password:
> ********

[ERROR] ✗ Wrong password. Please try again.
[DIM] Use /help if you forgot your password (you'll need to re-import your key).
```

#### Comando: /import

```
mostro> /import

[INFO] Import existing Nostr identity
[DIM] You can use either format:
[DIM]   • nsec format: nsec1abc123...
[DIM]   • hex format: a1b2c3d4e5f6...

[PROMPT] Enter your private key:
> nsec1abcdefghijklmnopqrstuvwxyz123456789abcdefghijklmnopqr

[INFO] Key validated successfully.

[PROMPT] Enter a password to encrypt this key (min 8 chars):
> ********

[PROMPT] Confirm password:
> ********

[SUCCESS] ✓ Private key imported and encrypted!

Your public key (npub):
npub1x9y8z7w6v5u4t3s2r1q0p9o8n7m6l5k4j3i2h1g0f9e8d7c6b5a

[WARNING] ⚠️  BACKUP REMINDER
[DIM] If you lose your password, you'll need to re-import this nsec.
[DIM] Keep your nsec in a safe place!

[SUCCESS] ✓ Session started. Ready to trade!
```

#### Comando: /identity

```
mostro> /identity

=== IDENTITY INFO ===

Status: 🟢 Unlocked

Public Key (npub):
npub1a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6q7r8s9t0u1v2w3x4y5z6

Public Key (hex):
a1b2c3d4e5f6789abcdef0123456789abcdef0123456789abcdef0123456789

Trade Index: 5

Current Trade Key:
npub1x9y8z7w6v5u4t3s2r1q0p9o8n7m6l5k4j3i2h1g0f9e8d7c6b5a

[DIM] Use /export to backup your private key.
```

#### Comando: /export

```
mostro> /export

[WARNING] ⚠️  WARNING: This will display your PRIVATE KEY
[DIM] Anyone with this key can control your identity and funds.
[DIM] Only export if you need to backup or migrate to another app.

[PROMPT] Type "I UNDERSTAND" to continue (or anything else to cancel):
> I UNDERSTAND

=== PRIVATE KEY BACKUP ===

Your private key (nsec format):
nsec1abcdefghijklmnopqrstuvwxyz123456789abcdefghijklmnopqr

Hex format (for advanced users):
a1b2c3d4e5f6789abcdef0123456789abcdef0123456789abcdef0123456789

[WARNING] ⚠️  Store this in a SAFE PLACE!
[DIM] Recommended storage:
[DIM]   • Password manager (encrypted vault)
[DIM]   • Hardware wallet (if supported)
[DIM]   • Paper backup in secure location
[DIM]   • DO NOT store in plain text files or screenshots!
```

#### Comando: /lock

```
mostro> /lock

[INFO] Locking session...
[SUCCESS] ✓ Session locked. Keys cleared from memory.
[DIM] Use /start to unlock again.
```

#### Comando: /changepass

```
mostro> /changepass

[INFO] Change encryption password
[WARNING] This will re-encrypt your private key with a new password.

[PROMPT] Enter current password:
> ********

[PROMPT] Enter new password (min 8 chars):
> ********

[PROMPT] Confirm new password:
> ********

[SUCCESS] ✓ Password changed successfully!
[INFO] Your private key has been re-encrypted.
```

### 6.3 Helpers para Input de Usuario

**Necesitamos implementar funciones de prompt**:

```javascript
// === js/utils/inputHelpers.js (nuevo archivo) ===

/**
 * Solicitar input de texto del usuario (modo asíncrono)
 */
export async function promptInput(message, validator = null) {
  return new Promise((resolve) => {
    Display.dim(message);

    // Crear input temporal
    const input = document.createElement('input');
    input.type = 'text';
    input.className = 'terminal-input';

    // Handler de submit
    input.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        const value = input.value.trim();

        // Validar si se proporcionó validador
        if (validator && !validator(value)) {
          Display.error('Invalid input. Please try again.');
          input.value = '';
          return;
        }

        // Limpiar y resolver
        input.remove();
        resolve(value);
      } else if (e.key === 'Escape') {
        input.remove();
        resolve(null);  // Cancelado
      }
    });

    // Agregar al DOM y enfocar
    const outputDiv = document.getElementById('terminal-output');
    outputDiv.appendChild(input);
    input.focus();
  });
}

/**
 * Solicitar password (input oculto)
 */
export async function promptPassword(message = 'Enter password:') {
  return new Promise((resolve) => {
    Display.dim(message);

    const input = document.createElement('input');
    input.type = 'password';
    input.className = 'terminal-input';
    input.placeholder = '••••••••';

    input.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        const value = input.value;
        input.remove();

        // No mostrar el password en terminal
        Display.dim('[password entered]');

        resolve(value);
      } else if (e.key === 'Escape') {
        input.remove();
        resolve(null);
      }
    });

    const outputDiv = document.getElementById('terminal-output');
    outputDiv.appendChild(input);
    input.focus();
  });
}

/**
 * Solicitar confirmación con password repetido
 */
export async function promptPasswordConfirm() {
  const pass1 = await promptPassword('Enter password:');

  if (!pass1) return null;  // Cancelado

  if (pass1.length < 8) {
    Display.error('Password must be at least 8 characters.');
    return promptPasswordConfirm();  // Recursivo
  }

  const pass2 = await promptPassword('Confirm password:');

  if (!pass2) return null;

  if (pass1 !== pass2) {
    Display.error('Passwords do not match. Try again.');
    return promptPasswordConfirm();
  }

  return pass1;
}

/**
 * Solicitar confirmación (sí/no)
 */
export async function promptConfirmation(message, expectedText = 'yes') {
  const response = await promptInput(
    `${message} (Type "${expectedText}" to confirm):`
  );

  return response?.toLowerCase() === expectedText.toLowerCase();
}

/**
 * Solicitar private key con validación
 */
export async function promptPrivateKey() {
  const validator = (value) => {
    return PATTERNS.NSEC.test(value) || PATTERNS.HEX_KEY.test(value);
  };

  const key = await promptInput(
    'Enter private key (nsec or hex):',
    validator
  );

  if (!key) {
    Display.error('Invalid key format. Must be nsec1... or 64-char hex.');
    return promptPrivateKey();
  }

  return key;
}
```

### 6.4 Modificaciones en constants.js

**Agregar información de comandos**:

```javascript
// Agregar al final de constants.js

export const COMMAND_INFO = {
  [COMMANDS.START]: {
    description: 'Start a new session (generate or unlock identity)',
    usage: '/start',
    aliases: ['s'],
    examples: ['/start']
  },

  [COMMANDS.IMPORT]: {
    description: 'Import an existing Nostr private key',
    usage: '/import',
    aliases: [],
    examples: ['/import']
  },

  [COMMANDS.IDENTITY]: {
    description: 'Show your identity information',
    usage: '/identity',
    aliases: ['id', 'whoami'],
    examples: ['/identity']
  },

  [COMMANDS.EXPORT]: {
    description: 'Export your private key for backup',
    usage: '/export',
    aliases: ['backup'],
    examples: ['/export']
  },

  [COMMANDS.LOCK]: {
    description: 'Lock session and clear keys from memory',
    usage: '/lock',
    aliases: ['logout'],
    examples: ['/lock']
  },

  [COMMANDS.CHANGEPASS]: {
    description: 'Change encryption password',
    usage: '/changepass',
    aliases: ['passwd'],
    examples: ['/changepass']
  },

  // ... existing commands
};

// Agregar constantes de encriptación
export const CRYPTO_CONFIG = {
  PBKDF2_ITERATIONS: 100000,
  SALT_LENGTH: 16,           // bytes
  AES_MODE: 'CBC',
  PADDING: 'Pkcs7',
  MIN_PASSWORD_LENGTH: 8
};
```

---

## 7. PLAN DE IMPLEMENTACIÓN PASO A PASO

### Fase 1: Preparación (30 min)

**Paso 1.1: Crear estructura de archivos**
- [ ] Crear `/js/core/keyManager.js`
- [ ] Crear `/js/utils/inputHelpers.js`

**Paso 1.2: Actualizar constants.js**
- [ ] Agregar COMMAND_INFO para nuevos comandos
- [ ] Agregar CRYPTO_CONFIG
- [ ] Agregar mensajes de error/éxito relacionados a keys

**Paso 1.3: Verificar dependencias**
- [ ] Verificar que nostr-tools esté cargado en window.nostrTools
- [ ] Verificar que CryptoJS esté disponible
- [ ] Test básico de generación de claves en consola

### Fase 2: Implementar keyManager.js Core (2 horas)

**Paso 2.1: Estructura básica y estado**
```javascript
// Estado interno
// Inicialización
// Helpers internos (generateSalt, etc.)
```

**Paso 2.2: Funciones de encriptación**
- [ ] `generateSalt()`
- [ ] `deriveEncryptionKey()`
- [ ] `encryptPrivateKey()`
- [ ] `decryptPrivateKey()`

**Paso 2.3: Generación e importación**
- [ ] `initNostrTools()`
- [ ] `generateNewIdentity()`
- [ ] `importPrivateKey()`
- [ ] `exportPrivateKey()`
- [ ] `getPublicKey()`

**Paso 2.4: Password management**
- [ ] `setPassword()`
- [ ] `unlockKeys()`
- [ ] `lockKeys()`
- [ ] `changePassword()`

**Paso 2.5: Trade keys**
- [ ] `generateTradeKey()`
- [ ] `getCurrentTradeKey()`
- [ ] `startNewTrade()`
- [ ] `restoreTradeFromIndex()`

**Paso 2.6: Queries y estado**
- [ ] `hasIdentity()`
- [ ] `isUnlocked()`
- [ ] `getTradeIndex()`
- [ ] `init()` (cargar estado desde storage)
- [ ] `deleteIdentity()`
- [ ] `clearMemory()`

### Fase 3: Implementar inputHelpers.js (1 hora)

**Paso 3.1: Funciones básicas**
- [ ] `promptInput()`
- [ ] `promptPassword()`
- [ ] `promptPasswordConfirm()`

**Paso 3.2: Funciones especializadas**
- [ ] `promptConfirmation()`
- [ ] `promptPrivateKey()`

**Paso 3.3: CSS para inputs temporales**
- [ ] Estilos para inputs en terminal-output
- [ ] Animaciones de focus

### Fase 4: Implementar comandos en commands.js (2 horas)

**Paso 4.1: Comando /start**
- [ ] Detectar si hay identidad
- [ ] Flujo: primera vez (generar)
- [ ] Flujo: usuario existente (unlock)
- [ ] Manejo de errores

**Paso 4.2: Comando /import**
- [ ] Prompt para private key
- [ ] Validación de formato
- [ ] Prompt para password
- [ ] Encriptar y guardar

**Paso 4.3: Comando /identity**
- [ ] Mostrar información pública
- [ ] Mostrar estado de sesión
- [ ] Mostrar trade index

**Paso 4.4: Comando /export**
- [ ] Verificar isUnlocked
- [ ] Prompt de confirmación
- [ ] Mostrar nsec y hex
- [ ] Advertencias de seguridad

**Paso 4.5: Comandos adicionales**
- [ ] /lock
- [ ] /changepass

**Paso 4.6: Actualizar switch en executeCommand()**
- [ ] Agregar cases para todos los comandos
- [ ] Agregar aliases

### Fase 5: Integración y Testing (1.5 horas)

**Paso 5.1: Integración con storage.js**
- [ ] Test guardar identidad encriptada
- [ ] Test cargar identidad
- [ ] Test incrementar trade index

**Paso 5.2: Testing de flujos completos**
- [ ] Test: /start (primera vez)
- [ ] Test: /start (usuario existente)
- [ ] Test: /import
- [ ] Test: /export
- [ ] Test: /changepass
- [ ] Test: Generación de trade keys

**Paso 5.3: Testing de seguridad**
- [ ] Test: Password incorrecto
- [ ] Test: Formato de clave inválido
- [ ] Test: Bloqueo de sesión (lockKeys)
- [ ] Test: Datos sensibles no en logs

**Paso 5.4: Testing de edge cases**
- [ ] Múltiples unlock/lock cycles
- [ ] Cambio de password
- [ ] Corrupción de datos en storage
- [ ] nostr-tools no disponible

### Fase 6: UI/UX Polish (1 hora)

**Paso 6.1: Mensajes de error claros**
- [ ] Mensajes específicos para cada error
- [ ] Sugerencias de solución

**Paso 6.2: Feedback visual**
- [ ] Spinner mientras genera claves
- [ ] Animación de unlock exitoso
- [ ] Indicadores de estado en statusbar

**Paso 6.3: Documentación inline**
- [ ] Help text para cada comando
- [ ] Ejemplos en /help

**Paso 6.4: Actualizar Display.showHelp()**
- [ ] Agregar nuevos comandos
- [ ] Agrupar por categoría (Identity, Trading, System)

### Fase 7: Actualización del Status Bar (30 min)

**Paso 7.1: Indicador de sesión**
- [ ] Agregar status-item para mostrar unlock status
- [ ] 🔴 Locked / 🟢 Unlocked

**Paso 7.2: Auto-update en eventos**
- [ ] Listener de unlock → actualizar statusbar
- [ ] Listener de lock → actualizar statusbar

---

## 8. CASOS DE PRUEBA

### 8.1 Test Suite para keyManager.js

```javascript
// === tests/keyManager.test.js ===

describe('KeyManager', () => {

  describe('Generación de Claves', () => {
    it('debe generar un par de claves válido', () => {
      const { secretKey, publicKey } = KeyManager.generateNewIdentity();

      expect(secretKey).toBeInstanceOf(Uint8Array);
      expect(secretKey.length).toBe(32);
      expect(publicKey).toMatch(/^[a-f0-9]{64}$/i);
    });

    it('debe generar claves diferentes cada vez', () => {
      const key1 = KeyManager.generateNewIdentity();
      const key2 = KeyManager.generateNewIdentity();

      expect(key1.publicKey).not.toBe(key2.publicKey);
    });
  });

  describe('Importación de Claves', () => {
    it('debe importar nsec válido', () => {
      const nsec = 'nsec1...';
      const result = KeyManager.importPrivateKey(nsec);

      expect(result.secretKey).toBeInstanceOf(Uint8Array);
      expect(result.publicKey).toMatch(/^[a-f0-9]{64}$/i);
    });

    it('debe importar hex válido', () => {
      const hex = 'a1b2c3...';
      const result = KeyManager.importPrivateKey(hex);

      expect(result.secretKey).toBeInstanceOf(Uint8Array);
    });

    it('debe rechazar formato inválido', () => {
      expect(() => {
        KeyManager.importPrivateKey('invalid');
      }).toThrow('Invalid key format');
    });
  });

  describe('Encriptación', () => {
    beforeEach(() => {
      KeyManager.generateNewIdentity();
    });

    it('debe encriptar clave con password', () => {
      const password = 'testpass123';
      KeyManager.setPassword(password);

      const stored = Storage.getIdentityKey();

      expect(stored.encryptedPrivateKey).toBeDefined();
      expect(stored.salt).toBeDefined();
      expect(stored.encryptedPrivateKey).not.toContain('nsec');
    });

    it('debe desencriptar con password correcto', () => {
      const password = 'testpass123';
      KeyManager.setPassword(password);
      KeyManager.lockKeys();

      KeyManager.unlockKeys(password);

      expect(KeyManager.isUnlocked()).toBe(true);
    });

    it('debe rechazar password incorrecto', () => {
      KeyManager.setPassword('correct');
      KeyManager.lockKeys();

      expect(() => {
        KeyManager.unlockKeys('wrong');
      }).toThrow('Wrong password');
    });
  });

  describe('Trade Keys', () => {
    beforeEach(() => {
      KeyManager.generateNewIdentity();
      KeyManager.setPassword('testpass');
    });

    it('debe generar trade key determinística', () => {
      const trade1 = KeyManager.generateTradeKey(0);
      const trade2 = KeyManager.generateTradeKey(0);

      expect(trade1.publicKey).toBe(trade2.publicKey);
    });

    it('debe generar trade keys diferentes por índice', () => {
      const trade1 = KeyManager.generateTradeKey(0);
      const trade2 = KeyManager.generateTradeKey(1);

      expect(trade1.publicKey).not.toBe(trade2.publicKey);
    });

    it('debe incrementar trade index', () => {
      KeyManager.startNewTrade();
      const index1 = KeyManager.getTradeIndex();

      KeyManager.startNewTrade();
      const index2 = KeyManager.getTradeIndex();

      expect(index2).toBe(index1 + 1);
    });
  });

  describe('Seguridad', () => {
    it('debe limpiar claves de memoria al bloquear', () => {
      KeyManager.generateNewIdentity();
      KeyManager.setPassword('test');

      KeyManager.lockKeys();

      expect(KeyManager.state.identityPrivateKey).toBeNull();
      expect(KeyManager.isUnlocked()).toBe(false);
    });

    it('debe prevenir export si no está unlocked', () => {
      KeyManager.lockKeys();

      expect(() => {
        KeyManager.exportPrivateKey();
      }).toThrow('locked');
    });
  });

});
```

### 8.2 Test Manual Checklist

**Test 1: Generación de identidad**
```
1. Abrir aplicación en navegador
2. Ejecutar: /start
3. ✓ Debe pedir password
4. Ingresar password fuerte
5. ✓ Debe mostrar npub generado
6. ✓ Debe mostrar advertencia de backup
7. Verificar localStorage:
   - ✓ mostro_identity_key existe
   - ✓ Contiene encryptedPrivateKey
   - ✓ Contiene salt
```

**Test 2: Importación de clave**
```
1. Ejecutar: /import
2. Pegar nsec válido
3. ✓ Debe validar formato
4. Ingresar password
5. ✓ Debe guardar encriptado
6. Ejecutar: /identity
7. ✓ Debe mostrar npub correcto
```

**Test 3: Lock/Unlock cycle**
```
1. Iniciar sesión: /start
2. Verificar estado: /identity
3. ✓ Debe mostrar 🟢 Unlocked
4. Ejecutar: /lock
5. ✓ Debe mostrar 🔴 Locked
6. Intentar: /export
7. ✓ Debe rechazar (locked)
8. Ejecutar: /start
9. Ingresar password
10. ✓ Debe unlock correctamente
```

**Test 4: Trade key generation**
```
1. Iniciar sesión
2. Ejecutar: KeyManager.generateTradeKey(0) en consola
3. ✓ Debe retornar { publicKey, index: 0 }
4. Verificar localStorage mostro_trade_key
5. ✓ Debe contener trade key data
6. Ejecutar: KeyManager.startNewTrade()
7. ✓ Trade index debe incrementar
```

**Test 5: Cambio de password**
```
1. Iniciar sesión
2. Ejecutar: /changepass
3. Ingresar old password
4. Ingresar new password
5. ✓ Debe confirmar cambio
6. Ejecutar: /lock
7. Ejecutar: /start con old password
8. ✗ Debe rechazar
9. Ejecutar: /start con new password
10. ✓ Debe unlock correctamente
```

**Test 6: Export de clave**
```
1. Iniciar sesión
2. Ejecutar: /export
3. ✓ Debe pedir confirmación "I UNDERSTAND"
4. Ingresar texto diferente
5. ✓ Debe cancelar
6. Ejecutar: /export nuevamente
7. Ingresar "I UNDERSTAND"
8. ✓ Debe mostrar nsec
9. ✓ Debe mostrar hex
10. ✓ Debe mostrar advertencias
```

---

## 9. CONSIDERACIONES DE SEGURIDAD

### 9.1 Vectores de Ataque y Mitigaciones

| Vector de Ataque | Riesgo | Mitigación Implementada |
|------------------|--------|-------------------------|
| **XSS (Cross-Site Scripting)** | Alto | ✅ `sanitizeHTML()` en todos los inputs |
| **LocalStorage Theft** | Alto | ✅ Encriptación AES-256 de private keys |
| **Password Brute Force** | Medio | ✅ PBKDF2 100k iteraciones + salt único |
| **Memory Dump** | Medio | ✅ Limpiar memoria al bloquear sesión |
| **Keylogger** | Alto | ⚠️ No mitigable en navegador |
| **Screen Capture** | Medio | ⚠️ Advertencias al exportar clave |
| **Clipboard Hijack** | Bajo | ⚠️ Advertir no pegar en lugares inseguros |
| **MITM en CDN** | Medio | ✅ Usar HTTPS + SRI hashes (futuro) |

### 9.2 Mejores Prácticas Implementadas

**✓ Almacenamiento**:
- Claves privadas SIEMPRE encriptadas en localStorage
- Salt único por usuario (evita rainbow tables)
- Versioning del formato de encriptación (migración futura)

**✓ Memoria**:
- Claves privadas solo en memoria cuando desbloqueado
- Sobrescribir bytes sensibles al bloquear (`.fill(0)`)
- No pasar claves privadas por console.log

**✓ Passwords**:
- Mínimo 8 caracteres (recomendado 12+)
- No se guardan en ningún lugar
- Derivación con PBKDF2 (lento a propósito)

**✓ UI/UX**:
- Confirmaciones dobles para acciones destructivas
- Advertencias claras sobre respaldo de claves
- Mensajes de error sin información sensible

### 9.3 Limitaciones y Advertencias

**⚠️ Limitaciones inherentes al navegador**:
1. **No hay Secure Enclave**: Claves en memoria pueden ser dumpeadas
2. **JavaScript interpretado**: Malware puede leer variables
3. **LocalStorage accesible**: No es un vault cifrado
4. **No hay 2FA nativo**: Password único punto de fallo

**🔴 Advertencias al usuario**:
```
Al usar /start primera vez:

[WARNING] SECURITY NOTICE
[DIM] Your private key will be encrypted and stored in your browser.
[DIM]
[DIM] Important security considerations:
[DIM]   • Use a STRONG password (12+ characters recommended)
[DIM]   • Store your nsec backup in a safe place
[DIM]   • Do not use this app on shared/public computers
[DIM]   • Clear browser data if device is compromised
[DIM]   • This app cannot recover your key if you forget your password
[DIM]
[DIM] By continuing, you acknowledge these security limitations.
```

### 9.4 Recomendaciones para Usuarios

**Documentación en /help**:
```
SECURITY BEST PRACTICES:

1. Password Management:
   • Use a unique, strong password (12+ characters)
   • Include uppercase, lowercase, numbers, symbols
   • Do NOT reuse passwords from other apps

2. Key Backup:
   • Use /export to backup your nsec
   • Store backup in password manager (encrypted vault)
   • Consider hardware wallet for large funds

3. Device Security:
   • Only use trusted devices
   • Keep OS and browser updated
   • Use antivirus software
   • Enable device encryption (FileVault/BitLocker)

4. Session Management:
   • Use /lock when stepping away
   • Close browser when done
   • Clear browser cache regularly on shared devices

5. Recovery Plan:
   • If password is forgotten, you MUST re-import your nsec
   • If nsec is lost, identity is UNRECOVERABLE
   • Test backup restore before trading large amounts
```

---

## 10. ARCHIVOS A MODIFICAR/CREAR

### 10.1 Archivos NUEVOS a Crear

```
js/core/keyManager.js                  (500-700 líneas)
├── Estado interno
├── Funciones de encriptación (PBKDF2, AES)
├── Generación de claves (nostr-tools)
├── Importación/Exportación
├── Gestión de trade keys
└── Limpieza de memoria

js/utils/inputHelpers.js               (200-300 líneas)
├── promptInput()
├── promptPassword()
├── promptPasswordConfirm()
├── promptConfirmation()
└── promptPrivateKey()

tests/keyManager.test.js               (300-400 líneas) [opcional]
└── Suite completa de tests
```

### 10.2 Archivos EXISTENTES a Modificar

**js/utils/constants.js** (agregar ~50 líneas):
```javascript
// Agregar COMMAND_INFO para nuevos comandos
export const COMMAND_INFO = { ... };

// Agregar configuración de encriptación
export const CRYPTO_CONFIG = { ... };

// Agregar mensajes relacionados a keys
export const ERROR_MESSAGES = {
  // ... existing
  WRONG_PASSWORD: 'Wrong password. Please try again.',
  KEY_LOCKED: 'Session locked. Use /start to unlock.',
  // ...
};
```

**js/ui/commands.js** (agregar ~400 líneas):
```javascript
// Importar KeyManager
import KeyManager from '../core/keyManager.js';
import { promptPassword, promptPrivateKey, ... } from '../utils/inputHelpers.js';

// Agregar handlers:
async function handleStart(args) { ... }       (~80 líneas)
async function handleImport(args) { ... }      (~60 líneas)
async function handleIdentity(args) { ... }    (~40 líneas)
async function handleExport(args) { ... }      (~60 líneas)
async function handleLock(args) { ... }        (~20 líneas)
async function handleChangePassword(args) { ...} (~80 líneas)

// Actualizar executeCommand() switch:
case COMMANDS.START:
case '/s':
  await handleStart(args);
  break;
// ... (6 comandos nuevos)
```

**js/ui/display.js** (agregar ~30 líneas):
```javascript
// Agregar método para mostrar advertencias de seguridad
function showSecurityWarning() {
  addLine('⚠️  SECURITY NOTICE', 'warning');
  dim('Your private key will be encrypted and stored locally.');
  // ... (ver sección 9.3)
}

// Agregar método para mostrar info de identidad
function showIdentityInfo(data) {
  info('=== IDENTITY INFO ===');
  // ... formateo de data
}
```

**css/terminal.css** (agregar ~20 líneas):
```css
/* Estilos para inputs temporales en output */
#terminal-output input {
  background: rgba(0, 255, 0, 0.1);
  border: 1px solid var(--color-primary);
  padding: 0.5rem;
  margin: 0.5rem 0;
  font-family: inherit;
  color: var(--color-primary);
}

#terminal-output input:focus {
  outline: none;
  box-shadow: 0 0 10px var(--color-primary);
}

#terminal-output input[type="password"] {
  letter-spacing: 0.3em;
}
```

**index.html** (agregar ~3 líneas):
```html
<!-- Agregar después de core/storage.js -->
<script type="module" src="js/core/keyManager.js"></script>
<script type="module" src="js/utils/inputHelpers.js"></script>
```

### 10.3 Resumen de Cambios por Archivo

| Archivo | Tipo | Líneas | Complejidad |
|---------|------|--------|-------------|
| `js/core/keyManager.js` | NUEVO | ~600 | Alta |
| `js/utils/inputHelpers.js` | NUEVO | ~250 | Media |
| `js/utils/constants.js` | MODIFICAR | +50 | Baja |
| `js/ui/commands.js` | MODIFICAR | +400 | Alta |
| `js/ui/display.js` | MODIFICAR | +30 | Baja |
| `css/terminal.css` | MODIFICAR | +20 | Baja |
| `index.html` | MODIFICAR | +3 | Baja |
| `tests/keyManager.test.js` | NUEVO | ~350 | Media |

**TOTAL ESTIMADO**: ~1700 líneas de código nuevo

---

## 11. ESTIMACIÓN DE TIEMPO

### Desglose Detallado

| Fase | Tarea | Tiempo | Dificultad |
|------|-------|--------|------------|
| **Fase 1** | Preparación y setup | 30 min | Baja |
| **Fase 2** | keyManager.js core | 2 h | Alta |
| **Fase 3** | inputHelpers.js | 1 h | Media |
| **Fase 4** | Comandos en commands.js | 2 h | Alta |
| **Fase 5** | Integración y testing | 1.5 h | Media |
| **Fase 6** | UI/UX polish | 1 h | Baja |
| **Fase 7** | Status bar update | 30 min | Baja |
| **TOTAL** | | **8.5 horas** | |

**Con testing exhaustivo**: +2 horas = **10.5 horas total**

**Con documentación completa**: +1 hora = **11.5 horas total**

### Recomendación de Sprints

**Opción 1: Sprint Único (1-2 días)**
- Día 1: Fases 1-4 (core implementation)
- Día 2: Fases 5-7 (testing & polish)

**Opción 2: Dos Sprints**
- Sprint 1: Fases 1-3 (keyManager + helpers)
- Sprint 2: Fases 4-7 (comandos + integración)

---

## 12. PRÓXIMOS PASOS DESPUÉS DE KEYMANAGER

Una vez completado keyManager.js, el siguiente módulo lógico sería:

**1. relayManager.js** (Issue #2 continuación):
- Conectar a relays Nostr
- Subscribe a eventos tipo 38383 (órdenes Mostro)
- Publicar eventos Gift Wrap (NIP-59)
- Manejo de reconexiones

**2. mostro/discovery.js**:
- Fetch órdenes públicas desde relays
- Filtrar por marketplace ('mostrop2p')
- Cachear en storage.js
- Actualizar status bar con cantidad de órdenes

**3. mostro/protocol.js**:
- Parsear mensajes Mostro
- Crear eventos con las acciones (TakeBuy, TakeSell, etc.)
- Firmar eventos con identity key
- Envolver en Gift Wrap con trade key

**Dependencias**:
```
keyManager.js (implementar primero)
    ↓
relayManager.js (conectividad)
    ↓
mostro/discovery.js (fetch órdenes)
    ↓
mostro/protocol.js (interacción)
    ↓
Comandos de trading (/newsell, /listorders, etc.)
```

---

## 13. PREGUNTAS FRECUENTES (FAQ)

### P: ¿Por qué no usar NIP-07 (extensión de navegador)?
**R**: NIP-07 requiere extensión externa (Alby, nos2x, etc.). MostroWeb busca ser standalone para usuarios sin extensiones. En el futuro, se puede agregar soporte opcional para NIP-07.

### P: ¿Por qué PBKDF2 y no Argon2?
**R**: CryptoJS solo soporta PBKDF2. Argon2 requiere WASM o librería adicional. Para Phase 2, PBKDF2 con 100k iteraciones es suficientemente seguro.

### P: ¿Cómo recuperar identidad si se olvida el password?
**R**: NO ES POSIBLE sin el nsec backup. Por eso es crítico que el usuario exporte su nsec inmediatamente después de /start.

### P: ¿Trade keys son NIP-46 (Nostr Connect) compatibles?
**R**: La derivación actual es custom (HMAC). Para NIP-46 completo, se necesita implementar el protocolo completo. Esto es una extensión futura.

### P: ¿Se puede migrar a hardware wallet?
**R**: Sí, el usuario puede exportar su nsec y cargarlo en un hardware wallet compatible con Nostr. El nsec es el formato estándar.

### P: ¿Qué pasa si se corrompe localStorage?
**R**: Los datos encriptados son irrecuperables si se corrompen. De ahí la importancia del backup de nsec. Considerar implementar export/import JSON completo en futuras versiones.

---

## 14. RECURSOS Y REFERENCIAS

### Documentación Oficial

**Nostr NIPs**:
- NIP-01: Basic protocol flow (keys, events, signing)
- NIP-19: bech32-encoded entities (nsec, npub)
- NIP-04: Encrypted Direct Message (legacy)
- NIP-44: Encrypted Payloads (modern)
- NIP-59: Gift Wrap (private messaging)

**nostr-tools**:
- Docs: https://github.com/nbd-wtf/nostr-tools
- API: https://github.com/nbd-wtf/nostr-tools#usage

**CryptoJS**:
- Docs: https://cryptojs.gitbook.io/docs/
- AES: https://cryptojs.gitbook.io/docs/#ciphers
- PBKDF2: https://cryptojs.gitbook.io/docs/#pbkdf2

### Mostro Protocol

**Mostro Docs**:
- GitHub: https://github.com/MostroP2P/mostro
- Protocol Spec: https://mostro.network/protocol/

**Actions Reference**:
- Ver `constants.js` MOSTRO_ACTIONS para lista completa

---

## 15. CONCLUSIÓN

Este documento proporciona un **plan completo y detallado** para implementar `keyManager.js` como parte del Issue #2 (Sprint 1 - Implementar Frontend para Mostros Existentes).

### Resumen de Entregables

✅ **Análisis Técnico**:
- Funciones específicas del KeyManager
- Integración con arquitectura existente
- Métodos de nostr-tools a usar
- Sistema de encriptación AES-256

✅ **Plan de Implementación**:
- 7 fases detalladas paso a paso
- Estimación de tiempo: 10.5 horas
- Archivos a crear/modificar
- Casos de prueba

✅ **Comandos de Terminal**:
- 6 comandos nuevos (/start, /import, /export, /identity, /lock, /changepass)
- Flujos de interacción completos
- Helpers para input de usuario

✅ **Consideraciones de Seguridad**:
- Vectores de ataque y mitigaciones
- Mejores prácticas
- Limitaciones y advertencias

### Estado Actual

🟢 **LISTO PARA IMPLEMENTACIÓN**

Todos los requisitos están documentados y planificados. El siguiente paso es comenzar con la **Fase 1: Preparación** según el plan del capítulo 7.

---

**Documento creado**: 2025-10-29
**Versión**: 1.0
**Autor**: Claude Code (Anthropic)
**Issue relacionado**: #2 - Sprint 1 - Implementar Frontend para Mostros Existentes
