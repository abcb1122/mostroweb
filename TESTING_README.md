# 🧪 Framework de Testing en Vivo - MostroWeb Mainnet

**Branch**: claude/execute-mainnet-live-test-011CUs2TMYGDRZyg2NshntWp

---

## 📌 Importante: Limitaciones de Testing Automatizado

Claude Code (IA) **NO PUEDE**:
- ❌ Ejecutar servidores web (`npm run dev`)
- ❌ Abrir navegadores o interactuar con UI
- ❌ Tomar capturas de pantalla
- ❌ Ejecutar comandos en interfaces web

**Por lo tanto**, he creado un **framework completo** para que TÚ puedas ejecutar el testing siguiendo una guía paso a paso.

---

## 📦 Documentos Creados

### 1. LIVE_TESTING_GUIDE.md (Guía Principal)

**Descripción**: Guía completa de 9 fases para testing en vivo

**Contenido**:
- Preparación del entorno
- Instrucciones paso a paso
- Comandos a ejecutar
- Qué observar en cada paso
- Criterios de éxito
- Troubleshooting
- Template de reporte

**Cuándo usar**: Durante la ejecución del testing

**Archivo**: `LIVE_TESTING_GUIDE.md`

---

### 2. TESTING_CHECKLIST.md (Checklist Rápida)

**Descripción**: Checklist de verificación para marcar durante testing

**Contenido**:
- Pre-requisitos
- Pasos de verificación
- Checkboxes para marcar
- Espacio para datos
- Resultado final

**Cuándo usar**: Imprimir o tener abierto durante testing para ir marcando

**Archivo**: `TESTING_CHECKLIST.md`

---

### 3. TEST_RESULTS_TEMPLATE.md (Template de Resultados)

**Descripción**: Template estructurado para documentar resultados

**Contenido**:
- Secciones pre-formateadas
- Tablas para llenar
- Campos para capturas
- Áreas de conclusiones

**Cuándo usar**: Después del testing, para documentar resultados formalmente

**Archivo**: `TEST_RESULTS_TEMPLATE.md`

---

## 🚀 Cómo Ejecutar el Testing

### Opción 1: Guía Completa (Recomendado para Primera Vez)

1. **Abrir** `LIVE_TESTING_GUIDE.md`
2. **Seguir** cada fase secuencialmente
3. **Leer** todas las instrucciones antes de ejecutar
4. **Documentar** resultados durante el proceso

**Ventajas**:
- Explicaciones detalladas
- Troubleshooting incluido
- Contexto completo

**Tiempo estimado**: 30-45 minutos

---

### Opción 2: Checklist Rápida (Para Usuarios Experimentados)

1. **Abrir** `TESTING_CHECKLIST.md`
2. **Imprimir** o tener en pantalla dividida
3. **Ir marcando** checkboxes conforme avanzas
4. **Llenar** campos de datos

**Ventajas**:
- Rápido y directo
- Fácil de seguir
- No se olvida nada

**Tiempo estimado**: 15-20 minutos

---

### Opción 3: Combinada (Óptimo)

1. **Leer primero** `LIVE_TESTING_GUIDE.md` (10 min)
2. **Ejecutar testing** con `TESTING_CHECKLIST.md` (20 min)
3. **Documentar resultados** en `TEST_RESULTS_TEMPLATE.md` (15 min)

**Tiempo total**: ~45 minutos

---

## 📋 Flujo Recomendado

```
┌─────────────────────────────────────────┐
│ 1. PREPARACIÓN                          │
│    - Leer LIVE_TESTING_GUIDE.md         │
│    - Verificar pre-requisitos           │
│    - Abrir TESTING_CHECKLIST.md         │
└─────────────┬───────────────────────────┘
              │
              ▼
┌─────────────────────────────────────────┐
│ 2. EJECUCIÓN                            │
│    - npm run dev                        │
│    - Seguir pasos de checklist          │
│    - Marcar checkboxes                  │
│    - Tomar capturas                     │
│    - Copiar logs                        │
└─────────────┬───────────────────────────┘
              │
              ▼
┌─────────────────────────────────────────┐
│ 3. DOCUMENTACIÓN                        │
│    - Copiar TEST_RESULTS_TEMPLATE.md    │
│    - Renombrar con fecha                │
│    - Llenar todas las secciones         │
│    - Adjuntar capturas                  │
└─────────────┬───────────────────────────┘
              │
              ▼
┌─────────────────────────────────────────┐
│ 4. ANÁLISIS                             │
│    - Revisar criterios de éxito         │
│    - Identificar issues                 │
│    - Escribir conclusiones              │
│    - Definir próximos pasos             │
└─────────────────────────────────────────┘
```

---

## 🎯 Comandos Clave a Ejecutar

Durante el testing, ejecutarás estos comandos en la interfaz de MostroWeb:

### 1. Discovery
```
/discover
```
Conecta a relays y busca órdenes.

### 2. Listar Órdenes
```
/listorders
```
Muestra todas las órdenes encontradas.

### 3. Filtros
```
/listorders buy        # Solo compra
/listorders sell       # Solo venta
/listorders USD        # Solo USD
/listorders buy USD    # Compra + USD
```

### 4. Detalle de Orden
```
/orderinfo <order-id>
```
Muestra información detallada de una orden.

### 5. Estadísticas
```
/stats
```
Muestra estadísticas generales.

### 6. Refresh
```
/refresh
```
Re-escanea relays para nuevas órdenes.

---

## 📸 Capturas Requeridas

