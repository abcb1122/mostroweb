/**
 * Commands Module
 * Parser y ejecutor de comandos
 */

import { COMMANDS, THEMES, ERROR_MESSAGES, SUCCESS_MESSAGES, SECURITY_NOTICES } from '../utils/constants.js';
import { isValidTheme, parseCommandArgs } from '../utils/helpers.js';
import Logger from '../utils/logger.js';
import Display from './display.js';
import KeyManager from '../core/keyManager.js';
import RelayManager from '../core/relayManager.js';
import Discovery from '../mostro/discovery.js';
import {
  promptPassword,
  promptPasswordConfirm,
  promptPrivateKey,
  promptConfirmation
} from '../utils/inputHelpers.js';

/**
 * Parsea un comando y sus argumentos
 */
export function parseCommand(input) {
  const trimmed = input.trim();

  if (!trimmed) {
    return null;
  }

  // Separar comando y argumentos
  const parts = parseCommandArgs(trimmed);
  const command = parts[0].toLowerCase();
  const args = parts.slice(1);

  return {
    raw: input,
    command,
    args,
    fullCommand: trimmed
  };
}

/**
 * Ejecuta un comando
 */
export async function executeCommand(input) {
  Logger.debug(`Commands: Executing "${input}"`);

  // Parsear comando
  const parsed = parseCommand(input);

  if (!parsed) {
    return;
  }

  // Echo del comando
  Display.echoCommand(parsed.fullCommand);

  const { command, args } = parsed;

  // Ejecutar comando según tipo
  try {
    switch (command) {
      case COMMANDS.HELP:
      case '/h':
      case '/?':
        handleHelp(args);
        break;

      case COMMANDS.CLEAR:
      case '/cls':
      case '/clean':
        handleClear();
        break;

      case COMMANDS.THEME:
        handleTheme(args);
        break;

      case COMMANDS.VERSION:
      case '/v':
      case '/ver':
        handleVersion();
        break;

      case COMMANDS.STATUS:
      case '/stat':
        handleStatus();
        break;

      case COMMANDS.EXIT:
      case '/quit':
      case '/q':
        handleExit();
        break;

      // Identity & Key Management Commands
      case COMMANDS.START:
      case '/s':
        await handleStart(args);
        break;

      case COMMANDS.LOGIN:
      case '/l':
        await handleLogin(args);
        break;

      case COMMANDS.IMPORT:
        await handleImport(args);
        break;

      case COMMANDS.EXPORT:
      case '/backup':
        await handleExport(args);
        break;

      case COMMANDS.IDENTITY:
      case '/id':
      case '/whoami':
        await handleIdentity(args);
        break;

      case COMMANDS.LOCK:
      case '/logout':
        await handleLock(args);
        break;

      case COMMANDS.CHANGEPASS:
      case '/passwd':
        await handleChangePassword(args);
        break;

      // Relay & Discovery Commands
      case COMMANDS.RELAYS:
      case '/relay':
        await handleRelays(args);
        break;

      case COMMANDS.DISCOVER:
      case '/scan':
        await handleDiscover(args);
        break;

      case COMMANDS.REFRESH:
      case '/reload':
        await handleRefresh(args);
        break;

      case COMMANDS.LISTORDERS:
      case '/orders':
      case '/list':
        await handleListOrders(args);
        break;

      // Comandos no implementados aún (Fase 3+)
      case COMMANDS.RESTORE:
      case COMMANDS.NEWSELL:
      case COMMANDS.NEWBUY:
      case COMMANDS.CANCEL:
      case COMMANDS.TAKEBUY:
      case COMMANDS.TAKESELL:
        Display.warning(`${command} - ${ERROR_MESSAGES.COMMAND_NOT_IMPLEMENTED}`);
        Display.info('Este comando estará disponible en Fase 3');
        break;

      default:
        // Comando no reconocido
        Display.error(`Comando desconocido: ${command}`);
        Display.dim('Escribe /help para ver comandos disponibles');
    }
  } catch (error) {
    Logger.error('Commands: Error executing command', error);
    Display.error(`Error al ejecutar comando: ${error.message}`);
  }
}

