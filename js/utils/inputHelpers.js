/**
 * Input Helpers
 * Funciones auxiliares para solicitar input del usuario en terminal
 *
 * Proporciona:
 * - Prompts de texto
 * - Prompts de password (oculto)
 * - Confirmaciones
 * - Validación de input
 */

import Logger from './logger.js';
import { PATTERNS, ERROR_MESSAGES, CRYPTO_CONFIG } from './constants.js';

/**
 * Solicitar input de texto del usuario (asíncrono)
 * @param {string} message - Mensaje a mostrar
 * @param {Function|null} validator - Función de validación opcional
 * @param {string} placeholder - Placeholder para el input
 * @returns {Promise<string|null>} Valor ingresado o null si se cancela
 */
export async function promptInput(message, validator = null, placeholder = '') {
  return new Promise((resolve) => {
    // Importar Display dinámicamente para evitar dependencia circular
    import('../ui/display.js').then((DisplayModule) => {
      const Display = DisplayModule.default;

      Display.dim(message);

      // Crear input temporal
      const inputWrapper = document.createElement('div');
      inputWrapper.className = 'terminal-input-wrapper';

      const input = document.createElement('input');
      input.type = 'text';
      input.className = 'terminal-prompt-input';
      input.placeholder = placeholder;
      input.autocomplete = 'off';

      inputWrapper.appendChild(input);

      // Handler de eventos
      const handleSubmit = () => {
        const value = input.value.trim();

        // Validar si se proporcionó validador
        if (validator && !validator(value)) {
          Display.error('Invalid input. Please try again.');
          input.value = '';
          input.focus();
          return;
        }

        // Limpiar y resolver
        inputWrapper.remove();
        Display.dim(`> ${value}`);
        resolve(value);
      };

      const handleCancel = () => {
        inputWrapper.remove();
        Display.dim('[cancelled]');
        resolve(null);
      };

      input.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
          handleSubmit();
        } else if (e.key === 'Escape') {
          handleCancel();
        }
      });

      // Agregar al DOM y enfocar
      const outputDiv = document.getElementById('terminal-output');
      outputDiv.appendChild(inputWrapper);
      input.focus();

      // Scroll al final
      outputDiv.scrollTop = outputDiv.scrollHeight;
    });
  });
}

/**
 * Solicitar password (input oculto)
 * @param {string} message - Mensaje a mostrar
 * @returns {Promise<string|null>} Password ingresado o null si se cancela
 */
export async function promptPassword(message = 'Enter password:') {
  return new Promise((resolve) => {
    import('../ui/display.js').then((DisplayModule) => {
      const Display = DisplayModule.default;

      Display.dim(message);

      // Crear input temporal tipo password
      const inputWrapper = document.createElement('div');
      inputWrapper.className = 'terminal-input-wrapper';

      const input = document.createElement('input');
      input.type = 'password';
      input.className = 'terminal-prompt-input';
      input.placeholder = '••••••••';
      input.autocomplete = 'off';

      inputWrapper.appendChild(input);

      const handleSubmit = () => {
        const value = input.value;
        inputWrapper.remove();

        // No mostrar el password en terminal
        Display.dim('[password entered]');

        resolve(value);
      };

      const handleCancel = () => {
        inputWrapper.remove();
        Display.dim('[cancelled]');
        resolve(null);
      };

      input.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
          handleSubmit();
        } else if (e.key === 'Escape') {
          handleCancel();
        }
      });

      const outputDiv = document.getElementById('terminal-output');
      outputDiv.appendChild(inputWrapper);
      input.focus();

      // Scroll al final
      outputDiv.scrollTop = outputDiv.scrollHeight;
    });
  });
}

/**
 * Solicitar confirmación con password repetido
 * @returns {Promise<string|null>} Password confirmado o null si falla/cancela
 */
export async function promptPasswordConfirm() {
  const pass1 = await promptPassword('Enter password:');

  if (!pass1) return null;  // Cancelado

  if (pass1.length < CRYPTO_CONFIG.MIN_PASSWORD_LENGTH) {
    const DisplayModule = await import('../ui/display.js');
    const Display = DisplayModule.default;
    Display.error(`Password must be at least ${CRYPTO_CONFIG.MIN_PASSWORD_LENGTH} characters.`);
    return promptPasswordConfirm();  // Recursivo
  }

  const pass2 = await promptPassword('Confirm password:');

  if (!pass2) return null;

  if (pass1 !== pass2) {
    const DisplayModule = await import('../ui/display.js');
    const Display = DisplayModule.default;
    Display.error(ERROR_MESSAGES.PASSWORDS_DONT_MATCH);
    return promptPasswordConfirm();
  }

  return pass1;
}

