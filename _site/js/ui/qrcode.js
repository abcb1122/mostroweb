/**
 * qrcode.js
 * Módulo para generar y mostrar códigos QR en el terminal
 * Usado principalmente para Lightning invoices
 */

import Display from './display.js';
import Logger from '../utils/logger.js';

/**
 * QRCodeManager class
 * Maneja la generación y display de códigos QR
 */
class QRCodeManager {
  constructor() {
    this.currentQR = null;
    this.qrContainer = null;
  }

  /**
   * Genera un código QR y lo muestra en el terminal
   * @param {string} data - Datos para el QR (invoice, address, etc.)
   * @param {Object} options - Opciones de configuración
   */
  show(data, options = {}) {
    try {
      const {
        title = 'Código QR',
        description = '',
        size = 200,
        colorDark = '#00ff00',
        colorLight = '#000000'
      } = options;

      Logger.info('QRCode: Generating QR code');

      // Limpiar QR anterior si existe
      this.clear();

      // Crear contenedor para el QR
      this.qrContainer = document.createElement('div');
      this.qrContainer.style.cssText = `
        margin: 20px auto;
        padding: 20px;
        background: #000;
        border: 2px solid ${colorDark};
        border-radius: 8px;
        max-width: ${size + 40}px;
        text-align: center;
      `;

      // Título
      if (title) {
        const titleEl = document.createElement('div');
        titleEl.textContent = title;
        titleEl.style.cssText = `
          color: ${colorDark};
          font-weight: bold;
          margin-bottom: 10px;
          font-size: 14px;
        `;
        this.qrContainer.appendChild(titleEl);
      }

      // Contenedor del QR code
      const qrCodeEl = document.createElement('div');
      qrCodeEl.id = 'qr-code-display';
      qrCodeEl.style.cssText = `
        background: ${colorLight};
        padding: 10px;
        border-radius: 4px;
        display: inline-block;
      `;
      this.qrContainer.appendChild(qrCodeEl);

      // Descripción
      if (description) {
        const descEl = document.createElement('div');
        descEl.textContent = description;
        descEl.style.cssText = `
          color: ${colorDark};
          margin-top: 10px;
          font-size: 12px;
          opacity: 0.8;
        `;
        this.qrContainer.appendChild(descEl);
      }

      // Datos del invoice (truncado)
      const dataEl = document.createElement('div');
      const truncatedData = data.length > 50
        ? `${data.slice(0, 25)}...${data.slice(-25)}`
        : data;
      dataEl.textContent = truncatedData;
      dataEl.style.cssText = `
        color: ${colorDark};
        margin-top: 10px;
        font-size: 10px;
        font-family: monospace;
        word-break: break-all;
        opacity: 0.6;
      `;
      this.qrContainer.appendChild(dataEl);

      // Botón para cerrar
      const closeBtn = document.createElement('button');
      closeBtn.textContent = 'Cerrar QR (ESC)';
      closeBtn.style.cssText = `
        margin-top: 15px;
        padding: 8px 16px;
        background: #333;
        color: ${colorDark};
        border: 1px solid ${colorDark};
        border-radius: 4px;
        cursor: pointer;
        font-size: 12px;
      `;
      closeBtn.onclick = () => this.clear();
      this.qrContainer.appendChild(closeBtn);

      // Añadir al output del terminal
      const terminalOutput = document.getElementById('terminal-output');
      if (terminalOutput) {
        terminalOutput.appendChild(this.qrContainer);

        // Scroll al QR
        this.qrContainer.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }

      // Generar QR code usando QRCode.js
      if (typeof QRCode !== 'undefined') {
        this.currentQR = new QRCode(qrCodeEl, {
          text: data,
          width: size,
          height: size,
          colorDark: colorDark,
          colorLight: colorLight,
          correctLevel: QRCode.CorrectLevel.M
        });

        Logger.info('QRCode: QR code generated successfully');
      } else {
        throw new Error('QRCode library not loaded');
      }

      // Listener para ESC key
      this.escListener = (e) => {
        if (e.key === 'Escape') {
          this.clear();
        }
      };
      document.addEventListener('keydown', this.escListener);

      return true;

    } catch (error) {
      Logger.error('QRCode: Error generating QR code', error);
      Display.error('Error generando código QR');
      return false;
    }
  }