/**
 * Comando: /help
 */
function handleHelp(args) {
  if (args.length === 0) {
    // Ayuda general
    Display.showHelp();
  } else {
    // Ayuda específica de comando
    const cmd = args[0];
    Display.info(`Ayuda para ${cmd} - Próximamente`);
    Display.dim('Por ahora, usa /help para ver todos los comandos');
  }
}

/**
 * Comando: /clear
 */
function handleClear() {
  Display.clear();
  Logger.info('Commands: Terminal cleared');
}

/**
 * Comando: /theme
 */
async function handleTheme(args) {
  if (args.length === 0) {
    // Mostrar temas disponibles
    Display.info('Temas disponibles:');
    Display.blank();
    THEMES.forEach(theme => {
      Display.addLine(`  • ${theme}`, 'dim');
    });
    Display.blank();
    Display.dim('Uso: /theme <color>');
    Display.dim('Ejemplo: /theme matrix');
    return;
  }

  const theme = args[0].toLowerCase();

  if (!isValidTheme(theme)) {
    Display.error(`Tema inválido: ${theme}`);
    Display.info(`Temas disponibles: ${THEMES.join(', ')}`);
    return;
  }

  // Aplicar tema
  applyTheme(theme);
  Display.success(`Tema cambiado a: ${theme}`);

  // Guardar preferencia
  const Storage = await import('../core/storage.js').then(m => m.default);
  Storage.saveSettings({ theme });
}

/**
 * Aplica un tema al body
 */
function applyTheme(theme) {
  // Remover todos los temas anteriores
  THEMES.forEach(t => {
    document.body.classList.remove(`theme-${t}`);
  });

  // Aplicar nuevo tema
  if (theme !== 'green') { // green es el default
    document.body.classList.add(`theme-${theme}`);
  }

  Logger.info(`Commands: Theme changed to ${theme}`);
}

/**
 * Comando: /version
 */
function handleVersion() {
  Display.showVersion();
}

/**
 * Comando: /status
 */
function handleStatus() {
  Display.showStatus();
}

/**
 * Comando: /exit
 */
function handleExit() {
  Display.info('Para cerrar la aplicación, cierra esta pestaña del navegador.');
  Display.dim('Tus datos de sesión se guardan localmente y se restaurarán al regresar.');
}

/**
 * Comando: /start
 * Generar nueva identidad Nostr (sin password)
 */