Durante el testing, toma estas capturas:

1. **Terminal tras /discover**
   - Archivo: `screenshot-discover.png`
   - Muestra: Conexión a relays y cantidad de órdenes

2. **Output de /listorders**
   - Archivo: `screenshot-listorders.png`
   - Muestra: Lista completa de órdenes con network tags

3. **Console del navegador**
   - Archivo: `screenshot-console.png`
   - Muestra: Logs de Discovery y eventos recibidos

4. **Detalle de orden**
   - Archivo: `screenshot-orderinfo.png`
   - Muestra: Información completa de una orden

5. **Evento raw**
   - Archivo: `screenshot-rawevent.png`
   - Muestra: JSON completo de un evento en console

**Guardar en**: `/docs/testing/`

---

## 📊 Datos Críticos a Recopilar

### Conexión a Relays

- [ ] Cantidad conectados (X/6)
- [ ] Cuáles respondieron
- [ ] Cuáles fallaron
- [ ] Tiempo de conexión

### Órdenes Descubiertas

- [ ] Total de órdenes
- [ ] BUY vs SELL
- [ ] Por moneda (USD, EUR, ARS, CUP)
- [ ] Métodos de pago encontrados
- [ ] Range orders (cantidad)

### Parsing y Validación

- [ ] Kind 38383 en todos
- [ ] Content vacío en todos
- [ ] Tags requeridos presentes
- [ ] Network tag visible en UI
- [ ] Layer tag presente

### Funcionalidades

- [ ] Filtros funcionan
- [ ] Refresh funciona
- [ ] Detalle de orden muestra todo
- [ ] No hay errores en console

---

## ✅ Criterios de Éxito

### ÉXITO COMPLETO ✅

Se considera éxito si:
- 3+ relays conectan
- 1+ orden encontrada
- Kind 38383 correcto
- Todos los tags presentes
- Network visible en UI
- Parsing correcto
- Sin errores críticos

### PARCIAL ⚠️

Se considera parcial si:
- 1-2 relays conectan
- Parsing mayormente correcto
- Algunos tags opcionales faltan
- Errores menores en console

### FALLO ❌

Se considera fallo si:
- 0 relays conectan
- 0 órdenes encontradas
- Kind incorrecto
- Tags requeridos faltantes
- Errores críticos

---

## 🐛 Troubleshooting Rápido

### No se conecta a relays
- Verificar internet
- Probar relays manualmente con websocat
- Revisar console para errores WebSocket

### No encuentra órdenes
- Normal si no hay órdenes en mainnet en este momento
- Intentar /refresh
- Verificar filtro de network en discovery.js

### Parsing incorrecto
- Inspeccionar evento raw
- Verificar estructura contra NIP-69
- Reportar como bug si estructura es válida

---

## 📝 Después del Testing

### 1. Documentar Resultados

- Llenar `TEST_RESULTS_TEMPLATE.md`
- Copiar con nombre: `TEST_RESULTS_[FECHA].md`
- Ejemplo: `TEST_RESULTS_2025-11-06.md`

### 2. Guardar Evidencias

```
/docs/testing/
├── TEST_RESULTS_2025-11-06.md
├── screenshots/
│   ├── screenshot-discover.png
│   ├── screenshot-listorders.png
│   ├── screenshot-console.png
│   ├── screenshot-orderinfo.png
│   └── screenshot-rawevent.png
└── logs/
    ├── console-full.log
    └── network-tab.har
```

### 3. Actualizar Documentación

Si el testing fue exitoso:
- Actualizar `MAINNET_STATUS_REPORT.md` con datos reales
- Marcar testing como completado
- Documentar cantidad real de órdenes en mainnet

### 4. Reportar Issues

Si se encontraron bugs:
- Crear issue en GitHub
- Adjuntar logs y capturas
- Incluir pasos para reproducir

---

## 🚀 Próximos Pasos Tras Testing Exitoso

1. **Testing de Creación de Órdenes**
   - Ejecutar `/neworder`
   - Verificar que aparece en relays
   - Confirmar interoperabilidad

2. **Testing de Toma de Órdenes**
   - Ejecutar `/takebuy` o `/takesell`
   - Verificar flujo completo
   - Monitorear Gift Wrap messages

3. **Testing de Cancelación**
   - Ejecutar `/cancel`
   - Verificar que orden desaparece

4. **Testing con Otros Clientes**
   - Verificar orden en p2p.band
   - Probar con mostro-cli
   - Confirmar interoperabilidad completa

---

## 📞 Soporte

Si necesitas ayuda durante el testing:

1. **Revisar** `LIVE_TESTING_GUIDE.md` sección Troubleshooting
2. **Revisar** logs en console del navegador
3. **Consultar** `MAINNET_STATUS_REPORT.md` para contexto
4. **Crear issue** en GitHub si encuentras bugs

---

## 📚 Referencias

- `LIVE_TESTING_GUIDE.md` - Guía completa paso a paso
- `TESTING_CHECKLIST.md` - Checklist de verificación
- `TEST_RESULTS_TEMPLATE.md` - Template de resultados
- `MAINNET_STATUS_REPORT.md` - Estado de Mostro en mainnet
- `INTEGRATION_VERIFICATION.md` - Análisis de compatibilidad NIP-69

---

**¡Listo para Testing!** 🚀

**Tiempo estimado total**: 45-60 minutos
**Dificultad**: Media
**Requisitos**: Node.js, navegador, conexión a internet

---

**Última actualización**: 2025-11-06
**Versión del Framework**: 1.0
