# MostroWeb - Cliente Web Frontend para Mostro P2P

## Documento de Arquitectura v1.0

---

## 1. CONTEXTO Y OBJETIVOS

### 1.1 Contexto
**Mostro** es un daemon P2P que facilita intercambios de Bitcoin Lightning Network de forma descentralizada y sin custodia, utilizando el protocolo **Nostr** como capa de comunicación.

Actualmente, los usuarios deben interactuar con Mostro mediante:
- Terminal/línea de comandos
- Clientes Nostr que soporten el protocolo personalizado de Mostro

### 1.2 Objetivo de MostroWeb
Crear un **cliente web frontend** que proporcione una interfaz gráfica minimalista (estilo terminal años 80) para interactuar con Mostro vía mensajes Nostr, permitiendo:

1. Gestión de identidad Nostr (import/generación de private key)
2. Envío y recepción de mensajes encriptados a/desde Mostro
3. Interfaz visual para todos los comandos de Mostro
4. Experiencia de usuario simplificada (sin necesidad de usar terminal)

### 1.3 Filosofía de Diseño
- **Minimalista**: Interfaz tipo terminal retro (años 80)
- **Simple**: HTML/CSS/JS vanilla con mínimas dependencias
- **No custodial**: Las claves privadas nunca salen del navegador del usuario
- **Descentralizado**: Conexión directa a relays Nostr, sin servidores intermediarios
- **Open Source**: Código auditable y transparente

---

## 2. ARQUITECTURA TÉCNICA

### 2.1 Diagrama de Arquitectura

```
┌─────────────────────────────────────────────────────────────┐
│                    USUARIO                                  │
│                (Navegador Web)                              │
└────────────────────┬────────────────────────────────────────┘
                     │
     ┌───────────────┴────────────────┐
     │                                │
┌────▼────────┐              ┌───────▼────────┐
│  Frontend   │              │  LocalStorage  │
│  (HTML/CSS/JS)              │  - Identity Key│
│  - UI Terminal              │  - Trade Key   │
│  - Comandos                 │  - Settings    │
└────┬────────┘              └────────────────┘
     │
     │ nostr-tools
     │
┌────▼─────────────────────────────────────────────────────┐
│           Nostr Client Layer                             │
│  - SimplePool (gestión de relays)                        │
│  - Event Creation (finalizeEvent, GiftWrap NIP-59)      │
│  - Event Verification (verifyEvent)                      │
│  - Encryption/Decryption (NIP-44 o NIP-04)              │
└────┬─────────────────────────────────────────────────────┘
     │
     │ WebSocket (wss://)
     │
┌────▼─────────────────────────────────────────────────────┐
│           Nostr Relays Públicos (múltiples)              │
│  - relay.damus.io                                        │
│  - nostr-pub.wellorder.net                               │
│  - nos.lol                                               │
│  - relay.snort.social                                    │
└────┬─────────────────────────────────────────────────────┘
     │
     │ Eventos Públicos (Kind 34242)  │  Mensajes Privados
     │ Órdenes descubribles           │  (Kind 1059 - GiftWrap)
     │                                 │
     ├─────────────────────────────────┴──────────────────┐
     │                                                     │
┌────▼────────────┐  ┌──────────────┐  ┌─────────────────▼──┐
│ Mostro Daemon A │  │ Mostro D. B  │  │  Mostro Daemon C   │
│ npub: AAA...    │  │ npub: BBB... │  │  npub: CCC...      │
│ - LND Node      │  │ - LND Node   │  │  - LND Node        │
│ - SQLite DB     │  │ - SQLite DB  │  │  - SQLite DB       │
│ - Fee: 0.3%     │  │ - Fee: 0.5%  │  │  - Fee: 0.2%       │
└─────────────────┘  └──────────────┘  └────────────────────┘
   (Independientes, descentralizados, intercambiables)

ARQUITECTURA DESCENTRALIZADA:
- Múltiples Mostro daemons ejecutándose independientemente
- Cada uno publica órdenes como eventos públicos (Kind 34242)
- MostroWeb descubre órdenes dinámicamente buscando en relays
- Usuario puede interactuar con cualquier Mostro instance
- NO hay "Mostro central" - es un protocolo P2P abierto
```

### 2.2 Componentes del Frontend

