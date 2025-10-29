/**
 * Display Module
 * Gestiona el output en el terminal
 */

import { sanitizeHTML } from '../utils/helpers.js';
import { ASCII_LOGO } from '../utils/constants.js';
import Logger from '../utils/logger.js';

// Referencia al elemento de output
let outputElement = null;

/**
 * Inicializa el módulo display
 */
export function initDisplay() {
  outputElement = document.getElementById('terminal-output');
  if (!outputElement) {
    Logger.error('Display: Output element not found');
    return false;
  }
  Logger.debug('Display: Initialized');
  return true;
}

/**
 * Añade una línea al output
 */
export function addLine(text, type = 'normal') {
  if (!outputElement) {
    Logger.warn('Display: Output element not initialized');
    return;
  }

  const line = document.createElement('div');
  line.className = `output-line ${type}`;
  line.textContent = sanitizeHTML(text);

  outputElement.appendChild(line);
  scrollToBottom();
}

/**
 * Añade HTML al output (usar con cuidado)
 */
export function addHTML(html, type = 'normal') {
  if (!outputElement) {
    Logger.warn('Display: Output element not initialized');
    return;
  }

  const wrapper = document.createElement('div');
  wrapper.className = `output-line ${type}`;
  wrapper.innerHTML = html;

  outputElement.appendChild(wrapper);
  scrollToBottom();
}

/**
 * Añade línea de comando ejecutado (echo)
 */
export function echoCommand(command) {
  const line = document.createElement('div');
  line.className = 'command-echo';
  line.textContent = command;
  outputElement.appendChild(line);
  scrollToBottom();
}

/**
 * Añade mensaje de éxito
 */
export function success(message) {
  addLine(`[SUCCESS] ${message}`, 'success');
}

/**
 * Añade mensaje de error
 */
export function error(message) {
  addLine(`[ERROR] ${message}`, 'error');
}

/**
 * Añade mensaje de advertencia
 */
export function warning(message) {
  addLine(`[WARNING] ${message}`, 'warning');
}

/**
 * Añade mensaje informativo
 */
export function info(message) {
  addLine(`[INFO] ${message}`, 'info');
}

/**
 * Añade mensaje dim (texto tenue)
 */
export function dim(message) {
  addLine(message, 'dim');
}

/**
 * Añade línea en blanco
 */
export function blank() {
  addLine('');
}

/**
 * Añade separador
 */
export function separator() {
  addHTML('<div class="separator"></div>');
}

/**
 * Limpia todo el output
 */
export function clear() {
  if (!outputElement) return;
  outputElement.innerHTML = '';
  Logger.debug('Display: Cleared output');
}

/**
 * Scroll automático al final
 */
export function scrollToBottom() {
  if (!outputElement) return;
  outputElement.scrollTop = outputElement.scrollHeight;
}

/**
 * Muestra el banner de bienvenida
 */
export function showWelcome() {
  addHTML(`
    <div class="welcome-banner">
      <pre class="ascii-art">${ASCII_LOGO}</pre>
      <div class="subtitle">Decentralized P2P Bitcoin Trading via Nostr</div>
      <div class="separator"></div>
      <div class="info">
        • Type <strong>/help</strong> to see available commands
        • Type <strong>/theme &lt;color&gt;</strong> to change theme (green, amber, blue, matrix, etc)
        • Type <strong>/version</strong> for version info
      </div>
    </div>
  `);
  blank();
  info('Terminal ready. Type /help for available commands.');
  blank();
}

/**
 * Muestra la ayuda de comandos
 */
export function showHelp() {
  addHTML(`
    <div class="help-table">
      <div class="help-section">
        <div class="help-section-title">AVAILABLE COMMANDS</div>

        <div class="help-command">
          <div class="help-command-name">/help [command]</div>
          <div class="help-command-desc">Show this help or help for specific command</div>
        </div>

        <div class="help-command">
          <div class="help-command-name">/clear</div>
          <div class="help-command-desc">Clear terminal output</div>
        </div>

        <div class="help-command">
          <div class="help-command-name">/theme &lt;color&gt;</div>
          <div class="help-command-desc">Change terminal theme (green, amber, blue, matrix, dos, hacker, etc)</div>
        </div>

        <div class="help-command">
          <div class="help-command-name">/version</div>
          <div class="help-command-desc">Show application version</div>
        </div>

        <div class="help-command">
          <div class="help-command-name">/status</div>
          <div class="help-command-desc">Show connection and system status</div>
        </div>
      </div>

      <div class="help-section">
        <div class="help-section-title">COMING SOON (PHASE 2+)</div>

        <div class="help-command">
          <div class="help-command-name">/start</div>
          <div class="help-command-desc">Initialize session with Mostro</div>
        </div>

        <div class="help-command">
          <div class="help-command-name">/newsell</div>
          <div class="help-command-desc">Create new sell order</div>
        </div>

        <div class="help-command">
          <div class="help-command-name">/newbuy</div>
          <div class="help-command-desc">Create new buy order</div>
        </div>

        <div class="help-command">
          <div class="help-command-name">/listorders</div>
          <div class="help-command-desc">List available orders</div>
        </div>
      </div>
    </div>
  `);
  blank();
  dim('Tip: You can use arrow keys (↑ ↓) to navigate command history');
}