async function handleStart(args) {
  try {
    // Verificar si ya tiene identidad en sesión
    const existingKey = sessionStorage.getItem('mostro_identity');

    if (existingKey) {
      Display.warning('Ya tienes una identidad activa en esta sesión.');
      Display.blank();
      const identity = JSON.parse(existingKey);
      Display.info('Tu identidad actual:');
      Display.addLine(`  ${identity.npub}`, 'success');
      Display.blank();
      Display.dim('Usa /export para ver tu clave privada (nsec)');
      return;
    }

    // Generar nueva identidad
    Display.info('Generando nueva identidad Nostr...');
    Display.blank();

    // Inicializar nostr-tools
    if (!window.nostrTools) {
      Display.error('Nostr-tools library not loaded yet. Please wait and try again.');
      return;
    }

    const nostrTools = window.nostrTools;
    const { nip19 } = nostrTools;

    // Generar keypair
    const secretKey = nostrTools.generateSecretKey();
    const publicKey = nostrTools.getPublicKey(secretKey);

    // Convertir a formatos legibles
    const npub = nip19.npubEncode(publicKey);
    const nsec = nip19.nsecEncode(secretKey);

    // Guardar en sessionStorage (solo durante la sesión)
    const identity = {
      secretKey: Array.from(secretKey), // Convertir Uint8Array a Array para JSON
      publicKey,
      npub,
      nsec,
      createdAt: Date.now()
    };

    sessionStorage.setItem('mostro_identity', JSON.stringify(identity));

    // Mostrar resultado
    Display.success('✓ Nueva identidad generada');
    Display.blank();
    Display.addLine('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━', 'dim');
    Display.blank();
    Display.info('CLAVE PÚBLICA (npub):');
    Display.addLine(`  ${npub}`, 'success');
    Display.blank();
    Display.info('CLAVE PRIVADA (nsec) - GUÁRDALA:');
    Display.addLine(`  ${nsec}`, 'warning');
    Display.blank();
    Display.addLine('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━', 'dim');
    Display.blank();
    Display.warning('⚠️  IMPORTANTE:');
    Display.blank();
    Display.dim(`  • ${SECURITY_NOTICES.KEY_PURPOSE}`);
    Display.dim(`  • ${SECURITY_NOTICES.FUNDS_LOCATION}`);
    Display.dim(`  • ${SECURITY_NOTICES.NOSTR_COMPATIBLE}`);

  } catch (error) {
    Logger.error('Start command error:', error);
    Display.error(`Error al generar identidad: ${error.message}`);
  }
}

/**
 * Comando: /login
 * Importar clave privada existente (nsec)
 */
async function handleLogin(args) {
  try {
    // Verificar si ya tiene identidad en sesión
    const existingKey = sessionStorage.getItem('mostro_identity');

    if (existingKey) {
      Display.warning('Ya tienes una identidad activa en esta sesión.');
      Display.blank();
      const identity = JSON.parse(existingKey);
      Display.info('Tu identidad actual:');
      Display.addLine(`  ${identity.npub}`, 'success');
      Display.blank();
      Display.dim('Cierra esta pestaña y abre una nueva para usar otra identidad.');
      return;
    }

    // Inicializar nostr-tools
    if (!window.nostrTools) {
      Display.error('Nostr-tools library not loaded yet. Please wait and try again.');
      return;
    }

    const nostrTools = window.nostrTools;
    const { nip19 } = nostrTools;

    // Mostrar advertencias
    Display.blank();
    Display.warning('⚠️  IMPORTANTE:');
    Display.blank();
    Display.dim(`  • ${SECURITY_NOTICES.KEY_PURPOSE}`);
    Display.dim(`  • ${SECURITY_NOTICES.FUNDS_LOCATION}`);
    Display.dim(`  • ${SECURITY_NOTICES.NOSTR_COMPATIBLE}`);
    Display.blank();

    // Solicitar private key
    Display.info('Ingresa tu clave privada (nsec):');
    const privateKey = await promptPrivateKey();

    if (!privateKey) {
      Display.error('Operación cancelada.');
      return;
    }

    // Importar y validar
    Display.blank();
    Display.info('Validando clave privada...');

    let secretKey;
    let publicKey;

    // Detectar formato (nsec o hex)
    if (privateKey.startsWith('nsec1')) {
      // Formato nsec (bech32)
      try {
        const decoded = nip19.decode(privateKey);
        if (decoded.type !== 'nsec') {
          throw new Error('Invalid nsec format');
        }
        secretKey = decoded.data;
      } catch (error) {
        Display.error('Formato nsec inválido. Verifica tu clave.');
        return;
      }
    } else if (/^[a-f0-9]{64}$/i.test(privateKey)) {
      // Formato hex
      secretKey = new Uint8Array(
        privateKey.match(/.{2}/g).map(byte => parseInt(byte, 16))
      );
    } else {
      Display.error('Formato de clave inválido. Usa nsec o hex.');
      return;
    }

    // Derivar public key
    try {
      publicKey = nostrTools.getPublicKey(secretKey);
    } catch (error) {
      Display.error('Clave privada inválida.');
      return;
    }

    // Convertir a formatos legibles
    const npub = nip19.npubEncode(publicKey);
    const nsec = nip19.nsecEncode(secretKey);

    // Guardar en sessionStorage
    const identity = {
      secretKey: Array.from(secretKey),
      publicKey,
      npub,
      nsec,
      createdAt: Date.now()
    };

    sessionStorage.setItem('mostro_identity', JSON.stringify(identity));

    // Mostrar resultado
    Display.blank();
    Display.success('✓ Identidad importada correctamente');
    Display.blank();
    Display.addLine('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━', 'dim');
    Display.blank();
    Display.info('TU IDENTIDAD:');
    Display.addLine(`  ${npub}`, 'success');
    Display.blank();
    Display.addLine('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━', 'dim');
    Display.blank();
    Display.dim('Listo para comenzar a tradear en Mostro.');
    Display.blank();

  } catch (error) {
    Logger.error('Login command error:', error);
    Display.error(`Error al importar identidad: ${error.message}`);
  }
}

