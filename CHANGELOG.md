# Changelog

Todos los cambios notables en este proyecto serán documentados en este archivo.

El formato está basado en [Keep a Changelog](https://keepachangelog.com/es-ES/1.0.0/),
y este proyecto adhiere a [Semantic Versioning](https://semver.org/lang/es/).

## [Unreleased]

### Added
- Tests unitarios e integración
- CI/CD pipeline
- Build process para producción

### Changed
- TBD

### Fixed
- TBD

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
