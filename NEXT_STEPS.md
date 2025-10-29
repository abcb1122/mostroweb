# Próximos Pasos - MostroWeb Project

## Estado Actual
✅ **COMPLETADO:**
- Análisis completo de repositorios (mostro, bot, nostr)
- Documentación de arquitectura (READMEv1.md)
- Guía para IA agents (AI_AGENTS.md)
- Repositorio configurado y sincronizado

## Próximos Pasos Críticos

### FASE 1: VALIDACIÓN TÉCNICA (Semana 1)

#### 1. Resolver Decisiones Pendientes
**Archivo:** `TECHNICAL_QUESTIONS.md`
- [ ] Obtener public key oficial de Mostro
- [ ] Confirmar relays recomendados  
- [ ] Validar NIP-44 vs NIP-04 para encriptación
- [ ] Configurar entorno de testnet
- [ ] Establecer timeout de órdenes

#### 2. Setup del Proyecto
**Archivo:** `package.json` y estructura inicial
- [ ] Configurar dependencias (nostr-tools, uuid, crypto-js)
- [ ] Crear estructura de archivos según AI_AGENTS.md
- [ ] Setup básico de HTML/CSS terminal retro
- [ ] Configurar entorno de desarrollo

### FASE 2: SPRINT 1 - FUNDAMENTOS (Semanas 2-3)

#### 3. Gestión de Identidad
**Módulo:** `js/core/keyManager.js`
- [ ] Generación de claves Nostr (secp256k1)
- [ ] Import/export de private key
- [ ] Almacenamiento seguro en LocalStorage
- [ ] Encriptación con password (AES-256)

#### 4. Conexión Nostr Básica
**Módulo:** `js/core/relayManager.js`
- [ ] Conexión a múltiples relays
- [ ] Monitoreo de estado de conexiones
- [ ] Auto-reconexión
- [ ] Configuración de relays

#### 5. UI Terminal Básica
**Módulo:** `js/ui/terminal.js`
- [ ] Interfaz terminal retro (verde/ámbar)
- [ ] Prompt de comandos
- [ ] Sistema de output
- [ ] Historial de comandos

### FASE 3: SPRINT 2 - PROTOCOLO MOSTRO (Semanas 4-5)

#### 6. Comunicación con Mostro
**Módulo:** `js/mostro/protocol.js`
- [ ] Estructura de mensajes Mostro
- [ ] NIP-59 GiftWrap implementation
- [ ] Trade index tracking
- [ ] Comandos TradePubkey y RestoreSession

### Prioridades Inmediatas (Esta Semana)

1. **CREAR** `TECHNICAL_QUESTIONS.md` para validar con equipo Mostro
2. **INICIAR** estructura básica del proyecto (HTML/CSS/JS)
3. **IMPLEMENTAR** keyManager.js (gestión de claves local)

## Decisiones Técnicas Inmediatas

### Stack Confirmado
- Frontend: HTML/CSS/JS vanilla
- Nostr: nostr-tools v2.5.2+
- Encriptación: NIP-44 (preferido) o NIP-04
- Storage: LocalStorage con encriptación AES-256

### Reglas de Seguridad Confirmadas
- Private keys NUNCA salen del navegador
- Validación de trade_index para anti-replay
- Verificación de firmas de todos los eventos
- Sanitización de inputs del usuario

## Métricas de Éxito Sprint 1
- [ ] Usuario puede generar/importar private key
- [ ] Conexión estable a 3+ relays Nostr
- [ ] Interfaz terminal funcional
- [ ] Private key almacenada de forma segura

## Acciones Requeridas

1. **Contactar equipo Mostro** para resolver preguntas técnicas
2. **Iniciar desarrollo** de componentes independientes
3. **Establecer entorno** de testing/testnet

---
**Última actualización:** $(date)
**Próxima revisión:** 1 semana
