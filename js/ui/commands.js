/**
 * Commands Module
 * Parser y ejecutor de comandos
 */

import { COMMANDS, THEMES, ERROR_MESSAGES, SUCCESS_MESSAGES } from '../utils/constants.js';
import { isValidTheme, parseCommandArgs } from '../utils/helpers.js';
import Logger from '../utils/logger.js';
import Display from './display.js';
import KeyManager from '../core/keyManager.js';
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

      // Comandos no implementados aún (Fase 2+)
      case COMMANDS.RESTORE:
      case COMMANDS.NEWSELL:
      case COMMANDS.NEWBUY:
      case COMMANDS.LISTORDERS:
      case COMMANDS.CANCEL:
      case COMMANDS.TAKEBUY:
      case COMMANDS.TAKESELL:
        Display.warning(`${command} - ${ERROR_MESSAGES.COMMAND_NOT_IMPLEMENTED}`);
        Display.info('This command will be available in Phase 2');
        break;

      default:
        // Comando no reconocido
        Display.error(`Unknown command: ${command}`);
        Display.dim('Type /help for available commands');
    }
  } catch (error) {
    Logger.error('Commands: Error executing command', error);
    Display.error(`Error executing command: ${error.message}`);
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
    Display.info(`Help for ${cmd} - Coming soon`);
    Display.dim('For now, use /help to see all commands');
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
    Display.info('Available themes:');
    Display.blank();
    THEMES.forEach(theme => {
      Display.addLine(`  • ${theme}`, 'dim');
    });
    Display.blank();
    Display.dim('Usage: /theme <color>');
    Display.dim('Example: /theme matrix');
    return;
  }

  const theme = args[0].toLowerCase();

  if (!isValidTheme(theme)) {
    Display.error(`Invalid theme: ${theme}`);
    Display.info(`Available themes: ${THEMES.join(', ')}`);
    return;
  }

  // Aplicar tema
  applyTheme(theme);
  Display.success(`Theme changed to: ${theme}`);

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
  Display.info('To close the application, simply close this browser tab.');
  Display.dim('Your session data is saved locally and will be restored when you return.');
}

/**
 * Comando: /start
 * Iniciar sesión (generar nueva identidad o unlock existente)
 */
