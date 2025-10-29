# AI_AGENTS.md - Guía para Agentes de IA

## Información del Proyecto

Este documento sirve como guía para agentes de IA que trabajen en el proyecto **MostroWeb**.

---

## 1. OBJETIVOS DEL PROYECTO

### Visión General
**MostroWeb** es un cliente web frontend para interactuar con Mostro P2P, un daemon descentralizado para intercambios de Bitcoin Lightning Network sin custodia, usando el protocolo Nostr como capa de comunicación.

### Objetivos Principales
1. Proporcionar una interfaz web con estética terminal retro (años 80)
2. Permitir gestión de identidad Nostr (generación/importación de claves privadas)
3. Facilitar envío y recepción de mensajes encriptados a/desde Mostro
4. Implementar interfaz visual para todos los comandos de Mostro
5. Simplificar la experiencia de usuario (sin necesidad de usar terminal real)

### Filosofía de Diseño
- **Minimalista**: Interfaz tipo terminal retro verde sobre negro
- **Simple**: HTML/CSS/JS vanilla con mínimas dependencias
- **No custodial**: Las claves privadas NUNCA salen del navegador
- **Descentralizado**: Conexión directa a relays Nostr, sin servidores intermediarios
- **Open Source**: Código auditable y transparente

---

## 2. STACK TECNOLÓGICO

### Frontend Core
```javascript
{
  "html": "HTML5 semántico",
  "css": "CSS3 vanilla (estilo terminal retro)",
  "javascript": "ES6+ vanilla (sin frameworks)"
}
```

### Librerías Esenciales
1. **nostr-tools** (v2.5.2+)
   - SimplePool para gestión de relays
   - Creación y firma de eventos
   - NIP-19 encoding/decoding
   - NIP-44 o NIP-04 para encriptación

2. **@noble/secp256k1** (incluida en nostr-tools)
   - Generación de key pairs
   - Firma Schnorr

3. **uuid** (v9+)
   - Generación de UUIDs para order_id y request_id

### Librerías Opcionales
- **xterm.js**: Terminal realista (si se requiere)
- **crypto-js**: Encriptación de LocalStorage con password
- **qrcode.js**: Generación de QR codes para invoices

### Almacenamiento
```javascript
// LocalStorage structure
{
  "mostro_identity_key": "encrypted-private-key-hex",
  "mostro_trade_key": "public-key-hex",
  "mostro_trade_index": 42,
  "mostro_relays": ["wss://relay.mostro.network", "..."],
  "mostro_orders": [...],
  "mostro_settings": {
    "theme": "green",
    "font_size": 14,
    "relay_timeout": 5000
  }
}
```

### Relays Nostr Predeterminados
```javascript
const DEFAULT_RELAYS = [
  'wss://relay.damus.io',
  'wss://nostr-pub.wellorder.net',
  'wss://nos.lol',
  'wss://relay.snort.social',
  'wss://relay.nostr.band'
];

// IMPORTANTE: No hay "relay oficial de Mostro"
// Cada Mostro daemon publica a sus propios relays configurados
// MostroWeb se conecta a múltiples relays públicos para maximizar descubrimiento
```

---

## 3. ESTRUCTURA DE ARCHIVOS

```
mostroweb/
├── index.html                 # Página principal
├── README.md                  # Documentación del usuario
├── READMEv1.md               # Arquitectura técnica
├── AI_AGENTS.md              # Este archivo
├── package.json              # Dependencias npm (opcional)
│
├── css/
│   ├── terminal.css          # Estilos retro terminal
│   ├── components.css        # Componentes UI
│   └── themes.css            # Temas (green, amber, blue)
│
├── js/
│   ├── main.js               # Punto de entrada
│   │
│   ├── core/
│   │   ├── keyManager.js     # Gestión de claves Nostr
│   │   ├── relayManager.js   # Conexión a relays
│   │   ├── messageHandler.js # Creación/envío mensajes
│   │   └── storage.js        # LocalStorage wrapper
│   │
│   ├── mostro/
│   │   ├── protocol.js       # Definiciones del protocolo
│   │   ├── actions.js        # Implementación de acciones
│   │   ├── encryption.js     # NIP-59 GiftWrap
│   │   └── validation.js     # Validación de mensajes
│   │
│   ├── ui/
│   │   ├── terminal.js       # Componente terminal
│   │   ├── commands.js       # Parser de comandos
│   │   ├── display.js        # Rendering de respuestas
│   │   └── notifications.js  # Sistema de notificaciones
│   │
│   ├── models/
│   │   ├── Order.js          # Modelo de orden
│   │   └── User.js           # Modelo de usuario
│   │
│   └── utils/
│       ├── constants.js      # Constantes (relays, kinds, etc)
│       ├── helpers.js        # Funciones auxiliares
│       └── logger.js         # Sistema de logs
│
├── assets/
│   ├── fonts/                # Fuentes monospace retro
│   ├── sounds/               # Sonidos de terminal (opcional)
│   └── images/               # Logos, iconos
│
└── docs/
    ├── API.md                # Documentación API Mostro
    ├── COMMANDS.md           # Lista de comandos
    └── DEVELOPMENT.md        # Guía para desarrolladores
```

