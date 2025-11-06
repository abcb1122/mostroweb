# 🧪 Guía de Testing en Vivo - Mainnet

**Fecha**: 2025-11-06
**Branch**: claude/execute-mainnet-live-test-011CUs2TMYGDRZyg2NshntWp
**Objetivo**: Ejecutar MostroWeb en mainnet y verificar descubrimiento de órdenes reales

---

## ⚠️ IMPORTANTE: Limitaciones de Testing Automatizado

**Claude Code no puede**:
- ❌ Ejecutar servidores web interactivos (`npm run dev`)
- ❌ Abrir navegadores o interactuar con interfaces gráficas
- ❌ Tomar capturas de pantalla
- ❌ Ejecutar comandos en la interfaz web de MostroWeb

**Esta guía proporciona**:
- ✅ Procedimiento paso a paso para testing manual
- ✅ Checklist detallada de verificación
- ✅ Templates para documentar resultados
- ✅ Comandos y queries de ejemplo
- ✅ Criterios de éxito claros

---

## 🚀 FASE 1: Preparación del Entorno

### 1.1. Verificar Dependencias

```bash
# Confirmar versión de Node.js
node --version
# Debería ser >= 16.x

# Confirmar que las dependencias están instaladas
npm install

# Verificar que el build funciona
npm run build
```

**Criterio de Éxito**:
- ✅ Build exitoso sin errores
- ✅ Archivos generados en `/dist`

---

### 1.2. Configuración de Relays

**Verificar** que `src/js/utils/constants.js` contiene:

```javascript
export const DEFAULT_RELAYS = [
  'wss://relay.mostro.network',    // ← Relay oficial
  'wss://relay.damus.io',
  'wss://nostr-pub.wellorder.net',
  'wss://nos.lol',
  'wss://relay.snort.social',
  'wss://relay.nostr.band'
];
```

**Criterio de Éxito**:
- ✅ Relay oficial en primera posición
- ✅ 6 relays configurados

---

### 1.3. Verificar Filtro de Discovery

**Verificar** que `src/js/mostro/discovery.js` línea 150-155 contiene:

```javascript
const filter = {
  kinds: [NOSTR_KINDS.P2P_ORDER],  // 38383
  '#y': [MOSTRO_TAGS.MARKETPLACE],    // "mostrop2p"
  '#network': ['mainnet'],            // ← Filtro por mainnet
  limit: 500
};
```

**Criterio de Éxito**:
- ✅ Filtro por `#network: ['mainnet']` presente
- ✅ Kind 38383 correcto
- ✅ Tag `#y: ['mostrop2p']` correcto

---

## 🌐 FASE 2: Iniciar MostroWeb

### 2.1. Iniciar Servidor de Desarrollo

```bash
# En el directorio raíz de mostroweb
npm run dev
```

**Observar en Terminal**:
```
  VITE v5.x.x  ready in XXX ms

  ➜  Local:   http://localhost:3000/
  ➜  Network: use --host to expose
  ➜  press h + enter to show help
```

**Criterio de Éxito**:
- ✅ Servidor inicia sin errores
- ✅ Puerto 3000 disponible
- ✅ Hot reload activado

---

### 2.2. Abrir en Navegador

1. **Abrir**: http://localhost:3000
2. **Abrir DevTools**: F12 o Ctrl+Shift+I (Cmd+Option+I en Mac)
3. **Ir a pestaña Console**

**Observar en Console**:
```
MostroWeb v1.0.0 initialized
Logger: Debug mode enabled
```

**Criterio de Éxito**:
- ✅ Página carga sin errores
- ✅ Terminal aparece visible
- ✅ No hay errores en Console

---

## 🔍 FASE 3: Ejecutar Discovery de Órdenes

### 3.1. Comando /discover

**En el terminal de MostroWeb**, ejecutar:

```
/discover
```

**Observar en UI** (mensajes esperados):

