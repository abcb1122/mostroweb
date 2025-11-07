/**
 * wizard.js
 * Wizard de onboarding para usuarios nuevos
 * Guía interactiva paso a paso para configurar MostroWeb
 */

import Display from './display.js';
import Logger from '../utils/logger.js';
import { APP_NAME, APP_VERSION } from '../utils/constants.js';

/**
 * OnboardingWizard class
 * Maneja el proceso de onboarding para usuarios nuevos
 */
class OnboardingWizard {
  constructor() {
    this.hasShownWelcome = false;
    this.currentStep = 0;
  }

  /**
   * Verifica si es la primera vez que el usuario ejecuta la aplicación
   * @returns {boolean} True si es primera vez
   */
  isFirstTime() {
    // Verificar si hay identidad guardada
    const hasIdentity = localStorage.getItem('mostro_identity_key') !== null;
    const hasCompletedWizard = localStorage.getItem('mostro_wizard_completed') === 'true';

    return !hasIdentity && !hasCompletedWizard;
  }

  /**
   * Marca el wizard como completado
   */
  markAsCompleted() {
    localStorage.setItem('mostro_wizard_completed', 'true');
    Logger.info('Wizard: Marked as completed');
  }

  /**
   * Reinicia el wizard (para testing)
   */
  reset() {
    localStorage.removeItem('mostro_wizard_completed');
    this.hasShownWelcome = false;
    this.currentStep = 0;
    Logger.info('Wizard: Reset');
  }

  /**
   * Muestra el banner de bienvenida ASCII
   */
  showWelcomeBanner() {
    Display.clear();
    Display.blank();

    // Banner ASCII art personalizado
    const banner = `
╔══════════════════════════════════════════════════════════════════╗
║                                                                  ║
║     ███╗   ███╗ ██████╗ ███████╗████████╗██████╗  ██████╗       ║
║     ████╗ ████║██╔═══██╗██╔════╝╚══██╔══╝██╔══██╗██╔═══██╗      ║
║     ██╔████╔██║██║   ██║███████╗   ██║   ██████╔╝██║   ██║      ║
║     ██║╚██╔╝██║██║   ██║╚════██║   ██║   ██╔══██╗██║   ██║      ║
║     ██║ ╚═╝ ██║╚██████╔╝███████║   ██║   ██║  ██║╚██████╔╝      ║
║     ╚═╝     ╚═╝ ╚═════╝ ╚══════╝   ╚═╝   ╚═╝  ╚═╝ ╚═════╝       ║
║                                                                  ║
║                    🌐 P2P Bitcoin Trading 🌐                     ║
║                  Cliente Web Terminal Retro v${APP_VERSION}              ║
║                                                                  ║
╚══════════════════════════════════════════════════════════════════╝
`;

    Display.addLine(banner, 'primary');
    Display.blank();
    this.hasShownWelcome = true;
  }

  /**
   * Muestra la introducción del wizard
   */
  showIntroduction() {
    Display.success('¡Bienvenido a MostroWeb! 👋');
    Display.blank();

    Display.addLine('═══════════════════════════════════════════════════════', 'dim');
    Display.addLine('         ¿QUÉ ES MOSTROWEB?', 'primary');
    Display.addLine('═══════════════════════════════════════════════════════', 'dim');
    Display.blank();

    Display.addLine('MostroWeb es un cliente web para tradear Bitcoin P2P usando el', 'info');
    Display.addLine('protocolo Mostro sobre Nostr.', 'info');
    Display.blank();

    Display.addLine('🔑 Conceptos básicos:', 'success');
    Display.blank();

    Display.addLine('  • Nostr: Red descentralizada de comunicación', 'dim');
    Display.addLine('    No hay servidores centrales, solo relays P2P', 'dim');
    Display.blank();

    Display.addLine('  • Mostro: Protocolo para trades P2P de Bitcoin', 'dim');
    Display.addLine('    Usa escrow con Lightning Network', 'dim');
    Display.blank();

    Display.addLine('  • Lightning: Red de pagos Bitcoin instantáneos', 'dim');
    Display.addLine('    Transacciones rápidas y de bajo costo', 'dim');
    Display.blank();

    Display.addLine('═══════════════════════════════════════════════════════', 'dim');
    Display.blank();
  }