---

## 4. PROTOCOLO NOSTR-MOSTRO

### 4.1 Estructura de Mensaje Mostro

Todos los mensajes siguen este formato:

```json
[
  {
    "order": {
      "version": 1,
      "request_id": "uuid-opcional",
      "trade_index": 1,
      "id": "order-uuid",
      "action": "NewOrder",
      "payload": {
        // Datos específicos del comando
      }
    }
  },
  "optional-signature"
]
```

### 4.2 Tipos de Eventos Nostr

#### A. GiftWrap (Kind 1059 - NIP-59)
**Uso:** Comunicación privada usuario ↔ Mostro

**Características:**
- Encriptación end-to-end
- Autor efímero (privacy)
- Timestamp randomizado (±2 días)
- Contenido: Seal event (kind 13)

#### B. Replaceable Events (Kind 34242 - NIP-33)
**Uso:** Publicación de órdenes públicas (descubribles por todos)

**Características:**
- Publicados por Mostro daemons cuando se crean órdenes
- PÚBLICOS - cualquier cliente puede descubrirlos
- El `pubkey` del evento identifica qué Mostro publicó la orden
- MostroWeb extrae este pubkey dinámicamente para interactuar

**Filtro de descubrimiento:**
```javascript
{
  kinds: [34242],
  "#y": ["mostrop2p"],  // Marketplace identifier
  "#z": ["order"],       // Event type
  "#s": ["pending"]      // Status filter (opcional)
}
```

**Tags importantes:**
- `d`: Order ID
- `k`: Tipo (buy/sell)
- `f`: Código moneda fiat
- `s`: Estado (pending/active/etc)
- `amt`: Monto en satoshis
- `fa`: Monto en fiat
- `pm`: Método de pago
- `y`: "mostrop2p"
- `z`: "order"
- `premium`: Porcentaje de premium
- `source`: Link a la orden

### 4.3 Sistema de Autenticación

**Modelo de Dos Llaves:**

1. **Identity Key**: Private key principal (almacenada offline recomendado)
2. **Trade Key**: Public key usada en transacciones (compartida con Mostro)

**Flujo:**
```
1. Usuario genera/importa Identity Key
2. Envía TradePubkey a Mostro
3. Mostro asocia Trade Key con Identity Key
4. Usuario opera usando Trade Key
5. RestoreSession recupera estado si se pierde sesión
```

---

## 5. COMANDOS A IMPLEMENTAR

### Fase 1 - MVP (Prioridad Alta)

#### Gestión de Sesión
```javascript
// /start - Registra public key
{ action: "TradePubkey", payload: { public_key: "hex" } }

// /restore - Restaura sesión
{ action: "RestoreSession", payload: { last_trade_index?: number } }

// /getindex - Obtiene último trade_index
{ action: "LastTradeIndex", payload: {} }
```

#### Creación de Órdenes
```javascript
// /newsell - Crea orden de venta
{
  action: "NewOrder",
  payload: {
    kind: "sell",
    fiat_code: "USD",
    fiat_amount: 100,
    payment_method: "Zelle",
    premium: 0
  }
}

// /newbuy - Crea orden de compra
{
  action: "NewOrder",
  payload: {
    kind: "buy",
    fiat_code: "USD",
    fiat_amount: 100,
    payment_method: "Zelle",
    premium: 0
  }
}
```