/**
 * Muestra información de versión
 */
export async function showVersion() {
  const { APP_VERSION, APP_NAME, ENVIRONMENT } = await import('../utils/constants.js');

  addHTML(`
    <div class="box">
      <div class="box-title">${APP_NAME} Version Information</div>
      <div class="box-content">
        Version: <strong>${APP_VERSION}</strong><br>
        Build Date: ${ENVIRONMENT.buildDate}<br>
        Environment: ${ENVIRONMENT.isDevelopment ? 'Development' : 'Production'}<br>
        Protocol: Mostro P2P v1<br>
        Network: Testnet (for now)
      </div>
    </div>
  `);
}

/**
 * Muestra estado del sistema
 */
export async function showStatus() {
  const storage = await import('../core/storage.js').then(m => m.default);
  const info = await storage.getInfo();

  addHTML(`
    <div class="box">
      <div class="box-title">System Status</div>
      <div class="box-content">
        <strong>Connection:</strong><br>
        • Relays: <span class="badge error">OFFLINE</span> (Phase 2)<br>
        <br>
        <strong>Storage:</strong><br>
        • Keys: ${info.keys}<br>
        • Size: ${info.sizeFormatted}<br>
        • Identity Key: ${info.hasIdentityKey ? '✓' : '✗'}<br>
        • Trade Key: ${info.hasTradeKey ? '✓' : '✗'}<br>
        • Trade Index: ${info.tradeIndex}<br>
        • Command History: ${info.commandHistorySize} commands<br>
        • Cached Orders: ${info.ordersCount}<br>
        <br>
        <strong>Libraries:</strong><br>
        • nostr-tools: ${typeof window.nostrTools !== 'undefined' ? '✓ Loaded' : '✗ Not loaded'}<br>
        • uuid: ${typeof uuid !== 'undefined' ? '✓ Loaded' : '✗ Not loaded'}<br>
        • CryptoJS: ${typeof CryptoJS !== 'undefined' ? '✓ Loaded' : '✗ Not loaded'}<br>
      </div>
    </div>
  `);
}

/**
 * Muestra indicador de carga
 */
export function showLoading(message = 'Loading...') {
  addHTML(`
    <div class="loading">
      <span class="loading-spinner"></span>
      <span>${sanitizeHTML(message)}</span>
    </div>
  `);
}

/**
 * Muestra barra de progreso
 */
export function showProgress(percentage, label = '') {
  addHTML(`
    <div class="progress-bar">
      <div class="progress-bar-fill" style="--progress: ${percentage}%"></div>
      <div class="progress-bar-text">${label || percentage + '%'}</div>
    </div>
  `);
}

/**
 * Muestra tabla de datos
 */
export function showTable(data) {
  if (!Array.isArray(data) || data.length === 0) {
    dim('No data to display');
    return;
  }

  // Por ahora, mostrar como lista simple
  // En el futuro, se puede mejorar con formato de tabla
  data.forEach((item, index) => {
    addLine(`${index + 1}. ${JSON.stringify(item)}`);
  });
}

/**
 * Muestra código formateado
 */
export function showCode(code, language = '') {
  addHTML(`
    <div class="code-block">
      <pre>${sanitizeHTML(code)}</pre>
    </div>
  `);
}

// Exportar todas las funciones
export default {
  initDisplay,
  addLine,
  addHTML,
  echoCommand,
  success,
  error,
  warning,
  info,
  dim,
  blank,
  separator,
  clear,
  scrollToBottom,
  showWelcome,
  showHelp,
  showVersion,
  showStatus,
  showLoading,
  showProgress,
  showTable,
  showCode
};
