/**
 * Constants
 * Constantes globales de la aplicación
 */

// Versión de la aplicación
export const APP_VERSION = '1.0.0';
export const APP_NAME = 'MostroWeb';

// Relays Nostr públicos por defecto
export const DEFAULT_RELAYS = [
  'wss://relay.damus.io',
  'wss://nostr-pub.wellorder.net',
  'wss://nos.lol',
  'wss://relay.snort.social',
  'wss://relay.nostr.band'
];

// Tipos de eventos Nostr
export const NOSTR_KINDS = {
  GIFT_WRAP: 1059,      // NIP-59 - Mensajes privados encriptados
  SEAL: 13,             // NIP-59 - Seal event interno
  P2P_ORDER: 38383,     // NIP-69 - P2P Order events (Mostro protocol)
  DIRECT_MESSAGE: 4     // NIP-04 - Mensajes directos (legacy)
};

// Tags para descubrimiento de órdenes
export const MOSTRO_TAGS = {
  MARKETPLACE: 'mostrop2p',  // Tag 'y'
  EVENT_TYPE: 'order',       // Tag 'z'
};

// Estados de órdenes
export const ORDER_STATUS = {
  PENDING: 'pending',
  ACTIVE: 'active',
  WAITING_PAYMENT: 'waiting_payment',
  FIAT_SENT: 'fiat_sent',
  SUCCESS: 'success',
  CANCELED: 'canceled',
  DISPUTE: 'dispute',
  EXPIRED: 'expired'
};

// Tipos de órdenes
export const ORDER_TYPES = {
  BUY: 'buy',
  SELL: 'sell'
};

// Acciones del protocolo Mostro
export const MOSTRO_ACTIONS = {
  // Sesión
  TRADE_PUBKEY: 'TradePubkey',
  RESTORE_SESSION: 'RestoreSession',
  LAST_TRADE_INDEX: 'LastTradeIndex',

  // Órdenes
  NEW_ORDER: 'NewOrder',
  CANCEL: 'Cancel',
  TAKE_BUY: 'TakeBuy',
  TAKE_SELL: 'TakeSell',

  // Pago
  ADD_INVOICE: 'AddInvoice',
  FIAT_SENT: 'FiatSent',
  RELEASE: 'Release',

  // Disputas
  DISPUTE: 'Dispute',
  ADMIN_TAKE_DISPUTE: 'AdminTakeDispute',

  // Calificaciones
  RATE_USER: 'RateUser',

  // Cooperativa
  COOPERATIVE_CANCEL_INIT: 'CooperativeCancelInit',
  COOPERATIVE_CANCEL_ACCEPT: 'CooperativeCancelAccept'
};

// Versión del protocolo Mostro
export const MOSTRO_PROTOCOL_VERSION = 1;

// LocalStorage keys
export const STORAGE_KEYS = {
  IDENTITY_KEY: 'mostro_identity_key',
  TRADE_KEY: 'mostro_trade_key',
  TRADE_INDEX: 'mostro_trade_index',
  RELAYS: 'mostro_relays',
  ORDERS: 'mostro_orders',
  SETTINGS: 'mostro_settings',
  COMMAND_HISTORY: 'mostro_command_history'
};

// Configuración por defecto
export const DEFAULT_SETTINGS = {
  theme: 'green',
  fontSize: 14,
  relayTimeout: 5000,
  commandHistorySize: 100,
  autoScroll: true,
  soundEnabled: false,
  scanlineEffect: true
};

// Temas disponibles
export const THEMES = [
  'green',
  'amber',
  'blue',
  'white',
  'red',
  'purple',
  'matrix',
  'dos',
  'hacker'
];

// Timeouts y límites
export const TIMEOUTS = {
  RELAY_CONNECTION: 5000,
  MESSAGE_RESPONSE: 30000,
  COMMAND_DEBOUNCE: 300
};

// Configuración de encriptación
export const CRYPTO_CONFIG = {
  PBKDF2_ITERATIONS: 100000,    // Iteraciones para derivación de clave
  SALT_LENGTH: 16,               // Bytes de salt (128 bits)
  AES_MODE: 'CBC',               // Modo de encriptación AES
  PADDING: 'Pkcs7',              // Padding para AES
  MIN_PASSWORD_LENGTH: 8,        // Mínimo de caracteres en password
  KEY_SIZE: 256                  // Bits de la clave de encriptación
};