#### A. Key Manager
- Generación de claves Nostr (secp256k1)
- Import/export de private key
- Almacenamiento seguro en LocalStorage (encriptado con password)
- Derivación de public key

#### B. Relay Manager
- Conexión a múltiples relays Nostr
- Gestión de estado de conexiones
- Auto-reconexión
- Configuración de relays personalizada

#### C. Message Handler
- Creación de mensajes Mostro (JSON con action + payload)
- Encriptación de mensajes (NIP-59 GiftWrap)
- Firma de mensajes (Schnorr)
- Envío de eventos a Mostro
- Escucha de respuestas
- Desencriptación de respuestas
- Validación de trade_index (anti-replay)

#### D. UI Terminal
- Prompt de comandos estilo terminal
- Autocompletado de comandos
- Historial de comandos
- Display de respuestas de Mostro
- Notificaciones visuales

#### E. Order Manager
- Listado de órdenes propias
- Display de órdenes públicas (eventos NIP-33)
- Tracking de estados de órdenes
- Historial de transacciones

---

## 3. PROTOCOLO DE MENSAJES NOSTR-MOSTRO

### 3.1 Estructura de Mensaje Mostro

Todos los mensajes a Mostro siguen este formato:

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

**Campos clave:**
- `version`: Versión del protocolo (actualmente 1)
- `request_id`: UUID opcional para tracking
- `trade_index`: Contador incrementante para evitar replay attacks
- `id`: UUID de la orden (cuando aplica)
- `action`: Nombre de la acción a ejecutar
- `payload`: Datos específicos de cada acción

### 3.2 Tipos de Eventos Nostr Utilizados

#### A. GiftWrap (Kind 1059 - NIP-59)
**Uso:** Comunicación privada y encriptada usuario ↔ Mostro

**Características:**
- Encriptación end-to-end
- Autor efímero (no revela identidad real)
- Timestamp randomizado (privacy)
- Contenido: Seal event (kind 13) con mensaje real

**Estructura:**
```json
{
  "kind": 1059,
  "pubkey": "random-ephemeral-key",
  "created_at": "random-timestamp",
  "tags": [
    ["p", "mostro-pubkey"]
  ],
  "content": "encrypted-seal-event",
  "sig": "signature"
}
```

#### B. Replaceable Events (Kind 34242 - NIP-33)
**Uso:** Publicación de órdenes P2P (PÚBLICAS y descubribles)

**Características:**
- Eventos públicos (no encriptados) - CUALQUIER cliente puede leerlos
- Publicados por Mostro daemons cuando usuarios crean órdenes
- Identificados por tag `d` (unique ID)
- Reemplazables (último evento prevalece)
- Descubribles mediante filtros de tags

**Estructura de Descubrimiento:**
```javascript
// Filtro para descubrir órdenes de TODOS los Mostros
{
  kinds: [34242],
  "#y": ["mostrop2p"],  // Marketplace identifier
  "#z": ["order"],       // Event type
  "#s": ["pending"]      // Status filter
}
```

**Tags importantes (NIP-69):**
- `d`: Order ID único
- `k`: Tipo (buy/sell)
- `f`: Código moneda fiat
- `s`: Estado (pending/active/success/canceled/etc)
- `amt`: Monto en satoshis
- `fa`: Monto en fiat
- `pm`: Método de pago
- `y`: "mostrop2p" (identificador de marketplace)
- `z`: "order" (tipo de evento)
- `premium`: Porcentaje de premium
- `source`: Link a la orden (relay info)

**IMPORTANTE:** El `pubkey` del evento identifica qué Mostro daemon publicó la orden. MostroWeb extrae este pubkey dinámicamente para interactuar con ese Mostro específico.

### 3.3 Sistema de Autenticación

**Modelo de Dos Llaves:**

1. **Identity Key** (clave de identidad):
   - Private key principal del usuario
   - Se usa para derivar Trade Keys
   - Almacenada de forma segura (offline recomendado)

2. **Trade Key** (clave de trading):
   - Public key usada en transacciones
   - Se comparte con Mostro vía `TradePubkey` action
   - Permite operar sin exponer Identity Key

**Flujo de sesión:**
```
1. Usuario genera/importa Identity Key
2. Usuario envía TradePubkey a Mostro con su public key
3. Mostro asocia Trade Key con Identity Key
4. Usuario opera usando Trade Key
5. Si se pierde sesión: RestoreSession recupera estado
```