#### Gestión de Órdenes
```javascript
// /listorders - Lista órdenes del usuario
{ action: "Orders", payload: { status?: "pending" | "active" | "all" } }

// /cancel <id> - Cancela orden
{ action: "Cancel", payload: { order_id: "uuid" } }

// /takebuy <id> - Toma orden de compra
{ action: "TakeBuy", payload: { order_id: "uuid" } }

// /takesell <id> - Toma orden de venta
{ action: "TakeSell", payload: { order_id: "uuid" } }
```

#### Flujo de Pago
```javascript
// /addinvoice <order_id> <invoice> - Añade invoice LN
{ action: "AddInvoice", payload: { order_id: "uuid", invoice: "lnbc..." } }

// /fiatsent <order_id> - Notifica envío de fiat
{ action: "FiatSent", payload: { order_id: "uuid" } }

// /release <order_id> - Libera fondos (seller confirma)
{ action: "Release", payload: { order_id: "uuid" } }
```

### Fase 2 - Funcionalidad Intermedia

```javascript
// Disputas
{ action: "Dispute", payload: { order_id: "uuid" } }
{ action: "AdminTakeDispute", payload: { dispute_id: "uuid" } }

// Calificaciones
{ action: "RateUser", payload: { order_id: "uuid", rating: 5 } }

// Cancelación Cooperativa
{ action: "CooperativeCancelInit", payload: { order_id: "uuid" } }
{ action: "CooperativeCancelAccept", payload: { order_id: "uuid" } }
```

### Fase 3 - Funcionalidad Avanzada (Admin/Solver)

```javascript
// Admin Commands
{ action: "AdminCancel", payload: { order_id: "uuid" } }
{ action: "AdminSettle", payload: { dispute_id: "uuid", winner: "buyer" | "seller" } }
{ action: "AdminAddSolver", payload: { pubkey: "hex" } }
{ action: "AdminRemoveSolver", payload: { pubkey: "hex" } }

// Pagos Directos
{ action: "PayInvoice", payload: { order_id: "uuid" } }

// Mensajes Directos
{ action: "DirectMessage", payload: { peer: "pubkey", message: "..." } }
```

---

## 6. REGLAS DE DESARROLLO

### 6.1 Principios de Código

1. **Vanilla JavaScript**: No usar frameworks (React, Vue, Angular)
2. **Modularidad**: Separar lógica en módulos cohesivos
3. **ES6+**: Usar sintaxis moderna (const/let, arrow functions, async/await)
4. **Naming**: camelCase para variables/funciones, PascalCase para clases
5. **Comentarios**: JSDoc para funciones públicas
6. **DRY**: No repetir código, crear funciones reutilizables

### 6.2 Estilo de Código

```javascript
// CORRECTO: Función bien documentada
/**
 * Envía un mensaje GiftWrap a Mostro
 * @param {string} action - Acción a ejecutar
 * @param {Object} payload - Datos del mensaje
 * @returns {Promise<Event>} Evento Nostr creado
 */
async function sendToMostro(action, payload) {
  const message = buildMostroMessage(action, payload);
  const giftWrap = await createGiftWrap(message);
  return pool.publish(DEFAULT_RELAYS, giftWrap);
}

// INCORRECTO: Sin documentación, nombres poco claros
async function send(a, p) {
  const m = build(a, p);
  const g = await wrap(m);
  return pub(r, g);
}
```

### 6.3 Gestión de Errores

```javascript
// CORRECTO: Manejo de errores explícito
try {
  const order = await createOrder(params);
  displaySuccess('Orden creada exitosamente');
} catch (error) {
  logger.error('Error creando orden:', error);
  displayError('No se pudo crear la orden. Intenta nuevamente.');
}

// INCORRECTO: Sin manejo de errores
const order = await createOrder(params);
displaySuccess('Orden creada');
```

### 6.4 Promesas y Async/Await

```javascript
// CORRECTO: Usar async/await
async function fetchOrders() {
  const events = await pool.list(DEFAULT_RELAYS, [{ kinds: [34242] }]);
  return events.map(parseOrder);
}

// EVITAR: Callbacks anidados (callback hell)
pool.list(DEFAULT_RELAYS, [{ kinds: [34242] }], (events) => {
  events.forEach((event) => {
    parseOrder(event, (order) => {
      displayOrder(order);
    });
  });
});
```

---

## 7. REGLAS DE SEGURIDAD

