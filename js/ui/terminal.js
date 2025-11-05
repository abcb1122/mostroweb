/**
 * Terminal Module
 * Gestiona la interacción del usuario con el terminal
 */

import Logger from '../utils/logger.js';
import Storage from '../core/storage.js';
import Display from './display.js';
import Commands from './commands.js';

// Estado del terminal
const state = {
  input: null,
  cursor: null,
  historyIndex: -1,
  commandHistory: [],
  isProcessing: false
};

/**
 * Inicializa el terminal
 */
export function initTerminal() {
  Logger.info('Terminal: Initializing...');

  // Obtener referencias a elementos
  state.input = document.getElementById('terminal-input');
  state.cursor = document.querySelector('.cursor');

  if (!state.input) {
    Logger.error('Terminal: Input element not found');
    return false;
  }

  // Cargar historial de comandos
  state.commandHistory = Storage.getCommandHistory();
  state.historyIndex = state.commandHistory.length;

  // Setup event listeners
  setupEventListeners();

  // Inicializar módulos relacionados
  Display.initDisplay();
  Commands.initCommands();

  // Mostrar welcome message
  Display.showWelcome();

  // Focus en input
  state.input.focus();

  Logger.info('Terminal: Initialized successfully');
  return true;
}

/**
 * Setup de event listeners
 */
function setupEventListeners() {
  // Enter: Ejecutar comando
  state.input.addEventListener('keydown', handleKeyDown);

  // Input: Actualizar cursor position
  state.input.addEventListener('input', handleInput);

  // Click en terminal: focus en input
  const container = document.getElementById('terminal-container');
  if (container) {
    container.addEventListener('click', () => {
      state.input.focus();
    });
  }

  // Prevenir pérdida de foco
  state.input.addEventListener('blur', () => {
    setTimeout(() => state.input.focus(), 100);
  });

  // Window resize: scroll to bottom
  window.addEventListener('resize', () => {
    Display.scrollToBottom();
  });

  Logger.debug('Terminal: Event listeners configured');
}

/**
 * Handler para keydown
 */
async function handleKeyDown(event) {
  switch (event.key) {
    case 'Enter':
      event.preventDefault();
      await handleEnter();
      break;

    case 'ArrowUp':
      event.preventDefault();
      handleArrowUp();
      break;

    case 'ArrowDown':
      event.preventDefault();
      handleArrowDown();
      break;

    case 'Tab':
      event.preventDefault();
      handleTab();
      break;

    case 'l':
      // Ctrl+L: Clear terminal
      if (event.ctrlKey) {
        event.preventDefault();
        Display.clear();
      }
      break;

    case 'c':
      // Ctrl+C: Cancel current input
      if (event.ctrlKey) {
        event.preventDefault();
        state.input.value = '';
        updateCursor();
      }
      break;
  }
}

/**
 * Handler para input
 */
function handleInput() {
  updateCursor();
}

/**
 * Handler para Enter (ejecutar comando)
 */
async function handleEnter() {
  const command = state.input.value.trim();

  if (!command) {
    Display.blank();
    return;
  }

  if (state.isProcessing) {
    Logger.warn('Terminal: Already processing a command');
    return;
  }

  state.isProcessing = true;

  try {
    // Añadir al historial
    Storage.addToCommandHistory(command);
    state.commandHistory = Storage.getCommandHistory();
    state.historyIndex = state.commandHistory.length;

    // Limpiar input
    state.input.value = '';
    updateCursor();

    // Ejecutar comando
    await Commands.executeCommand(command);

    // Añadir línea en blanco después del output
    Display.blank();

  } catch (error) {
    Logger.error('Terminal: Error executing command', error);
    Display.error(`Unexpected error: ${error.message}`);
  } finally {
    state.isProcessing = false;
  }
}

/**
 * Handler para Arrow Up (comando anterior)
 */
function handleArrowUp() {
  if (state.historyIndex > 0) {
    state.historyIndex--;
    state.input.value = state.commandHistory[state.historyIndex] || '';
    updateCursor();
    // Mover cursor al final
    setTimeout(() => {
      state.input.selectionStart = state.input.value.length;
      state.input.selectionEnd = state.input.value.length;
    }, 0);
  }
}

/**
 * Handler para Arrow Down (comando siguiente)
 */
