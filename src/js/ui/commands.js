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
import MostroMessaging from '../mostro/messaging.js';
import OnboardingWizard from './wizard.js';
import QRCodeManager from './qrcode.js';
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

      case COMMANDS.TUTORIAL:
      case '/guide':
      case '/onboarding':
        await handleTutorial(args);
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

      // Trading Commands (Fase 3)
      case COMMANDS.NEWORDER:
      case '/order':
        await handleNewOrder(args);
        break;

      case COMMANDS.TAKEBUY:
        await handleTakeBuy(args);
        break;

      case COMMANDS.TAKESELL:
        await handleTakeSell(args);
        break;

      case COMMANDS.CANCEL:
        await handleCancel(args);
        break;

      case COMMANDS.ADDINVOICE:
        await handleAddInvoice(args);
        break;

      case COMMANDS.FIATSENT:
        await handleFiatSent(args);
        break;

      case COMMANDS.RELEASE:
        await handleRelease(args);
        break;

      case COMMANDS.HISTORY:
        await handleHistory(args);
        break;

      case COMMANDS.MYSTATS:
        await handleMyStats(args);
        break;

      case COMMANDS.SHOWQR:
        await handleShowQR(args);
        break;

      // Comandos no implementados aún
      case COMMANDS.RESTORE:
      case COMMANDS.NEWSELL:
      case COMMANDS.NEWBUY:
        Display.warning(`${command} - ${ERROR_MESSAGES.COMMAND_NOT_IMPLEMENTED}`);
        Display.info('Usa /neworder para crear órdenes');
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
 * Comando: /tutorial
 * Muestra la guía completa de onboarding
 */