/**
 * Comando: /import
 * Importar clave privada existente
 */
async function handleImport(args) {
  try {
    // Verificar si ya existe identidad
    await KeyManager.init();

    if (KeyManager.hasIdentity()) {
      Display.warning('Ya existe una identidad');
      Display.blank();

      const confirm = await promptConfirmation(
        'Esto reemplazará tu identidad actual. ¿Continuar?',
        'yes'
      );

      if (!confirm) {
        Display.info('Importación cancelada.');
        return;
      }

      // Si está unlocked, eliminar identidad actual
      if (KeyManager.isUnlocked()) {
        KeyManager.deleteIdentity();
      } else {
        // Si está locked, necesita unlock primero para delete
        Display.error('Desbloquea tu sesión primero con /start e intenta de nuevo.');
        return;
      }
    }

    Display.info('Importar identidad Nostr existente');
    Display.blank();

    // Solicitar private key
    const privateKey = await promptPrivateKey();

    if (!privateKey) {
      Display.error('Operación cancelada.');
      return;
    }

    // Importar clave
    await KeyManager.importPrivateKey(privateKey);

    // Solicitar password para encriptar
    Display.blank();
    const password = await promptPasswordConfirm();

    if (!password) {
      Display.error('Operación cancelada.');
      return;
    }

    // Encriptar y guardar
    await KeyManager.setPassword(password);

    const npub = KeyManager.getPublicKey('npub');

    Display.blank();
    Display.success(SUCCESS_MESSAGES.KEY_IMPORTED);
    Display.blank();
    Display.info('Tu clave pública (npub):');
    Display.addLine(npub, 'success');
    Display.blank();
    Display.warning('⚠️  RECORDATORIO DE RESPALDO');
    Display.dim('Si pierdes tu contraseña, necesitarás re-importar esta clave.');
    Display.dim('Mantén tu nsec en un lugar seguro');
    Display.blank();
    Display.success('✓ Sesión iniciada. Listo para tradear');

  } catch (error) {
    Logger.error('Import command error:', error);
    Display.error(`Error al importar: ${error.message}`);
  }
}

/**
 * Comando: /export
 * Exportar clave privada para backup
 */