async function handleStart(args) {
  try {
    // Inicializar KeyManager si no está inicializado
    await KeyManager.init();

    const hasIdentity = KeyManager.hasIdentity();

    if (!hasIdentity) {
      // Primera vez: generar nueva identidad
      Display.info('No identity found. Creating new identity...');
      Display.blank();
      Display.warning('⚠️  SECURITY NOTICE');
      Display.dim('Your private key will be encrypted and stored in your browser.');
      Display.blank();
      Display.dim('Important:');
      Display.dim('  • Use a STRONG password (12+ characters recommended)');
      Display.dim('  • Backup your key with /export after creation');
      Display.dim('  • Do not use on shared/public computers');
      Display.blank();

      // Solicitar password
      const password = await promptPasswordConfirm();

      if (!password) {
        Display.error('Operation cancelled.');
        return;
      }

      // Generar nueva identidad
      await KeyManager.generateNewIdentity();
      await KeyManager.setPassword(password);

      const npub = KeyManager.getPublicKey('npub');

      Display.blank();
      Display.success(SUCCESS_MESSAGES.KEY_GENERATED);
      Display.blank();
      Display.info('Your Nostr public key (npub):');
      Display.addLine(npub, 'success');
      Display.blank();
      Display.warning('⚠️  BACKUP YOUR KEY');
      Display.dim('Use /export to show your private key for backup.');
      Display.dim('Without this backup, you cannot recover your identity!');
      Display.blank();
      Display.success('✓ Session started. Ready to trade!');

    } else {
      // Usuario existente: unlock
      Display.info('Identity found. Unlocking session...');
      Display.blank();

      const password = await promptPassword('Enter your password:');

      if (!password) {
        Display.error('Operation cancelled.');
        return;
      }

      // Desbloquear claves
      await KeyManager.unlockKeys(password);

      const npub = KeyManager.getPublicKey('npub');
      const tradeIndex = KeyManager.getTradeIndex();

      Display.blank();
      Display.success(SUCCESS_MESSAGES.SESSION_UNLOCKED);
      Display.info(`Logged in as: ${npub.substring(0, 30)}...`);
      Display.info(`Trade index: ${tradeIndex}`);
      Display.blank();
      Display.dim('Ready to create orders and trades.');
    }

  } catch (error) {
    Logger.error('Start command error:', error);
    Display.error(`Failed to start: ${error.message}`);
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
      Display.warning('Identity already exists!');
      Display.blank();

      const confirm = await promptConfirmation(
        'This will replace your current identity. Continue?',
        'yes'
      );

      if (!confirm) {
        Display.info('Import cancelled.');
        return;
      }

      // Si está unlocked, eliminar identidad actual
      if (KeyManager.isUnlocked()) {
        KeyManager.deleteIdentity();
      } else {
        // Si está locked, necesita unlock primero para delete
        Display.error('Please unlock your session first with /start, then try again.');
        return;
      }
    }

    Display.info('Import existing Nostr identity');
    Display.blank();

    // Solicitar private key
    const privateKey = await promptPrivateKey();

    if (!privateKey) {
      Display.error('Operation cancelled.');
      return;
    }

    // Importar clave
    await KeyManager.importPrivateKey(privateKey);

    // Solicitar password para encriptar
    Display.blank();
    const password = await promptPasswordConfirm();

    if (!password) {
      Display.error('Operation cancelled.');
      return;
    }

    // Encriptar y guardar
    await KeyManager.setPassword(password);

    const npub = KeyManager.getPublicKey('npub');

    Display.blank();
    Display.success(SUCCESS_MESSAGES.KEY_IMPORTED);
    Display.blank();
    Display.info('Your public key (npub):');
    Display.addLine(npub, 'success');
    Display.blank();
    Display.warning('⚠️  BACKUP REMINDER');
    Display.dim('If you lose your password, you\'ll need to re-import this key.');
    Display.dim('Keep your nsec in a safe place!');
    Display.blank();
    Display.success('✓ Session started. Ready to trade!');

  } catch (error) {
    Logger.error('Import command error:', error);
    Display.error(`Import failed: ${error.message}`);
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
    Display.warning('⚠️  WARNING: This will display your PRIVATE KEY');
    Display.dim('Anyone with this key can control your identity and funds.');
    Display.dim('Only export if you need to backup or migrate to another app.');
    Display.blank();

    const confirmed = await promptConfirmation(
      'Are you sure you want to continue?',
      'I UNDERSTAND'
    );

    if (!confirmed) {
      Display.info('Export cancelled.');
      return;
    }

    // Exportar claves
    const nsec = KeyManager.exportPrivateKey('nsec');
    const hex = KeyManager.exportPrivateKey('hex');

    Display.blank();
    Display.info('=== PRIVATE KEY BACKUP ===');
    Display.blank();
    Display.success('Your private key (nsec format):');
    Display.addLine(nsec, 'warning');
    Display.blank();
    Display.dim('Hex format (for advanced users):');
    Display.addLine(hex, 'dim');
    Display.blank();
    Display.warning('⚠️  Store this in a SAFE PLACE!');
    Display.dim('Recommended storage:');
    Display.dim('  • Password manager (encrypted vault)');
    Display.dim('  • Hardware wallet (if supported)');
    Display.dim('  • Paper backup in secure location');
    Display.dim('  • DO NOT store in plain text files or screenshots!');

  } catch (error) {
    Logger.error('Export command error:', error);
    Display.error(`Export failed: ${error.message}`);
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
        Display.addLine(tradeKey.publicKey, 'dim');
      }
    }

    Display.blank();
    Display.dim('Use /export to backup your private key.');

  } catch (error) {
    Logger.error('Identity command error:', error);
    Display.error(`Failed to show identity: ${error.message}`);
  }
}

/**
 * Comando: /lock
 * Bloquear sesión y limpiar claves de memoria
 */
async function handleLock(args) {
  try {
    if (!KeyManager.isUnlocked()) {
      Display.warning('Session is already locked.');
      return;
    }

    KeyManager.lockKeys();

    Display.success(SUCCESS_MESSAGES.SESSION_LOCKED);
    Display.dim('Use /start to unlock again.');

  } catch (error) {
    Logger.error('Lock command error:', error);
    Display.error(`Failed to lock: ${error.message}`);
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
      Display.dim('Use /start to unlock first.');
      return;
    }

    Display.info('Change encryption password');
    Display.warning('This will re-encrypt your private key with a new password.');
    Display.blank();

    // Solicitar password actual
    const oldPassword = await promptPassword('Enter current password:');

    if (!oldPassword) {
      Display.error('Operation cancelled.');
      return;
    }

    // Solicitar nuevo password
    Display.blank();
    const newPassword = await promptPasswordConfirm();

    if (!newPassword) {
      Display.error('Operation cancelled.');
      return;
    }

    // Cambiar password
    await KeyManager.changePassword(oldPassword, newPassword);

    Display.blank();
    Display.success(SUCCESS_MESSAGES.PASSWORD_CHANGED);
    Display.info('Your private key has been re-encrypted.');

  } catch (error) {
    Logger.error('ChangePassword command error:', error);
    Display.error(`Failed to change password: ${error.message}`);
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