```
Iniciando búsqueda de órdenes...

Conectando a relays...
✓ Conectado a 6/6 relays

Escaneando relays en busca de órdenes Mostro...
✓ Búsqueda de órdenes iniciada
Escuchando eventos de órdenes...
Las órdenes aparecerán conforme se descubran.

Usa /listorders para ver órdenes descubiertas
Usa /refresh para re-escanear relays
```

---

### 3.2. Monitorear Console del Navegador

**Filtrar logs por**: `Discovery`

**Logs Esperados**:

```javascript
// Conexión a relays
RelayManager: Connecting to 6 relays...
RelayManager: Connected to wss://relay.mostro.network
RelayManager: Connected to wss://relay.damus.io
// ... (otros relays)

// Inicio de discovery
Discovery: Starting order discovery...
Discovery: Subscription filter {kinds: [38383], #y: ["mostrop2p"], #network: ["mainnet"], limit: 500}

// Eventos recibidos
Discovery: Processing order event 1a2b3c4d...
Discovery: Order 1a2b3c4d... from Mostro 5e6f7g8h...
Discovery: Order 9i0j1k2l... from Mostro 3m4n5o6p...

// EOSE (End Of Stored Events)
Discovery: EOSE received - Initial sync complete
Discovery: Found X orders from Y Mostro instances
Discovery: Processed Z events (A valid, B invalid)
```

---

### 3.3. Documentar Resultados de Discovery

**Copiar de Console** los siguientes datos:

| Métrica | Valor |
|---------|-------|
| Relays conectados | X/6 |
| Órdenes encontradas | X |
| Instancias Mostro | Y |
| Eventos procesados | Z |
| Eventos válidos | A |
| Eventos inválidos | B |

**Verificar Relays que Respondieron**:

- [ ] wss://relay.mostro.network ✅/❌
- [ ] wss://relay.damus.io ✅/❌
- [ ] wss://nostr-pub.wellorder.net ✅/❌
- [ ] wss://nos.lol ✅/❌
- [ ] wss://relay.snort.social ✅/❌
- [ ] wss://relay.nostr.band ✅/❌

**Criterio de Éxito**:
- ✅ Al menos 3/6 relays conectados exitosamente
- ✅ Al menos 1 orden encontrada
- ✅ No hay errores críticos en console

---

## 📋 FASE 4: Listar y Verificar Órdenes

### 4.1. Comando /listorders

**En el terminal de MostroWeb**, ejecutar:

```
/listorders
```

**Observar Output Esperado**:

```
=== ÓRDENES DE MOSTRO ===

Todas las órdenes: X órdenes de Y instancias Mostro

Mostro 1a2b3c4d... (Z órdenes activas) 🟢
  Pubkey: 1a2b3c4d5e6f7g8h...9i0j1k2l

  📗 BUY  | 100 USD (10000 sats)  +2%    | bank transfer        | [mainnet]  | abc123...def456
  📕 SELL | 50-200 EUR range      +1%    | revolut, wise        | [mainnet]  | ghi789...jkl012

Mostro 5e6f7g8h... (W órdenes activas) 🟢
  Pubkey: 5e6f7g8h9i0j1k2l...3m4n5o6p

  📗 BUY  | 500 ARS (5000 sats)   +0%    | mercadopago          | [mainnet]  | mno345...pqr678

Leyenda: 📗 = COMPRA | 📕 = VENTA | 🟢 = Mostro Activo
```

---

### 4.2. Verificar Datos de Órdenes

**Para CADA orden visible**, verificar:

#### ✅ Campos Básicos
- [ ] Order ID (8+...+8 caracteres)
- [ ] Tipo (BUY/SELL con emoji 📗/📕)
- [ ] Monto (fiat amount + moneda)
- [ ] Satoshis (entre paréntesis)
- [ ] Premium (+X% o -X%)
- [ ] Método de pago (texto legible)
- [ ] Network tag ([mainnet])

