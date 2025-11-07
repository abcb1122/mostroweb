# 📦 Instrucciones de Deployment - MostroWeb

Guía completa para hacer deployment de MostroWeb a GitHub Pages.

## 🎯 Configuración Inicial (Solo una vez)

### Paso 1: Configurar GitHub Pages

1. Ve a tu repositorio en GitHub: `https://github.com/abcb1122/mostroweb`
2. Click en **Settings** → **Pages** (menú izquierdo)
3. En **"Source"**, selecciona:
   - **Branch:** `claude/gh-pages-011CUsiYfnuWePiXwGKf7uJK`
   - **Folder:** `/ (root)`
4. Click **"Save"**
5. Espera 1-3 minutos

### Paso 2: Verificar Deployment

Abre en tu navegador: **https://abcb1122.github.io/mostroweb/**

✅ **Deberías ver:**
- Terminal UI con tema verde retro
- Header "MOSTRO P2P TERMINAL"
- Prompt `mostro>` activo
- Sin errores en DevTools Console (F12)

---

## 🚀 Deployments Futuros (Automático)

### Opción 1: Script Automático (Recomendado)

Usa el script `deploy.sh` para automatizar todo el proceso:

```bash
# Deploy con mensaje automático (timestamp)
./deploy.sh

# Deploy con mensaje personalizado
./deploy.sh "Fix bug en comando /status"
./deploy.sh "Add new theme cyberpunk"
./deploy.sh "Update nostr relay list"
```

**El script automáticamente:**
1. ✅ Guarda tu branch actual
2. ✅ Cambia a branch de deployment
3. ✅ Copia archivos de `src/` a raíz
4. ✅ Crea commit con mensaje
5. ✅ Push a GitHub
6. ✅ Regresa a tu branch original

---

### Opción 2: Manual (Paso a paso)

Si prefieres hacerlo manualmente:

```bash
# 1. Guardar tu branch actual
CURRENT_BRANCH=$(git branch --show-current)

# 2. Cambiar a branch de deployment
git checkout claude/gh-pages-011CUsiYfnuWePiXwGKf7uJK

# 3. Copiar archivos actualizados
cp -rf src/* .

# 4. Verificar cambios
git status

# 5. Commit
git add .
git commit -m "Deploy: Tu mensaje aquí"

# 6. Push a GitHub
git push origin claude/gh-pages-011CUsiYfnuWePiXwGKf7uJK

# 7. Regresar a tu branch
git checkout $CURRENT_BRANCH
```

---

## 📋 Workflow Típico de Desarrollo

### Escenario: Agregar nueva feature

```bash
# 1. Desarrollar en branch main o feature branch
git checkout main
# ... hacer cambios en src/ ...

# 2. Probar localmente
npm run dev
# Abrir http://localhost:3000

# 3. Commit tus cambios
git add src/
git commit -m "Add: New feature X"
git push origin main

# 4. Deploy a producción
./deploy.sh "Add new feature X"

# 5. Verificar en producción (espera 2-3 min)
# Abrir https://abcb1122.github.io/mostroweb/
```

---

## 🔍 Verificación Post-Deployment

### Checklist de Verificación:

**1. GitHub Status:**
- [ ] Ve a: `https://github.com/abcb1122/mostroweb/deployments`
- [ ] Último deployment debe mostrar ✅ "Success"
- [ ] Timestamp debe ser reciente

**2. Sitio Web:**
- [ ] Abre: `https://abcb1122.github.io/mostroweb/`
- [ ] Página carga sin 404
- [ ] Terminal UI visible correctamente
- [ ] CSS y themes funcionan

**3. DevTools Console (F12):**
- [ ] Sin errores "Failed to load resource"
- [ ] Sin errores "Module not found"
- [ ] Logs de MostroWeb inicializan correctamente

**4. Funcionalidad Básica:**
```
Comandos a probar:
- /help      → Debe mostrar lista de comandos
- /version   → Debe mostrar v1.0.0
- /theme amber → Debe cambiar color
- /clear     → Debe limpiar terminal
```

---

## 🛠️ Troubleshooting

### Problema: 404 Not Found

