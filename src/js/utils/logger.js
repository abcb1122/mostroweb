/**
 * Logger
 * Sistema de logging centralizado
 */

import { ENVIRONMENT } from './constants.js';

// Niveles de log
export const LogLevel = {
  DEBUG: 0,
  INFO: 1,
  WARN: 2,
  ERROR: 3,
  NONE: 4
};

// Configuración del logger
const logConfig = {
  level: ENVIRONMENT.isDevelopment ? LogLevel.DEBUG : LogLevel.INFO,
  includeTimestamp: true,
  includeSource: true,
  consoleOutput: true
};

/**
 * Formatea el timestamp
 */
function formatTimestamp() {
  const now = new Date();
  return now.toISOString().substring(11, 23); // HH:MM:SS.mmm
}

/**
 * Obtiene el color para el nivel de log
 */
function getLogColor(level) {
  switch (level) {
    case LogLevel.DEBUG:
      return '#888888'; // Gris
    case LogLevel.INFO:
      return '#00aaff'; // Azul
    case LogLevel.WARN:
      return '#ffaa00'; // Naranja
    case LogLevel.ERROR:
      return '#ff0000'; // Rojo
    default:
      return '#00ff00'; // Verde
  }
}

/**
 * Obtiene el label para el nivel de log
 */
function getLogLabel(level) {
  switch (level) {
    case LogLevel.DEBUG:
      return 'DEBUG';
    case LogLevel.INFO:
      return 'INFO';
    case LogLevel.WARN:
      return 'WARN';
    case LogLevel.ERROR:
      return 'ERROR';
    default:
      return 'LOG';
  }
}

/**
 * Log genérico
 */
function log(level, message, ...args) {
  // Verificar si el nivel es suficiente
  if (level < logConfig.level) {
    return;
  }

  // Construir el mensaje
  const parts = [];

  if (logConfig.includeTimestamp) {
    parts.push(`[${formatTimestamp()}]`);
  }

  parts.push(`[${getLogLabel(level)}]`);

  parts.push(message);

  // Output a consola si está habilitado
  if (logConfig.consoleOutput) {
    const color = getLogColor(level);
    const fullMessage = parts.join(' ');

    switch (level) {
      case LogLevel.DEBUG:
        console.debug(`%c${fullMessage}`, `color: ${color}`, ...args);
        break;
      case LogLevel.INFO:
        console.info(`%c${fullMessage}`, `color: ${color}`, ...args);
        break;
      case LogLevel.WARN:
        console.warn(`%c${fullMessage}`, `color: ${color}`, ...args);
        break;
      case LogLevel.ERROR:
        console.error(`%c${fullMessage}`, `color: ${color}`, ...args);
        break;
      default:
        console.log(`%c${fullMessage}`, `color: ${color}`, ...args);
    }
  }

  // Disparar evento custom para que otros módulos puedan escuchar
  window.dispatchEvent(new CustomEvent('app:log', {
    detail: {
      level,
      message,
      args,
      timestamp: Date.now()
    }
  }));
}

/**
 * Logger object con métodos convenientes
 */
export const Logger = {
  /**
   * Log de debug (solo en desarrollo)
   */
  debug(message, ...args) {
    log(LogLevel.DEBUG, message, ...args);
  },

  /**
   * Log informativo
   */
  info(message, ...args) {
    log(LogLevel.INFO, message, ...args);
  },

  /**
   * Log de advertencia
   */
  warn(message, ...args) {
    log(LogLevel.WARN, message, ...args);
  },

  /**
   * Log de error
   */
  error(message, ...args) {
    log(LogLevel.ERROR, message, ...args);
  },

  /**
   * Log de grupo (para agrupar logs relacionados)
   */
  group(title) {
    if (logConfig.consoleOutput) {
      console.group(`%c${title}`, 'color: #00ff00; font-weight: bold');
    }
  },

  /**
   * Finalizar grupo
   */
  groupEnd() {
    if (logConfig.consoleOutput) {
      console.groupEnd();
    }
  },

  /**
   * Configurar el logger
   */
  configure(options) {
    Object.assign(logConfig, options);
  },

  /**
   * Obtener configuración actual
   */
  getConfig() {
    return { ...logConfig };
  },

  /**
   * Tabla (útil para mostrar objetos estructurados)
   */
  table(data) {
    if (logConfig.consoleOutput && logConfig.level <= LogLevel.DEBUG) {
      console.table(data);
    }
  },

  /**
   * Timer (para medir performance)
   */
  time(label) {
    if (logConfig.consoleOutput && logConfig.level <= LogLevel.DEBUG) {
      console.time(label);
    }
  },

  /**
   * Finalizar timer
   */
  timeEnd(label) {
    if (logConfig.consoleOutput && logConfig.level <= LogLevel.DEBUG) {
      console.timeEnd(label);
    }
  }
};

// Exportar como default también
export default Logger;