#### ✅ Range Orders
- [ ] Si es range: formato "min-max CURRENCY range"
- [ ] Ejemplo: "50-200 EUR range"

#### ✅ Monedas Encontradas
- [ ] USD
- [ ] EUR
- [ ] ARS
- [ ] CUP
- [ ] Otras: _______

#### ✅ Métodos de Pago Encontrados
- [ ] bank transfer
- [ ] face to face
- [ ] revolut
- [ ] wise
- [ ] strike
- [ ] mercadopago
- [ ] Otros: _______

---

### 4.3. Verificar Parsing Correcto

**Ejecutar** (para ver orden detallada):

```
/orderinfo <order-id>
```

**Ejemplo**:
```
/orderinfo abc123def456
```

**Verificar Output Detallado**:

```
Order ID: abc123def456789...
Type: 📗 BUY
Amount: 100 USD (10000 sats)
Premium: +2%
Payment Method: bank transfer
Status: pending
Network: mainnet          ← ✅ Verificar presente
Layer: lightning          ← ✅ Verificar presente
Created: 2025-11-06 10:30:00
Expires: 2025-11-06 22:30:00
Mostro: 1a2b3c4d5e6f...
```

**Criterio de Éxito**:
- ✅ Todos los campos se muestran
- ✅ Network y Layer presentes
- ✅ Fechas son válidas
- ✅ Montos coinciden con tipo de orden

---

## 🔬 FASE 5: Inspección de Eventos Raw

### 5.1. Inspeccionar Evento en Console

**En Console**, buscar:

```javascript
Discovery: Processing order event 1a2b3c4d...
```

**Expandir el objeto event** y verificar estructura:

```json
{
  "id": "1a2b3c4d5e6f7g8h...",
  "kind": 38383,              // ✅ Verificar = 38383
  "pubkey": "5e6f7g8h...",
  "created_at": 1730000000,
  "tags": [
    ["d", "abc123def456"],    // ✅ Order ID
    ["k", "buy"],             // ✅ Order type
    ["f", "USD"],             // ✅ Fiat currency
    ["s", "pending"],         // ✅ Status
    ["amt", "10000"],         // ✅ Satoshis
    ["fa", "100"],            // ✅ Fiat amount
    ["pm", "bank transfer"],  // ✅ Payment method
    ["premium", "2"],         // ✅ Premium
    ["expiration", "1730100000"], // ✅ Expiration
    ["network", "mainnet"],   // ✅ Network tag
    ["layer", "lightning"],   // ✅ Layer tag (opcional)
    ["y", "mostrop2p"],       // ✅ Marketplace tag
    ["z", "order"]            // ✅ Event type tag
  ],
  "content": "",              // ✅ Debe estar vacío
  "sig": "..."
}
```

**Verificar Tags Presentes**:

Requeridos:
- [ ] `d` - Order ID
- [ ] `k` - Order type
- [ ] `f` - Fiat currency
- [ ] `s` - Status
- [ ] `amt` - Amount sats
- [ ] `fa` - Fiat amount
- [ ] `pm` - Payment method
- [ ] `premium` - Premium %
- [ ] `expiration` - Timestamp
- [ ] `y` - "mostrop2p"
- [ ] `z` - "order"

Opcionales (pueden no estar todos):
- [ ] `network` - mainnet/testnet
- [ ] `layer` - lightning/onchain
- [ ] `source` - Source URL
- [ ] `rating` - User rating
- [ ] `name` - Display name
- [ ] `g` - Geohash
- [ ] `bond` - Fidelity bond

**Criterio de Éxito**:
- ✅ Kind = 38383
- ✅ Todos los tags requeridos presentes
- ✅ Content = "" (vacío)
- ✅ Signature válida

---

## 📊 FASE 6: Análisis de Estadísticas

### 6.1. Comando /stats

**Ejecutar**:

```
/stats
```

**Observar Output** (esperado):