---

## 4. FLUJO DE MENSAJES

### 4.1 Flujo de Inicialización

```
┌──────────┐         ┌─────────┐         ┌────────────┐
│  Usuario │         │ MostroWeb│        │   Mostro   │
└────┬─────┘         └────┬────┘         └─────┬──────┘
     │                    │                     │
     │ 1. Abre app        │                     │
     │───────────────────>│                     │
     │                    │                     │
     │ 2. Genera/importa  │                     │
     │    private key     │                     │
     │───────────────────>│                     │
     │                    │                     │
     │                    │ 3. TradePubkey      │
     │                    │────────────────────>│
     │                    │    (GiftWrap)       │
     │                    │                     │
     │                    │ 4. Ack + trade_index│
     │                    │<────────────────────│
     │                    │                     │
     │ 5. Sesión activa   │                     │
     │<───────────────────│                     │
```

### 4.2 Flujo de Creación de Orden de Venta

```
┌──────────┐         ┌─────────┐         ┌────────────┐         ┌─────────┐
│  Seller  │         │ MostroWeb│        │   Mostro   │         │  Relays │
└────┬─────┘         └────┬────┘         └─────┬──────┘         └────┬────┘
     │                    │                     │                     │
     │ 1. /newsell        │                     │                     │
     │───────────────────>│                     │                     │
     │                    │                     │                     │
     │ 2. Formulario      │                     │                     │
     │<───────────────────│                     │                     │
     │                    │                     │                     │
     │ 3. Submit (params) │                     │                     │
     │───────────────────>│                     │                     │
     │                    │                     │                     │
     │                    │ 4. NewOrder action  │                     │
     │                    │────────────────────>│                     │
     │                    │    (GiftWrap)       │                     │
     │                    │                     │                     │
     │                    │                     │ 5. Publica Order    │
     │                    │                     │    (Kind 34242)     │
     │                    │                     │────────────────────>│
     │                    │                     │                     │
     │                    │ 6. Respuesta:       │                     │
     │                    │    Order ID +       │                     │
     │                    │    invoice (hold)   │                     │
     │                    │<────────────────────│                     │
     │                    │                     │                     │
     │ 7. Display invoice │                     │                     │
     │<───────────────────│                     │                     │
     │                    │                     │                     │
     │ 8. Paga invoice    │                     │                     │
     │    (wallet externo)│                     │                     │
     │                    │                     │                     │
     │                    │                     │ 9. Detecta pago     │
     │                    │ 10. Orden ACTIVE    │                     │
     │                    │<────────────────────│                     │
     │                    │                     │                     │
     │ 11. Orden activa   │                     │                     │
     │<───────────────────│                     │                     │
```

### 4.3 Flujo de Tomar Orden (Buy)

```
┌──────────┐         ┌─────────┐         ┌────────────┐         ┌─────────┐
│  Buyer   │         │ MostroWeb│        │   Mostro   │         │  Seller │
└────┬─────┘         └────┬────�┘         └─────┬──────┘         └────┬────┘
     │                    │                     │                     │
     │ 1. /takebuy <id>   │                     │                     │
     │───────────────────>│                     │                     │
     │                    │                     │                     │
     │                    │ 2. TakeBuy action   │                     │
     │                    │────────────────────>│                     │
     │                    │    (GiftWrap)       │                     │
     │                    │                     │                     │
     │                    │ 3. Solicita invoice │                     │
     │                    │<────────────────────│                     │
     │                    │                     │                     │
     │ 4. Formulario LN   │                     │                     │
     │    invoice         │                     │                     │
     │<───────────────────│                     │                     │
     │                    │                     │                     │
     │ 5. Submit invoice  │                     │                     │
     │───────────────────>│                     │                     │
     │                    │                     │                     │
     │                    │ 6. AddInvoice action│                     │
     │                    │────────────────────>│                     │
     │                    │    (GiftWrap)       │                     │
     │                    │                     │                     │
     │                    │ 7. Orden WAITING_PAYMENT                  │
     │                    │<────────────────────│                     │
     │                    │                     │                     │
     │                    │                     │ 8. Notifica Seller  │
     │                    │                     │────────────────────>│
     │                    │                     │                     │
     │ 9. Envía dinero fiat (fuera de sistema)                       │
     │───────────────────────────────────────────────────────────────>│
     │                    │                     │                     │
     │ 10. /fiatsent <id> │                     │                     │
     │───────────────────>│                     │                     │
     │                    │                     │                     │
     │                    │ 11. FiatSent action │                     │
     │                    │────────────────────>│                     │
     │                    │    (GiftWrap)       │                     │
     │                    │                     │                     │
     │                    │                     │ 12. Notifica Seller │
     │                    │                     │    Orden FIAT_SENT  │
     │                    │                     │────────────────────>│
     │                    │                     │                     │
     │                    │                     │ 13. /release <id>   │
     │                    │                     │<────────────────────│
     │                    │                     │                     │
     │                    │ 14. Liquida invoice │                     │
     │                    │    Buyer recibe BTC │                     │
     │                    │<────────────────────│                     │
     │                    │                     │                     │
     │ 15. SUCCESS!       │                     │                     │
     │<───────────────────│                     │                     │
```

