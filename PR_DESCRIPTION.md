# Pull Request: Fix Text Selection

## 🐛 Problema Resuelto

El texto en la aplicación MostroWeb **NO era seleccionable/copiable** a pesar de tener CSS con `user-select: text !important`.

## 🔍 Causa Raíz Identificada

El problema estaba en `js/ui/terminal.js`, específicamente en dos event listeners de JavaScript que interferían con la selección de texto:

1. **Click listener (líneas 66-72)** - Hacía focus en el input en CUALQUIER click del container
2. **Blur listener (líneas 74-77)** - Prevenía la pérdida de foco automáticamente

Estos listeners estaban interrumpiendo la selección de texto porque:
- Al hacer click para seleccionar → el listener hacía focus en el input
- Al intentar seleccionar → el input recuperaba el foco automáticamente
- Resultado: **imposible seleccionar texto**

## ✅ Solución Implementada

### Modificaciones en `js/ui/terminal.js`:

**1. Click Listener Inteligente (líneas 66-88)**
```javascript
// ANTES: Siempre hacía focus
container.addEventListener('click', () => {
  state.input.focus();
});

// AHORA: Detecta contexto antes de hacer focus
container.addEventListener('click', (e) => {
  const selection = window.getSelection();
  const hasTextSelected = selection && selection.toString().length > 0;
  const clickedOutput = e.target.closest('.terminal-output');
  const clickedInteractive = e.target.tagName === 'INPUT' || ...;

  // Solo hace focus si NO hay selección y NO se clickeó el output
  if (!hasTextSelected && !clickedOutput && !clickedInteractive) {
    state.input.focus();
  }
});
```

**2. Blur Listener Inteligente (líneas 90-108)**
```javascript
// ANTES: Siempre recuperaba focus
state.input.addEventListener('blur', () => {
  setTimeout(() => state.input.focus(), 100);
});

// AHORA: Solo recupera focus si NO hay selección activa
state.input.addEventListener('blur', (e) => {
  const relatedTarget = e.relatedTarget;
  const clickedOutput = relatedTarget && relatedTarget.closest('.terminal-output');

  setTimeout(() => {
    const selection = window.getSelection();
    const hasTextSelected = selection && selection.toString().length > 0;

    // Solo recupera focus si NO hay selección
    if (!hasTextSelected && !clickedOutput) {
      state.input.focus();
    }
  }, 100);
});
```

## 🎯 Resultado

- ✅ **Texto completamente seleccionable** en toda la aplicación
- ✅ **Comportamiento de terminal preservado** (auto-focus cuando no hay selección)
- ✅ **Compatible con botones "Copiar"** de las claves Nostr
- ✅ **UX mejorada** - usuarios pueden copiar npub/nsec fácilmente

## 🧪 Testing Manual Sugerido

1. Ejecutar `/start` para generar claves
2. Intentar seleccionar el npub/nsec con el mouse
3. Verificar que se puede copiar con Ctrl+C o botón derecho
4. Verificar que el terminal sigue funcionando normalmente (comandos, historial, etc.)

## 📝 Archivos Modificados

- `js/ui/terminal.js` - Event listeners con detección de selección de texto
  - 37 inserciones
  - 6 eliminaciones

---

**Commit:** e52c773
**Branch:** `claude/fix-text-selection-011CUow9xtRLX5otChuujdiT`
**Base Branch:** `main`
**Listo para merge** ✅