### 7.1 Gestión de Claves Privadas

**CRÍTICO - REGLAS ABSOLUTAS:**

1. Private key NUNCA debe enviarse a servidor externo
2. Private key NUNCA debe ser logueada en console
3. Encriptar private key con AES-256 antes de guardar en LocalStorage
4. Usar password fuerte para encriptación local
5. Implementar timeout de sesión (auto-lock)
6. Ofrecer opción de "session key" temporal (no persistente)

```javascript
// CORRECTO: Encriptar antes de guardar
const encrypted = CryptoJS.AES.encrypt(privateKeyHex, userPassword);
localStorage.setItem('mostro_identity_key', encrypted.toString());

// INCORRECTO: Guardar en texto plano
localStorage.setItem('mostro_identity_key', privateKeyHex); // NUNCA HACER ESTO
```

### 7.2 Validación de Mensajes

**Validaciones obligatorias:**

```javascript
function validateIncomingMessage(event) {
  // 1. Verificar firma
  if (!verifyEvent(event)) {
    throw new Error('Firma inválida');
  }

  // 2. Verificar pubkey (debe ser Mostro)
  if (event.pubkey !== MOSTRO_PUBKEY) {
    throw new Error('Evento no proviene de Mostro');
  }

  // 3. Verificar trade_index (anti-replay)
  const message = JSON.parse(decryptedContent);
  if (message.trade_index <= lastTradeIndex) {
    throw new Error('Trade index inválido (replay attack)');
  }

  // 4. Verificar timestamp (no muy antiguo/futuro)
  const now = Date.now() / 1000;
  if (Math.abs(event.created_at - now) > 86400) { // 24 horas
    throw new Error('Timestamp fuera de rango');
  }

  return true;
}
```

### 7.3 Protección contra Ataques

#### Replay Attack
```javascript
// SIEMPRE incrementar trade_index
let tradeIndex = parseInt(localStorage.getItem('mostro_trade_index')) || 0;

function sendMessage(action, payload) {
  tradeIndex++;
  localStorage.setItem('mostro_trade_index', tradeIndex);

  const message = {
    order: {
      version: 1,
      trade_index: tradeIndex,
      action: action,
      payload: payload
    }
  };

  return sendGiftWrap(message);
}
```

#### XSS/Injection
```javascript
// CORRECTO: Sanitizar input del usuario
function displayMessage(text) {
  const sanitized = text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');

  terminalOutput.textContent = sanitized; // Usar textContent, no innerHTML
}

// INCORRECTO: Usar innerHTML directamente
function displayMessage(text) {
  terminalOutput.innerHTML = text; // NUNCA HACER ESTO con input no sanitizado
}
```

### 7.4 Privacidad (NIP-59 GiftWrap)

```javascript
// SIEMPRE usar claves efímeras y timestamp randomizado
async function createGiftWrap(content, recipientPubkey) {
  // 1. Generar ephemeral key
  const ephemeralKey = generatePrivateKey();

  // 2. Crear Seal event (kind 13)
  const seal = {
    kind: 13,
    created_at: Math.floor(Date.now() / 1000),
    content: await encrypt(content, recipientPubkey),
    tags: []
  };

  // 3. Crear GiftWrap (kind 1059) con timestamp randomizado
  const randomTimestamp = Math.floor(Date.now() / 1000) +
    (Math.random() * 172800 - 86400); // ±1 día

  const giftWrap = {
    kind: 1059,
    pubkey: getPublicKey(ephemeralKey),
    created_at: randomTimestamp,
    tags: [['p', recipientPubkey]],
    content: await encrypt(JSON.stringify(seal), recipientPubkey)
  };

  return finalizeEvent(giftWrap, ephemeralKey);
}
```

---

## 8. CONSIDERACIONES DE UX

### 8.1 Estética Terminal Retro

#### Paleta de Colores
```css
/* Terminal Verde (por defecto) */
:root {
  --bg-color: #000000;           /* Negro absoluto */
  --text-color: #00ff00;         /* Verde neón */
  --text-dim: #008800;           /* Verde oscuro */
  --cursor-color: #00ff00;       /* Verde neón */
  --selection-bg: #004400;       /* Verde muy oscuro */
}

/* Terminal Amber (alternativa) */
.theme-amber {
  --text-color: #ffb000;         /* Ámbar */
  --text-dim: #aa7700;
}

/* Terminal Blue (alternativa) */
.theme-blue {
  --text-color: #00aaff;         /* Azul cyan */
  --text-dim: #0066aa;
}
```