### 4.4 Flujo de Restauración de Sesión

```
┌──────────┐         ┌─────────┐         ┌────────────┐
│  Usuario │         │ MostroWeb│        │   Mostro   │
└────┬─────┘         └────┬────┘         └─────┬──────┘
     │                    │                     │
     │ 1. Recarga página  │                     │
     │───────────────────>│                     │
     │                    │                     │
     │                    │ 2. Carga key de     │
     │                    │    LocalStorage     │
     │                    │                     │
     │                    │ 3. RestoreSession   │
     │                    │    action           │
     │                    │────────────────────>│
     │                    │    (GiftWrap)       │
     │                    │                     │
     │                    │ 4. Devuelve:        │
     │                    │    - trade_index    │
     │                    │    - órdenes activas│
     │                    │<────────────────────│
     │                    │                     │
     │ 5. Sesión restaurada│                    │
     │<───────────────────│                     │
```

---

## 5. COMANDOS A IMPLEMENTAR

### 5.1 Fase 1 - MVP (Funcionalidad Básica)

#### A. Gestión de Sesión
| Comando | Action | Descripción | Payload |
|---------|--------|-------------|---------|
| `/start` | TradePubkey | Registra public key del usuario | `{ public_key: "hex" }` |
| `/restore` | RestoreSession | Restaura sesión perdida | `{ last_trade_index?: number }` |
| `/getindex` | LastTradeIndex | Obtiene último trade_index | `{}` |

#### B. Creación de Órdenes
| Comando | Action | Descripción | Payload |
|---------|--------|-------------|---------|
| `/newsell` | NewOrder | Crea orden de venta (sell) | `{ kind: "sell", fiat_code: "USD", fiat_amount: 100, payment_method: "Zelle", premium: 0 }` |
| `/newbuy` | NewOrder | Crea orden de compra (buy) | `{ kind: "buy", fiat_code: "USD", fiat_amount: 100, payment_method: "Zelle", premium: 0 }` |

**Parámetros NewOrder:**
```typescript
{
  kind: "buy" | "sell",
  fiat_code: string,      // "USD", "EUR", "ARS", etc
  fiat_amount: number,    // Monto en moneda fiat
  payment_method: string, // "Zelle", "Paypal", "SEPA", etc
  premium: number         // Porcentaje sobre precio de mercado (-10 a +50)
}
```

#### C. Gestión de Órdenes
| Comando | Action | Descripción | Payload |
|---------|--------|-------------|---------|
| `/listorders` | Orders | Lista órdenes del usuario | `{ status?: "pending" | "active" | "all" }` |
| `/cancel <id>` | Cancel | Cancela orden propia | `{ order_id: "uuid" }` |
| `/takebuy <id>` | TakeBuy | Toma orden de compra (como seller) | `{ order_id: "uuid" }` |
| `/takesell <id>` | TakeSell | Toma orden de venta (como buyer) | `{ order_id: "uuid" }` |

#### D. Flujo de Pago
| Comando | Action | Descripción | Payload |
|---------|--------|-------------|---------|
| `/addinvoice <order_id> <invoice>` | AddInvoice | Añade invoice LN | `{ order_id: "uuid", invoice: "lnbc..." }` |
| `/fiatsent <order_id>` | FiatSent | Notifica envío de fiat | `{ order_id: "uuid" }` |
| `/release <order_id>` | Release | Libera fondos (seller confirma) | `{ order_id: "uuid" }` |