function handleArrowDown() {
  if (state.historyIndex < state.commandHistory.length) {
    state.historyIndex++;
    state.input.value = state.commandHistory[state.historyIndex] || '';
    updateCursor();
    // Mover cursor al final
    setTimeout(() => {
      state.input.selectionStart = state.input.value.length;
      state.input.selectionEnd = state.input.value.length;
    }, 0);
  }
}

/**
 * Handler para Tab (autocompletado)
 */
function handleTab() {
  const input = state.input.value;

  if (!input || !input.startsWith('/')) {
    return;
  }

  const suggestions = Commands.getAutocompleteSuggestions(input);

  if (suggestions.length === 0) {
    // No hay sugerencias
    return;
  }

  if (suggestions.length === 1) {
    // Una sola sugerencia: completar automáticamente
    state.input.value = suggestions[0] + ' ';
    updateCursor();
  } else {
    // Múltiples sugerencias: mostrar opciones
    Display.dim('Available commands:');
    suggestions.forEach(cmd => {
      Display.addLine(`  ${cmd}`, 'dim');
    });
    Display.blank();
  }
}

/**
 * Actualiza la posición del cursor visual
 */
function updateCursor() {
  if (!state.cursor) return;

  // El cursor se posiciona automáticamente con CSS
  // pero podemos agregar animación o lógica adicional aquí
}

/**
 * Establece el valor del input (útil para otros módulos)
 */
export function setInputValue(value) {
  if (state.input) {
    state.input.value = value;
    updateCursor();
  }
}

/**
 * Obtiene el valor actual del input
 */
export function getInputValue() {
  return state.input ? state.input.value : '';
}

/**
 * Limpia el input
 */
export function clearInput() {
  if (state.input) {
    state.input.value = '';
    updateCursor();
  }
}

/**
 * Focus en el input
 */
export function focusInput() {
  if (state.input) {
    state.input.focus();
  }
}

/**
 * Deshabilita el input (mientras se procesa un comando)
 */
export function disableInput() {
  if (state.input) {
    state.input.disabled = true;
  }
}

/**
 * Habilita el input
 */
export function enableInput() {
  if (state.input) {
    state.input.disabled = false;
    state.input.focus();
  }
}

/**
 * Actualiza el status bar
 */
export function updateStatus(section, text) {
  const statusElement = document.getElementById(`status-${section}-text`);
  if (statusElement) {
    statusElement.textContent = text;
  }
}

/**
 * Marca relays como conectados
 */
export function setRelaysConnected(connected) {
  const statusRelays = document.querySelector('.status-relays');
  if (statusRelays) {
    if (connected) {
      statusRelays.classList.add('connected');
      statusRelays.classList.remove('connecting');
      updateStatus('relays', 'CONNECTED');
    } else {
      statusRelays.classList.remove('connected');
      statusRelays.classList.remove('connecting');
      updateStatus('relays', 'OFFLINE');
    }
  }
}

/**
 * Marca relays como conectando
 */
export function setRelaysConnecting() {
  const statusRelays = document.querySelector('.status-relays');
  if (statusRelays) {
    statusRelays.classList.add('connecting');
    statusRelays.classList.remove('connected');
    updateStatus('relays', 'CONNECTING...');
  }
}

/**
 * Actualiza contador de órdenes
 */
export function updateOrdersCount(count) {
  updateStatus('orders', `Órdenes: ${count}`);
}

/**
 * Obtiene el estado actual del terminal
 */
export function getState() {
  return {
    ...state,
    historySize: state.commandHistory.length,
    isInputFocused: document.activeElement === state.input
  };
}

/**
 * Destruye el terminal (cleanup)
 */
export function destroyTerminal() {
  // Remover event listeners
  if (state.input) {
    state.input.removeEventListener('keydown', handleKeyDown);
    state.input.removeEventListener('input', handleInput);
  }

  Logger.info('Terminal: Destroyed');
}

// Exportar funciones principales
export default {
  initTerminal,
  setInputValue,
  getInputValue,
  clearInput,
  focusInput,
  disableInput,
  enableInput,
  updateStatus,
  setRelaysConnected,
  setRelaysConnecting,
  updateOrdersCount,
  getState,
  destroyTerminal
};