#### Tipografía
```css
/* Fuente monospace retro */
body {
  font-family: 'Courier New', 'Consolas', 'Monaco', monospace;
  font-size: 14px;
  line-height: 1.5;
  letter-spacing: 0.5px;
}
```

#### Efectos Visuales
```css
/* Efecto scanline (opcional) */
.terminal::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: linear-gradient(
    transparent 50%,
    rgba(0, 0, 0, 0.1) 50%
  );
  background-size: 100% 4px;
  pointer-events: none;
}

/* Cursor parpadeante */
.cursor {
  animation: blink 1s step-end infinite;
}

@keyframes blink {
  0%, 50% { opacity: 1; }
  51%, 100% { opacity: 0; }
}
```

### 8.2 Interacción Terminal

#### Prompt
```
mostro> _
```

#### Autocompletado
```javascript
// Al presionar TAB
mostro> /new[TAB]
// Se completa a:
mostro> /newbuy

// Si hay múltiples opciones:
mostro> /new[TAB]
/newbuy  /newsell
mostro> /new
```

#### Historial de Comandos
```javascript
// Flecha Arriba: Comando anterior
// Flecha Abajo: Comando siguiente
// Similar a bash history
```

#### Mensajes de Sistema
```
[INFO] Conectado a relay relay.mostro.network
[SUCCESS] Orden creada: abc123
[ERROR] No se pudo procesar el comando
[WARNING] Trade index puede estar desactualizado
```

### 8.3 Feedback Visual

#### Estados de Órdenes
```javascript
const ORDER_STATES = {
  pending: { color: '#ffff00', symbol: '○', label: 'PENDIENTE' },
  active: { color: '#00ff00', symbol: '●', label: 'ACTIVA' },
  waiting_payment: { color: '#ffaa00', symbol: '◐', label: 'ESPERANDO PAGO' },
  fiat_sent: { color: '#00aaff', symbol: '◑', label: 'FIAT ENVIADO' },
  success: { color: '#00ff00', symbol: '✓', label: 'COMPLETADA' },
  canceled: { color: '#ff0000', symbol: '✗', label: 'CANCELADA' },
  dispute: { color: '#ff00ff', symbol: '⚠', label: 'DISPUTA' }
};
```

#### Loading Indicators
```
Processing... [████████░░] 80%
Connecting to relays... [●●●○○○○○○○]
Waiting for response... ⠋ (spinner animation)
```

#### Notificaciones
```
╔═══════════════════════════════════╗
║  ORDEN COMPLETADA EXITOSAMENTE    ║
║  Order ID: abc123                 ║
║  Monto: 100 USD → 50,000 sats    ║
╚═══════════════════════════════════╝
```

### 8.4 Tutoriales y Ayuda

#### Comando /help
```
mostro> /help

COMANDOS DISPONIBLES:

Sesión:
  /start              - Iniciar sesión con Mostro
  /restore            - Restaurar sesión perdida

Órdenes:
  /newbuy             - Crear orden de compra
  /newsell            - Crear orden de venta
  /listorders         - Listar mis órdenes
  /cancel <id>        - Cancelar orden

Trading:
  /takebuy <id>       - Tomar orden de compra
  /takesell <id>      - Tomar orden de venta
  /addinvoice <id>    - Añadir invoice Lightning
  /fiatsent <id>      - Marcar fiat como enviado
  /release <id>       - Liberar fondos

Utilidades:
  /help               - Mostrar esta ayuda
  /clear              - Limpiar terminal
  /theme <color>      - Cambiar tema (green/amber/blue)

Para más información: /help <comando>
```

#### Hints Contextuales
```javascript
// Si usuario escribe comando incorrecto
mostro> /newsel
[HINT] ¿Quisiste decir "/newsell"?

// Si falta parámetro
mostro> /cancel
[ERROR] Falta parámetro: order_id
[USAGE] /cancel <order_id>
[EXAMPLE] /cancel abc-123-def
```

---

## 9. TESTING Y VALIDACIÓN

### 9.1 Testing Manual