### 5.2 Fase 2 - Funcionalidad Intermedia

#### A. Disputas
| Comando | Action | Descripción | Payload |
|---------|--------|-------------|---------|
| `/dispute <order_id>` | Dispute | Inicia disputa | `{ order_id: "uuid" }` |
| `/takedisp <dispute_id>` | AdminTakeDispute | Solver toma disputa | `{ dispute_id: "uuid" }` |

#### B. Calificaciones
| Comando | Action | Descripción | Payload |
|---------|--------|-------------|---------|
| `/rate <order_id> <1-5>` | RateUser | Califica contraparte | `{ order_id: "uuid", rating: 5 }` |

#### C. Cooperativa
| Comando | Action | Descripción | Payload |
|---------|--------|-------------|---------|
| `/cancelcooperative <id>` | CooperativeCancelInit | Propone cancelación cooperativa | `{ order_id: "uuid" }` |
| `/accept <id>` | CooperativeCancelAccept | Acepta cancelación | `{ order_id: "uuid" }` |

### 5.3 Fase 3 - Funcionalidad Avanzada

#### A. Admin/Solver
| Comando | Action | Descripción | Payload |
|---------|--------|-------------|---------|
| `/admcancel <id>` | AdminCancel | Admin cancela orden | `{ order_id: "uuid" }` |
| `/settle <id>` | AdminSettle | Solver resuelve disputa | `{ dispute_id: "uuid", winner: "buyer" | "seller" }` |
| `/addsolver <npub>` | AdminAddSolver | Añade solver | `{ pubkey: "hex" }` |
| `/rmsolver <npub>` | AdminRemoveSolver | Remueve solver | `{ pubkey: "hex" }` |

#### B. Pagos Directos
| Comando | Action | Descripción | Payload |
|---------|--------|-------------|---------|
| `/payinvoice <order_id>` | PayInvoice | Admin paga invoice de hold | `{ order_id: "uuid" }` |

#### C. Información
| Comando | Action | Descripción | Payload |
|---------|--------|-------------|---------|
| `/getdm` | DirectMessage | Obtiene mensaje directo | `{ peer: "pubkey", message: "..." }` |

---

## 6. STACK TECNOLÓGICO

### 6.1 Frontend

#### Tecnologías Core
- **HTML5**: Estructura semántica
- **CSS3**: Estilizado retro terminal (green on black)
- **Vanilla JavaScript** (ES6+): Lógica de la aplicación

#### Librerías JavaScript (CDN o npm)
1. **nostr-tools** (v2.5.2+)
   - Creación y firma de eventos
   - Gestión de relays (SimplePool)
   - Utilidades NIP-19 (encoding/decoding)
   - NIP-44 o NIP-04 (encryption)

2. **@noble/secp256k1** (incluida en nostr-tools)
   - Generación de key pairs
   - Firma Schnorr

3. **uuid** (v9+)
   - Generación de UUIDs para order_id y request_id

#### Opcionales
- **xterm.js** (si queremos terminal realista)
- **crypto-js** (para encriptar LocalStorage con password)

### 6.2 Backend (Opcional - Servidor Simple)

Si se decide usar un servidor simple para servir archivos:

- **Node.js** 18+ con **Express.js**
- Sirve archivos estáticos
- NO procesa lógica de negocio (todo en frontend)
- NO almacena claves ni datos sensibles

**Alternativa:** Hosting estático (GitHub Pages, Netlify, Vercel)

### 6.3 Almacenamiento