  /**
   * Explica el modelo de seguridad
   */
  showSecurityExplanation() {
    Display.addLine('🔒 Seguridad y Privacidad:', 'warning');
    Display.blank();

    Display.addLine('  1. Identidad Nostr:', 'info');
    Display.addLine('     • Clave privada (nsec): Solo la conoces tú', 'dim');
    Display.addLine('     • Clave pública (npub): Tu identidad pública', 'dim');
    Display.addLine('     • Los mensajes se firman criptográficamente', 'dim');
    Display.blank();

    Display.addLine('  2. Tus satoshis están seguros:', 'info');
    Display.addLine('     • Esta llave NO controla tus fondos', 'dim');
    Display.addLine('     • Solo se usa para coordinar trades', 'dim');
    Display.addLine('     • Tus Bitcoin los recibes donde TÚ elijas', 'dim');
    Display.blank();

    Display.addLine('  3. Privacidad:', 'info');
    Display.addLine('     • Mensajes encriptados con NIP-59 (Gift Wrap)', 'dim');
    Display.addLine('     • Solo tú y Mostro pueden leer los mensajes', 'dim');
    Display.addLine('     • Las órdenes públicas no revelan tu identidad', 'dim');
    Display.blank();

    Display.addLine('⚠️  IMPORTANTE:', 'error');
    Display.addLine('  • Guarda tu nsec en lugar seguro', 'warning');
    Display.addLine('  • Si pierdes tu nsec, pierdes tu identidad (pero NO tus Bitcoin)', 'warning');
    Display.addLine('  • Nunca compartas tu nsec con nadie', 'warning');
    Display.blank();

    Display.addLine('═══════════════════════════════════════════════════════', 'dim');
    Display.blank();
  }

  /**
   * Muestra las opciones de configuración inicial
   */
  showSetupOptions() {
    Display.addLine('📋 Configuración Inicial:', 'primary');
    Display.blank();

    Display.addLine('Tienes dos opciones para comenzar:', 'info');
    Display.blank();

    Display.addLine('  Opción 1: Crear nueva identidad', 'success');
    Display.addLine('  ═══════════════════════════════', 'dim');
    Display.addLine('  • MostroWeb genera un nuevo par de claves', 'dim');
    Display.addLine('  • Perfecto si es tu primera vez con Nostr', 'dim');
    Display.addLine('  • Usa el comando: /start', 'primary');
    Display.blank();

    Display.addLine('  Opción 2: Importar identidad existente', 'success');
    Display.addLine('  ═══════════════════════════════════════', 'dim');
    Display.addLine('  • Si ya tienes una clave Nostr (nsec)', 'dim');
    Display.addLine('  • Reutiliza tu identidad de otros clientes', 'dim');
    Display.addLine('  • Usa el comando: /login', 'primary');
    Display.blank();

    Display.addLine('═══════════════════════════════════════════════════════', 'dim');
    Display.blank();
  }

  /**
   * Muestra los próximos pasos después de crear identidad
   */
  showNextSteps() {
    Display.blank();
    Display.addLine('🚀 Próximos Pasos:', 'primary');
    Display.blank();

    Display.addLine('  1. Descubrir órdenes disponibles:', 'info');
    Display.addLine('     /discover', 'success');
    Display.addLine('     → Conecta a relays y busca órdenes P2P', 'dim');
    Display.blank();

    Display.addLine('  2. Ver órdenes encontradas:', 'info');
    Display.addLine('     /listorders', 'success');
    Display.addLine('     → Muestra todas las órdenes agrupadas por Mostro', 'dim');
    Display.blank();

    Display.addLine('  3. Crear tu propia orden:', 'info');
    Display.addLine('     /neworder buy 100 USD Strike', 'success');
    Display.addLine('     → Compra $100 USD pagando con Strike', 'dim');
    Display.blank();

    Display.addLine('  4. Tomar una orden existente:', 'info');
    Display.addLine('     /takesell <order-id>', 'success');
    Display.addLine('     → Toma una orden de venta (compras Bitcoin)', 'dim');
    Display.blank();

    Display.addLine('═══════════════════════════════════════════════════════', 'dim');
    Display.blank();

    Display.addLine('💡 Consejos:', 'warning');
    Display.blank();
    Display.addLine('  • Usa /help para ver todos los comandos', 'dim');
    Display.addLine('  • Usa /tutorial para una guía paso a paso completa', 'dim');
    Display.addLine('  • Empieza con cantidades pequeñas para practicar', 'dim');
    Display.addLine('  • Lee las órdenes cuidadosamente antes de tomar', 'dim');
    Display.blank();

    Display.addLine('═══════════════════════════════════════════════════════', 'dim');
    Display.blank();
  }