async function handleExport(args) {
  try {
    // Verificar que esté unlocked
    if (!KeyManager.isUnlocked()) {
      Display.error(ERROR_MESSAGES.EXPORT_REQUIRES_UNLOCK);
      return;
    }

    // Pedir confirmación
    Display.warning('⚠️  ADVERTENCIA: Esto mostrará tu CLAVE PRIVADA');
    Display.dim('Cualquiera con esta clave puede controlar tu identidad y fondos.');
    Display.dim('Solo exporta si necesitas respaldar o migrar a otra app.');
    Display.blank();

    const confirmed = await promptConfirmation(
      '¿Estás seguro de continuar?',
      'I UNDERSTAND'
    );

    if (!confirmed) {
      Display.info('Exportación cancelada.');
      return;
    }

    // Exportar claves
    const nsec = KeyManager.exportPrivateKey('nsec');
    const hex = KeyManager.exportPrivateKey('hex');

    Display.blank();
    Display.info('=== RESPALDO DE CLAVE PRIVADA ===');
    Display.blank();
    Display.success('Tu clave privada (formato nsec):');
    Display.addLine(nsec, 'warning');
    Display.blank();
    Display.dim('Formato hex (para usuarios avanzados):');
    Display.addLine(hex, 'dim');
    Display.blank();
    Display.warning('⚠️  Guarda esto en un LUGAR SEGURO');
    Display.dim('Almacenamiento recomendado:');
    Display.dim('  • Gestor de contraseñas (bóveda encriptada)');
    Display.dim('  • Hardware wallet (si es compatible)');
    Display.dim('  • Respaldo en papel en ubicación segura');
    Display.dim('  • NO guardar en archivos de texto plano o capturas');

  } catch (error) {
    Logger.error('Export command error:', error);
    Display.error(`Error al exportar: ${error.message}`);
  }
}

/**
 * Comando: /identity
 * Mostrar información de identidad
 */
async function handleIdentity(args) {
  try {
    await KeyManager.init();

    if (!KeyManager.hasIdentity()) {
      Display.error(ERROR_MESSAGES.NO_IDENTITY_FOUND);
      Display.dim('Usa /start para crear o importar una identidad.');
      return;
    }

    const npub = KeyManager.getPublicKey('npub');
    const hex = KeyManager.getPublicKey('hex');
    const isUnlocked = KeyManager.isUnlocked();
    const tradeIndex = KeyManager.getTradeIndex();

    Display.info('=== INFORMACIÓN DE IDENTIDAD ===');
    Display.blank();
    Display.addLine(`Estado: ${isUnlocked ? '🟢 Desbloqueado' : '🔴 Bloqueado'}`, 'normal');
    Display.blank();
    Display.addLine('Clave Pública (npub):', 'dim');
    Display.addLine(npub, 'normal');
    Display.blank();
    Display.addLine('Clave Pública (hex):', 'dim');
    Display.addLine(hex, 'dim');
    Display.blank();
    Display.addLine(`Índice de Trading: ${tradeIndex}`, 'info');

    if (isUnlocked) {
      const tradeKey = KeyManager.getCurrentTradeKey();
      if (tradeKey) {
        Display.blank();
        Display.addLine('Clave de Trading Actual:', 'dim');
        Display.addLine(tradeKey.publicKey, 'dim');
      }
    }

    Display.blank();
    Display.dim('Usa /export para respaldar tu clave privada.');

  } catch (error) {
    Logger.error('Identity command error:', error);
    Display.error(`Error al mostrar identidad: ${error.message}`);
  }
}

/**
 * Comando: /lock
 * Bloquear sesión y limpiar claves de memoria
 */
async function handleLock(args) {
  try {
    if (!KeyManager.isUnlocked()) {
      Display.warning('La sesión ya está bloqueada.');
      return;
    }

    KeyManager.lockKeys();

    Display.success(SUCCESS_MESSAGES.SESSION_LOCKED);
    Display.dim('Usa /start para desbloquear de nuevo.');

  } catch (error) {
    Logger.error('Lock command error:', error);
    Display.error(`Error al bloquear: ${error.message}`);
  }
}

/**
 * Comando: /changepass
 * Cambiar password de encriptación
 */
