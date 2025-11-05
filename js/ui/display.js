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
  blank();
  addLine('  ███╗   ███╗ ██████╗ ███████╗████████╗██████╗  ██████╗ ', 'success');
  addLine('  ████╗ ████║██╔═══██╗██╔════╝╚══██╔══╝██╔══██╗██╔═══██╗', 'success');
  addLine('  ██╔████╔██║██║   ██║███████╗   ██║   ██████╔╝██║   ██║', 'success');
  addLine('  ██║╚██╔╝██║██║   ██║╚════██║   ██║   ██╔══██╗██║   ██║', 'success');
  addLine('  ██║ ╚═╝ ██║╚██████╔╝███████║   ██║   ██║  ██║╚██████╔╝', 'success');
  addLine('  ╚═╝     ╚═╝ ╚═════╝ ╚══════╝   ╚═╝   ╚═╝  ╚═╝ ╚═════╝ ', 'success');
  blank();
  addLine('          TERMINAL DE TRADING P2P DE BITCOIN', 'info');
  blank();
  blank();
  addLine('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━', 'dim');
  addLine('  COMENZAR:', 'info');
  blank();
  addLine('    /start    - Generar nueva identidad Nostr para tradear', 'normal');
  addLine('    /login    - Iniciar sesión con clave privada (nsec)', 'normal');
  blank();
  addLine('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━', 'dim');
  blank();
}

/**
 * Muestra la ayuda de comandos
 */
export function showHelp() {
  addHTML(`
    <div class="help-table">
      <div class="help-section">
        <div class="help-section-title">COMANDOS DISPONIBLES</div>

        <div class="help-command">
          <div class="help-command-name">/help [command]</div>
          <div class="help-command-desc">Mostrar esta ayuda o ayuda de comando específico</div>
        </div>

        <div class="help-command">
          <div class="help-command-name">/clear</div>
          <div class="help-command-desc">Limpiar salida del terminal</div>
        </div>

        <div class="help-command">
          <div class="help-command-name">/theme &lt;color&gt;</div>
          <div class="help-command-desc">Cambiar tema del terminal (green, amber, blue, matrix, dos, hacker, etc)</div>
        </div>

        <div class="help-command">
          <div class="help-command-name">/version</div>
          <div class="help-command-desc">Mostrar versión de la aplicación</div>
        </div>

        <div class="help-command">
          <div class="help-command-name">/status</div>
          <div class="help-command-desc">Mostrar estado de conexión y sistema</div>
        </div>
      </div>

      <div class="help-section">
        <div class="help-section-title">PRÓXIMAMENTE (FASE 2+)</div>

        <div class="help-command">
          <div class="help-command-name">/start</div>
          <div class="help-command-desc">Inicializar sesión con Mostro</div>
        </div>

        <div class="help-command">
          <div class="help-command-name">/newsell</div>
          <div class="help-command-desc">Crear nueva orden de venta</div>
        </div>

        <div class="help-command">
          <div class="help-command-name">/newbuy</div>
          <div class="help-command-desc">Crear nueva orden de compra</div>
        </div>

        <div class="help-command">
          <div class="help-command-name">/listorders</div>
          <div class="help-command-desc">Listar órdenes disponibles</div>
        </div>
      </div>
    </div>
  `);
  blank();
  dim('Tip: Usa las flechas (↑ ↓) para navegar el historial de comandos');
}

/**
 * Muestra información de versión
 */
export async function showVersion() {
  const { APP_VERSION, APP_NAME, ENVIRONMENT } = await import('../utils/constants.js');

  addHTML(`
    <div class="box">
      <div class="box-title">Información de Versión de ${APP_NAME}</div>
      <div class="box-content">
        Versión: <strong>${APP_VERSION}</strong><br>
        Fecha de compilación: ${ENVIRONMENT.buildDate}<br>
        Entorno: ${ENVIRONMENT.isDevelopment ? 'Desarrollo' : 'Producción'}<br>
        Protocolo: Mostro P2P v1<br>
        Red: Testnet (por ahora)
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
      <div class="box-title">Estado del Sistema</div>
      <div class="box-content">
        <strong>Conexión:</strong><br>
        • Relays: <span class="badge error">DESCONECTADO</span> (Fase 2)<br>
        <br>
        <strong>Almacenamiento:</strong><br>
        • Claves: ${info.keys}<br>
        • Tamaño: ${info.sizeFormatted}<br>
        • Clave de Identidad: ${info.hasIdentityKey ? '✓' : '✗'}<br>
        • Clave de Trading: ${info.hasTradeKey ? '✓' : '✗'}<br>
        • Índice de Trading: ${info.tradeIndex}<br>
        • Historial de Comandos: ${info.commandHistorySize} comandos<br>
        • Órdenes en Caché: ${info.ordersCount}<br>
        <br>
        <strong>Bibliotecas:</strong><br>
        • nostr-tools: ${typeof window.nostrTools !== 'undefined' ? '✓ Cargado' : '✗ No cargado'}<br>
        • uuid: ${typeof uuid !== 'undefined' ? '✓ Cargado' : '✗ No cargado'}<br>
        • CryptoJS: ${typeof CryptoJS !== 'undefined' ? '✓ Cargado' : '✗ No cargado'}<br>
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