```
=== ESTADÍSTICAS DE MOSTRO ===

Órdenes Descubiertas:
  Total: X órdenes
  Órdenes de compra: Y
  Órdenes de venta: Z
  Órdenes activas: A
  Órdenes pendientes: B

Instancias Mostro:
  Total: C instancias
  Activas: D

Monedas:
  USD: X órdenes
  EUR: Y órdenes
  ARS: Z órdenes
  CUP: W órdenes

Eventos Procesados:
  Total eventos: X
  Eventos válidos: Y
  Eventos inválidos: Z
  EOSE recibido: ✓
```

**Documentar Estadísticas**:

| Categoría | Cantidad |
|-----------|----------|
| Total órdenes | X |
| Órdenes BUY | Y |
| Órdenes SELL | Z |
| Instancias Mostro | W |
| Monedas diferentes | A |
| Métodos de pago diferentes | B |

---

## 🧪 FASE 7: Testing de Filtros

### 7.1. Filtrar por Tipo de Orden

**Ejecutar**:

```
/listorders buy
```

**Verificar**:
- ✅ Solo muestra órdenes de COMPRA (📗)
- ✅ No aparecen órdenes de VENTA (📕)

**Ejecutar**:

```
/listorders sell
```

**Verificar**:
- ✅ Solo muestra órdenes de VENTA (📕)
- ✅ No aparecen órdenes de COMPRA (📗)

---

### 7.2. Filtrar por Moneda

**Ejecutar**:

```
/listorders USD
```

**Verificar**:
- ✅ Solo muestra órdenes en USD
- ✅ No aparecen otras monedas

**Probar con otras monedas**:

```
/listorders EUR
/listorders ARS
```

---

### 7.3. Filtro Combinado

**Ejecutar**:

```
/listorders buy USD
```

**Verificar**:
- ✅ Solo órdenes de COMPRA
- ✅ Solo en USD
- ✅ Otras monedas y tipos filtrados

---

## 🔄 FASE 8: Testing de Refresh

### 8.1. Comando /refresh

**Ejecutar**:

```
/refresh
```

**Observar**:

```
Actualizando órdenes desde relays...

Escaneando relays...

✓ Órdenes refrescadas
Encontradas X órdenes de Y instancias Mostro
  Órdenes de compra: A
  Órdenes de venta: B

Usa /listorders para ver órdenes
```

**Criterio de Éxito**:
- ✅ Discovery se reinicia
- ✅ Contador de órdenes se actualiza
- ✅ Órdenes aparecen de nuevo

---

## 📸 FASE 9: Documentación de Resultados

### 9.1. Capturas de Pantalla Requeridas

**Tomar capturas de**:

1. **Terminal tras /discover**
   - Mostrando "Conectado a X/6 relays"
   - Mostrando "Encontradas X órdenes"

2. **Output de /listorders**
   - Mostrando lista completa de órdenes
   - Con network tags visibles

3. **Console del navegador**
   - Mostrando logs de Discovery
   - Mostrando eventos recibidos

4. **Detalle de una orden** (/orderinfo)
   - Mostrando todos los campos
   - Con network y layer visibles

5. **Evento raw expandido**
   - Mostrando tags array completo
   - Mostrando kind 38383

---

### 9.2. Logs a Copiar

**De Console del Navegador**:

```
// Copiar sección completa desde:
Discovery: Starting order discovery...
// Hasta:
Discovery: Found X orders from Y Mostro instances
```

**Del Terminal de MostroWeb**:

```
// Copiar output completo de /listorders
```

---

## ✅ CRITERIOS DE ÉXITO GLOBAL

### Mínimos Aceptables

- ✅ Al menos **3/6 relays** conectados
- ✅ Al menos **1 orden** encontrada
- ✅ **Kind 38383** en todos los eventos
- ✅ **Todos los tags requeridos** presentes
- ✅ **Network tag** visible en UI
- ✅ **Content vacío** en eventos
- ✅ **Parsing correcto** de todos los campos

