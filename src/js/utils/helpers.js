/**
 * Helpers
 * Funciones auxiliares generales
 */

import { PATTERNS, THEMES } from './constants.js';

/**
 * Formatea una fecha como string legible
 */
export function formatDate(timestamp) {
  const date = new Date(timestamp * 1000);
  return date.toLocaleString();
}

/**
 * Formatea una fecha como string relativo (hace X tiempo)
 */
export function formatRelativeTime(timestamp) {
  const now = Math.floor(Date.now() / 1000);
  const diff = now - timestamp;

  if (diff < 60) {
    return 'just now';
  } else if (diff < 3600) {
    const minutes = Math.floor(diff / 60);
    return `${minutes} minute${minutes > 1 ? 's' : ''} ago`;
  } else if (diff < 86400) {
    const hours = Math.floor(diff / 3600);
    return `${hours} hour${hours > 1 ? 's' : ''} ago`;
  } else {
    const days = Math.floor(diff / 86400);
    return `${days} day${days > 1 ? 's' : ''} ago`;
  }
}

/**
 * Trunca un string largo en el medio
 */
export function truncateMiddle(str, maxLength = 20) {
  if (!str || str.length <= maxLength) {
    return str;
  }

  const charsToShow = maxLength - 3; // 3 para "..."
  const frontChars = Math.ceil(charsToShow / 2);
  const backChars = Math.floor(charsToShow / 2);

  return str.substring(0, frontChars) + '...' + str.substring(str.length - backChars);
}

/**
 * Valida si un string es un npub válido
 */
export function isValidNpub(str) {
  return PATTERNS.NPUB.test(str);
}

/**
 * Valida si un string es un nsec válido
 */
export function isValidNsec(str) {
  return PATTERNS.NSEC.test(str);
}

/**
 * Valida si un string es una hex key válida
 */
export function isValidHexKey(str) {
  return PATTERNS.HEX_KEY.test(str);
}

/**
 * Valida si un string es un Lightning invoice válido
 */
export function isValidLightningInvoice(str) {
  return PATTERNS.LIGHTNING_INVOICE.test(str);
}

/**
 * Valida si un string es un UUID válido
 */
export function isValidUUID(str) {
  return PATTERNS.UUID.test(str);
}

/**
 * Valida si un tema es válido
 */
export function isValidTheme(theme) {
  return THEMES.includes(theme);
}

/**
 * Sanitiza HTML para prevenir XSS
 */
export function sanitizeHTML(str) {
  if (!str) return '';

  const map = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#039;'
  };

  return str.replace(/[&<>"']/g, (char) => map[char]);
}

/**
 * Escapa caracteres especiales de regex
 */
export function escapeRegex(str) {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

/**
 * Debounce función (retrasa ejecución hasta que pase X tiempo sin llamadas)
 */
export function debounce(func, wait) {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

/**
 * Throttle función (limita ejecuciones a una cada X tiempo)
 */
export function throttle(func, limit) {
  let inThrottle;
  return function(...args) {
    if (!inThrottle) {
      func.apply(this, args);
      inThrottle = true;
      setTimeout(() => (inThrottle = false), limit);
    }
  };
}

/**
 * Copia texto al clipboard
 */
export async function copyToClipboard(text) {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch (err) {
    // Fallback para navegadores viejos
    const textArea = document.createElement('textarea');
    textArea.value = text;
    textArea.style.position = 'fixed';
    textArea.style.left = '-999999px';
    document.body.appendChild(textArea);
    textArea.select();
    try {
      document.execCommand('copy');
      return true;
    } catch (err) {
      return false;
    } finally {
      document.body.removeChild(textArea);
    }
  }
}

/**
 * Genera un ID aleatorio
 */
export function generateId(length = 8) {
  const chars = 'abcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

/**
 * Sleep (esperar X milisegundos)
 */
export function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Parsea argumentos de un comando
 * Ejemplo: "/command arg1 arg2 'arg with spaces' arg4"
 */
export function parseCommandArgs(input) {
  const parts = [];
  let current = '';
  let inQuotes = false;

  for (let i = 0; i < input.length; i++) {
    const char = input[i];

    if (char === "'" || char === '"') {
      inQuotes = !inQuotes;
    } else if (char === ' ' && !inQuotes) {
      if (current) {
        parts.push(current);
        current = '';
      }
    } else {
      current += char;
    }
  }

  if (current) {
    parts.push(current);
  }

  return parts;
}

/**
 * Formatea número con separadores de miles
 */
export function formatNumber(num) {
  return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
}

/**
 * Formatea satoshis a BTC
 */
export function satsToBTC(sats) {
  return (sats / 100000000).toFixed(8);
}

/**
 * Formatea BTC a satoshis
 */
export function btcToSats(btc) {
  return Math.round(btc * 100000000);
}

/**
 * Obtiene parámetros de URL
 */
export function getURLParams() {
  const params = new URLSearchParams(window.location.search);
  const result = {};
  for (const [key, value] of params) {
    result[key] = value;
  }
  return result;
}

/**
 * Deep clone de objeto (simple, para objetos JSON-serializables)
 */
export function deepClone(obj) {
  return JSON.parse(JSON.stringify(obj));
}

/**
 * Verifica si un objeto está vacío
 */
export function isEmpty(obj) {
  if (obj == null) return true;
  if (Array.isArray(obj) || typeof obj === 'string') return obj.length === 0;
  return Object.keys(obj).length === 0;
}

/**
 * Capitaliza primera letra
 */
export function capitalize(str) {
  if (!str) return '';
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
}

/**
 * Pluraliza palabra según cantidad
 */
export function pluralize(count, singular, plural) {
  return count === 1 ? singular : plural;
}

/**
 * Calcula el hash simple de un string (para IDs rápidos)
 */
export function simpleHash(str) {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32bit integer
  }
  return Math.abs(hash).toString(36);
}

/**
 * Detecta si está en modo oscuro
 */
export function isDarkMode() {
  return window.matchMedia &&
         window.matchMedia('(prefers-color-scheme: dark)').matches;
}

/**
 * Detecta si el usuario prefiere animaciones reducidas
 */
export function prefersReducedMotion() {
  return window.matchMedia &&
         window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

// Exportar todas las funciones como objeto también
export default {
  formatDate,
  formatRelativeTime,
  truncateMiddle,
  isValidNpub,
  isValidNsec,
  isValidHexKey,
  isValidLightningInvoice,
  isValidUUID,
  isValidTheme,
  sanitizeHTML,
  escapeRegex,
  debounce,
  throttle,
  copyToClipboard,
  generateId,
  sleep,
  parseCommandArgs,
  formatNumber,
  satsToBTC,
  btcToSats,
  getURLParams,
  deepClone,
  isEmpty,
  capitalize,
  pluralize,
  simpleHash,
  isDarkMode,
  prefersReducedMotion
};