/**
 * Solicitar confirmación de texto exacto
 * @param {string} message - Mensaje de confirmación
 * @param {string} expectedText - Texto esperado (default: "yes")
 * @returns {Promise<boolean>} true si confirmado, false si no
 */
export async function promptConfirmation(message, expectedText = 'yes') {
  const response = await promptInput(
    `${message} (Type "${expectedText}" to confirm):`,
    null,
    expectedText
  );

  if (!response) return false;

  return response.toLowerCase() === expectedText.toLowerCase();
}

/**
 * Solicitar private key con validación
 * @returns {Promise<string|null>} Private key validada o null si cancela
 */
export async function promptPrivateKey() {
  const DisplayModule = await import('../ui/display.js');
  const Display = DisplayModule.default;

  Display.dim('Enter your private key:');
  Display.dim('  • nsec format: nsec1...');
  Display.dim('  • hex format: a1b2c3...');
  Display.blank();

  const validator = (value) => {
    return PATTERNS.NSEC.test(value) || PATTERNS.HEX_KEY.test(value);
  };

  let attempts = 0;
  const maxAttempts = 3;

  while (attempts < maxAttempts) {
    const key = await promptInput('Private key:', validator);

    if (!key) {
      return null; // Cancelado
    }

    if (validator(key)) {
      return key;
    }

    attempts++;
    Display.error(`Invalid key format. ${maxAttempts - attempts} attempts remaining.`);
  }

  Display.error('Too many invalid attempts.');
  return null;
}

/**
 * Solicitar texto con opciones
 * @param {string} message - Mensaje
 * @param {Array<string>} options - Opciones válidas
 * @returns {Promise<string|null>} Opción seleccionada o null
 */
export async function promptChoice(message, options) {
  const DisplayModule = await import('../ui/display.js');
  const Display = DisplayModule.default;

  Display.dim(message);
  Display.blank();
  Display.dim('Options:');
  options.forEach((opt, index) => {
    Display.dim(`  ${index + 1}. ${opt}`);
  });
  Display.blank();

  const validator = (value) => {
    const num = parseInt(value);
    return !isNaN(num) && num >= 1 && num <= options.length;
  };

  const response = await promptInput('Select option (1-' + options.length + '):', validator);

  if (!response) return null;

  const index = parseInt(response) - 1;
  return options[index];
}

/**
 * Prompt genérico con retry
 * @param {Function} promptFn - Función de prompt a ejecutar
 * @param {number} maxRetries - Número máximo de intentos
 * @returns {Promise<any>} Resultado del prompt
 */
export async function promptWithRetry(promptFn, maxRetries = 3) {
  let attempts = 0;

  while (attempts < maxRetries) {
    try {
      const result = await promptFn();
      if (result !== null) {
        return result;
      }
    } catch (error) {
      Logger.error('Prompt error:', error);
    }

    attempts++;

    if (attempts < maxRetries) {
      const DisplayModule = await import('../ui/display.js');
      const Display = DisplayModule.default;
      Display.warning(`Attempt ${attempts}/${maxRetries} failed. Retrying...`);
    }
  }

  throw new Error('Max retries exceeded');
}

/**
 * Esperar confirmación simple (Enter para continuar)
 * @param {string} message - Mensaje a mostrar
 * @returns {Promise<void>}
 */
export async function waitForEnter(message = 'Press Enter to continue...') {
  return new Promise((resolve) => {
    import('../ui/display.js').then((DisplayModule) => {
      const Display = DisplayModule.default;

      Display.dim(message);

      const handler = (e) => {
        if (e.key === 'Enter') {
          document.removeEventListener('keydown', handler);
          Display.blank();
          resolve();
        }
      };

      document.addEventListener('keydown', handler);
    });
  });
}

// Exportar todas las funciones
export default {
  promptInput,
  promptPassword,
  promptPasswordConfirm,
  promptConfirmation,
  promptPrivateKey,
  promptChoice,
  promptWithRetry,
  waitForEnter
};
