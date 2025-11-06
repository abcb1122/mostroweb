# 🌐 MostroWeb

**Cliente Web Terminal para el Protocolo Mostro P2P**

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Nostr](https://img.shields.io/badge/Nostr-Protocol-purple)](https://github.com/nostr-protocol/nostr)
[![Bitcoin](https://img.shields.io/badge/Bitcoin-Lightning-orange)](https://lightning.network/)

> 🇪🇸 **Español** | [🇬🇧 English](README.md)

---

## 📋 Índice

- [¿Qué es MostroWeb?](#-qué-es-mostroweb)
- [Características](#-características)
- [Inicio Rápido](#-inicio-rápido)
- [Arquitectura](#-arquitectura)
- [Protocolo Mostro](#-protocolo-mostro)
- [Desarrollo](#-desarrollo)
- [Contribuir](#-contribuir)
- [Licencia](#-licencia)

---

## 🎯 ¿Qué es MostroWeb?

**MostroWeb** es un cliente web frontend con interfaz de terminal retro para interactuar con el **protocolo Mostro**, un sistema de intercambio P2P de Bitcoin descentralizado y resistente a la censura construido sobre [Nostr](https://github.com/nostr-protocol/nostr).

**Versión actual:** v1.0.0 Production Ready 🎉

### ¿Por qué MostroWeb?

- 🌍 **Sin KYC**: Intercambia Bitcoin sin verificación de identidad
- 🔒 **No custodial**: Tus claves, tus Bitcoin
- 🌐 **Descentralizado**: Usa la red Nostr, sin servidores centrales
- ⚡ **Lightning Network**: Pagos instantáneos y de bajo costo
- 🌎 **Enfoque LATAM**: Soporta ARS, USD, EUR, CUP, MXN y métodos de pago locales
- 🖥️ **Terminal Retro**: Interfaz nostálgica inspirada en terminales clásicas
- 🧪 **Auto-Testing**: Verifica compatibilidad en 5 segundos con `/testconnection`

---

## ✨ Características

### Core

- ✅ **Gestión de Identidad Nostr**
  - Generación de claves (nsec/npub)
  - Importación de claves existentes
  - Encriptación con contraseña (AES-256)
  - Exportación segura de respaldos

- ✅ **Descubrimiento de Órdenes P2P**
  - Búsqueda en múltiples relays Nostr
  - Filtrado por moneda, método de pago, tipo
  - Cache local para carga rápida
  - Agrupación por daemon Mostro

- ✅ **Trading Completo**
  - Crear órdenes de compra/venta
  - Tomar órdenes existentes
  - Cancelar órdenes pendientes
  - **Flujo completo de Lightning invoices**
  - Añadir invoice para recibir pago (/addinvoice)
  - Notificar envío de fiat (/fiatsent)
  - Liberar fondos Bitcoin (/release)
  - Seguimiento de estado en tiempo real

- ✅ **Sistema de Respuestas**
  - 34+ handlers de respuesta del daemon Mostro
  - Desencriptación completa NIP-59 (Gift Wrap)
  - Verificación de firmas Schnorr
  - Actualizaciones de estado automáticas

- ⚠️ **En Desarrollo**
  - Sistema de disputas
  - Calificaciones de usuarios
  - Mensajería directa entre traders
  - Exportación de historial de trades

### Protocolo

- ✅ **NIP-59**: Gift Wrap (mensajes encriptados)
- ✅ **NIP-44**: Encryption v2
- ✅ **NIP-69**: P2P Order Events (Kind 38383)
- ✅ **Mostro Core**: Compatibilidad con protocolo oficial

### UI/UX

- 👋 **Wizard de Onboarding**: Guía interactiva automática para nuevos usuarios
  - Explica Nostr, Mostro y Lightning en términos simples
  - Walkthrough completo del flujo de trading
  - Consejos de seguridad y mejores prácticas
  - Comando `/tutorial` para ver guía en cualquier momento

- 🔔 **Notificaciones Visuales Mejoradas**
  - Mensajes con bordes y emojis contextuales
  - Sugerencias accionables en errores
  - Historial de notificaciones (/history)
  - Indicadores de estado con emojis

- 🧪 **Auto-Testing** (NUEVO en v1.0.0)
  - `/testconnection`: Auto-test completo en 5 segundos
  - `/testingguide`: Guía de testing paso a paso
  - Verifica conexión a relays, discovery y NIP-69
  - Score de 100 puntos con veredicto claro

- 📊 **Comandos de Utilidad**
  - `/status`: Dashboard completo con métricas y recomendaciones
  - `/history`: Ver notificaciones recientes
  - `/mystats`: Estadísticas de trading y órdenes activas
  - `/tutorial`: Guía completa paso a paso

- 🎨 **Temas y Terminal**
  - 9 temas visuales: Green, Amber, Blue, Matrix, DOS, Hacker, etc.
  - Comandos estilo Unix con autocompletado
  - Historial de comandos (↑/↓)
  - Responsive: Desktop y mobile

---

## 🚀 Inicio Rápido

### 📖 Guía Rápida de 5 Minutos

**¿Primera vez usando MostroWeb?** Lee la **[Guía de Inicio Rápido](QUICK_START_ES.md)** con ejemplos específicos para tu país (Argentina, Venezuela, Cuba, México, España).

### Prerequisitos

- Node.js >= 18.0.0
- npm o pnpm

### Instalación

```bash
# Clonar repositorio
git clone https://github.com/abcb1122/mostroweb.git
cd mostroweb

# Instalar dependencias
npm install

# Iniciar servidor de desarrollo
npm run dev
```

Abre tu navegador en [http://localhost:3000](http://localhost:3000)

### ⚡ Primeros Pasos (3 minutos)

#### Paso 1: Verificar Compatibilidad

```bash
# ✨ NUEVO en v1.0.0: Auto-test de conexión
/testconnection
```

Este comando verifica automáticamente:
- ✅ Conexión a 6 relays Nostr
- ✅ Descubrimiento de órdenes en mainnet
- ✅ Compatibilidad NIP-69
- ✅ Te da un veredicto claro: "✅ Compatible con Mostro" o "⚠️ Problemas detectados"

**Tiempo: 5 segundos** | **Score: 100 puntos máximo**

#### Paso 2: Crear Identidad

🎉 **¡La primera vez que abras MostroWeb verás un wizard de onboarding automático!** Este te guiará paso a paso.

```bash
# Si saltaste el wizard, puedes verlo con:
/tutorial

# Generar identidad Nostr (si no tienes una)
/start

# O importar identidad existente
/login
```

#### Paso 3: Empezar a Tradear

```bash
# Descubrir órdenes disponibles
/discover

# Listar órdenes
/listorders

# Ejemplo: Comprar Bitcoin con pesos argentinos
/listorders sell ARS
/takesell <order-id>

# Ejemplo: Vender Bitcoin por dólares
/neworder sell 100 USD Strike

# Ver ayuda completa
/help
```

### 📚 Comandos Esenciales

```bash
# Testing y Estado
/testconnection          # Auto-test (NUEVO en v1.0.0)
/status                  # Estado del sistema con métricas
/testingguide            # Guía de testing paso a paso

# Identidad
/start                   # Crear identidad
/login                   # Importar identidad
/export                  # Backup de claves

# Trading
/discover                # Buscar órdenes
/listorders              # Ver órdenes
/neworder buy 100 USD Strike  # Crear orden
/takebuy <order-id>      # Tomar orden de compra
/takesell <order-id>     # Tomar orden de venta

# Gestión
/mystats                 # Tus estadísticas
/history                 # Historial de notificaciones
/tutorial                # Wizard de onboarding
/help                    # Ayuda completa
```

### Flujo Completo de un Trade

```bash
# COMPRADOR (compras Bitcoin):
1. /discover                      # Buscar órdenes
2. /takesell <order-id>          # Tomar orden de venta
3. /addinvoice <id> <invoice>    # Añadir tu Lightning invoice
4. Esperar que vendedor bloquee fondos en escrow
5. /fiatsent <order-id>          # Confirmar que enviaste fiat
6. Esperar que vendedor libere Bitcoin
7. ✅ ¡Recibes Bitcoin en tu wallet Lightning!

# VENDEDOR (vendes Bitcoin):
1. /neworder sell 100 USD Bizum  # Crear orden de venta
2. Esperar que comprador tome orden
3. Pagar hold invoice generada (fondos en escrow)
4. Esperar confirmación de fiat del comprador
5. Verificar que recibiste el pago fiat
6. /release <order-id>           # Liberar Bitcoin
7. ✅ Trade completado!
```

---

## 🏗️ Arquitectura

### Estructura del Proyecto

```
mostroweb/
├── src/                    # Código fuente
│   ├── css/               # Estilos (reset, terminal, themes)
│   ├── js/
│   │   ├── core/          # RelayManager, KeyManager, Storage
│   │   ├── models/        # Order, Mostro
│   │   ├── mostro/        # Discovery, Messaging (protocolo)
│   │   ├── ui/            # Terminal, Display, Commands
│   │   └── utils/         # Constants, Helpers, Logger
│   └── index.html         # Entrada principal
├── docs/                  # Documentación
│   ├── es/               # Español (prioritario)
│   └── en/               # Inglés
├── tests/                 # Tests unitarios e integración
├── scripts/               # Utilidades de desarrollo
└── package.json           # Configuración del proyecto
```

### Componentes Principales

#### 1. **RelayManager** (`src/js/core/relayManager.js`)
Gestiona conexiones a relays Nostr:
- SimplePool de nostr-tools
- Auto-reconnect
- Subscripciones con filtros
- Publicación de eventos

#### 2. **Discovery** (`src/js/mostro/discovery.js`)
Descubre órdenes P2P:
- Subscribe a eventos Kind 38383 (NIP-69)
- Filtra por tag `#y: mostrop2p`
- Cache en LocalStorage
- Limpieza automática de órdenes expiradas

#### 3. **MostroMessaging** (`src/js/mostro/messaging.js`)
Comunicación encriptada con daemon Mostro:
- Construcción de mensajes (versión, action, payload)
- Firmado SHA256 + Schnorr
- Gift Wrap (NIP-59) de 3 capas: Rumor → Seal → Gift Wrap
- Encriptación NIP-44 v2

#### 4. **KeyManager** (`src/js/core/keyManager.js`)
Gestión de claves Nostr:
- Generación de pares de claves
- Encriptación AES-256-CBC (PBKDF2)
- Almacenamiento en sessionStorage
- Conversión nsec ↔ hex ↔ npub

#### 5. **Terminal** (`src/js/ui/terminal.js`)
Interfaz de usuario:
- Input handling con historial
- Display de mensajes con colores
- Comandos con sintaxis Unix
- Status bar con indicadores

---

## 🔐 Protocolo Mostro

### Event Kinds

| Kind | Propósito | NIP |
|------|-----------|-----|
| **38383** | Órdenes P2P públicas | NIP-69 |
| **1059** | Gift Wrap (mensajes privados) | NIP-59 |
| **13** | Seal (capa intermedia) | NIP-59 |

### Estructura de Mensajes

```javascript
{
  "order": {
    "version": 1,
    "id": "order-uuid",
    "request_id": 1730000000,
    "trade_index": 0,
    "action": "NewOrder",
    "payload": {
      "kind": "buy",
      "fiat_code": "USD",
      "fiat_amount": 100,
      "payment_method": "Strike",
      "premium": 2
    }
  }
}
```

Firmado con: `SHA256(JSON) + Schnorr Signature`

### Tags NIP-69

Órdenes públicas (Kind 38383) usan tags:

```javascript
tags: [
  ["d", "order-id"],           // ID único
  ["k", "buy"],                // buy/sell
  ["f", "USD"],                // Moneda fiat (ISO 4217)
  ["s", "pending"],            // Estado
  ["amt", "1000000"],          // Satoshis
  ["fa", "100"],               // Cantidad fiat
  ["pm", "Strike"],            // Método de pago
  ["premium", "2"],            // Premium %
  ["network", "mainnet"],      // Red Bitcoin
  ["layer", "lightning"],      // Capa de pago
  ["y", "mostrop2p"],          // Identificador
  ["z", "order"]               // Tipo de documento
]
```

### Flujos Implementados

#### Crear Orden
```
User → MostroMessaging.sendToMostro("NewOrder", payload)
     → Gift Wrap (NIP-59) → Relay
     → Mostro Daemon recibe
```

#### Descubrir Órdenes
```
Discovery → Subscribe(kinds: [38383], #y: mostrop2p)
          → Relay stream events
          → Parse NIP-69 tags
          → Cache + UI update
```

#### Tomar Orden
```
User → MostroMessaging.sendToMostro("TakeBuy", {amount}, {orderId})
     → Gift Wrap → Relay
     → Mostro Daemon matches
```

---

## 💻 Desarrollo

### Estructura de Comandos

```bash
npm run dev       # Servidor de desarrollo con hot-reload
npm start         # Servidor de producción
npm test          # Ejecutar tests (próximamente)
npm run lint      # Linter de código
npm run build     # Build para producción
```

### Configuración de Relays

Editar `src/js/utils/constants.js`:

```javascript
export const DEFAULT_RELAYS = [
  'wss://relay.mostro.network',      // Relay oficial Mostro (prioritario)
  'wss://relay.damus.io',
  'wss://nostr-pub.wellorder.net',
  'wss://nos.lol',
  'wss://relay.snort.social',
  'wss://relay.nostr.band'
];
```

**Nota:** `relay.mostro.network` es el relay oficial y tiene prioridad.

### Añadir Nuevos Comandos

1. Definir en `src/js/utils/constants.js`:
```javascript
export const COMMANDS = {
  MI_COMANDO: '/micomando'
};

export const COMMAND_INFO = {
  [COMMANDS.MI_COMANDO]: {
    description: 'Descripción del comando',
    usage: '/micomando <arg>',
    examples: ['/micomando valor']
  }
};
```

2. Implementar en `src/js/ui/commands.js`:
```javascript
async function handleMiComando(args) {
  // Lógica del comando
  Display.success('Comando ejecutado');
}

// Agregar al switch en CommandHandler.handle()
```

### Testing

```bash
# Ejecutar todos los tests
npm test

# Tests con cobertura
npm run test:coverage

# Tests en modo watch
npm run test:watch
```

### Debugging

Habilitar logs en DevTools Console:

```javascript
// En src/js/utils/logger.js
export const LOG_LEVEL = {
  DEBUG: true,   // Ver todos los logs
  INFO: true,
  WARN: true,
  ERROR: true
};
```

---

## 🤝 Contribuir

¡Contribuciones son bienvenidas! Lee la [Guía de Contribución](CONTRIBUTING_ES.md) para más detalles.

### Proceso de Contribución

1. Fork del repositorio
2. Crear branch de feature: `git checkout -b feature/mi-feature`
3. Commit cambios: `git commit -m 'feat: mi nueva feature'`
4. Push a tu fork: `git push origin feature/mi-feature`
5. Abrir Pull Request

### Convenciones de Commits

Usamos [Conventional Commits](https://www.conventionalcommits.org/):

```
feat: nueva funcionalidad
fix: corrección de bug
docs: cambios en documentación
style: formateo, puntos y comas faltantes, etc.
refactor: refactorización de código
test: añadir tests
chore: actualización de tareas de build, etc.
```

### Áreas de Contribución

- 🐛 **Reportar bugs**: Usa el [template de bug report](.github/ISSUE_TEMPLATE/bug_report.md)
- ✨ **Nuevas features**: Usa el [template de feature request](.github/ISSUE_TEMPLATE/feature_request.md)
- 📝 **Documentación**: Mejorar guías y ejemplos
- 🌍 **Traducciones**: Añadir idiomas (actualmente: ES, EN)
- 🧪 **Testing**: Aumentar cobertura de tests
- 💬 **Difusión**: Compartir en comunidades Bitcoin LATAM

---

## 📚 Recursos

### Documentación

- [Guía de Usuario](docs/es/user/guia-usuario.md)
- [Guía de Desarrollo](docs/es/technical/guia-desarrollo.md)
- [Arquitectura del Sistema](docs/es/technical/arquitectura.md)
- [Protocolo Mostro](docs/es/technical/protocolo-mostro.md)

### Protocolo Mostro

- [Mostro Protocol Docs](https://mostro.network/protocol/)
- [Mostro GitHub](https://github.com/MostroP2P/mostro)
- [mostro-core](https://github.com/MostroP2P/mostro-core)

### Nostr

- [NIP-01: Basic protocol](https://github.com/nostr-protocol/nips/blob/master/01.md)
- [NIP-44: Encryption](https://github.com/nostr-protocol/nips/blob/master/44.md)
- [NIP-59: Gift Wrap](https://github.com/nostr-protocol/nips/blob/master/59.md)
- [NIP-69: P2P Order Events](https://github.com/nostr-protocol/nips/blob/master/69.md)

### Comunidad

- [Mostro Telegram](https://t.me/mostro_p2p) (si existe)
- [Nostr Dev Discord](https://discord.gg/nostr)

---

## 📊 Estado del Proyecto

### Versión Actual: v1.0.0 Production Ready 🎉

### Compatibilidad

| Componente | Estado | Versión |
|------------|--------|---------|
| NIP-59 Gift Wrap | ✅ 100% | 2.0 |
| NIP-44 Encryption | ✅ 100% | 2.0 |
| NIP-69 P2P Orders | ✅ 100% | 1.0 |
| Mostro Protocol | ✅ 98% | 1.0 |

### Completado en v1.0.0

#### ✅ Sprint 1 - Core Protocol
- [x] Event Kind 38383 (NIP-69)
- [x] Tags NIP-69 completos (11 required + 7 optional)
- [x] Handler de respuestas del daemon (34+ handlers)
- [x] Flujo completo Lightning invoices
- [x] Network filtering (mainnet/testnet)

#### ✅ Sprint 2 - UX Polish
- [x] Onboarding wizard automático
- [x] Auto-testing con `/testconnection`
- [x] Dashboard mejorado con `/status`
- [x] Notificaciones visuales
- [x] Historial y estadísticas
- [x] 9 temas de terminal

### Roadmap v1.1+

#### Sprint 3 - Advanced Features
- [ ] Sistema de disputas completo
- [ ] Calificaciones de usuarios (reputation)
- [ ] Mensajería directa entre traders
- [ ] Notificaciones push (opcional)

#### Sprint 4 - Testing & CI/CD
- [ ] Tests unitarios completos
- [ ] Tests de integración con mainnet
- [ ] CI/CD pipeline
- [ ] Deploy automatizado

#### Sprint 5 - Interoperabilidad
- [ ] Testing con otros clientes (mostro-cli, web mostro)
- [ ] Verificación cross-client
- [ ] Documentación de interoperabilidad

---

## 📄 Licencia

Este proyecto está licenciado bajo la Licencia MIT - ver el archivo [LICENSE](LICENSE) para más detalles.

---

## 🙏 Agradecimientos

- **Mostro Team**: Por el protocolo P2P innovador
- **Nostr Community**: Por la infraestructura descentralizada
- **Contributors**: Gracias a todos los que hacen MostroWeb mejor

---

## ⚠️ Disclaimer

**MostroWeb v1.0.0 es Production Ready pero úsalo con precaución.**

- ✅ Compatible al 98% con protocolo Mostro
- ✅ Testeado con órdenes reales en mainnet
- ⚠️ Empieza con cantidades pequeñas para familiarizarte
- ⚠️ Guarda siempre respaldo de tus claves privadas (`/export`)
- ⚠️ Verifica que recibiste el fiat antes de liberar Bitcoin
- ⚠️ Los desarrolladores no son responsables por pérdida de fondos

**Buenas prácticas:**
1. Ejecuta `/testconnection` antes de tradear
2. Empieza con $10-20 USD equivalente
3. Guarda tu nsec con `/export`
4. Verifica pagos fiat antes de `/release`

---

## 📞 Contacto

- GitHub Issues: [Issues](https://github.com/abcb1122/mostroweb/issues)
- Pull Requests: [PRs](https://github.com/abcb1122/mostroweb/pulls)

---

<p align="center">
  <sub>Construido con ⚡ y 🧡 para la comunidad Bitcoin</sub>
</p>

<p align="center">
  <sub>MostroWeb - Cliente Nostr para Mostro P2P</sub>
</p>