// Mensajes de error
export const ERROR_MESSAGES = {
  NOSTR_NOT_LOADED: 'Biblioteca nostr-tools aún no cargada',
  NO_PRIVATE_KEY: 'No se encontró clave privada. Genera o importa una primero.',
  INVALID_COMMAND: 'Comando inválido. Escribe /help para ver comandos disponibles.',
  RELAY_CONNECTION_FAILED: 'Error al conectar con relay',
  MESSAGE_SEND_FAILED: 'Error al enviar mensaje',
  INVALID_PARAMETER: 'Parámetro inválido',
  COMMAND_NOT_IMPLEMENTED: 'Comando aún no implementado',
  WRONG_PASSWORD: 'Contraseña incorrecta. Intenta de nuevo.',
  KEY_LOCKED: 'Sesión bloqueada. Usa /start para desbloquear.',
  INVALID_KEY_FORMAT: 'Formato de clave inválido. Usa nsec o hex.',
  PASSWORD_TOO_SHORT: 'La contraseña debe tener al menos 8 caracteres.',
  PASSWORDS_DONT_MATCH: 'Las contraseñas no coinciden.',
  DECRYPTION_FAILED: 'Error al desencriptar. Contraseña incorrecta o datos corruptos.',
  NO_IDENTITY_FOUND: 'No se encontró identidad. Usa /start para crear una.',
  IDENTITY_ALREADY_EXISTS: 'Ya existe una identidad. Usa /start para desbloquear o /import para reemplazar.',
  EXPORT_REQUIRES_UNLOCK: 'Debes desbloquear tu sesión primero. Usa /start.',
  RELAY_NOT_CONNECTED: 'No conectado a ningún relay. Usa /discover primero.',
  NO_ORDERS_FOUND: 'No se encontraron órdenes. Usa /discover para escanear.',
  DISCOVERY_ALREADY_RUNNING: 'El escaneo ya está en ejecución.',
  RELAY_CONNECTION_TIMEOUT: 'Timeout de conexión al relay. Verifica tu conexión.'
};

// Mensajes de éxito
export const SUCCESS_MESSAGES = {
  KEY_GENERATED: 'Nuevo par de claves generado exitosamente',
  KEY_IMPORTED: 'Clave privada importada exitosamente',
  RELAY_CONNECTED: 'Conectado al relay',
  MESSAGE_SENT: 'Mensaje enviado exitosamente',
  COMMAND_EXECUTED: 'Comando ejecutado exitosamente',
  SESSION_UNLOCKED: 'Sesión desbloqueada exitosamente',
  SESSION_LOCKED: 'Sesión bloqueada. Claves eliminadas de memoria.',
  PASSWORD_CHANGED: 'Contraseña cambiada exitosamente',
  KEY_ENCRYPTED: 'Clave privada encriptada y almacenada de forma segura',
  IDENTITY_CREATED: 'Identidad creada exitosamente',
  RELAY_CONNECTED_SUCCESS: 'Conectado exitosamente a los relays',
  DISCOVERY_STARTED: 'Escaneo de órdenes iniciado. Buscando en relays...',
  ORDERS_REFRESHED: 'Órdenes actualizadas exitosamente',
  RELAY_ADDED: 'Relay agregado exitosamente',
  RELAY_REMOVED: 'Relay eliminado exitosamente'
};

// Mensajes de seguridad (nuevo formato)
export const SECURITY_NOTICES = {
  KEY_PURPOSE: 'Esta llave es solo para firmar mensajes en Mostro',
  FUNDS_LOCATION: 'Tus satoshis se reciben donde tú elijas, no aquí',
  NOSTR_COMPATIBLE: 'Puedes usar la misma llave en otros clientes Nostr',
  BACKUP_REMINDER: 'Guarda tu llave privada (nsec) en un lugar seguro',
  NO_RECOVERY: 'Si pierdes tu nsec, no podrás recuperar esta identidad',
  REUSABLE_KEY: 'Esta llave es reutilizable en cualquier cliente Mostro/Nostr'
};

// Regex patterns
export const PATTERNS = {
  COMMAND: /^\/[a-z]+/i,
  NPUB: /^npub1[a-z0-9]{58}$/i,
  NSEC: /^nsec1[a-z0-9]{58}$/i,
  HEX_KEY: /^[a-f0-9]{64}$/i,
  LIGHTNING_INVOICE: /^(lnbc|lntb|lnbcrt)[0-9]+[munp]?[a-z0-9]+$/i,
  UUID: /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
};

