# 🧪 MANUAL TESTING GUIDE - KeyManager

Esta guía te ayudará a verificar que el KeyManager funciona correctamente en el navegador.

## 🚀 PREPARACIÓN

### 1. Iniciar el servidor
```bash
npm start
```

El servidor debería iniciar en `http://localhost:3000`

### 2. Abrir en navegador
1. Abre Chrome/Firefox/Edge
2. Navega a: `http://localhost:3000`
3. Abre **DevTools Console** (F12 → Console)

### 3. Verificar carga sin errores

En la consola deberías ver:
```
✅ MostroWeb v0.1.0 - Starting...
✅ Main: Initializing KeyManager...
✅ KeyManager: Initialized successfully
✅ MostroWeb initialized successfully
```

**🔴 Si ves errores aquí, DETENERSE y reportar.**

---

## ✅ TEST 1: GENERAR NUEVA IDENTIDAD

### Objetivo
Verificar que se puede generar una nueva identidad con password.

### Pasos
1. En el terminal escribir: `/start`
2. Presionar Enter
3. **Debería pedir password:** "Enter password:"
4. Escribir password de prueba: `Test1234`
5. Presionar Enter
6. **Debería pedir confirmación:** "Confirm password:"
7. Escribir mismo password: `Test1234`
8. Presionar Enter

### Resultado Esperado
```
✓ New key pair generated successfully!

Your Nostr public key (npub):
npub1xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx

⚠️  BACKUP YOUR KEY
Use /export to show your private key for backup.
Without this backup, you cannot recover your identity!

✓ Session started. Ready to trade!
```

### Verificar en Console
```javascript
MostroWeb.KeyManager.getState()
```

Debería mostrar:
```javascript
{
  hasPassword: true,
  isUnlocked: true,
  hasPublicKey: true,
  tradeIndex: 0,
  hasCurrentTradeKey: false
}
```

### Verificar en localStorage
```javascript
localStorage.getItem('mostro_identity_key')
```

Debería mostrar un objeto JSON con:
- `encryptedPrivateKey`
- `publicKey` (npub)
- `publicKeyHex`
- `salt`
- `createdAt`
- `version`

### ✅ PASS / ❌ FAIL: _______

---

## ✅ TEST 2: COMANDO /IDENTITY

### Objetivo
Verificar que se muestra información de identidad correctamente.

### Pasos
1. Escribir: `/identity`
2. Presionar Enter

### Resultado Esperado
```
=== IDENTITY INFO ===

Status: 🟢 Unlocked

Public Key (npub):
npub1xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx

Public Key (hex):
abc123...

Trade Index: 0

Use /export to backup your private key.
```

### ✅ PASS / ❌ FAIL: _______

---

## ✅ TEST 3: COMANDO /LOCK

### Objetivo
Verificar que se puede bloquear la sesión.

### Pasos
1. Escribir: `/lock`
2. Presionar Enter

### Resultado Esperado
```
✓ Session locked. Keys cleared from memory.
Use /start to unlock again.
```

### Verificar en Console
```javascript
MostroWeb.KeyManager.getState()
```

Debería mostrar:
```javascript
{
  hasPassword: true,
  isUnlocked: false,  // ← DEBE SER FALSE
  hasPublicKey: true,
  tradeIndex: 0,
  hasCurrentTradeKey: false
}
```

### ✅ PASS / ❌ FAIL: _______

---

## ✅ TEST 4: UNLOCK IDENTIDAD EXISTENTE

### Objetivo
Verificar que se puede desbloquear con password correcto.

### Pasos
1. Escribir: `/start`
2. Presionar Enter
3. **Debería decir:** "Identity found. Unlocking session..."
4. Escribir password: `Test1234`
5. Presionar Enter

### Resultado Esperado
```
✓ Session unlocked successfully!
Logged in as: npub1xxxxxxxxxx...
Trade index: 0

Ready to create orders and trades.
```

### ✅ PASS / ❌ FAIL: _______

---

## ✅ TEST 5: PASSWORD INCORRECTO

### Objetivo
Verificar que rechaza password incorrecto.

### Pasos
1. Si está unlocked, ejecutar `/lock`
2. Escribir: `/start`
3. Presionar Enter
4. Escribir password INCORRECTO: `WrongPass123`
5. Presionar Enter

### Resultado Esperado
```
❌ Failed to start: Wrong password. Please try again.
```

La sesión debe permanecer **locked**.

### ✅ PASS / ❌ FAIL: _______

---

## ✅ TEST 6: COMANDO /EXPORT

### Objetivo
Verificar que se puede exportar la clave privada.

### Pasos (requiere sesión unlocked)
1. Si está locked, hacer `/start` con password correcto
2. Escribir: `/export`
3. Presionar Enter
4. **Debería pedir confirmación:** "Type 'I UNDERSTAND' to confirm:"
5. Escribir exactamente: `I UNDERSTAND`
6. Presionar Enter

### Resultado Esperado
```
=== PRIVATE KEY BACKUP ===

Your private key (nsec format):
nsec1xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx

Hex format (for advanced users):
abc123def456...

⚠️  Store this in a SAFE PLACE!
Recommended storage:
  • Password manager (encrypted vault)
  • Hardware wallet (if supported)
  • Paper backup in secure location
  • DO NOT store in plain text files or screenshots!
```

### Verificar: Copiar el nsec mostrado para usarlo en siguiente test

### ✅ PASS / ❌ FAIL: _______

---

## ✅ TEST 7: COMANDO /IMPORT

### Objetivo
Verificar que se puede importar una clave existente.