async function handleChangePassword(args) {
  try {
    if (!KeyManager.isUnlocked()) {
      Display.error(ERROR_MESSAGES.KEY_LOCKED);
      Display.dim('Usa /start para desbloquear primero.');
      return;
    }

    Display.info('Cambiar contraseña de encriptación');
    Display.warning('Esto re-encriptará tu clave privada con una nueva contraseña.');
    Display.blank();

    // Solicitar password actual
    const oldPassword = await promptPassword('Ingresa contraseña actual:');

    if (!oldPassword) {
      Display.error('Operación cancelada.');
      return;
    }

    // Solicitar nuevo password
    Display.blank();
    const newPassword = await promptPasswordConfirm();

    if (!newPassword) {
      Display.error('Operación cancelada.');
      return;
    }

    // Cambiar password
    await KeyManager.changePassword(oldPassword, newPassword);

    Display.blank();
    Display.success(SUCCESS_MESSAGES.PASSWORD_CHANGED);
    Display.info('Tu clave privada ha sido re-encriptada.');

  } catch (error) {
    Logger.error('ChangePassword command error:', error);
    Display.error(`Error al cambiar contraseña: ${error.message}`);
  }
}

/**
 * Obtiene sugerencias de autocompletado
 */
export function getAutocompleteSuggestions(input) {
  if (!input || !input.startsWith('/')) {
    return [];
  }

  const lower = input.toLowerCase();

  // Buscar comandos que coincidan
  const suggestions = Object.values(COMMANDS).filter(cmd =>
    cmd.toLowerCase().startsWith(lower)
  );

  return suggestions;
}

/**
 * Valida si un input es un comando válido
 */
export async function isValidCommand(input) {
  const parsed = parseCommand(input);
  if (!parsed) return false;

  const allCommands = Object.values(COMMANDS);
  return allCommands.includes(parsed.command);
}

/**
 * Obtiene información de un comando
 */
export async function getCommandInfo(command) {
  const { COMMAND_INFO } = await import('../utils/constants.js');
  return COMMAND_INFO[command] || null;
}

/**
 * Comando: /relays
 * Muestra estado de conexiones a relays
 */
async function handleRelays(args) {
  try {
    const state = RelayManager.getState();

    Display.info('=== ESTADO DE RELAYS ===');
    Display.blank();
    Display.addLine(`Conectados: ${state.connectedCount}/${state.relayCount}`, 'info');
    Display.addLine(`Suscripciones: ${state.subscriptionCount}`, 'dim');
    Display.blank();

    if (state.relays.length === 0) {
      Display.warning('No hay relays configurados');
      return;
    }

    state.relays.forEach(relay => {
      const statusIcon = relay.status === 'connected' ? '🟢' :
                         relay.status === 'connecting' ? '🟡' : '🔴';
      const statusText = relay.status === 'connected' ? 'CONECTADO' :
                         relay.status === 'connecting' ? 'CONECTANDO' : 'DESCONECTADO';

      Display.addLine(`${statusIcon} ${relay.url}`, 'normal');
      Display.addLine(`   Estado: ${statusText}`, 'dim');

      if (relay.lastConnected) {
        const ago = Math.floor((Date.now() - relay.lastConnected) / 1000);
        Display.addLine(`   Última conexión: hace ${ago}s`, 'dim');
      }

      if (relay.lastError) {
        Display.addLine(`   Error: ${relay.lastError}`, 'error');
      }

      Display.blank();
    });

    Display.dim('Estadísticas:');
    Display.dim(`  Eventos recibidos: ${state.stats.eventsReceived}`);
    Display.dim(`  Eventos publicados: ${state.stats.eventsPublished}`);
    Display.dim(`  Errores: ${state.stats.errors}`);

  } catch (error) {
    Logger.error('Relays command error:', error);
    Display.error(`Error al mostrar relays: ${error.message}`);
  }
}

/**
 * Comando: /discover
 * Inicia descubrimiento de órdenes
 */