#### LocalStorage
```javascript
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

**Seguridad:**
- Private key encriptada con password del usuario (usando AES-256)
- Trade index guardado localmente para validación
- Órdenes cacheadas para performance

### 6.4 Configuración de Relays

**Relays Nostr públicos recomendados:**
```javascript
const DEFAULT_RELAYS = [
  'wss://relay.damus.io',
  'wss://nostr-pub.wellorder.net',
  'wss://nos.lol',
  'wss://relay.snort.social',
  'wss://relay.nostr.band'
];
```

**Características:**
- Múltiples relays públicos para descubrimiento amplio de órdenes
- Auto-reconexión en caso de fallo
- Preferencia de lectura: relay más rápido
- Escritura: broadcast a todos los relays
- Usuario puede añadir relays adicionales según preferencia

**IMPORTANTE:** No hay "relay oficial de Mostro". Cada Mostro daemon publica a sus propios relays configurados. MostroWeb debe conectarse a múltiples relays públicos para maximizar el descubrimiento de órdenes.

---

## 7. ESTRUCTURA DEL PROYECTO

```
mostroweb/
├── index.html                 # Página principal
├── README.md                  # Este documento
├── READMEv1.md               # Documento de arquitectura
├── package.json              # Dependencias (si usamos npm)
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

## 8. ROADMAP DE IMPLEMENTACIÓN

### Sprint 1: Fundamentos (1-2 semanas)
**Objetivo:** Conexión básica a Nostr y gestión de identidad

**Tareas:**
- [ ] Estructura inicial del proyecto
- [ ] Integración de nostr-tools (SimplePool)
- [ ] Key Manager (generación, import, export)
- [ ] Conexión a relays y monitoreo de estado
- [ ] LocalStorage para persistencia
- [ ] UI terminal básica (prompt, output)

**Entregable:** Usuario puede generar claves, conectarse a relays, y ver eventos en tiempo real

---

### Sprint 2: Protocolo Mostro (2-3 semanas)
**Objetivo:** Implementar comunicación con Mostro

**Tareas:**
- [ ] Implementar estructura de mensajes Mostro
- [ ] NIP-59 GiftWrap (encryption/decryption)
- [ ] Firma de mensajes
- [ ] Trade index tracking (anti-replay)
- [ ] Comando TradePubkey (iniciar sesión)
- [ ] Comando RestoreSession
- [ ] Listener de respuestas de Mostro
- [ ] Parsing y display de respuestas

**Entregable:** Usuario puede autenticarse con Mostro y recibir respuestas

---

### Sprint 3: Órdenes Básicas (2 semanas)
**Objetivo:** Crear y listar órdenes

**Tareas:**
- [ ] Comando NewOrder (sell/buy)
- [ ] Formulario interactivo para crear orden
- [ ] Comando Orders (listar órdenes propias)
- [ ] Display de órdenes públicas (eventos NIP-33)
- [ ] Comando Cancel
- [ ] Estados de órdenes (pending, active, etc)

**Entregable:** Usuario puede crear órdenes de compra/venta y verlas listadas

---

### Sprint 4: Trading Flow (2-3 semanas)
**Objetivo:** Completar flujo de trading end-to-end

**Tareas:**
- [ ] Comando TakeBuy/TakeSell
- [ ] Comando AddInvoice con validación
- [ ] Comando FiatSent
- [ ] Comando Release
- [ ] Display de invoice (hold invoice) como QR
- [ ] Notificaciones de cambios de estado
- [ ] Tracking de órdenes en progreso

**Entregable:** Usuario puede completar un trade P2P completo (crear orden → tomar → pagar → liberar)

---

### Sprint 5: Funcionalidad Intermedia (1-2 semanas)
**Objetivo:** Disputas y calificaciones

**Tareas:**
- [ ] Comando Dispute
- [ ] Comando RateUser
- [ ] Sistema de calificaciones visual
- [ ] Cancelación cooperativa
- [ ] Notificaciones de disputas

**Entregable:** Sistema completo de resolución de conflictos y reputación

---

### Sprint 6: Pulido y Testing (1-2 semanas)
**Objetivo:** Mejoras UX y testing

**Tareas:**
- [ ] Testing exhaustivo de todos los flujos
- [ ] Mejoras de UX (autocompletado, hints)
- [ ] Documentación de usuario
- [ ] Temas visuales (green, amber, blue)
- [ ] Manejo de errores robusto
- [ ] Performance optimization
- [ ] Auditoría de seguridad

**Entregable:** Aplicación production-ready

---

### Futuro (Post-MVP)
- [ ] Comandos admin/solver
- [ ] Integración con wallets Lightning (WebLN)
- [ ] Multi-idioma (i18n)
- [ ] Histórico de trades
- [ ] Exportación de datos
- [ ] PWA (Progressive Web App)
- [ ] Mobile responsive
- [ ] Dark/Light theme toggle
- [ ] Configuración avanzada de relays
- [ ] Filtros y búsqueda de órdenes

