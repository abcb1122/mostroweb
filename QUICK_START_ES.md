# 🚀 Inicio Rápido - MostroWeb

**Guía de 5 minutos para comenzar a tradear Bitcoin P2P sin KYC**

---

## 👋 Bienvenido

MostroWeb te permite **comprar y vender Bitcoin sin intermediarios**, directamente con otras personas de toda Latinoamérica, usando tus métodos de pago locales favoritos.

**Ventajas**:
- 🔒 **Sin KYC**: No necesitas dar tu identidad
- 💰 **Sin custodio**: Tú controlas tus claves
- 🌍 **Para LATAM**: Soporta ARS, USD, EUR, CUP y más
- ⚡ **Lightning**: Pagos instantáneos
- 🛡️ **Escrow automático**: Fondos protegidos durante el trade

---

## ⚡ 3 Pasos para Empezar

### Paso 1: Abrir MostroWeb

```bash
# Si ya lo instalaste:
npm run dev

# Luego abre en tu navegador:
http://localhost:3000
```

¡Verás un wizard de bienvenida automático! 🎉

---

### Paso 2: Verificar que Todo Funciona

**Ejecuta el auto-test** (toma 5 segundos):

```
/testconnection
```

**Qué verás**:
```
═══════════════════════════════════════
   🧪 AUTO-TEST DE CONEXIÓN MOSTRO
═══════════════════════════════════════

🌐 FASE 1: Probando conexión a relays...
✅ Conectado a 6/6 relays

🔍 FASE 2: Descubriendo órdenes Mostro...
✅ Encontradas 15 órdenes
   📗 Compra: 8
   📕 Venta: 7

✅ FASE 3: Verificando compatibilidad NIP-69...
✅ Compatible con Mostro!

═══════════════════════════════════════
   ✅ COMPATIBLE CON MOSTRO
═══════════════════════════════════════
```

✅ **Si ves esto, estás listo!**

⚠️ **Si hay problemas**, el comando te dirá exactamente qué hacer.

---

### Paso 3: Crear Tu Identidad

```
/start
```

**Qué hace**: Genera automáticamente una identidad Nostr (es como un usuario anónimo).

**Importante**: Guarda tu clave privada (`nsec...`) en un lugar seguro. Es como tu contraseña maestra.

---

## 💸 Caso de Uso #1: Comprar Bitcoin

**Situación**: Quieres comprar Bitcoin con pesos argentinos via MercadoPago

### Paso por Paso:

```bash
# 1. Buscar órdenes disponibles
/discover

# 2. Ver órdenes en ARS (pesos argentinos)
/listorders sell ARS

# 3. Verás algo como:
📕 SELL | 100-500 ARS range (+1%)  | mercadopago | [mainnet] | abc123...

# 4. Tomar la orden que te guste
/takesell abc123def456

# 5. Seguir las instrucciones del Mostro daemon:
#    - Te pedirá tu Lightning invoice
#    - Enviarás los pesos via MercadoPago
#    - Recibirás Bitcoin instantáneamente!
```

**Tiempo total**: 5-10 minutos ⚡

---

## 💰 Caso de Uso #2: Vender Bitcoin

**Situación**: Tienes Bitcoin y necesitas dólares en Strike

### Paso por Paso:

```bash
# 1. Crear orden de venta
/neworder sell 100 USD Strike

# 2. Esperar que alguien tome tu orden
#    (Recibirás notificación automática)

# 3. El daemon Mostro te pedirá pagar una hold invoice
#    (tus Bitcoin quedan en escrow)

# 4. Cuando el comprador envíe los USD a tu Strike:
#    Verificas en tu cuenta

# 5. Liberar el Bitcoin al comprador
/release <order-id>

# 6. ✅ Trade completado!
```

**Tiempo total**: 10-15 minutos 💸

---

## 🌎 Ejemplos por País

### 🇦🇷 Argentina

**Moneda**: ARS (Pesos)
**Métodos de pago comunes**:
- MercadoPago
- Banco (transferencia)
- Efectivo (face to face en CABA/GBA)

**Ejemplo - Comprar Bitcoin**:
```bash
/listorders sell ARS
/takesell <order-id>
# Envías pesos via MercadoPago
# Recibes Bitcoin en tu wallet Lightning
```

---

### 🇻🇪 Venezuela

**Moneda**: USD (dolarizado)
**Métodos de pago comunes**:
- Zelle
- PayPal
- Reserve
- Binance P2P

**Ejemplo - Vender Bitcoin**:
```bash
/neworder sell 50 USD Zelle
# Esperas comprador
# Recibes USD en tu Zelle
# Liberas Bitcoin
```

---

### 🇨🇺 Cuba

**Moneda**: CUP, USD
**Métodos de pago comunes**:
- Transfermovil
- Efectivo
- Western Union

**Ejemplo**:
```bash
/listorders buy CUP
/takebuy <order-id>
# Te pagan en CUP
# Entregas Bitcoin
```

---

### 🇲🇽 México

**Moneda**: MXN, USD
**Métodos de pago comunes**:
- SPEI (transferencia bancaria)
- Efectivo
- OXXO

**Ejemplo**:
```bash
/neworder buy 1000 MXN SPEI
```

---

### 🇪🇸 España / 🇪🇺 Europa

**Moneda**: EUR
**Métodos de pago comunes**:
- SEPA (transferencia bancaria)
- Bizum
- Revolut
- Wise

**Ejemplo**:
```bash
/listorders sell EUR
/takesell <order-id>
# Envías EUR via Bizum
# Recibes Bitcoin
```