async function handleDiscover(args) {
  try {
    if (Discovery.isActive()) {
      Display.warning(ERROR_MESSAGES.DISCOVERY_ALREADY_RUNNING);
      Display.info('Usa /refresh para actualizar órdenes o /listorders para verlas.');
      return;
    }

    Display.info('Iniciando búsqueda de órdenes...');
    Display.blank();

    // Conectar a relays si no está conectado
    if (!RelayManager.isConnected()) {
      Display.info('Conectando a relays...');

      try {
        const result = await RelayManager.connect();
        Display.success(`Conectado a ${result.connected}/${result.total} relays`);

        if (result.failed > 0) {
          Display.warning(`Error al conectar con ${result.failed} relays`);
        }

        Display.blank();
      } catch (error) {
        Display.error(`Error al conectar con relays: ${error.message}`);
        Display.dim('Verifica tu conexión a internet e intenta de nuevo.');
        return;
      }
    } else {
      const connectedCount = RelayManager.getConnectedCount();
      Display.info(`Ya conectado a ${connectedCount} relays`);
      Display.blank();
    }

    // Iniciar discovery
    Display.info('Escaneando relays en busca de órdenes Mostro...');

    await Discovery.startDiscovery();

    Display.success(SUCCESS_MESSAGES.DISCOVERY_STARTED);
    Display.blank();
    Display.dim('Escuchando eventos de órdenes...');
    Display.dim('Las órdenes aparecerán conforme se descubran.');
    Display.blank();
    Display.info('Usa /listorders para ver órdenes descubiertas');
    Display.dim('Usa /refresh para re-escanear relays');

  } catch (error) {
    Logger.error('Discover command error:', error);
    Display.error(`Error al iniciar búsqueda: ${error.message}`);
  }
}

/**
 * Comando: /refresh
 * Refresca órdenes desde relays
 */
async function handleRefresh(args) {
  try {
    if (!Discovery.isActive()) {
      Display.warning('Búsqueda no activa. Usa /discover para iniciar.');
      return;
    }

    Display.info('Actualizando órdenes desde relays...');
    Display.blank();

    const oldStats = Discovery.getStats();

    await Discovery.refreshOrders();

    // Esperar un momento para que lleguen algunos eventos
    Display.dim('Escaneando relays...');

    // Dar tiempo para recibir eventos iniciales (2 segundos)
    await new Promise(resolve => setTimeout(resolve, 2000));

    const newStats = Discovery.getStats();

    Display.blank();
    Display.success(SUCCESS_MESSAGES.ORDERS_REFRESHED);
    Display.blank();
    Display.info(`Encontradas ${newStats.total} órdenes de ${newStats.mostroCount} instancias Mostro`);
    Display.dim(`  Órdenes de compra: ${newStats.buyOrders}`);
    Display.dim(`  Órdenes de venta: ${newStats.sellOrders}`);
    Display.blank();
    Display.info('Usa /listorders para ver órdenes');

  } catch (error) {
    Logger.error('Refresh command error:', error);
    Display.error(`Error al actualizar órdenes: ${error.message}`);
  }
}

/**
 * Comando: /listorders
 * Lista órdenes descubiertas agrupadas por Mostro
 */
