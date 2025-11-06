# Arquitectura de MostroWeb

Este documento describe la arquitectura técnica de MostroWeb.

## Visión General

MostroWeb es un cliente web de terminal para el protocolo Mostro, construido como una Single Page Application (SPA) usando JavaScript vanilla y ES6 modules.

## Componentes Principales

### 1. RelayManager (`src/js/core/relayManager.js`)

Gestiona todas las conexiones a relays Nostr.

**Responsabilidades**:
- Manejo de pool de conexiones WebSocket
- Subscripciones con filtros
- Publicación de eventos
- Auto-reconnect
- Status tracking

**Tecnologías**: nostr-tools SimplePool

### 2. Discovery (`src/js/mostro/discovery.js`)

Descubre órdenes P2P en la red Nostr.

**Responsabilidades**:
- Subscribe a eventos Kind 38383 (NIP-69)
- Parseo de tags NIP-69
- Cache en LocalStorage
- Agrupación por Mostro daemon
- Limpieza automática de órdenes expiradas

### 3. MostroMessaging (`src/js/mostro/messaging.js`)

Comunicación encriptada con daemons Mostro.

**Responsabilidades**:
- Construcción de mensajes del protocolo
- Firmado SHA256 + Schnorr
- Gift Wrap (NIP-59) de 3 capas
- Encriptación NIP-44 v2

### 4. KeyManager (`src/js/core/keyManager.js`)

Gestión segura de claves Nostr.

**Responsabilidades**:
- Generación de pares de claves
- Encriptación AES-256-CBC
- Derivación con PBKDF2
- Conversión nsec/npub/hex

### 5. Terminal (`src/js/ui/terminal.js`)

Interfaz de usuario de terminal.

**Responsabilidades**:
- Input handling
- Historial de comandos
- Display de output
- Temas visuales

## Flujo de Datos

```
User Input → Terminal → CommandHandler → Core Services → Nostr Network
                                              ↓
                                         LocalStorage
                                              ↓
                                          Display
```

## Seguridad

- Claves privadas solo en sessionStorage
- Encriptación AES-256 para persistencia
- Gift Wrap para privacidad de mensajes
- No hay backend, todo client-side

Para más detalles, ver [Compatibilidad con Protocolo](COMPATIBILITY_REPORT.md).