async function handleTutorial(args) {
  try {
    Display.clear();
    await OnboardingWizard.showTutorial();
  } catch (error) {
    Logger.error('Tutorial command error:', error);
    Display.error('Error mostrando tutorial');
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

    // Iniciar escucha de respuestas de Mostro
    try {
      await MostroMessaging.startListening();
      Logger.info('Commands: Started listening for Mostro responses');
    } catch (error) {
      Logger.warn('Commands: Could not start listening for responses', error);
      // No es crítico, continuar de todas formas
    }

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
      Display.addLine(`  Pubkey: ${mostroPubkey.slice(0, 16)}...${mostroPubkey.slice(-8)}`, 'dim');
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
    Display.info('Comandos disponibles:');
    Display.dim('  /neworder buy 100 USD Strike   - Crear orden de compra');
    Display.dim('  /neworder sell 50 EUR Revolut  - Crear orden de venta');
    Display.dim('  /takebuy <order-id>            - Tomar orden de compra');
    Display.dim('  /takesell <order-id>           - Tomar orden de venta');

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
 * Comando: /neworder
 * Crear nueva orden de compra o venta en Mostro
 */
async function handleNewOrder(args) {
  try {
    // Verificar que esté conectado a relays
    if (!RelayManager.isConnected()) {
      Display.error('No estás conectado a ningún relay.');
      Display.dim('Ejecuta /discover primero para conectarte.');
      return;
    }

    // Verificar identidad
    const identityData = sessionStorage.getItem('mostro_identity');
    if (!identityData) {
      Display.error('No tienes una identidad activa.');
      Display.dim('Ejecuta /start o /login para crear/importar una identidad.');
      return;
    }

    // Validar argumentos mínimos
    if (args.length < 4) {
      Display.error('Parámetros insuficientes.');
      Display.blank();
      Display.info('Uso: /neworder <buy|sell> <amount> <currency> <payment-method> [premium] [mostro-pubkey]');
      Display.blank();
      Display.dim('Ejemplos:');
      Display.dim('  /neworder buy 100 USD Strike');
      Display.dim('  /neworder sell 50 EUR Revolut 2');
      Display.dim('  /neworder buy 1000 ARS "Face to face"');
      Display.blank();
      Display.info('Nota: Para especificar un Mostro específico, agrega su pubkey al final');
      Display.dim('  /neworder buy 100 USD Strike 0 npub1abc...');
      return;
    }

    // Parsear argumentos
    const orderType = args[0].toLowerCase();
    const amount = parseFloat(args[1]);
    const currency = args[2].toUpperCase();
    const paymentMethod = args[3];
    const premium = args[4] ? parseFloat(args[4]) : 0;
    const mostroPubkey = args[5] || null;

    // Validar tipo de orden
    if (orderType !== 'buy' && orderType !== 'sell') {
      Display.error(`Tipo de orden inválido: ${orderType}`);
      Display.dim('Debe ser "buy" o "sell"');
      return;
    }

    // Validar cantidad
    if (isNaN(amount) || amount <= 0) {
      Display.error(`Cantidad inválida: ${args[1]}`);
      Display.dim('Debe ser un número mayor que 0');
      return;
    }

    // Validar premium
    if (isNaN(premium)) {
      Display.error(`Premium inválido: ${args[4]}`);
      Display.dim('Debe ser un número (puede ser negativo)');
      return;
    }

    // Determinar pubkey de Mostro
    let targetMostro = mostroPubkey;

    if (!targetMostro) {
      // Si no se especificó, intentar obtener uno del discovery
      const mostros = Discovery.getMostroInstances();

      if (mostros.length === 0) {
        Display.warning('No se encontraron instancias de Mostro.');
        Display.blank();
        Display.info('Opciones:');
        Display.dim('  1. Ejecuta /discover para buscar Mostros activos');
        Display.dim('  2. Especifica un pubkey de Mostro manualmente:');
        Display.dim('     /neworder buy 100 USD Strike 0 npub1abc...');
        return;
      }

      // Usar el primero encontrado (el que más órdenes tenga)
      targetMostro = mostros[0].pubkey;
      Display.info(`Usando Mostro: ${mostros[0].getShortPubkey()}`);
      Display.blank();
    }

    // Si el pubkey es npub, convertirlo a hex
    if (targetMostro.startsWith('npub1')) {
      const { nip19 } = window.nostrTools;
      try {
        const decoded = nip19.decode(targetMostro);
        targetMostro = decoded.data;
      } catch (error) {
        Display.error('Formato de pubkey inválido.');
        return;
      }
    }

    // Configurar el pubkey de Mostro en el messaging
    MostroMessaging.setMostroPubkey(targetMostro);

    // Mostrar resumen
    Display.info('=== NUEVA ORDEN ===');
    Display.blank();
    Display.addLine(`Tipo: ${orderType.toUpperCase()}`, 'info');
    Display.addLine(`Cantidad: ${amount} ${currency}`, 'normal');
    Display.addLine(`Método de pago: ${paymentMethod}`, 'normal');
    if (premium !== 0) {
      const sign = premium > 0 ? '+' : '';
      Display.addLine(`Premium: ${sign}${premium}%`, 'normal');
    }
    Display.addLine(`Mostro: ${targetMostro.slice(0, 16)}...`, 'dim');
    Display.blank();
    Display.info('Enviando orden a Mostro...');

    // Crear orden
    const orderParams = {
      fiatCode: currency,
      fiatAmount: amount,
      paymentMethod: paymentMethod,
      premium: premium
    };

    let result;
    if (orderType === 'buy') {
      result = await MostroMessaging.createBuyOrder(orderParams);
    } else {
      result = await MostroMessaging.createSellOrder(orderParams);
    }

    Display.blank();
    Display.success('✓ Orden enviada exitosamente');
    Display.blank();
    Display.addLine(`Request ID: ${result.requestId}`, 'dim');
    Display.addLine(`Event ID: ${result.eventId.slice(0, 16)}...`, 'dim');
    Display.blank();
    Display.info('Espera la confirmación de Mostro...');
    Display.dim('La orden aparecerá en /listorders cuando sea confirmada.');

  } catch (error) {
    Logger.error('NewOrder command error:', error);
    Display.error(`Error al crear orden: ${error.message}`);
  }
}

/**
 * Comando: /takebuy
 * Tomar una orden de compra existente
 */
async function handleTakeBuy(args) {
  try {
    if (args.length === 0) {
      Display.error('Debes especificar el ID de la orden.');
      Display.dim('Uso: /takebuy <order-id> [amount]');
      Display.dim('Ejemplo: /takebuy abc123def456');
      return;
    }

    const orderId = args[0];
    const amount = args[1] ? parseFloat(args[1]) : null;

    // Verificar que tengamos un Mostro configurado
    const order = Discovery.getOrder(orderId);
    if (!order) {
      Display.error(`Orden no encontrada: ${orderId}`);
      Display.dim('Usa /listorders para ver órdenes disponibles.');
      return;
    }

    MostroMessaging.setMostroPubkey(order.mostroPubkey);

    Display.info(`Tomando orden de compra ${orderId.slice(0, 8)}...`);

    const result = await MostroMessaging.takeBuyOrder(orderId, amount);

    Display.blank();
    Display.success('✓ Orden tomada exitosamente');
    Display.blank();
    Display.addLine(`Request ID: ${result.requestId}`, 'dim');
    Display.blank();
    Display.info('Espera instrucciones de Mostro...');

  } catch (error) {
    Logger.error('TakeBuy command error:', error);
    Display.error(`Error al tomar orden: ${error.message}`);
  }
}

/**
 * Comando: /takesell
 * Tomar una orden de venta existente
 */
async function handleTakeSell(args) {
  try {
    if (args.length === 0) {
      Display.error('Debes especificar el ID de la orden.');
      Display.dim('Uso: /takesell <order-id> [amount]');
      Display.dim('Ejemplo: /takesell abc123def456');
      return;
    }

    const orderId = args[0];
    const amount = args[1] ? parseFloat(args[1]) : null;

    // Verificar que tengamos un Mostro configurado
    const order = Discovery.getOrder(orderId);
    if (!order) {
      Display.error(`Orden no encontrada: ${orderId}`);
      Display.dim('Usa /listorders para ver órdenes disponibles.');
      return;
    }

    MostroMessaging.setMostroPubkey(order.mostroPubkey);

    Display.info(`Tomando orden de venta ${orderId.slice(0, 8)}...`);

    const result = await MostroMessaging.takeSellOrder(orderId, amount);

    Display.blank();
    Display.success('✓ Orden tomada exitosamente');
    Display.blank();
    Display.addLine(`Request ID: ${result.requestId}`, 'dim');
    Display.blank();
    Display.info('Espera instrucciones de Mostro...');

  } catch (error) {
    Logger.error('TakeSell command error:', error);
    Display.error(`Error al tomar orden: ${error.message}`);
  }
}

/**
 * Comando: /cancel
 * Cancelar una orden pendiente
 */
async function handleCancel(args) {
  try {
    if (args.length === 0) {
      Display.error('Debes especificar el ID de la orden.');
      Display.dim('Uso: /cancel <order-id>');
      Display.dim('Ejemplo: /cancel abc123def456');
      return;
    }

    const orderId = args[0];

    // Verificar que tengamos un Mostro configurado
    const order = Discovery.getOrder(orderId);
    if (!order) {
      Display.error(`Orden no encontrada: ${orderId}`);
      Display.dim('Solo puedes cancelar órdenes que aparecen en /listorders.');
      return;
    }

    MostroMessaging.setMostroPubkey(order.mostroPubkey);

    Display.info(`Cancelando orden ${orderId.slice(0, 8)}...`);

    const result = await MostroMessaging.cancelOrder(orderId);

    Display.blank();
    Display.success('✓ Solicitud de cancelación enviada');
    Display.blank();
    Display.addLine(`Request ID: ${result.requestId}`, 'dim');
    Display.blank();
    Display.info('Espera confirmación de Mostro...');

  } catch (error) {
    Logger.error('Cancel command error:', error);
    Display.error(`Error al cancelar orden: ${error.message}`);
  }
}

/**
 * Maneja comando /addinvoice para añadir invoice Lightning
 * @param {string[]} args - Argumentos: [order-id, invoice]
 */
async function handleAddInvoice(args) {
  try {
    if (args.length < 2) {
      Display.error('Debes especificar el ID de la orden y la invoice.');
      Display.dim('Uso: /addinvoice <order-id> <lightning-invoice>');
      Display.dim('Ejemplo: /addinvoice abc123 lnbc1000...');
      return;
    }

    const orderId = args[0];
    const invoice = args[1];

    // Validar formato de invoice Lightning
    if (!PATTERNS.LIGHTNING_INVOICE.test(invoice)) {
      Display.error('Invoice Lightning inválida.');
      Display.dim('Debe empezar con lnbc (mainnet), lntb (testnet) o lnbcrt (regtest).');
      return;
    }

    // Verificar que la orden existe
    const order = Discovery.getOrder(orderId);
    if (!order) {
      Display.error(`Orden no encontrada: ${orderId}`);
      Display.dim('Solo puedes añadir invoice a órdenes que aparecen en /listorders.');
      return;
    }

    MostroMessaging.setMostroPubkey(order.mostroPubkey);

    Display.info(`Enviando invoice para orden ${orderId.slice(0, 8)}...`);

    // Enviar invoice a Mostro
    const result = await MostroMessaging.sendToMostro(
      MOSTRO_ACTIONS.ADD_INVOICE,
      { invoice },
      { orderId }
    );

    Display.blank();
    Display.success('✓ Invoice enviada a Mostro');
    Display.blank();
    Display.addLine(`Order ID: ${orderId.slice(0, 8)}...`, 'dim');
    Display.addLine(`Request ID: ${result.requestId}`, 'dim');
    Display.blank();
    Display.info('Espera confirmación del daemon Mostro...');
    Display.dim('Recibirás una notificación cuando el pago sea procesado.');

  } catch (error) {
    Logger.error('AddInvoice command error:', error);
    Display.error(`Error al enviar invoice: ${error.message}`);
  }
}

/**
 * Maneja comando /fiatsent para notificar envío de pago fiat
 * @param {string[]} args - Argumentos: [order-id]
 */
async function handleFiatSent(args) {
  try {
    if (args.length === 0) {
      Display.error('Debes especificar el ID de la orden.');
      Display.dim('Uso: /fiatsent <order-id>');
      Display.dim('Ejemplo: /fiatsent abc123def456');
      return;
    }

    const orderId = args[0];

    // Verificar que la orden existe
    const order = Discovery.getOrder(orderId);
    if (!order) {
      Display.error(`Orden no encontrada: ${orderId}`);
      Display.dim('Solo puedes notificar pago en órdenes activas.');
      return;
    }

    MostroMessaging.setMostroPubkey(order.mostroPubkey);

    Display.warning('⚠️  IMPORTANTE: Solo confirma si realmente enviaste el pago fiat.');
    Display.blank();
    Display.info(`Notificando envío de pago para orden ${orderId.slice(0, 8)}...`);

    // Notificar a Mostro que el fiat fue enviado
    const result = await MostroMessaging.sendToMostro(
      MOSTRO_ACTIONS.FIAT_SENT,
      {},
      { orderId }
    );

    Display.blank();
    Display.success('✓ Notificación enviada a Mostro');
    Display.blank();
    Display.addLine(`Order ID: ${orderId.slice(0, 8)}...`, 'dim');
    Display.addLine(`Request ID: ${result.requestId}`, 'dim');
    Display.blank();
    Display.info('Espera que el vendedor confirme la recepción del pago...');
    Display.dim('El vendedor revisará el pago y liberará los satoshis.');

  } catch (error) {
    Logger.error('FiatSent command error:', error);
    Display.error(`Error al notificar pago: ${error.message}`);
  }
}

/**
 * Maneja comando /release para liberar fondos Bitcoin
 * @param {string[]} args - Argumentos: [order-id]
 */
async function handleRelease(args) {
  try {
    if (args.length === 0) {
      Display.error('Debes especificar el ID de la orden.');
      Display.dim('Uso: /release <order-id>');
      Display.dim('Ejemplo: /release abc123def456');
      return;
    }

    const orderId = args[0];

    // Verificar que la orden existe
    const order = Discovery.getOrder(orderId);
    if (!order) {
      Display.error(`Orden no encontrada: ${orderId}`);
      Display.dim('Solo puedes liberar fondos en órdenes donde eres vendedor.');
      return;
    }

    MostroMessaging.setMostroPubkey(order.mostroPubkey);

    Display.warning('⚠️  CRÍTICO: Solo libera fondos si recibiste el pago fiat.');
    Display.warning('⚠️  Esta acción es IRREVERSIBLE.');
    Display.blank();

    // Pedir confirmación
    const confirmed = await promptConfirmation(
      '¿Confirmas que recibiste el pago fiat y quieres liberar los satoshis? (sí/no)'
    );

    if (!confirmed) {
      Display.info('Liberación cancelada');
      Display.blank();
      Display.dim('Usa /release <order-id> cuando hayas confirmado el pago fiat');
      return;
    }

    Display.blank();
    Display.info(`Liberando fondos para orden ${orderId.slice(0, 8)}...`);

    // Liberar fondos
    const result = await MostroMessaging.sendToMostro(
      MOSTRO_ACTIONS.RELEASE,
      {},
      { orderId }
    );

    Display.blank();
    Display.success('✓ Solicitud de liberación enviada a Mostro');
    Display.blank();
    Display.addLine(`Order ID: ${orderId.slice(0, 8)}...`, 'dim');
    Display.addLine(`Request ID: ${result.requestId}`, 'dim');
    Display.blank();
    Display.info('Los satoshis serán liberados al comprador...');
    Display.dim('El trade se completará una vez que Mostro procese la liberación.');

  } catch (error) {
    Logger.error('Release command error:', error);
    Display.error(`Error al liberar fondos: ${error.message}`);
  }
}

/**
 * Comando: /history
 * Muestra historial de notificaciones y eventos
 */
async function handleHistory(args) {
  try {
    const limit = args.length > 0 ? parseInt(args[0], 10) : 10;

    if (isNaN(limit) || limit < 1 || limit > 100) {
      Display.error('Límite inválido. Usa un número entre 1 y 100');
      Display.dim('Uso: /history [limit]');
      Display.dim('Ejemplo: /history 20');
      return;
    }

    const Notifications = await import('./notifications.js').then(m => m.default);
    Notifications.showHistory(limit);

  } catch (error) {
    Logger.error('History command error:', error);
    Display.error('Error mostrando historial');
  }
}

/**
 * Comando: /mystats
 * Muestra estadísticas de trading del usuario
 */
async function handleMyStats(args) {
  try {
    Display.blank();
    Display.addLine('📊 Tus Estadísticas de Trading', 'primary');
    Display.addLine('═══════════════════════════════════════', 'dim');
    Display.blank();

    // Obtener estadísticas del ResponseHandler
    const ResponseHandler = await import('../mostro/responseHandler.js').then(m => m.default);
    const stats = ResponseHandler.getStats();

    Display.addLine('  Mensajes Procesados:', 'info');
    Display.addLine(`    Recibidos: ${stats.messagesReceived}`, 'dim');
    Display.addLine(`    Errores:   ${stats.errorsHandled}`, 'dim');
    Display.blank();

    Display.addLine('  Trades:', 'info');
    Display.addLine(`    Completados: ${stats.tradesCompleted}`, 'success');
    Display.blank();

    // Obtener órdenes activas
    const activeOrders = ResponseHandler.getActiveOrders();
    Display.addLine(`  Órdenes Activas: ${activeOrders.size}`, 'warning');

    if (activeOrders.size > 0) {
      Display.blank();
      Display.addLine('  Estado de Órdenes:', 'info');

      activeOrders.forEach((order, orderId) => {
        const statusEmoji = {
          [ORDER_STATUS.PENDING]: '⏳',
          [ORDER_STATUS.ACTIVE]: '▶️',
          [ORDER_STATUS.WAITING_PAYMENT]: '💰',
          [ORDER_STATUS.FIAT_SENT]: '💸',
          [ORDER_STATUS.SUCCESS]: '✅',
          [ORDER_STATUS.CANCELED]: '❌',
          [ORDER_STATUS.DISPUTE]: '⚖️'
        };

        const emoji = statusEmoji[order.status] || '📦';
        Display.addLine(`    ${emoji} ${orderId.slice(0, 12)}... → ${order.status}`, 'dim');
      });
    }

    Display.blank();
    Display.addLine('═══════════════════════════════════════', 'dim');
    Display.blank();

    Display.dim('Usa /history para ver tu historial de notificaciones');
    Display.blank();

  } catch (error) {
    Logger.error('MyStats command error:', error);
    Display.error('Error mostrando estadísticas');
  }
}

/**
 * Comando: /showqr
 * Muestra un código QR para Lightning invoice o dirección
 */
async function handleShowQR(args) {
  try {
    if (args.length === 0) {
      Display.error('Debes especificar una invoice o datos para el QR');
      Display.dim('Uso: /showqr <lightning-invoice>');
      Display.dim('Ejemplo: /showqr lnbc1000...');
      return;
    }

    const data = args.join(' ');

    // Verificar si es una Lightning invoice
    const isLightningInvoice = /^(lnbc|lntb|lnbcrt)/i.test(data);

    if (!QRCodeManager.isAvailable()) {
      Display.error('Librería QR code no está disponible');
      return;
    }

    Display.blank();

    if (isLightningInvoice) {
      // Mostrar como Lightning invoice
      const success = QRCodeManager.showInvoice(data, {
        description: 'Invoice Lightning'
      });

      if (success) {
        Display.success('✅ Código QR generado');
        Display.blank();
        QRCodeManager.showASCII(data);
      }
    } else {
      // Mostrar QR genérico
      const success = QRCodeManager.show(data, {
        title: 'Código QR',
        description: 'Escanea este código QR'
      });

      if (success) {
        Display.success('✅ Código QR generado');
        Display.blank();
        QRCodeManager.showASCII(data);
      }
    }

  } catch (error) {
    Logger.error('ShowQR command error:', error);
    Display.error('Error generando código QR');
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