// Comandos disponibles (Fase 1 - básicos)
export const COMMANDS = {
  HELP: '/help',
  TUTORIAL: '/tutorial',
  CLEAR: '/clear',
  THEME: '/theme',
  VERSION: '/version',
  STATUS: '/status',
  EXIT: '/exit',

  // Fase 2 - Identity & Key Management
  START: '/start',
  LOGIN: '/login',
  IMPORT: '/import',
  EXPORT: '/export',
  IDENTITY: '/identity',
  LOCK: '/lock',
  CHANGEPASS: '/changepass',

  // Fase 2 - Relay & Discovery
  RELAYS: '/relays',
  DISCOVER: '/discover',
  REFRESH: '/refresh',

  // Fase 2 - Orders & Discovery
  LISTORDERS: '/listorders',

  // Fase 3 - Trading
  NEWORDER: '/neworder',
  TAKEBUY: '/takebuy',
  TAKESELL: '/takesell',
  CANCEL: '/cancel',

  // Fase 4 - Lightning & Payment Flow
  ADDINVOICE: '/addinvoice',
  FIATSENT: '/fiatsent',
  RELEASE: '/release',

  // Fase 5 - Utilities & History
  HISTORY: '/history',
  MYSTATS: '/mystats',
  SHOWQR: '/showqr',

  // Deprecated/Alias (usar /neworder)
  RESTORE: '/restore',
  NEWSELL: '/newsell',
  NEWBUY: '/newbuy'
};

// Información de comandos
export const COMMAND_INFO = {
  [COMMANDS.HELP]: {
    description: 'Mostrar comandos disponibles',
    usage: '/help [command]',
    aliases: ['?', 'h']
  },
  [COMMANDS.TUTORIAL]: {
    description: 'Mostrar guía completa paso a paso para usar MostroWeb',
    usage: '/tutorial',
    aliases: ['guide', 'onboarding']
  },
  [COMMANDS.CLEAR]: {
    description: 'Limpiar salida del terminal',
    usage: '/clear',
    aliases: ['cls', 'clean']
  },
  [COMMANDS.THEME]: {
    description: 'Cambiar tema del terminal',
    usage: '/theme <color>',
    examples: ['/theme amber', '/theme blue', '/theme matrix']
  },
  [COMMANDS.VERSION]: {
    description: 'Mostrar versión de la aplicación',
    usage: '/version',
    aliases: ['v', 'ver']
  },
  [COMMANDS.STATUS]: {
    description: 'Mostrar estado de conexión',
    usage: '/status',
    aliases: ['stat']
  },
  [COMMANDS.START]: {
    description: 'Generar nueva identidad Nostr para tradear',
    usage: '/start',
    aliases: ['s'],
    examples: ['/start']
  },
  [COMMANDS.LOGIN]: {
    description: 'Iniciar sesión con clave privada existente (nsec)',
    usage: '/login',
    aliases: ['l'],
    examples: ['/login']
  },
  [COMMANDS.IMPORT]: {
    description: 'Importar clave privada de Nostr existente',
    usage: '/import',
    aliases: [],
    examples: ['/import']
  },
  [COMMANDS.IDENTITY]: {
    description: 'Mostrar tu información de identidad',
    usage: '/identity',
    aliases: ['id', 'whoami'],
    examples: ['/identity']
  },
  [COMMANDS.EXPORT]: {
    description: 'Exportar tu clave privada para respaldo',
    usage: '/export',
    aliases: ['backup'],
    examples: ['/export']
  },
  [COMMANDS.LOCK]: {
    description: 'Bloquear sesión y limpiar claves de memoria',
    usage: '/lock',
    aliases: ['logout'],
    examples: ['/lock']
  },
  [COMMANDS.CHANGEPASS]: {
    description: 'Cambiar contraseña de encriptación',
    usage: '/changepass',
    aliases: ['passwd'],
    examples: ['/changepass']
  },
  [COMMANDS.RELAYS]: {
    description: 'Mostrar estado de conexión a relays',
    usage: '/relays',
    aliases: ['relay'],
    examples: ['/relays']
  },
  [COMMANDS.DISCOVER]: {
    description: 'Iniciar búsqueda de órdenes en relays',
    usage: '/discover',
    aliases: ['scan'],
    examples: ['/discover']
  },
  [COMMANDS.REFRESH]: {
    description: 'Actualizar órdenes desde relays',
    usage: '/refresh',
    aliases: ['reload'],
    examples: ['/refresh']
  },
  [COMMANDS.LISTORDERS]: {
    description: 'Listar todas las órdenes descubiertas agrupadas por Mostro',
    usage: '/listorders [buy|sell] [fiatCode]',
    aliases: ['orders', 'list'],
    examples: ['/listorders', '/listorders buy', '/listorders sell USD']
  },
  [COMMANDS.NEWORDER]: {
    description: 'Crear nueva orden de compra o venta',
    usage: '/neworder <buy|sell> <amount> <currency> <payment-method> [premium] [mostro-pubkey]',
    aliases: ['order'],
    examples: [
      '/neworder buy 100 USD Strike',
      '/neworder sell 50 EUR Revolut 2',
      '/neworder buy 1000 ARS "Face to face"'
    ]
  },
  [COMMANDS.TAKEBUY]: {
    description: 'Tomar una orden de compra existente',
    usage: '/takebuy <order-id> [amount]',
    examples: ['/takebuy abc123def456']
  },
  [COMMANDS.TAKESELL]: {
    description: 'Tomar una orden de venta existente',
    usage: '/takesell <order-id> [amount]',
    examples: ['/takesell abc123def456']
  },
  [COMMANDS.CANCEL]: {
    description: 'Cancelar una orden pendiente',
    usage: '/cancel <order-id>',
    examples: ['/cancel abc123def456']
  },
  [COMMANDS.ADDINVOICE]: {
    description: 'Añadir invoice Lightning para recibir pago (compradores)',
    usage: '/addinvoice <order-id> <lightning-invoice>',
    examples: ['/addinvoice abc123def456 lnbc1000...']
  },
  [COMMANDS.FIATSENT]: {
    description: 'Notificar que enviaste el pago fiat (compradores)',
    usage: '/fiatsent <order-id>',
    examples: ['/fiatsent abc123def456']
  },
  [COMMANDS.RELEASE]: {
    description: 'Liberar satoshis al comprador después de recibir fiat (vendedores)',
    usage: '/release <order-id>',
    examples: ['/release abc123def456']
  },
  [COMMANDS.HISTORY]: {
    description: 'Ver historial de notificaciones y eventos recientes',
    usage: '/history [limit]',
    examples: ['/history', '/history 20']
  },
  [COMMANDS.MYSTATS]: {
    description: 'Ver tus estadísticas de trading',
    usage: '/mystats',
    examples: ['/mystats']
  },
  [COMMANDS.SHOWQR]: {
    description: 'Mostrar código QR para Lightning invoice o dirección',
    usage: '/showqr <invoice-o-data>',
    examples: ['/showqr lnbc1000...', '/showqr bc1q...']
  }
};

