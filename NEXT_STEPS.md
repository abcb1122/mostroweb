# Próximos Pasos - MostroWeb Project

## Estado Actual
✅ **COMPLETADO:**
- Análisis completo de repositorios (mostro, bot, nostr)
- Documentación de arquitectura (READMEv1.md) - **Actualizada para modelo descentralizado**
- Guía para IA agents (AI_AGENTS.md) - **Actualizada para modelo descentralizado**
- Repositorio configurado y sincronizado

🎯 **DESCUBRIMIENTO CRÍTICO:**
- Mostro es un **protocolo descentralizado**, NO un servicio centralizado
- Múltiples Mostro daemons ejecutándose independientemente
- Cada Mostro tiene su propia public key (NO hay pubkey fija global)
- Órdenes son eventos públicos descubribles (Kind 34242)
- MostroWeb descubre órdenes dinámicamente buscando en relays

## Próximos Pasos Críticos

### FASE 1: VALIDACIÓN TÉCNICA (Semana 1)

#### 1. Resolver Decisiones Pendientes
**Archivo:** `TECHNICAL_QUESTIONS.md`
- [ ] Confirmar relays Nostr recomendados para descubrimiento de órdenes
- [ ] Validar NIP-44 vs NIP-04 para encriptación de GiftWraps
- [ ] Configurar entorno de testnet con Mostro daemon de prueba
- [ ] Establecer timeout de órdenes
- [ ] Definir criterios para identificar Mostros confiables (whitelist/reputación)

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
- [ ] Conexión a múltiples relays públicos
- [ ] Monitoreo de estado de conexiones
- [ ] Auto-reconexión
- [ ] Configuración de relays dinámica (usuario puede añadir)

#### 5. Descubrimiento de Órdenes (CRÍTICO)
**Módulo:** `js/mostro/discovery.js`
- [ ] Buscar eventos Kind 34242 en relays (órdenes públicas)
- [ ] Filtrar por tags (#y=mostrop2p, #z=order)
- [ ] Extraer pubkey de Mostro de cada evento
- [ ] Cachear lista de Mostros descubiertos
- [ ] Agrupar órdenes por Mostro daemon

#### 6. UI Terminal Básica
**Módulo:** `js/ui/terminal.js`
- [ ] Interfaz terminal retro (verde/ámbar)
- [ ] Prompt de comandos
- [ ] Sistema de output
- [ ] Historial de comandos
- [ ] Display de órdenes agrupadas por Mostro

### FASE 3: SPRINT 2 - PROTOCOLO MOSTRO (Semanas 4-5)

#### 7. Comunicación con Mostro
**Módulo:** `js/mostro/protocol.js`
- [ ] Estructura de mensajes Mostro
- [ ] NIP-59 GiftWrap implementation (dirigido a Mostro específico)
- [ ] Trade index tracking (por Mostro instance)
- [ ] Comandos TradePubkey y RestoreSession
- [ ] Gestión de múltiples Mostros simultáneos
- [ ] Validación de respuestas por pubkey del Mostro

### Prioridades Inmediatas (Esta Semana)

1. **CREAR** `TECHNICAL_QUESTIONS.md` para validar con equipo Mostro
2. **INICIAR** estructura básica del proyecto (HTML/CSS/JS)
3. **IMPLEMENTAR** keyManager.js (gestión de claves local)
4. **PROTOTIPAR** descubrimiento de órdenes (buscar Kind 34242 en relays)
5. **VALIDAR** extracción dinámica de pubkey de Mostros

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
- [ ] Conexión estable a 3+ relays Nostr públicos
- [ ] Descubrimiento de órdenes públicas (Kind 34242) funcionando
- [ ] Extracción correcta de pubkey de Mostro de cada orden
- [ ] Interfaz terminal funcional con listado de órdenes
- [ ] Private key almacenada de forma segura
- [ ] Display de órdenes agrupadas por Mostro instance

## Acciones Requeridas

1. **Contactar equipo Mostro** para resolver preguntas técnicas
2. **Iniciar desarrollo** de componentes independientes
3. **Establecer entorno** de testing/testnet

---
**Última actualización:** $(date)
**Próxima revisión:** 1 semana