  /**
   * Muestra el flujo completo de trading
   */
  showTradingFlow() {
    Display.addLine('📊 Flujo de Trading (Ejemplo: Comprar Bitcoin):', 'primary');
    Display.blank();

    Display.addLine('  VENDEDOR (tú)          MOSTRO DAEMON          COMPRADOR', 'dim');
    Display.addLine('  ══════════════         ═════════════          ═════════', 'dim');
    Display.blank();

    Display.addLine('  1. /neworder sell 100 USD Bizum', 'info');
    Display.addLine('     └─> Orden publicada', 'dim');
    Display.blank();

    Display.addLine('  2.                     Comprador toma orden', 'info');
    Display.addLine('                         └─> /takebuy <id>', 'dim');
    Display.blank();

    Display.addLine('  3. Recibes hold invoice', 'info');
    Display.addLine('     └─> Pagas invoice Lightning', 'dim');
    Display.addLine('         (fondos retenidos en escrow)', 'dim');
    Display.blank();

    Display.addLine('  4.                     Comprador envía fiat ────>', 'info');
    Display.addLine('                         /fiatsent <id>', 'dim');
    Display.blank();

    Display.addLine('  5. Recibes pago fiat (€100 Bizum)', 'info');
    Display.addLine('     Verificas el pago', 'dim');
    Display.blank();

    Display.addLine('  6. /release <id>', 'info');
    Display.addLine('     └─> Liberas Bitcoin al comprador', 'dim');
    Display.blank();

    Display.addLine('  7. ✅ Trade completado!', 'success');
    Display.addLine('     Comprador recibe Bitcoin', 'dim');
    Display.addLine('     Vendedor recibe fiat', 'dim');
    Display.blank();

    Display.addLine('═══════════════════════════════════════════════════════', 'dim');
    Display.blank();
  }

  /**
   * Muestra comandos esenciales
   */
  showEssentialCommands() {
    Display.addLine('⌨️  Comandos Esenciales:', 'primary');
    Display.blank();

    const commands = [
      { cmd: '/help', desc: 'Ver todos los comandos disponibles' },
      { cmd: '/tutorial', desc: 'Guía paso a paso completa' },
      { cmd: '/start', desc: 'Crear nueva identidad' },
      { cmd: '/login', desc: 'Importar identidad existente' },
      { cmd: '/discover', desc: 'Buscar órdenes en relays' },
      { cmd: '/listorders', desc: 'Ver órdenes disponibles' },
      { cmd: '/neworder', desc: 'Crear orden de compra/venta' },
      { cmd: '/takebuy', desc: 'Tomar orden de compra (vendes BTC)' },
      { cmd: '/takesell', desc: 'Tomar orden de venta (compras BTC)' },
      { cmd: '/identity', desc: 'Ver tu información de identidad' },
      { cmd: '/theme', desc: 'Cambiar tema del terminal' },
      { cmd: '/clear', desc: 'Limpiar pantalla' }
    ];

    commands.forEach(({ cmd, desc }) => {
      Display.addLine(`  ${cmd.padEnd(15)} → ${desc}`, 'dim');
    });

    Display.blank();
    Display.addLine('═══════════════════════════════════════════════════════', 'dim');
    Display.blank();
  }

  /**
   * Ejecuta el wizard completo
   */
  async run() {
    try {
      // 1. Banner de bienvenida
      this.showWelcomeBanner();

      // 2. Introducción
      this.showIntroduction();

      // 3. Seguridad
      this.showSecurityExplanation();

      // 4. Opciones de setup
      this.showSetupOptions();

      // 5. Próximos pasos
      this.showNextSteps();

      // 6. Flujo de trading
      this.showTradingFlow();

      // 7. Comandos esenciales
      this.showEssentialCommands();

      // 8. Prompt final
      Display.success('🎯 Estás listo para empezar!');
      Display.blank();
      Display.addLine('Escribe /start para crear una nueva identidad', 'primary');
      Display.addLine('o /login para importar una existente', 'primary');
      Display.blank();
      Display.dim('Tip: Puedes volver a ver esta guía con /tutorial');
      Display.blank();

      // Marcar wizard como completado
      this.markAsCompleted();

      Logger.info('Wizard: Completed successfully');

    } catch (error) {
      Logger.error('Wizard: Error running wizard', error);
      Display.error('Error mostrando wizard de bienvenida');
    }
  }

  /**
   * Muestra solo el tutorial (sin marcar como completado)
   */
  async showTutorial() {
    this.showWelcomeBanner();
    this.showIntroduction();
    this.showSecurityExplanation();
    this.showSetupOptions();
    this.showNextSteps();
    this.showTradingFlow();
    this.showEssentialCommands();

    Display.success('📚 Tutorial completado!');
    Display.blank();
    Display.addLine('Usa /help para ver la lista completa de comandos', 'dim');
    Display.blank();
  }
}

// Crear instancia singleton
const instance = new OnboardingWizard();

// Exportar como default
export default instance;