**Checklist de Pruebas:**
- [ ] Generación de claves Nostr
- [ ] Importación de claves existentes
- [ ] Conexión a múltiples relays
- [ ] Envío de TradePubkey a Mostro
- [ ] Creación de orden de venta
- [ ] Creación de orden de compra
- [ ] Listado de órdenes
- [ ] Tomar orden (buy/sell)
- [ ] Añadir invoice Lightning
- [ ] Notificar fiat enviado
- [ ] Liberar fondos
- [ ] Cancelar orden
- [ ] Disputas
- [ ] Calificaciones
- [ ] Restauración de sesión
- [ ] Encriptación/desencriptación NIP-59

### 9.2 Casos de Prueba Críticos

```javascript
// Test 1: Trade Index Incrementante
test('Trade index debe incrementar en cada mensaje', async () => {
  const index1 = getCurrentTradeIndex();
  await sendMessage('NewOrder', {});
  const index2 = getCurrentTradeIndex();
  assert(index2 === index1 + 1);
});

// Test 2: Validación de Firma
test('Debe rechazar eventos con firma inválida', () => {
  const fakeEvent = { ...validEvent, sig: 'invalid-signature' };
  assert.throws(() => validateIncomingMessage(fakeEvent));
});

// Test 3: Encriptación LocalStorage
test('Private key debe estar encriptada en LocalStorage', () => {
  const stored = localStorage.getItem('mostro_identity_key');
  assert(!stored.includes('nsec'));
  assert(stored.length > 100); // Debe ser ciphertext, no plaintext
});
```

### 9.3 Testnet vs Mainnet

```javascript
// SIEMPRE usar testnet durante desarrollo
const CONFIG = {
  environment: 'testnet', // 'mainnet' solo en producción
  mostro_pubkey: TESTNET_MOSTRO_PUBKEY,
  relays: TESTNET_RELAYS,
  bitcoin_network: 'testnet'
};

// Advertencia visual en mainnet
if (CONFIG.environment === 'mainnet') {
  console.warn('⚠️  MAINNET MODE - REAL BITCOIN ⚠️');
  displayWarning('Estás usando MAINNET. Ten cuidado.');
}
```

---

## 10. PATRONES COMUNES

### 10.1 Enviar Comando a Mostro

```javascript
async function sendMostroCommand(action, payload, mostroPubkey, orderId = null) {
  try {
    // 1. Incrementar trade_index
    const tradeIndex = incrementTradeIndex();

    // 2. Construir mensaje
    const message = {
      order: {
        version: 1,
        request_id: uuidv4(),
        trade_index: tradeIndex,
        id: orderId,
        action: action,
        payload: payload
      }
    };

    // 3. Crear GiftWrap dirigido al Mostro específico
    const giftWrap = await createGiftWrap(
      JSON.stringify([message]),
      mostroPubkey  // CRÍTICO: pubkey extraído de la orden
    );

    // 4. Publicar a relays
    await pool.publish(DEFAULT_RELAYS, giftWrap);

    // 5. Esperar respuesta
    return await waitForResponse(message.request_id);

  } catch (error) {
    logger.error(`Error enviando comando ${action}:`, error);
    throw error;
  }
}

// Ejemplo de uso:
const order = selectedOrder;  // Orden seleccionada por el usuario
const targetMostro = order.pubkey;  // Extraer pubkey del evento

await sendMostroCommand(
  'TakeBuy',
  { order_id: order.id },
  targetMostro  // Mostro específico que publicó esta orden
);
```

### 10.2 Escuchar Respuestas de Mostro

```javascript
async function listenForMostroMessages() {
  const sub = pool.sub(DEFAULT_RELAYS, [
    {
      kinds: [1059], // GiftWraps
      '#p': [myPublicKey]
    }
  ]);

  sub.on('event', async (event) => {
    try {
      // 1. Desencriptar GiftWrap
      const seal = await decryptGiftWrap(event, myPrivateKey);

      // 2. Desencriptar Seal
      const content = await decrypt(seal.content, myPrivateKey);

      // 3. Parsear mensaje
      const message = JSON.parse(content);

      // 4. Identificar de qué Mostro viene el mensaje
      // (Opcional: validar contra lista de Mostros conocidos)
      const mostroPubkey = event.pubkey;

      // 5. Validar trade_index
      if (message.trade_index <= lastTradeIndex) {
        throw new Error('Invalid trade_index');
      }

      // 6. Actualizar trade_index
      updateTradeIndex(message.trade_index);

      // 7. Procesar mensaje con contexto del Mostro
      await handleMostroMessage(message, mostroPubkey);

    } catch (error) {
      logger.error('Error procesando mensaje de Mostro:', error);
    }
  });
}

// IMPORTANTE: Usuario puede estar interactuando con MÚLTIPLES Mostros
// simultáneamente. Identificar el origen de cada mensaje por su pubkey.
```

