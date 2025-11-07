# ✅ Checklist de Testing en Vivo - MostroWeb Mainnet

**Branch**: claude/execute-mainnet-live-test-011CUs2TMYGDRZyg2NshntWp
**Fecha**: _______________

---

## PRE-REQUISITOS

- [ ] Node.js >= 16.x instalado
- [ ] Dependencias instaladas (`npm install`)
- [ ] Build exitoso (`npm run build`)
- [ ] DevTools del navegador abierto (F12)
- [ ] Conexión a internet estable

---

## CONFIGURACIÓN VERIFICADA

- [ ] `constants.js` tiene 6 relays configurados
- [ ] `wss://relay.mostro.network` está en primera posición
- [ ] `discovery.js` tiene filtro `#network: ['mainnet']`
- [ ] Kind 38383 configurado correctamente

---

## FASE 1: INICIO

- [ ] `npm run dev` ejecutado exitosamente
- [ ] Servidor corriendo en http://localhost:3000
- [ ] Página carga sin errores
- [ ] Console muestra "MostroWeb v1.0.0 initialized"

---

## FASE 2: DISCOVERY

### Comando /discover

- [ ] Comando ejecutado: `/discover`
- [ ] Mensaje: "Conectando a relays..."
- [ ] Mensaje: "✓ Conectado a X/6 relays"
- [ ] Mensaje: "✓ Búsqueda de órdenes iniciada"
- [ ] No hay errores en console

### Conexión a Relays

- [ ] wss://relay.mostro.network conectado
- [ ] wss://relay.damus.io conectado
- [ ] wss://nostr-pub.wellorder.net conectado
- [ ] wss://nos.lol conectado
- [ ] wss://relay.snort.social conectado
- [ ] wss://relay.nostr.band conectado

Conectados: ___/6

### Resultados

- [ ] EOSE recibido en console
- [ ] Mensaje final con cantidad de órdenes
- [ ] Órdenes encontradas: ___

---

## FASE 3: LISTAR ÓRDENES

### Comando /listorders

- [ ] Comando ejecutado: `/listorders`
- [ ] Header mostrado: "=== ÓRDENES DE MOSTRO ==="
- [ ] Órdenes listadas con formato correcto
- [ ] Network tag `[mainnet]` visible
- [ ] Emojis correctos (📗/📕)

### Verificar Campos en UI

Para cada orden visible:

- [ ] Order ID (8...8 formato)
- [ ] Tipo (BUY/SELL)
- [ ] Monto y moneda
- [ ] Satoshis entre paréntesis
- [ ] Premium (+X% o -X%)
- [ ] Método de pago
- [ ] Network tag

---

## FASE 4: DETALLE DE ORDEN

### Comando /orderinfo

- [ ] Comando ejecutado: `/orderinfo <order-id>`
- [ ] Order ID mostrado completo
- [ ] Type mostrado con emoji
- [ ] Amount correcto
- [ ] Premium correcto
- [ ] Payment Method legible
- [ ] Status presente
- [ ] **Network**: mainnet ← VERIFICAR
- [ ] **Layer**: lightning ← VERIFICAR
- [ ] Created date válido
- [ ] Expires date válido
- [ ] Mostro pubkey visible

---

## FASE 5: EVENTO RAW

### En Console del Navegador

- [ ] Encontrado log: "Processing order event..."
- [ ] Evento expandido

### Verificar Estructura

- [ ] `kind`: 38383
- [ ] `content`: "" (vacío)
- [ ] `tags` es un array

### Tags Requeridos (11)

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

### Tags Opcionales

- [ ] `network` - mainnet/testnet
- [ ] `layer` - lightning/onchain
- [ ] Otros tags opcionales: ___

---

## FASE 6: FILTROS

### Por Tipo

- [ ] `/listorders buy` - solo BUY
- [ ] `/listorders sell` - solo SELL

### Por Moneda

- [ ] `/listorders USD` - solo USD
- [ ] `/listorders EUR` - solo EUR (si hay)
- [ ] `/listorders ARS` - solo ARS (si hay)

### Combinado

- [ ] `/listorders buy USD` - solo BUY+USD

---

## FASE 7: ESTADÍSTICAS

### Comando /stats

- [ ] Comando ejecutado: `/stats`
- [ ] Total órdenes mostrado
- [ ] Órdenes buy/sell separadas
- [ ] Instancias Mostro mostradas
- [ ] Monedas listadas
- [ ] Eventos procesados mostrados

---

## FASE 8: REFRESH

### Comando /refresh

- [ ] Comando ejecutado: `/refresh`
- [ ] Mensaje: "Actualizando órdenes..."
- [ ] Discovery se reinicia
- [ ] Mensaje final con nuevas estadísticas
- [ ] Órdenes actualizadas: ___

---

## DATOS RECOPILADOS

### Estadísticas Generales

- Relays conectados: ___/6
- Órdenes encontradas: ___
- Instancias Mostro: ___
- Eventos procesados: ___
- Eventos válidos: ___
- Eventos inválidos: ___

### Por Tipo

- Órdenes BUY: ___
- Órdenes SELL: ___

### Por Moneda

- USD: ___
- EUR: ___
- ARS: ___
- CUP: ___
- Otras: ___

### Métodos de Pago Encontrados

- [ ] bank transfer
- [ ] face to face
- [ ] revolut
- [ ] wise
- [ ] strike
- [ ] mercadopago
- [ ] Otros: _______________

### Range Orders

- Range orders encontradas: ___

---

## CAPTURAS TOMADAS

- [ ] Screenshot: Terminal tras /discover
- [ ] Screenshot: Output de /listorders
- [ ] Screenshot: Console del navegador
- [ ] Screenshot: Detalle de orden (/orderinfo)
- [ ] Screenshot: Evento raw expandido

---

## LOGS COPIADOS

- [ ] Logs de conexión a relays
- [ ] Logs de discovery completo
- [ ] Output de /listorders
- [ ] Output de /orderinfo
- [ ] Evento raw JSON completo

---

## ISSUES ENCONTRADOS

### Issue #1
- Descripción: _______________
- Severidad: [ ] Crítico [ ] Medio [ ] Bajo

### Issue #2
- Descripción: _______________
- Severidad: [ ] Crítico [ ] Medio [ ] Bajo

### Issue #3
- Descripción: _______________
- Severidad: [ ] Crítico [ ] Medio [ ] Bajo

---

## CRITERIOS DE ÉXITO

### Mínimos

- [ ] ✅ 3+/6 relays conectados
- [ ] ✅ 1+ orden encontrada
- [ ] ✅ Kind 38383 correcto
- [ ] ✅ Tags requeridos presentes
- [ ] ✅ Network tag visible
- [ ] ✅ Content vacío
- [ ] ✅ Parsing correcto

### Óptimos

- [ ] ✅ 6/6 relays conectados
- [ ] ✅ 10+ órdenes
- [ ] ✅ 3+ instancias Mostro
- [ ] ✅ Múltiples monedas
- [ ] ✅ Range orders presentes
- [ ] ✅ Refresh funciona
- [ ] ✅ Filtros funcionan

---

## RESULTADO FINAL

- [ ] ✅ ÉXITO COMPLETO
- [ ] ⚠️ PARCIAL (especificar)
- [ ] ❌ FALLÓ (especificar)

**Notas Finales**:
_______________________________________________
_______________________________________________
_______________________________________________

---

**Tester**: _______________
**Fecha**: _______________
**Duración**: ___ minutos
**Firma**: _______________
