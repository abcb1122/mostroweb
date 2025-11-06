# Changelog

Todos los cambios notables en este proyecto serán documentados en este archivo.

El formato está basado en [Keep a Changelog](https://keepachangelog.com/es-ES/1.0.0/),
y este proyecto adhiere a [Semantic Versioning](https://semver.org/lang/es/).

## [Unreleased]

### Planned
- Tests unitarios e integración completa
- CI/CD pipeline automatizado
- Exportación de historial de trades
- Sistema completo de disputas
- Calificaciones y reputación de usuarios

## [1.0.0] - 2025-11-06 🎉

### Added - Sprint Final: Producción

#### QR Codes para Lightning Invoices
- **Librería QRCode.js**: Integrada desde CDN
- **Módulo qrcode.js**: Sistema completo de generación de QR codes
- **Comando `/showqr`**: Muestra QR para cualquier invoice o dato
- **Display Automático**: QR se muestra automáticamente al recibir invoices
- **Temas Adaptativos**: QR usa colores del tema actual del terminal
- **Interactivo**: Cerrar con ESC o botón

#### Confirmaciones de Seguridad
- **Confirmación en `/release`**: Requiere confirmación antes de liberar fondos
- **Advertencias Críticas**: Mensajes claros sobre irreversibilidad
- **Confirmación en `/export`**: Ya implementado (protección de claves)

#### Documentación de Producción
- **DEPLOYMENT.md**: Guía completa de despliegue
  - GitHub Pages, Netlify, Vercel, servidor propio
  - Configuración de DNS y HTTPS
  - Headers de seguridad
  - Monitoreo y troubleshooting

### Added - Sprint 2: UX Polish

#### Wizard de Onboarding
- **wizard.js**: Sistema completo de onboarding (400+ líneas)
- **Detección Automática**: Se ejecuta en primera apertura
- **Guía Interactiva**: 7 secciones educativas
  - Banner de bienvenida ASCII
  - Introducción a Nostr, Mostro, Lightning
  - Explicación del modelo de seguridad
  - Opciones de configuración
  - Próximos pasos después de setup
  - Flujo completo de trading
  - Comandos esenciales
- **Comando `/tutorial`**: Re-ejecutar wizard en cualquier momento
- **Idioma**: 100% en español no-técnico

#### Notificaciones Visuales Mejoradas
- **notifications.js**: Sistema rico de notificaciones (400+ líneas)
- **9 Tipos de Notificaciones**:
  - Order Taken: Orden tomada con emoji según tipo
  - Invoice Accepted: Invoice aceptada por Mostro
  - Hold Invoice Paid: Fondos bloqueados en escrow
  - Fiat Sent: Notificación de pago fiat
  - Purchase Completed: Trade completado con celebración
  - Error: Errores con sugerencias accionables
  - Order Canceled: Cancelaciones (cooperativas y normales)
  - Dispute Initiated: Inicio de disputas
  - Order Created: Confirmación de orden publicada
- **Bordes ASCII Decorativos**: Notificaciones con marcos visuales
- **Emojis Contextuales**: 🎉 ✅ ⚠️ ❌ 💰 💸 🔒 ⚖️
- **Sugerencias Inteligentes**: Errores incluyen pasos de solución
- **Historial**: Últimas 50 notificaciones guardadas

#### Comandos de Utilidad
- **`/history [limit]`**: Ver historial de notificaciones (default 10)
- **`/mystats`**: Estadísticas de trading personales
  - Mensajes procesados
  - Errores manejados
  - Trades completados
  - Órdenes activas con estados
- **`/tutorial`**: Mostrar guía completa de onboarding

### Added - Sprint 1: Lightning Flow

#### Sistema de Respuestas
- **responseHandler.js**: 34+ handlers de respuestas (1000+ líneas)
- **Desencriptación NIP-59**: Gift Wrap completo de 3 capas
- **Verificación de Firmas**: Schnorr sobre SHA256
- **State Management**: Tracking de órdenes activas
- **Estadísticas**: Mensajes, errores, trades completados

#### Comandos Lightning
- **`/addinvoice <id> <invoice>`**: Añadir invoice Lightning
  - Validación de formato (lnbc/lntb/lnbcrt)
  - Verificación de orden existente
- **`/fiatsent <id>`**: Notificar envío de pago fiat
  - Advertencia de confirmación antes de uso
- **`/release <id>`**: Liberar Bitcoin a comprador
  - Advertencias críticas sobre irreversibilidad
  - Confirmación requerida antes de ejecutar

#### Handlers de Respuestas Implementados
- **CantDo**: 21 tipos de errores con traducciones en español
- **BuyerInvoiceAccepted**: Confirmación de invoice
- **PurchaseCompleted**: Trade exitoso
- **HoldInvoicePaymentAccepted/Settled**: Estados de hold invoice
- **InvoiceUpdated**: Actualizaciones de pago
- **PaymentFailed**: Manejo de errores de pago
- **FiatSentOk**: Confirmación de notificación fiat
- **Released**: Fondos liberados
- **CooperativeCancelInitiated/Accepted**: Cancelaciones cooperativas
- **DisputeInitiated/AdminTook/Settled**: Flujo de disputas
- **RateReceived**: Calificaciones recibidas

#### Integración Messaging
- **startListening()**: Escucha automática de respuestas
- **stopListening()**: Gestión de suscripciones
- **Auto-inicio en `/discover`**: Listening se activa automáticamente

### Changed

#### Notificaciones Mejoradas
- `handleCantDo()` → `Notifications.error()` con sugerencias
- `handleBuyerInvoiceAccepted()` → `Notifications.invoiceAccepted()`
- `handlePurchaseCompleted()` → `Notifications.purchaseCompleted()`
- `handleHoldInvoicePaymentAccepted()` → `Notifications.holdInvoicePaymentAccepted()`
- `handleFiatSentOk()` → `Notifications.fiatSent()`

#### Main.js
- **Auto-wizard**: Ejecuta onboarding si es primera vez
- **Detección**: Basado en localStorage

#### Documentación
- **README_ES.md**: Actualizado con features Sprint 1 y 2
  - Trading completo marcado como ✅
  - Sistema de respuestas documentado
  - Wizard y notificaciones explicados
  - Flujo completo de trading con ejemplos
  - Comandos de utilidad documentados

### Fixed

#### Sprint 1
- Hold invoice payment flow completamente funcional
- Recepción de respuestas de daemon Mostro
- State tracking de órdenes en progreso

#### Sprint 2
- Experiencia confusa para usuarios nuevos
- Notificaciones genéricas sin contexto
- Falta de confirmación en acciones críticas
- Ausencia de historial y estadísticas

### Security

- Confirmación obligatoria en `/release` antes de liberar fondos
- Advertencias críticas sobre irreversibilidad
- `/export` requiere confirmación con "I UNDERSTAND"
- Warnings claros sobre protección de claves privadas

## [0.1.0] - 2025-11-06

### Added - Sprint 0: Compatibilidad con Protocolo Mostro

#### Correcciones Críticas
- **Event Kind 38383 (NIP-69)**: Cambiado de 34242 (NIP-33) a 38383 (NIP-69) para compatibilidad con protocolo oficial Mostro
- **Tags NIP-69 Completos**: Implementado parsing de todos los tags obligatorios:
  - `amt`: Cantidad en satoshis
  - `fa`: Cantidad fiat (soporta rangos "100-500")
  - `premium`: Porcentaje de premium
  - `expiration`: Timestamp de expiración
  - `network`: mainnet/testnet/signet
  - `layer`: onchain/lightning/liquid
  - Tags opcionales: source, rating, name, g (geohash), bond
- **Validación NIP-69**: Warning cuando content no está vacío, prioriza datos de tags sobre content
- **Compatibilidad**: Score incrementado de 40% a 85%

#### Reorganización Profesional del Repositorio
- **Estructura `src/`**: Todo el código fuente movido a directorio src/
  - `src/css/`: Estilos organizados
  - `src/js/`: Código JavaScript modular
  - `src/index.html`: Punto de entrada
- **Documentación `docs/`**: Español prioritario
  - `docs/es/`: Documentación en español
  - `docs/en/`: Documentación en inglés
- **Scripts `scripts/`**: Utilidades de desarrollo
  - `scripts/dev-server.js`: Servidor de desarrollo
- **README_ES.md**: Documentación principal en español
- **CONTRIBUTING_ES.md**: Guía de contribución en español
- **CHANGELOG.md**: Historial de cambios
- **package.json**: Actualizado con metadatos profesionales
- **.gitignore**: Configuración completa

### Changed

#### Migración de Archivos
- `index.html` → `src/index.html`
- `css/*` → `src/css/*`
- `js/*` → `src/js/*`
- `server.js` → `scripts/dev-server.js`

#### Actualización de Referencias
- dev-server.js actualizado para servir desde `src/`
- Todas las rutas relativas mantienen funcionalidad
- Health check endpoint actualizado

#### Documentación
- Todas las referencias 34242 → 38383 en docs
- Todas las referencias NIP-33 → NIP-69 en docs
- Archivos actualizados:
  - `NEXT_STEPS.md`
  - `READMEv1.md`
  - `AI_AGENTS.md`
  - `KEYMANAGER_IMPLEMENTATION_PLAN.md`

### Fixed

- Event kind incompatibility bloqueando descubrimiento de órdenes
- Parsing incompleto de tags NIP-69
- Estructura de proyecto no profesional

## [0.0.1] - 2025-10-29

### Added

#### Core Features
- **Gestión de Identidad Nostr**
  - Generación de claves (nsec/npub)
  - Importación de claves existentes
  - Encriptación con contraseña (AES-256-CBC + PBKDF2)
  - Exportación segura de respaldos

- **Descubrimiento de Órdenes P2P**
  - Búsqueda en múltiples relays Nostr
  - Filtrado por moneda, método de pago, tipo
  - Cache local para carga rápida
  - Agrupación por daemon Mostro

- **Trading Básico**
  - Crear órdenes de compra/venta
  - Tomar órdenes existentes
  - Cancelar órdenes pendientes

- **Protocolo Mostro**
  - NIP-59: Gift Wrap implementation
  - NIP-44: Encryption v2
  - NIP-33: Replaceable events (antes del cambio a NIP-69)
  - Mensaje structure compatible con mostro-core

#### UI/UX
- **Terminal Retro**: Interfaz estilo terminal clásica
- **9 Temas visuales**: Green, Amber, Blue, Matrix, DOS, Hacker, White, Red, Purple
- **Comandos**: `/help`, `/start`, `/discover`, `/listorders`, `/neworder`, `/takebuy`, `/takesell`, `/cancel`
- **Status Bar**: Indicadores de relay y órdenes en tiempo real
- **Responsive**: Funciona en desktop y mobile

#### Infraestructura
- **RelayManager**: Gestión de conexiones a relays Nostr
- **KeyManager**: Gestión segura de claves privadas
- **Storage**: Persistencia en LocalStorage
- **Logger**: Sistema de logging con niveles

### Known Issues (v0.0.1)

- Event Kind 34242 incompatible con protocolo oficial (corregido en 0.1.0)
- Tags NIP-69 incompletos (corregido en 0.1.0)
- Flujo Lightning invoices no implementado
- Sistema de disputas pendiente
- Calificaciones de usuarios pendiente

---

## Tipos de Cambios

- `Added`: Nuevas funcionalidades
- `Changed`: Cambios en funcionalidades existentes
- `Deprecated`: Funcionalidades que serán removidas
- `Removed`: Funcionalidades removidas
- `Fixed`: Corrección de bugs
- `Security`: Cambios de seguridad

---

[Unreleased]: https://github.com/abcb1122/mostroweb/compare/v0.1.0...HEAD
[0.1.0]: https://github.com/abcb1122/mostroweb/compare/v0.0.1...v0.1.0
[0.0.1]: https://github.com/abcb1122/mostroweb/releases/tag/v0.0.1