### 10.3 Parsear Órdenes Públicas (NIP-33)

```javascript
async function fetchPublicOrders() {
  // Descubrir órdenes de TODOS los Mostros en los relays
  const events = await pool.list(DEFAULT_RELAYS, [
    {
      kinds: [34242],
      '#y': ['mostrop2p'],
      '#z': ['order'],
      '#s': ['pending', 'active']
    }
  ]);

  return events.map(event => {
    const tags = Object.fromEntries(event.tags);

    return {
      id: tags.d,
      kind: tags.k, // 'buy' o 'sell'
      fiat_code: tags.f,
      fiat_amount: parseInt(tags.fa),
      amount: parseInt(tags.amt), // satoshis
      payment_method: tags.pm,
      status: tags.s,
      premium: parseFloat(tags.premium || 0),
      created_at: event.created_at,

      // CRÍTICO: Guardar pubkey del Mostro que publicó esta orden
      mostro_pubkey: event.pubkey,  // Necesario para interactuar después

      // Opcional: Pubkey del creador de la orden (puede ser diferente)
      creator: tags.creator || event.pubkey
    };
  });
}

// Agrupar órdenes por Mostro (útil para UI)
function groupOrdersByMostro(orders) {
  const grouped = {};

  orders.forEach(order => {
    const mostro = order.mostro_pubkey;
    if (!grouped[mostro]) {
      grouped[mostro] = [];
    }
    grouped[mostro].push(order);
  });

  return grouped;
}

// Cuando usuario selecciona una orden
function selectOrder(order) {
  // Guardar el Mostro target para futuros comandos
  state.currentMostro = order.mostro_pubkey;
  state.currentOrder = order;
}
```

---

## 11. RECURSOS Y REFERENCIAS

### 11.1 Repositorios Relacionados
- **Mostro Daemon**: `/home/ubuntu/github/mostro/`
- **LNp2pBot**: `/home/ubuntu/github/bot/`
- **Nostr Protocol**: `/home/ubuntu/github/nostr/`

### 11.2 Documentación Externa
- Nostr Protocol: https://github.com/nostr-protocol/nostr
- nostr-tools: https://github.com/nbd-wtf/nostr-tools
- NIPs: https://github.com/nostr-protocol/nips
  - NIP-01: Basic protocol
  - NIP-04: Encrypted Direct Messages (legacy)
  - NIP-19: bech32 encoding (npub, nsec)
  - NIP-33: Parameterized Replaceable Events
  - NIP-44: Versioned Encryption (recomendado)
  - NIP-59: Gift Wrap

### 11.3 Herramientas Útiles
- **Nostr DevTools**: https://nostr.watch
- **Key Converter**: https://nostr.band
- **Relay Explorer**: https://nostr.info
- **Invoice Decoder**: https://lightningdecoder.com

---

## 12. PREGUNTAS FRECUENTES PARA IA

### ¿Debo usar un framework frontend?
**NO.** El proyecto usa vanilla JavaScript por diseño. No uses React, Vue, Angular, ni similares.

### ¿Cómo manejo el estado de la aplicación?
Usa el patrón Observer con eventos custom del DOM, o implementa un State Manager simple en vanilla JS.

### ¿Qué librería de encriptación uso?
**nostr-tools** incluye NIP-44 encryption. Usa eso. Para LocalStorage, usa **crypto-js** con AES-256.

### ¿Cómo pruebo sin usar Bitcoin real?
Usa testnet. Configura `environment: 'testnet'` y conecta a relays de testing.

### ¿Puedo guardar la private key en texto plano?
**NUNCA.** Siempre encripta con password del usuario antes de guardar en LocalStorage.

### ¿Qué hago si el usuario pierde su sesión?
Implementa el comando `/restore` que envía `RestoreSession` action a Mostro para recuperar estado.