**Solución:**
1. Verifica configuración en Settings → Pages
2. Asegúrate que branch sea `claude/gh-pages-011CUsiYfnuWePiXwGKf7uJK`
3. Espera 2-3 minutos después del push
4. Hard refresh: `Ctrl + Shift + R` (o `Cmd + Shift + R` en Mac)

### Problema: CSS no carga (página sin estilos)

**Solución:**
1. Verifica que archivos CSS estén en branch deployment:
   ```bash
   git checkout claude/gh-pages-011CUsiYfnuWePiXwGKf7uJK
   ls -la css/
   ```
2. Debe mostrar: `components.css`, `reset.css`, `terminal.css`, `themes.css`
3. Si faltan, ejecuta: `./deploy.sh`

### Problema: JavaScript no funciona

**Solución:**
1. Abre DevTools Console (F12)
2. Busca errores CORS o "Module not found"
3. Verifica que archivos JS estén en branch:
   ```bash
   git checkout claude/gh-pages-011CUsiYfnuWePiXwGKf7uJK
   ls -la js/
   ```
4. Debe tener carpetas: `core/`, `models/`, `mostro/`, `ui/`, `utils/`

### Problema: "Site not published" después de 10 min

**Posibles causas:**

1. **Repo privado sin GitHub Pro:**
   - GitHub Pages gratis solo funciona con repos públicos
   - Solución: Hacer repo público en Settings → General → Danger Zone

2. **Branch sin commits:**
   ```bash
   git log claude/gh-pages-011CUsiYfnuWePiXwGKf7uJK
   # Debe mostrar commits
   ```

3. **GitHub Pages deshabilitado:**
   - Ve a Settings → Pages
   - Verifica que no diga "GitHub Pages is disabled"

### Problema: Deploy script falla con error

**Síntomas:**
```
❌ Push failed
```

**Solución:**
1. Verifica conexión a internet
2. Verifica credenciales de Git
3. Intenta push manual:
   ```bash
   git checkout claude/gh-pages-011CUsiYfnuWePiXwGKf7uJK
   git push origin claude/gh-pages-011CUsiYfnuWePiXwGKf7uJK
   ```

---

## 📊 Comandos Útiles

### Ver deployments recientes
```bash
git log claude/gh-pages-011CUsiYfnuWePiXwGKf7uJK --oneline -5
```

### Ver diferencias entre dev y production
```bash
git diff main claude/gh-pages-011CUsiYfnuWePiXwGKf7uJK --stat
```

### Ver archivos en production
```bash
git ls-tree -r claude/gh-pages-011CUsiYfnuWePiXwGKf7uJK --name-only
```

### Forzar re-deployment (si GitHub no detectó cambios)
```bash
git checkout claude/gh-pages-011CUsiYfnuWePiXwGKf7uJK
git commit --amend --no-edit
git push -f origin claude/gh-pages-011CUsiYfnuWePiXwGKf7uJK
git checkout main
```

---

## 🎯 Best Practices

1. **✅ Siempre probar localmente antes de deploy:**
   ```bash
   npm run dev
   # Verificar que todo funciona en localhost:3000
   ```

2. **✅ Usar mensajes de commit descriptivos:**
   ```bash
   ./deploy.sh "Fix: Corregir bug en keyManager"
   # NO: ./deploy.sh "update"
   ```

3. **✅ Verificar después de cada deploy:**
   - Espera 2-3 minutos
   - Abre sitio en incógnito (sin cache)
   - Prueba funcionalidad crítica

4. **✅ Mantener ramas sincronizadas:**
   ```bash
   # Deploy debe hacerse desde main actualizado
   git checkout main
   git pull origin main
   ./deploy.sh
   ```

5. **❌ NO editar archivos directamente en branch deployment:**
   - Siempre edita en `src/` en branch main
   - Usa `./deploy.sh` para copiar a deployment

---

## 📞 Soporte

Si encuentras problemas:

1. Revisa este documento de troubleshooting
2. Verifica [GitHub Pages Status](https://www.githubstatus.com/)
3. Consulta [GitHub Pages docs](https://docs.github.com/en/pages)

---

**Última actualización:** 2025-11-07
**Branch de deployment:** `claude/gh-pages-011CUsiYfnuWePiXwGKf7uJK`
**URL del sitio:** https://abcb1122.github.io/mostroweb/