  /**
   * Muestra un Lightning invoice como QR code
   * @param {string} invoice - Lightning invoice (lnbc...)
   * @param {Object} metadata - Metadata opcional (orderId, amount, etc.)
   */
  showInvoice(invoice, metadata = {}) {
    const { orderId, amount, description } = metadata;

    let title = '⚡ Lightning Invoice';
    let desc = 'Escanea con tu wallet Lightning';

    if (orderId) {
      desc += ` | Order: ${orderId.slice(0, 8)}...`;
    }

    if (amount) {
      desc += ` | ${amount} sats`;
    }

    if (description) {
      desc += ` | ${description}`;
    }

    // Obtener el tema actual para los colores
    const currentTheme = this.getCurrentThemeColor();

    return this.show(invoice, {
      title,
      description: desc,
      size: 256,
      colorDark: currentTheme,
      colorLight: '#000000'
    });
  }

  /**
   * Muestra un QR genérico con formato ASCII en terminal
   * @param {string} data - Datos a codificar
   */
  showASCII(data) {
    try {
      Display.blank();
      Display.addLine('═══════════════════════════════════════════', 'primary');
      Display.addLine('         CÓDIGO QR (ASCII)', 'primary');
      Display.addLine('═══════════════════════════════════════════', 'primary');
      Display.blank();

      // Mensaje para scanear
      Display.info('Escanea el código QR arriba con tu wallet');
      Display.blank();

      // Datos truncados
      const truncated = data.length > 80
        ? `${data.slice(0, 40)}...${data.slice(-40)}`
        : data;
      Display.addLine(`Datos: ${truncated}`, 'dim');
      Display.blank();

      Display.dim('Presiona ESC para cerrar el QR code');
      Display.blank();
      Display.addLine('═══════════════════════════════════════════', 'dim');

    } catch (error) {
      Logger.error('QRCode: Error showing ASCII QR', error);
    }
  }

  /**
   * Limpia el QR code actual
   */
  clear() {
    if (this.qrContainer && this.qrContainer.parentNode) {
      this.qrContainer.parentNode.removeChild(this.qrContainer);
      this.qrContainer = null;
      this.currentQR = null;

      // Remover listener
      if (this.escListener) {
        document.removeEventListener('keydown', this.escListener);
        this.escListener = null;
      }

      Logger.debug('QRCode: Cleared');
    }
  }

  /**
   * Obtiene el color del tema actual
   * @returns {string} Color hex del tema
   */
  getCurrentThemeColor() {
    const container = document.getElementById('terminal-container');
    if (!container) return '#00ff00';

    const classList = container.classList;

    const themeColors = {
      'theme-green': '#00ff00',
      'theme-amber': '#ffaa00',
      'theme-blue': '#00aaff',
      'theme-white': '#ffffff',
      'theme-red': '#ff0000',
      'theme-purple': '#aa00ff',
      'theme-matrix': '#00ff41',
      'theme-dos': '#ffffff',
      'theme-hacker': '#00ff00'
    };

    for (const theme in themeColors) {
      if (classList.contains(theme)) {
        return themeColors[theme];
      }
    }

    return '#00ff00'; // Default
  }

  /**
   * Verifica si QRCode.js está cargado
   * @returns {boolean} True si está disponible
   */
  isAvailable() {
    return typeof QRCode !== 'undefined';
  }
}

// Crear instancia singleton
const instance = new QRCodeManager();

// Exportar como default
export default instance;