### ¿Hay una public key fija de Mostro?
**NO.** Mostro es un protocolo descentralizado. Cada Mostro daemon tiene su propia pubkey. Extrae la pubkey dinámicamente del evento de orden (`event.pubkey`).

### ¿Cómo descubro qué Mostros existen?
Busca eventos Kind 34242 en relays públicos. El `pubkey` de cada evento identifica un Mostro daemon. No hay registro central.

### ¿Puedo interactuar con múltiples Mostros a la vez?
**SÍ.** Un usuario puede tener órdenes activas con varios Mostros simultáneamente. Guarda el `mostro_pubkey` por cada orden.

### ¿Cómo sé si un mensaje es de un Mostro legítimo?
Verifica la firma del evento con `verifyEvent()` y compara `event.pubkey` con el pubkey de la orden que estás procesando. Opcionalmente, implementa whitelist/blacklist de Mostros conocidos.

### ¿Qué es trade_index y por qué es importante?
Es un contador incrementante que previene replay attacks. SIEMPRE valida que sea mayor al último conocido.

### ¿Puedo usar innerHTML para mostrar mensajes?
**NO.** Usa `textContent` o sanitiza el contenido primero para evitar XSS.

### ¿Cómo implemento el estilo retro terminal?
CSS con colores neón sobre fondo negro, fuente monospace, y opcionalmente efectos scanline y cursor parpadeante.

### ¿Qué pasa si un Mostro daemon se desconecta?
Las órdenes de ese Mostro dejarán de actualizarse, pero otros Mostros siguen funcionando. Esto es una ventaja de la descentralización: no hay single point of failure.

---

## 13. WORKFLOW RECOMENDADO PARA IA

Cuando trabajes en este proyecto, sigue este flujo:

1. **Leer Contexto**
   - Lee este archivo (AI_AGENTS.md)
   - Revisa READMEv1.md para arquitectura detallada
   - Consulta estructura de archivos existente

2. **Planificar Tarea**
   - Identifica qué módulo afecta (core/, mostro/, ui/)
   - Verifica dependencias entre módulos
   - Planea tests necesarios

3. **Implementar**
   - Sigue las reglas de código (sección 6)
   - Aplica reglas de seguridad (sección 7)
   - Usa patrones comunes (sección 10)

4. **Validar**
   - Verifica que funciona en testnet
   - Comprueba que no hay console.errors
   - Valida que private keys estén encriptadas

5. **Documentar**
   - Añade JSDoc a funciones públicas
   - Actualiza COMMANDS.md si añades comandos
   - Comenta lógica compleja

---

## 14. ESTADO ACTUAL DEL PROYECTO

### ¿Qué está implementado?
Consulta el archivo README.md para ver el estado actual de implementación.

### ¿Qué falta por hacer?
Consulta el Roadmap en READMEv1.md sección 8 para ver los sprints pendientes.

### ¿Cómo contribuir?
1. Revisa este documento completo
2. Lee READMEv1.md para entender arquitectura
3. Elige una tarea del Roadmap
4. Implementa siguiendo las reglas de este documento
5. Prueba exhaustivamente en testnet

---

**Documento actualizado:** 2025-10-29
**Versión:** 1.0
**Propósito:** Guía para agentes de IA trabajando en MostroWeb

---

## RESUMEN EJECUTIVO PARA IA

**Proyecto:** Cliente web terminal retro para Mostro P2P Bitcoin
**Tech Stack:** HTML/CSS/JS vanilla + nostr-tools
**Protocolo:** Nostr (NIP-59 GiftWrap, NIP-33 Events)
**Seguridad:** Private keys nunca salen del navegador, encriptación AES-256
**UX:** Terminal años 80, verde sobre negro, comandos tipo CLI
**Prioridad:** Seguridad > Simplicidad > Features

**Reglas Absolutas:**
- NO usar frameworks frontend
- NO guardar private keys sin encriptar
- SIEMPRE validar trade_index
- SIEMPRE verificar firmas de eventos
- SIEMPRE usar testnet en desarrollo

**Para empezar:**
1. Lee READMEv1.md (arquitectura completa)
2. Revisa estructura de archivos (sección 3)
3. Estudia comandos a implementar (sección 5)
4. Sigue patrones comunes (sección 10)
5. Implementa con seguridad (sección 7)