---

## 9. CONSIDERACIONES DE SEGURIDAD

### 9.1 Gestión de Claves Privadas

**CRÍTICO:**
- Private key NUNCA debe salir del navegador del usuario
- Encriptar private key en LocalStorage con password fuerte
- Usar AES-256 para encriptación local
- Implementar timeout de sesión (auto-lock)
- Opción de "session key" temporal (no persistente)

**Recomendaciones:**
```javascript
// Encriptar antes de guardar en LocalStorage
const encrypted = CryptoJS.AES.encrypt(privateKeyHex, userPassword);
localStorage.setItem('mostro_identity_key', encrypted.toString());

// Desencriptar al cargar
const decrypted = CryptoJS.AES.decrypt(encrypted, userPassword);
const privateKey = decrypted.toString(CryptoJS.enc.Utf8);
```

### 9.2 Validación de Mensajes

**Validaciones obligatorias:**
1. **Trade Index:** Siempre debe ser > último trade_index guardado
2. **Firma:** Verificar firma de eventos recibidos con `verifyEvent()`
3. **Timestamp:** Rechazar eventos con timestamp muy antiguo/futuro
4. **Pubkey:** Verificar que eventos vienen de Mostro (pubkey conocido)
5. **Content:** Validar estructura JSON de payloads

### 9.3 Protección contra Ataques

**Replay Attack:**
- Implementar trade_index incrementante
- Rechazar mensajes con trade_index <= último conocido

**Man-in-the-Middle:**
- Usar SIEMPRE relays con WSS (WebSocket Secure)
- Verificar firmas de todos los eventos

**XSS/Injection:**
- Sanitizar todo input del usuario
- Nunca usar `eval()` ni `innerHTML` con contenido no sanitizado
- Escapar HTML en displays

**Phishing:**
- Advertir al usuario sobre importancia de private key
- Nunca solicitar private key por otros medios
- Mostrar public key visible para verificación

### 9.4 Privacidad

**NIP-59 GiftWrap:**
- Usar ephemeral keys (claves efímeras aleatorias)
- Timestamp randomizado (±2 días)
- Contenido encriptado end-to-end

**Metadata:**
- No incluir información identificatoria en tags públicas
- Usar TOR/VPN para mejor privacidad (opcional)

---

## 10. REFERENCIAS

### 10.1 Repositorios Analizados

1. **Mostro Daemon** (Rust)
   - Ubicación: `/home/ubuntu/github/mostro/`
   - Archivos clave:
     - `src/app.rs` - Router principal
     - `src/nip33.rs` - Eventos NIP-33
     - `src/util.rs` - Mensajería
     - `src/app/*.rs` - Handlers de acciones

2. **LNp2pBot** (TypeScript)
   - Ubicación: `/home/ubuntu/github/bot/`
   - Archivos clave:
     - `bot/modules/nostr/*.ts` - Integración Nostr
     - `models/order.ts` - Modelo de orden
     - `bot/commands.ts` - Comandos Telegram

3. **Nostr Protocol Spec**
   - Ubicación: `/home/ubuntu/github/nostr/`
   - Documentación oficial del protocolo

### 10.2 NIPs Relevantes (Nostr Implementation Possibilities)

- **NIP-01:** Basic protocol flow description
- **NIP-04:** Encrypted Direct Messages (legacy)
- **NIP-19:** bech32-encoded entities (npub, nsec)
- **NIP-33:** Parameterized Replaceable Events (kind 30000-39999)
- **NIP-44:** Versioned Encryption (recomendado sobre NIP-04)
- **NIP-59:** Gift Wrap (mensajes privados con metadata escondida)

### 10.3 Documentación Externa

- **Nostr Protocol:** https://github.com/nostr-protocol/nostr
- **nostr-tools:** https://github.com/nbd-wtf/nostr-tools
- **Mostro Daemon:** Documentación en repositorio mostro
- **NIPs:** https://github.com/nostr-protocol/nips

### 10.4 Public Keys de Mostro (Modelo Descentralizado)

**CRÍTICO - NO HAY PUBLIC KEY FIJA GLOBAL:**

Mostro es un protocolo descentralizado. Múltiples instancias independientes de Mostro pueden ejecutarse simultáneamente, cada una con su propia public key.