// ASCII Art (opcional)
export const ASCII_LOGO = `
╔═══════════════════════════════════════╗
║     ___  ___         _                ║
║    |  \\/  |        | |               ║
║    | .  . | ___  __| |_ _ __ ___     ║
║    | |\\/| |/ _ \\/ _\` | | '__/ _ \\    ║
║    | |  | | (_) \\__ \\ | | | (_) |   ║
║    \\_|  |_/\\___/ |___/_|_|  \\___/    ║
║                                       ║
║         P2P Bitcoin Trading           ║
╚═══════════════════════════════════════╝
`;

// Entorno
export const ENVIRONMENT = {
  isDevelopment: window.location.hostname === 'localhost' ||
                 window.location.hostname === '127.0.0.1',
  version: APP_VERSION,
  buildDate: '2025-10-29'
};

// Exportar todo como objeto único también
export default {
  APP_VERSION,
  APP_NAME,
  DEFAULT_RELAYS,
  NOSTR_KINDS,
  MOSTRO_TAGS,
  ORDER_STATUS,
  ORDER_TYPES,
  MOSTRO_ACTIONS,
  MOSTRO_PROTOCOL_VERSION,
  STORAGE_KEYS,
  DEFAULT_SETTINGS,
  THEMES,
  TIMEOUTS,
  CRYPTO_CONFIG,
  ERROR_MESSAGES,
  SUCCESS_MESSAGES,
  SECURITY_NOTICES,
  PATTERNS,
  COMMANDS,
  COMMAND_INFO,
  ASCII_LOGO,
  ENVIRONMENT
};