async function handleListOrders(args) {
  try {
    // Verificar que discovery esté activo o haya órdenes cacheadas
    if (!Discovery.isActive() && Discovery.getOrderCount() === 0) {
      Display.warning('No hay órdenes disponibles.');
      Display.info('Usa /discover para comenzar a escanear órdenes.');
      return;
    }

    // Parsear filtros de argumentos
    const filters = {};

    // Primer argumento puede ser tipo (buy/sell) o fiatCode
    if (args.length > 0) {
      const firstArg = args[0].toLowerCase();

      if (firstArg === 'buy' || firstArg === 'sell') {
        filters.type = firstArg;
      } else {
        // Asumir que es fiatCode
        filters.fiatCode = args[0].toUpperCase();
      }
    }

    // Segundo argumento puede ser fiatCode
    if (args.length > 1) {
      filters.fiatCode = args[1].toUpperCase();
    }

    // Solo órdenes completas y no expiradas
    filters.onlyComplete = true;
    filters.excludeExpired = true;

    // Obtener órdenes
    const orders = Discovery.getOrders(filters);

    if (orders.length === 0) {
      Display.warning(ERROR_MESSAGES.NO_ORDERS_FOUND);

      if (Object.keys(filters).length > 2) {
        Display.dim('Intenta remover filtros o usa /refresh para actualizar.');
      } else {
        Display.dim('Usa /discover para comenzar a escanear o /refresh para actualizar.');
      }

      return;
    }

    // Agrupar por Mostro
    const groupedOrders = {};
    orders.forEach(order => {
      if (!groupedOrders[order.mostroPubkey]) {
        groupedOrders[order.mostroPubkey] = [];
      }
      groupedOrders[order.mostroPubkey].push(order);
    });

    const mostroCount = Object.keys(groupedOrders).length;

    // Header
    Display.info('=== ÓRDENES DE MOSTRO ===');
    Display.blank();

    let filterText = 'Todas las órdenes';
    if (filters.type) {
      filterText = `Órdenes de ${filters.type === 'buy' ? 'COMPRA' : 'VENTA'}`;
    }
    if (filters.fiatCode) {
      filterText += ` en ${filters.fiatCode}`;
    }

    Display.addLine(`${filterText}: ${orders.length} órdenes de ${mostroCount} instancias Mostro`, 'info');
    Display.blank();

    // Mostrar órdenes agrupadas por Mostro
    let displayedOrders = 0;
    const maxOrdersPerMostro = 10;
    const maxMostros = 5;

    Object.entries(groupedOrders).slice(0, maxMostros).forEach(([mostroPubkey, mostroOrders]) => {
      const mostro = Discovery.getMostro(mostroPubkey);

      if (!mostro) return;

      Display.addLine(`${mostro.toDisplayString()}`, 'info');
      Display.blank();

      mostroOrders.slice(0, maxOrdersPerMostro).forEach(order => {
        Display.addLine(`  ${order.toDisplayString()}`, 'normal');
      });

      if (mostroOrders.length > maxOrdersPerMostro) {
        Display.dim(`  ... y ${mostroOrders.length - maxOrdersPerMostro} órdenes más`);
      }

      Display.blank();
      displayedOrders += Math.min(mostroOrders.length, maxOrdersPerMostro);
    });

    if (mostroCount > maxMostros) {
      Display.dim(`... y ${mostroCount - maxMostros} instancias Mostro más`);
      Display.blank();
    }

    // Footer
    Display.dim('Leyenda: 📗 = COMPRA | 📕 = VENTA | 🟢 = Mostro Activo');
    Display.blank();
    Display.info('Para tomar una orden, usa:');
    Display.dim('  /takebuy <order-id>  - Tomar una orden de compra');
    Display.dim('  /takesell <order-id> - Tomar una orden de venta');

    if (!Discovery.isActive()) {
      Display.blank();
      Display.warning('⚠️  Búsqueda no activa. Las órdenes pueden estar desactualizadas.');
      Display.dim('Usa /discover para iniciar búsqueda en tiempo real.');
    }

  } catch (error) {
    Logger.error('ListOrders command error:', error);
    Display.error(`Error al listar órdenes: ${error.message}`);
  }
}

/**
 * Inicializa el módulo de comandos
 */
export async function initCommands() {
  Logger.debug('Commands: Initialized');

  // Restaurar tema guardado
  const Storage = await import('../core/storage.js').then(m => m.default);
  const settings = Storage.getSettings();

  if (settings.theme && settings.theme !== 'green') {
    applyTheme(settings.theme);
    Logger.info(`Commands: Restored theme: ${settings.theme}`);
  }
}

// Exportar funciones principales
export default {
  parseCommand,
  executeCommand,
  getAutocompleteSuggestions,
  isValidCommand,
  getCommandInfo,
  initCommands,
  applyTheme
};
