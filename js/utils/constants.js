/**
 * Constants
 * Constantes globales de la aplicación
 */

// Versión de la aplicación
export const APP_VERSION = '0.1.0';
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
  REPLACEABLE: 34242,   // NIP-33 - Órdenes públicas Mostro
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
  NOSTR_NOT_LOADED: 'Nostr-tools library not loaded yet',
  NO_PRIVATE_KEY: 'No private key found. Generate or import a key first.',
  INVALID_COMMAND: 'Invalid command. Type /help for available commands.',
  RELAY_CONNECTION_FAILED: 'Failed to connect to relay',
  MESSAGE_SEND_FAILED: 'Failed to send message',
  INVALID_PARAMETER: 'Invalid parameter provided',
  COMMAND_NOT_IMPLEMENTED: 'Command not yet implemented',
  WRONG_PASSWORD: 'Wrong password. Please try again.',
  KEY_LOCKED: 'Session locked. Use /start to unlock.',
  INVALID_KEY_FORMAT: 'Invalid key format. Use nsec or hex.',
  PASSWORD_TOO_SHORT: 'Password must be at least 8 characters.',
  PASSWORDS_DONT_MATCH: 'Passwords do not match.',
  DECRYPTION_FAILED: 'Decryption failed. Wrong password or corrupted data.',
  NO_IDENTITY_FOUND: 'No identity found. Use /start to create one.',
  IDENTITY_ALREADY_EXISTS: 'Identity already exists. Use /start to unlock or /import to replace.',
  EXPORT_REQUIRES_UNLOCK: 'You must unlock your session first. Use /start.',
  RELAY_NOT_CONNECTED: 'Not connected to any relay. Use /discover first.',
  NO_ORDERS_FOUND: 'No orders found. Try /discover to scan for orders.',
  DISCOVERY_ALREADY_RUNNING: 'Discovery is already running.',
  RELAY_CONNECTION_TIMEOUT: 'Relay connection timeout. Check your internet connection.'
};

// Mensajes de éxito
export const SUCCESS_MESSAGES = {
  KEY_GENERATED: 'New key pair generated successfully',
  KEY_IMPORTED: 'Private key imported successfully',
  RELAY_CONNECTED: 'Connected to relay',
  MESSAGE_SENT: 'Message sent successfully',
  COMMAND_EXECUTED: 'Command executed successfully',
  SESSION_UNLOCKED: 'Session unlocked successfully',
  SESSION_LOCKED: 'Session locked. Keys cleared from memory.',
  PASSWORD_CHANGED: 'Password changed successfully',
  KEY_ENCRYPTED: 'Private key encrypted and stored securely',
  IDENTITY_CREATED: 'Identity created successfully',
  RELAY_CONNECTED_SUCCESS: 'Successfully connected to relays',
  DISCOVERY_STARTED: 'Order discovery started. Scanning relays...',
  ORDERS_REFRESHED: 'Orders refreshed successfully',
  RELAY_ADDED: 'Relay added successfully',
  RELAY_REMOVED: 'Relay removed successfully'
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

  // Fase 2+ (placeholder)
  RESTORE: '/restore',
  NEWSELL: '/newsell',
  NEWBUY: '/newbuy',
  LISTORDERS: '/listorders',
  CANCEL: '/cancel',
  TAKEBUY: '/takebuy',
  TAKESELL: '/takesell'
};

// Información de comandos
export const COMMAND_INFO = {
  [COMMANDS.HELP]: {
    description: 'Show available commands',
    usage: '/help [command]',
    aliases: ['?', 'h']
  },
  [COMMANDS.CLEAR]: {
    description: 'Clear terminal output',
    usage: '/clear',
    aliases: ['cls', 'clean']
  },
  [COMMANDS.THEME]: {
    description: 'Change terminal theme',
    usage: '/theme <color>',
    examples: ['/theme amber', '/theme blue', '/theme matrix']
  },
  [COMMANDS.VERSION]: {
    description: 'Show application version',
    usage: '/version',
    aliases: ['v', 'ver']
  },
  [COMMANDS.STATUS]: {
    description: 'Show connection status',
    usage: '/status',
    aliases: ['stat']
  },
  [COMMANDS.START]: {
    description: 'Generate new Nostr identity for trading',
    usage: '/start',
    aliases: ['s'],
    examples: ['/start']
  },
  [COMMANDS.LOGIN]: {
    description: 'Login with existing private key (nsec)',
    usage: '/login',
    aliases: ['l'],
    examples: ['/login']
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
  [COMMANDS.RELAYS]: {
    description: 'Show relay connection status',
    usage: '/relays',
    aliases: ['relay'],
    examples: ['/relays']
  },
  [COMMANDS.DISCOVER]: {
    description: 'Start discovering orders from relays',
    usage: '/discover',
    aliases: ['scan'],
    examples: ['/discover']
  },
  [COMMANDS.REFRESH]: {
    description: 'Refresh orders from relays',
    usage: '/refresh',
    aliases: ['reload'],
    examples: ['/refresh']
  },
  [COMMANDS.LISTORDERS]: {
    description: 'List all discovered orders grouped by Mostro',
    usage: '/listorders [buy|sell] [fiatCode]',
    aliases: ['orders', 'list'],
    examples: ['/listorders', '/listorders buy', '/listorders sell USD']
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