### Preparación
**⚠️ IMPORTANTE:** Este test BORRARÁ la identidad actual. Asegúrate de tener el nsec del test anterior.

### Pasos
1. Escribir: `/import`
2. Presionar Enter
3. **Debería advertir:** "Identity already exists! This will replace your current identity. Continue?"
4. Escribir: `yes`
5. Presionar Enter
6. **Debería pedir private key:** "Enter your private key:"
7. Pegar el nsec del test 6
8. Presionar Enter
9. **Debería pedir password:** "Enter password:"
10. Escribir nuevo password: `NewPass123`
11. Presionar Enter
12. Confirmar password: `NewPass123`
13. Presionar Enter

### Resultado Esperado
```
✓ Private key imported successfully!

Your public key (npub):
npub1xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx

⚠️  BACKUP REMINDER
If you lose your password, you'll need to re-import this key.
Keep your nsec in a safe place!

✓ Session started. Ready to trade!
```

### Verificar: El npub debe ser EL MISMO que antes (misma clave privada)

### ✅ PASS / ❌ FAIL: _______

---

## ✅ TEST 8: COMANDO /CHANGEPASS

### Objetivo
Verificar que se puede cambiar el password.

### Pasos
1. Asegurar que sesión está unlocked
2. Escribir: `/changepass`
3. Presionar Enter
4. **Debería pedir password actual:** "Enter current password:"
5. Escribir: `NewPass123`
6. Presionar Enter
7. **Debería pedir nuevo password:** "Enter new password:"
8. Escribir: `FinalPass456`
9. Presionar Enter
10. Confirmar: `FinalPass456`
11. Presionar Enter

### Resultado Esperado
```
✓ Password changed successfully!
Your private key has been re-encrypted.
```

### Verificar cambio
1. Ejecutar: `/lock`
2. Ejecutar: `/start`
3. Intentar con password viejo (`NewPass123`)
   - **Debe RECHAZAR** ❌
4. Ejecutar: `/start` nuevamente
5. Usar password nuevo (`FinalPass456`)
   - **Debe ACEPTAR** ✅

### ✅ PASS / ❌ FAIL: _______

---

## ✅ TEST 9: VERIFICAR ENCRIPTACIÓN EN LOCALSTORAGE

### Objetivo
Confirmar que la clave privada NO está visible en texto plano.

### Pasos
1. En Console, ejecutar:
```javascript
const data = JSON.parse(localStorage.getItem('mostro_identity_key'));
console.log('Encrypted private key:', data.encryptedPrivateKey);
console.log('Should start with:', data.encryptedPrivateKey.substring(0, 10));
```

### Resultado Esperado
- `encryptedPrivateKey` debe ser un string largo cifrado
- Debe empezar con `U2FsdGVkX1` (formato CryptoJS)
- **NO** debe contener `nsec1` o claves en texto plano

### ✅ PASS / ❌ FAIL: _______

---

## ✅ TEST 10: GENERAR TRADE KEY

### Objetivo
Verificar que se pueden generar trade keys.

### Pasos
1. Asegurar que sesión está unlocked
2. En Console, ejecutar:
```javascript
const tradeKey = MostroWeb.KeyManager.startNewTrade();
console.log('Trade key generated:', tradeKey);
```

### Resultado Esperado
```javascript
{
  publicKey: "abc123def456...",  // Hex format
  index: 1
}
```

### Verificar en estado
```javascript
MostroWeb.KeyManager.getState()
```

Debería mostrar:
```javascript
{
  hasPassword: true,
  isUnlocked: true,
  hasPublicKey: true,
  tradeIndex: 1,  // ← INCREMENTADO
  hasCurrentTradeKey: true  // ← AHORA TRUE
}
```

### ✅ PASS / ❌ FAIL: _______

---

## 📊 RESUMEN DE TESTS

| Test | Descripción | Resultado |
|------|-------------|-----------|
| 1 | Generar nueva identidad | ⬜ |
| 2 | Comando /identity | ⬜ |
| 3 | Comando /lock | ⬜ |
| 4 | Unlock con password correcto | ⬜ |
| 5 | Rechazar password incorrecto | ⬜ |
| 6 | Comando /export | ⬜ |
| 7 | Comando /import | ⬜ |
| 8 | Comando /changepass | ⬜ |
| 9 | Verificar encriptación | ⬜ |
| 10 | Generar trade key | ⬜ |

**Total PASS: ____ / 10**

---

## 🐛 ERRORES COMUNES

### Error: "KeyManager is not defined"
**Causa:** index.html no tiene el import de keyManager.js
**Fix:** Verificar que línea 97 de index.html tiene:
```html
<script type="module" src="js/core/keyManager.js"></script>
```

### Error: "Cannot read property 'init' of undefined"
**Causa:** KeyManager no se exporta correctamente
**Fix:** Verificar export en js/core/keyManager.js línea 734

### Error: "nostr-tools not loaded"
**Causa:** CDN de nostr-tools no cargó
**Fix:** Verificar conexión a internet y CDN en index.html línea 84

### Error: "CryptoJS is not defined"
**Causa:** CDN de CryptoJS no cargó
**Fix:** Verificar CDN en index.html línea 23

### Input no aparece cuando pide password
**Causa:** CSS no cargó o conflicto de estilos
**Fix:** Verificar que css/terminal.css tiene estilos de `.terminal-prompt-input`

---

## 📝 NOTAS

- Todos los tests deben ejecutarse en ORDEN
- NO refrescar la página entre tests (excepto si se indica)
- Guardar el nsec del test 6 para el test 7
- Verificar console por errores después de cada comando

---

**Fecha de creación:** 2025-10-29
**Versión:** 1.0