---

## 📱 Comandos Esenciales

### Para Ver Información

```bash
/status          # Ver estado del sistema
/testconnection  # Probar conexión (auto-test)
/testingguide    # Ver guía paso a paso
/help            # Ver todos los comandos
```

### Para Descubrir Órdenes

```bash
/discover        # Buscar órdenes en la red
/listorders      # Ver todas las órdenes
/listorders buy  # Solo órdenes de compra
/listorders USD  # Solo USD
```

### Para Tradear

```bash
/neworder buy 100 USD Strike    # Crear orden de compra
/neworder sell 50 EUR Bizum     # Crear orden de venta
/takebuy <order-id>             # Tomar orden de compra
/takesell <order-id>            # Tomar orden de venta
```

### Para Gestionar Trades

```bash
/addinvoice <id> <invoice>   # Añadir tu Lightning invoice
/fiatsent <order-id>         # Notificar envío de fiat
/release <order-id>          # Liberar Bitcoin (vendedor)
/cancel <order-id>           # Cancelar orden
```

### Utilidades

```bash
/mystats     # Ver tus estadísticas
/history     # Ver historial de notificaciones
/identity    # Ver tu identidad Nostr
/export      # Exportar backup de claves
```

---

## 🛡️ Consejos de Seguridad

### ✅ HAZ

- ✅ Guarda tu `nsec` (clave privada) en lugar seguro
- ✅ Empieza con cantidades pequeñas para probar
- ✅ Verifica que recibiste el fiat antes de liberar Bitcoin
- ✅ Usa el sistema de escrow (hold invoices)
- ✅ Haz backup de tu identidad con `/export`

### ❌ NO HAGAS

- ❌ No compartas tu `nsec` (clave privada) con nadie
- ❌ No saltees el paso de verificar el fiat recibido
- ❌ No liberes Bitcoin sin confirmar pago
- ❌ No uses para grandes cantidades sin experiencia previa
- ❌ No confíes en traders sin reputación para grandes sumas

---

## 🆘 ¿Problemas?

### No se conecta a relays

```bash
# Prueba el auto-test
/testconnection

# Verifica tu internet
# Prueba refrescar
/refresh
```

### No encuentra órdenes

**Normal**: Puede que no haya órdenes activas en este momento en mainnet.

```bash
# Intenta crear tu propia orden
/neworder sell 50 USD Strike

# O espera y refresca
/refresh
```

### Olvidé mi clave privada

⚠️ **Sin la clave privada no puedes recuperar tu identidad.**

**Prevención**: Siempre haz backup:
```bash
/export
# Copia el nsec... y guárdalo
```

### El trade no avanza

1. Revisa `/history` para ver notificaciones del daemon
2. Verifica `/mystats` para ver estado de tus órdenes
3. Si hay problema, contacta soporte o reporta issue

---

## 📚 Más Información

### Guías Completas

- **Tutorial Interactivo**: `/tutorial` (dentro de MostroWeb)
- **Guía de Testing**: `/testingguide`
- **README Completo**: [README_ES.md](README_ES.md)

### Documentación Técnica

- **Protocolo Mostro**: https://mostro.network/protocol
- **Nostr NIPs**: https://github.com/nostr-protocol/nips
- **Lightning Network**: https://lightning.network

### Comunidad

- **GitHub Issues**: [Reportar bugs](https://github.com/abcb1122/mostroweb/issues)
- **Telegram Mostro**: https://t.me/mostro_p2p (si existe)
- **Nostr**: Busca #mostro #p2p

---

## 🎯 Próximos Pasos

Ya que sabes lo básico:

1. **Prueba con cantidades pequeñas** ($10-20 USD equivalente)
2. **Experimenta con diferentes métodos de pago**
3. **Construye reputación** completando trades exitosos
4. **Ayuda a otros** compartiendo tu experiencia
5. **Contribuye** al proyecto si eres dev

---

## 💡 Tips para LATAM

### Mejores Prácticas por País

**Argentina (inflación alta)**:
- Usa premium positivo al vender (+2% a +5%)
- Actualiza precios frecuentemente
- MercadoPago es el más común

**Venezuela (dolarizado)**:
- USD es estándar, no bolívares
- Zelle muy popular
- Considera Reserve o Binance P2P

**España (Europa)**:
- EUR via SEPA (puede tardar 1-2 días)
- Bizum es instantáneo (mejor para montos pequeños)
- Revolut/Wise muy comunes

**Cuba (restricciones)**:
- CUP para local, USD para remesas
- Transfermovil más usado
- Efectivo en persona también común

### Premium Típicos

- **Comprar Bitcoin**: -1% a -3% (pagas menos que precio spot)
- **Vender Bitcoin**: +1% a +5% (cobras más que precio spot)
- **Monedas volátiles**: +5% a +10%
- **Efectivo en persona**: +3% a +8% (por riesgo)

---

## ✨ ¡Listo para Tradear!

```bash
# Ejecuta esto ahora:
/testconnection

# Si ves ✅ COMPATIBLE CON MOSTRO
# Estás listo para tu primer trade!

# Empieza descubriendo órdenes:
/discover

# ¡Buena suerte! 🚀
```

---

**¿Preguntas?** Abre un issue en GitHub o consulta la documentación completa.

**¿Te gusta MostroWeb?** ⭐ Dale una estrella en [GitHub](https://github.com/abcb1122/mostroweb)

---

<p align="center">
  <sub>MostroWeb - P2P Bitcoin para Latinoamérica 🌎⚡</sub>
</p>
