/**
 * Commands Module
 * Parser y ejecutor de comandos
 */

import { COMMANDS, THEMES, ERROR_MESSAGES } from '../utils/constants.js';
import { isValidTheme, parseCommandArgs } from '../utils/helpers.js';
import Logger from '../utils/logger.js';
import Display from './display.js';

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

      // Comandos no implementados aún
      case COMMANDS.START:
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
function handleTheme(args) {
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
export function isValidCommand(input) {
  const parsed = parseCommand(input);
  if (!parsed) return false;

  const allCommands = Object.values(COMMANDS);
  return allCommands.includes(parsed.command);
}

/**
 * Obtiene información de un comando
 */
export function getCommandInfo(command) {
  const { COMMAND_INFO } = await import('../utils/constants.js');
  return COMMAND_INFO[command] || null;
}

/**
 * Inicializa el módulo de comandos
 */
export function initCommands() {
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