### Óptimos

- ✅ **6/6 relays** conectados
- ✅ **10+ órdenes** encontradas
- ✅ **Multiple instancias Mostro** (3+)
- ✅ **Variedad de monedas** (USD, EUR, ARS, CUP)
- ✅ **Range orders** presentes
- ✅ **Refresh funciona** correctamente
- ✅ **Filtros funcionan** correctamente

---

## 🐛 TROUBLESHOOTING

### Problema: No se conecta a relays

**Síntoma**: "Error al conectar con relays"

**Solución**:
1. Verificar conexión a internet
2. Verificar que los relays están en línea:
   ```bash
   # Probar con websocat
   websocat wss://relay.damus.io
   ```
3. Verificar console del navegador para errores WebSocket

---

### Problema: No encuentra órdenes

**Síntoma**: "No hay órdenes disponibles"

**Posibles Causas**:
1. **No hay órdenes en mainnet actualmente**
   - Solución: Normal, esperar o crear orden de prueba

2. **Filtro demasiado restrictivo**
   - Verificar filtro en discovery.js
   - Temporalmente remover filtro de network

3. **Relays no responden**
   - Verificar en console que llegaron eventos EOSE
   - Probar /refresh

---

### Problema: Parsing incorrecto

**Síntoma**: Campos vacíos o "N/A" en órdenes

**Solución**:
1. Inspeccionar evento raw en console
2. Verificar que todos los tags están presentes
3. Comparar con estructura esperada en NIP-69
4. Reportar como bug si la estructura es válida

---

## 📝 TEMPLATE DE REPORTE

```markdown
# Reporte de Testing en Vivo - Mainnet

**Fecha**: 2025-11-06
**Ejecutado por**: [Tu nombre]
**Branch**: claude/execute-mainnet-live-test-011CUs2TMYGDRZyg2NshntWp

## Resultados de Discovery

- Relays conectados: X/6
- Órdenes encontradas: X
- Instancias Mostro: Y
- Eventos procesados: Z
- Eventos válidos: A
- Eventos inválidos: B

## Relays Status

- wss://relay.mostro.network: ✅/❌
- wss://relay.damus.io: ✅/❌
- wss://nostr-pub.wellorder.net: ✅/❌
- wss://nos.lol: ✅/❌
- wss://relay.snort.social: ✅/❌
- wss://relay.nostr.band: ✅/❌

## Órdenes Verificadas

### Orden 1
- ID: abc123...def456
- Tipo: BUY/SELL
- Monto: 100 USD (10000 sats)
- Premium: +2%
- Payment: bank transfer
- Network: mainnet ✅
- Layer: lightning ✅

### Orden 2
[...]

## Monedas Encontradas

- USD: X órdenes
- EUR: Y órdenes
- ARS: Z órdenes
- CUP: W órdenes

## Métodos de Pago Encontrados

- bank transfer: X órdenes
- face to face: Y órdenes
- [...]

## Verificación de Parsing

- ✅ Kind 38383 correcto
- ✅ Todos los tags requeridos presentes
- ✅ Content vacío
- ✅ Network tag visible en UI
- ✅ Range orders parseados correctamente

## Issues Encontrados

1. [Descripción de issue]
2. [...]

## Conclusión

[✅ ÉXITO / ❌ FALLÓ / ⚠️ PARCIAL]

[Descripción de conclusión]
```

---

## 🚀 PRÓXIMOS PASOS

Tras completar este testing:

1. **Documentar resultados** usando el template
2. **Guardar capturas** en carpeta `/docs/testing/`
3. **Crear issue** si se encuentran bugs
4. **Actualizar MAINNET_STATUS_REPORT.md** con resultados reales
5. **Proceder con testing de creación de órdenes** (si discovery exitoso)

---

**Última actualización**: 2025-11-06
**Versión**: 1.0
