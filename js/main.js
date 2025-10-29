/**
 * Main Entry Point
 * Inicializa la aplicación MostroWeb
 */

import { APP_NAME, APP_VERSION, ENVIRONMENT } from './utils/constants.js';
import Logger from './utils/logger.js';
import Terminal from './ui/terminal.js';

/**
 * Estado global de la aplicación
 */
const app = {
  initialized: false,
  version: APP_VERSION,
  name: APP_NAME,
  startTime: Date.now()
};

/**
 * Inicializa la aplicación
 */
async function init() {
  Logger.info(`${APP_NAME} v${APP_VERSION} - Starting...`);
  Logger.info(`Environment: ${ENVIRONMENT.isDevelopment ? 'Development' : 'Production'}`);

  try {
    // Verificar que estamos en un navegador
    if (typeof window === 'undefined') {
      throw new Error('This application must run in a browser');
    }

    // Esperar a que el DOM esté listo
    if (document.readyState === 'loading') {
      await new Promise(resolve => {
        document.addEventListener('DOMContentLoaded', resolve);
      });
    }

    Logger.debug('Main: DOM ready');

    // Esperar a que nostr-tools se cargue
    await waitForNostrTools();

    // Inicializar terminal
    const success = Terminal.initTerminal();

    if (!success) {
      throw new Error('Failed to initialize terminal');
    }

    // Marcar como inicializado
    app.initialized = true;

    const elapsed = Date.now() - app.startTime;
    Logger.info(`${APP_NAME} initialized successfully in ${elapsed}ms`);

    // Disparar evento de inicialización
    window.dispatchEvent(new CustomEvent('app:ready', {
      detail: { app }
    }));

  } catch (error) {
    Logger.error('Main: Initialization failed', error);
    showFatalError(error);
  }
}

/**
 * Espera a que nostr-tools se cargue
 */
async function waitForNostrTools() {
  return new Promise((resolve, reject) => {
    // Si ya está cargado
    if (typeof window.nostrTools !== 'undefined') {
      Logger.debug('Main: nostr-tools already loaded');
      resolve();
      return;
    }

    // Esperar evento de carga
    const timeout = setTimeout(() => {
      Logger.warn('Main: nostr-tools loading timeout');
      resolve(); // No rechazamos para no bloquear la app
    }, 5000);

    window.addEventListener('nostr-tools-loaded', () => {
      clearTimeout(timeout);
      Logger.debug('Main: nostr-tools loaded');
      resolve();
    }, { once: true });
  });
}

/**
 * Muestra un error fatal en pantalla
 */
function showFatalError(error) {
  const container = document.getElementById('terminal-output');
  if (container) {
    container.innerHTML = `
      <div style="color: #ff0000; padding: 20px; border: 2px solid #ff0000;">
        <h2>FATAL ERROR</h2>
        <p>${error.message}</p>
        <p style="color: #ffaa00; margin-top: 20px;">
          Please refresh the page and try again.
        </p>
        <p style="color: #888; margin-top: 10px; font-size: 12px;">
          If the problem persists, check the browser console for more details.
        </p>
      </div>
    `;
  }
}

/**
 * Handler para errores no capturados
 */
window.addEventListener('error', (event) => {
  Logger.error('Uncaught error:', event.error);
});

/**
 * Handler para promesas rechazadas no capturadas
 */
window.addEventListener('unhandledrejection', (event) => {
  Logger.error('Unhandled promise rejection:', event.reason);
});

/**
 * Handler para antes de descargar la página
 */
window.addEventListener('beforeunload', () => {
  Logger.info('Main: Application closing');
});

/**
 * Exponer API global (útil para debugging)
 */
window.MostroWeb = {
  version: APP_VERSION,
  app,
  Logger,
  Terminal,

  // Métodos útiles para debugging
  getState() {
    return {
      initialized: app.initialized,
      terminal: Terminal.getState(),
      environment: ENVIRONMENT
    };
  },

  getInfo() {
    Logger.table({
      Name: APP_NAME,
      Version: APP_VERSION,
      Environment: ENVIRONMENT.isDevelopment ? 'Development' : 'Production',
      Initialized: app.initialized,
      Uptime: `${((Date.now() - app.startTime) / 1000).toFixed(2)}s`
    });
  }
};

// Iniciar aplicación
init();

// Exportar para uso en módulos
export default app;