**Descubrimiento Dinámico:**
```javascript
// ❌ INCORRECTO: Asumir una public key fija
const MOSTRO_PUBKEY = "npub1..."; // NO EXISTE

// ✅ CORRECTO: Extraer pubkey del evento de orden
async function discoverOrders() {
  const orderEvents = await pool.list(relays, [{
    kinds: [34242],
    "#y": ["mostrop2p"],
    "#z": ["order"]
  }]);

  // Cada evento tiene el pubkey del Mostro que lo publicó
  orderEvents.forEach(event => {
    const mostroPubkey = event.pubkey;  // Dinámico por orden
    const orderId = event.tags.find(t => t[0] === 'd')[1];

    console.log(`Orden ${orderId} publicada por Mostro ${mostroPubkey}`);
  });
}

// Cuando usuario interactúa con una orden
function selectOrder(orderEvent) {
  const targetMostro = orderEvent.pubkey;  // Extraer del evento

  // Enviar GiftWrap a ESTE Mostro específico
  sendGiftWrap(message, targetMostro);
}
```

**Implicaciones:**
- MostroWeb NO necesita configurar una public key fija
- Cada orden lleva el pubkey del Mostro que la creó
- Usuario puede interactuar con múltiples Mostros simultáneamente
- Verificación de respuestas: comparar con pubkey extraído de la orden

---

## 11. DECISIONES TÉCNICAS PENDIENTES

### 11.1 Preguntas a Resolver

1. **¿Qué relays Nostr recomiendan para descubrimiento de órdenes?**
   - ¿Hay relays específicos donde Mostros publican?
   - ¿O usar relays públicos genéricos?
   - Lista recomendada de relays para mejor cobertura

2. **¿NIP-44 o NIP-04 para encriptación de GiftWraps?**
   - NIP-44 es más moderno y seguro
   - Verificar compatibilidad con Mostro daemon

3. **¿Proof of Work (PoW) es obligatorio?**
   - Algunos mensajes en Mostro mencionan PoW opcional
   - ¿Es necesario implementarlo en cliente web?

4. **¿Rate limiting por parte de Mostro?**
   - ¿Cuántos mensajes por minuto acepta cada Mostro?
   - ¿Necesitamos queue local de mensajes?

5. **¿Invoice validation?**
   - ¿Validar formato de Lightning invoices en frontend?
   - ¿O delegar validación a Mostro daemon?

6. **¿Timeout de órdenes?**
   - ¿Cuánto tiempo permanece activa una orden?
   - ¿Auto-cancelación tras X tiempo de inactividad?

7. **¿Cómo identificar Mostros confiables?**
   - ¿Sistema de reputación para Mostro instances?
   - ¿Verificar fees antes de interactuar?
   - ¿Whitelist/blacklist de Mostros conocidos?

### 11.2 Testing con Testnet

**Recomendación:** Implementar modo testnet para desarrollo

```javascript
const CONFIG = {
  network: process.env.NETWORK || 'testnet', // 'mainnet' o 'testnet'
  mostro_pubkey: process.env.NETWORK === 'mainnet'
    ? MAINNET_MOSTRO_PUBKEY
    : TESTNET_MOSTRO_PUBKEY,
  relays: process.env.NETWORK === 'mainnet'
    ? MAINNET_RELAYS
    : TESTNET_RELAYS
};
```

---

## 12. CONCLUSIÓN

Este documento establece la arquitectura base para **MostroWeb**, un cliente web frontend para interactuar con Mostro P2P vía protocolo Nostr.

**Próximos pasos:**
1. Validar arquitectura propuesta con equipo Mostro
2. Resolver decisiones técnicas pendientes (sección 11)
3. Comenzar Sprint 1: Fundamentos
4. Establecer entorno de testing (testnet)
5. Crear repositorio Git y configurar CI/CD

**Principios guía:**
- Seguridad primero (keys never leave browser)
- Simplicidad en UX (terminal retro, fácil de usar)
- Descentralización (sin servidores intermediarios)
- Open source (código auditable)

---

**Documento creado:** 2025-10-29
**Versión:** 1.0
**Autor:** Análisis basado en repositorios mostro/, bot/, nostr/
**Estado:** Propuesta de arquitectura - Pendiente aprobación
