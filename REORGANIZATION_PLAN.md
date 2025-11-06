# 📋 PLAN DE REORGANIZACIÓN PROFESIONAL - MostroWeb

## 🎯 OBJETIVO
Transformar la estructura actual en un repositorio profesional, organizado y accesible para la comunidad hispanohablante, especialmente LATAM.

---

## 📊 ANÁLISIS DE ESTRUCTURA ACTUAL

### Estructura Actual
```
mostroweb/
├── README.md
├── READMEv1.md
├── AI_AGENTS.md
├── KEYMANAGER_IMPLEMENTATION_PLAN.md
├── MANUAL_TESTING_GUIDE.md
├── NEXT_STEPS.md
├── ANALISIS_COMPLETO.md
├── PR_DESCRIPTION.md
├── package.json
├── server.js
├── index.html
├── .gitignore
├── .nojekyll
├── css/
│   ├── reset.css
│   ├── terminal.css
│   ├── components.css
│   └── themes.css
└── js/
    ├── main.js
    ├── core/ (keyManager, relayManager, storage)
    ├── mostro/ (discovery, messaging)
    ├── ui/ (terminal, commands, display)
    ├── models/ (Order, Mostro)
    └── utils/ (constants, logger, helpers, inputHelpers)
```

### Problemas Identificados
1. ❌ Documentación mezclada en raíz
2. ❌ No hay separación clara entre código fuente y docs
3. ❌ Falta documentación en español para usuarios
4. ❌ No hay guías de contribución
5. ❌ Falta estructura de testing
6. ❌ No hay assets organizados

---

## 🏗️ NUEVA ESTRUCTURA PROPUESTA

```
mostroweb/
├── 📄 README.md                    # Bilingüe (ES/EN) - Landing principal
├── 📄 README_ES.md                 # Documentación completa en español
├── 📄 README_EN.md                 # Complete documentation in English
├── 📄 LICENSE                      # MIT License
├── 📄 CODE_OF_CONDUCT.md           # Código de conducta
├── 📄 CONTRIBUTING.md              # Guía de contribución (EN)
├── 📄 CONTRIBUTING_ES.md           # Guía de contribución (ES)
├── 📄 CHANGELOG.md                 # Historial de cambios
├── 📄 ROADMAP.md                   # Plan de desarrollo
├── 📄 package.json                 # Configuración npm
├── 📄 .gitignore                   # Git ignore
├── 📄 .nojekyll                    # GitHub Pages
│
├── 📁 .github/                     # GitHub configurations
│   ├── workflows/
│   │   ├── ci.yml                  # CI/CD pipeline
│   │   └── deploy.yml              # Deploy automation
│   ├── ISSUE_TEMPLATE/
│   │   ├── bug_report.md
│   │   └── feature_request.md
│   └── PULL_REQUEST_TEMPLATE.md
│
├── 📁 docs/                        # 📚 TODA LA DOCUMENTACIÓN
│   ├── es/                         # 🇪🇸 Documentación en Español
│   │   ├── 01_PRIMEROS_PASOS.md   # Guía para nuevos usuarios
│   │   ├── 02_GUIA_USUARIO.md     # Manual de usuario completo
│   │   ├── 03_ARQUITECTURA.md     # Arquitectura técnica
│   │   ├── 04_GUIA_DESARROLLO.md  # Para desarrolladores
│   │   ├── 05_COMANDOS.md         # Referencia de comandos
│   │   ├── 06_TRADING.md          # Guía de trading P2P
│   │   ├── 07_SEGURIDAD.md        # Mejores prácticas
│   │   ├── 08_TESTING.md          # Guía de testing
│   │   └── 09_FAQ.md              # Preguntas frecuentes
│   │
│   ├── en/                         # 🇬🇧 Documentation in English
│   │   ├── 01_GETTING_STARTED.md
│   │   ├── 02_USER_GUIDE.md
│   │   ├── 03_ARCHITECTURE.md
│   │   ├── 04_DEVELOPMENT_GUIDE.md
│   │   ├── 05_COMMANDS.md
│   │   ├── 06_TRADING.md
│   │   ├── 07_SECURITY.md
│   │   ├── 08_TESTING.md
│   │   └── 09_FAQ.md
│   │
│   ├── technical/                  # 🔧 Documentación Técnica Avanzada
│   │   ├── AI_AGENTS_GUIDE.md     # Guía para IA
│   │   ├── KEYMANAGER_SPEC.md     # Especificación KeyManager
│   │   ├── PROTOCOL_SPEC.md       # Protocolo Mostro
│   │   ├── NOSTR_INTEGRATION.md   # Integración Nostr
│   │   └── API_REFERENCE.md       # Referencia API interna
│   │
│   ├── assets/                     # Assets para documentación
│   │   ├── images/
│   │   │   ├── screenshots/
│   │   │   ├── diagrams/
│   │   │   └── logos/
│   │   └── videos/
│   │       └── demos/
│   │
│   └── LATAM/                      # 🌎 Recursos específicos LATAM
│       ├── MONEDAS_FIAT.md        # Monedas soportadas LATAM
│       ├── METODOS_PAGO.md        # Métodos de pago regionales
│       ├── COMUNIDADES.md         # Comunidades Bitcoin LATAM
│       └── RECURSOS.md            # Recursos educativos
│
├── 📁 src/                         # 💻 CÓDIGO FUENTE
│   ├── index.html                  # Página principal
│   ├── server.js                   # Servidor Express
│   │
│   ├── css/
│   │   ├── reset.css
│   │   ├── terminal.css
│   │   ├── components.css
│   │   └── themes.css
│   │
│   └── js/
│       ├── main.js                 # Entry point
│       │
│       ├── core/                   # Módulos core
│       │   ├── keyManager.js
│       │   ├── relayManager.js
│       │   └── storage.js
│       │
│       ├── mostro/                 # Protocolo Mostro
│       │   ├── discovery.js
│       │   └── messaging.js
│       │
│       ├── ui/                     # Interfaz de usuario
│       │   ├── terminal.js
│       │   ├── commands.js
│       │   └── display.js
│       │
│       ├── models/                 # Modelos de datos
│       │   ├── Order.js
│       │   └── Mostro.js
│       │
│       ├── utils/                  # Utilidades
│       │   ├── constants.js
│       │   ├── logger.js
│       │   ├── helpers.js
│       │   └── inputHelpers.js
│       │
│       └── i18n/                   # 🌍 INTERNACIONALIZACIÓN (nuevo)
│           ├── index.js
│           ├── es.js               # Traducciones español
│           ├── en.js               # Translations English
│           └── pt.js               # Traduções Português
│
├── 📁 tests/                       # 🧪 TESTS
│   ├── unit/                       # Tests unitarios
│   │   ├── keyManager.test.js
│   │   ├── relayManager.test.js
│   │   └── storage.test.js
│   │
│   ├── integration/                # Tests de integración
│   │   ├── nostr-integration.test.js
│   │   └── mostro-protocol.test.js
│   │
│   ├── e2e/                        # Tests end-to-end
│   │   └── trading-flow.test.js
│   │
│   ├── fixtures/                   # Data de prueba
│   │   └── sample-orders.json
│   │
│   └── setup.js                    # Configuración tests
│
├── 📁 scripts/                     # 🛠️ SCRIPTS DE UTILIDAD
│   ├── setup.sh                    # Setup inicial
│   ├── deploy.sh                   # Deploy a producción
│   ├── migrate-structure.sh        # Migración de archivos
│   └── i18n-extract.js             # Extraer strings para traducir
│
├── 📁 assets/                      # 📦 ASSETS ESTÁTICOS
│   ├── fonts/                      # Fuentes monospace
│   │   └── terminus/
│   ├── images/                     # Imágenes
│   │   ├── logo.svg
│   │   ├── favicon.ico
│   │   └── og-image.png
│   └── icons/                      # Iconos
│       └── terminal.svg
│
└── 📁 config/                      # ⚙️ CONFIGURACIONES
    ├── relays.json                 # Configuración de relays
    ├── fiat-currencies.json        # Monedas FIAT soportadas
    └── payment-methods.json        # Métodos de pago por región
```

---

## 🔄 PLAN DE MIGRACIÓN (PASO A PASO)

### FASE 1: Crear Nueva Estructura (Sin Romper Nada)
**Duración**: 30 minutos

1. ✅ Crear directorios nuevos
2. ✅ Crear archivos base vacíos
3. ✅ NO mover archivos todavía (mantener funcionando)

### FASE 2: Migrar Documentación
**Duración**: 1 hora

1. ✅ Mover READMEv1.md → docs/technical/ARCHITECTURE.md
2. ✅ Mover AI_AGENTS.md → docs/technical/AI_AGENTS_GUIDE.md
3. ✅ Mover KEYMANAGER_IMPLEMENTATION_PLAN.md → docs/technical/KEYMANAGER_SPEC.md
4. ✅ Mover MANUAL_TESTING_GUIDE.md → docs/es/08_TESTING.md
5. ✅ Mover NEXT_STEPS.md → docs/technical/NEXT_STEPS.md (temporal)
6. ✅ Mover ANALISIS_COMPLETO.md → docs/technical/ANALYSIS.md

### FASE 3: Migrar Código Fuente
**Duración**: 45 minutos

1. ✅ Crear src/ directory
2. ✅ Mover index.html → src/index.html
3. ✅ Mover server.js → src/server.js
4. ✅ Mover css/ → src/css/
5. ✅ Mover js/ → src/js/
6. ✅ Actualizar rutas en index.html
7. ✅ Actualizar rutas en server.js
8. ✅ Actualizar imports en archivos JS

### FASE 4: Crear Documentación en Español
**Duración**: 3-4 horas

1. ✅ README_ES.md completo
2. ✅ docs/es/01_PRIMEROS_PASOS.md
3. ✅ docs/es/02_GUIA_USUARIO.md
4. ✅ docs/es/03_ARQUITECTURA.md
5. ✅ docs/es/04_GUIA_DESARROLLO.md
6. ✅ docs/es/05_COMANDOS.md
7. ✅ docs/es/06_TRADING.md
8. ✅ docs/es/07_SEGURIDAD.md
9. ✅ docs/es/09_FAQ.md
10. ✅ CONTRIBUTING_ES.md

### FASE 5: Crear Archivos de Configuración
**Duración**: 1 hora

1. ✅ CHANGELOG.md
2. ✅ ROADMAP.md
3. ✅ CODE_OF_CONDUCT.md
4. ✅ LICENSE
5. ✅ .gitignore mejorado
6. ✅ package.json actualizado

### FASE 6: Configuración LATAM
**Duración**: 1 hora

1. ✅ config/fiat-currencies.json
2. ✅ config/payment-methods.json
3. ✅ docs/LATAM/MONEDAS_FIAT.md
4. ✅ docs/LATAM/METODOS_PAGO.md
5. ✅ docs/LATAM/COMUNIDADES.md

### FASE 7: Testing y Validación
**Duración**: 1 hora

1. ✅ Verificar que la app funciona con nueva estructura
2. ✅ Actualizar todos los links en documentación
3. ✅ Verificar GitHub Pages deployment
4. ✅ Revisar todos los imports
5. ✅ Testing manual completo

---

## 📝 ARCHIVOS A CREAR (PRIORIDAD ALTA)

### 1. README_ES.md
```markdown
# 🌟 Contenido:
- Introducción en español
- Quick start para usuarios LATAM
- Screenshots/GIFs
- Links a documentación en español
- FAQ en español
- Comunidad y soporte
```

### 2. CONTRIBUTING_ES.md
```markdown
# 🌟 Contenido:
- Cómo contribuir (en español)
- Setup de desarrollo
- Convenciones de código
- Pull request guidelines
- Código de conducta
```

### 3. docs/es/01_PRIMEROS_PASOS.md
```markdown
# 🌟 Contenido:
- Instalación paso a paso
- Primera configuración
- Crear identidad
- Primera orden
- Solución de problemas comunes
```

### 4. docs/LATAM/MONEDAS_FIAT.md
```markdown
# 🌟 Contenido:
- USD (común en toda LATAM)
- ARS (Argentina)
- COP (Colombia)
- PEN (Perú)
- BRL (Brasil)
- VES (Venezuela)
- CLP (Chile)
- MXN (México)
- Tasas de cambio
- Recomendaciones por país
```

### 5. docs/LATAM/METODOS_PAGO.md
```markdown
# 🌟 Contenido:
- Transferencias bancarias
- Billeteras digitales (Mercado Pago, Nequi, etc.)
- Efectivo (encuentros presenciales)
- Recomendaciones de seguridad por método
- Métodos por país
```

---

## ⚙️ CAMBIOS EN PACKAGE.JSON

```json
{
  "name": "mostroweb",
  "version": "0.2.0",
  "description": "Cliente web terminal retro para Mostro P2P - Bitcoin Lightning Network trading descentralizado",
  "main": "src/server.js",
  "type": "module",
  "scripts": {
    "start": "node src/server.js",
    "dev": "node --watch src/server.js",
    "test": "jest",
    "test:watch": "jest --watch",
    "test:coverage": "jest --coverage",
    "lint": "eslint src/js/**/*.js",
    "migrate": "bash scripts/migrate-structure.sh",
    "deploy": "bash scripts/deploy.sh"
  },
  "keywords": [
    "mostro",
    "nostr",
    "p2p",
    "bitcoin",
    "lightning",
    "terminal",
    "latam",
    "español",
    "descentralizado"
  ],
  "author": {
    "name": "MostroWeb Contributors",
    "url": "https://github.com/yourusername/mostroweb"
  },
  "repository": {
    "type": "git",
    "url": "https://github.com/yourusername/mostroweb.git"
  },
  "homepage": "https://mostroweb.dev",
  "license": "MIT",
  "engines": {
    "node": ">=18.0.0"
  },
  "dependencies": {
    "express": "^4.18.2",
    "nostr-tools": "^2.5.2",
    "uuid": "^10.0.0",
    "crypto-js": "^4.2.0"
  },
  "devDependencies": {
    "jest": "^29.7.0",
    "eslint": "^8.56.0"
  }
}
```

---

## 🔧 MEJORAS EN .GITIGNORE

```gitignore
# Dependencies
node_modules/
package-lock.json

# Build outputs
dist/
build/
*.log

# Environment
.env
.env.local
.env.production

# IDE
.vscode/
.idea/
*.swp
*.swo
*~

# OS
.DS_Store
Thumbs.db

# Testing
coverage/
.nyc_output/
*.test.js.snap

# Temporary files
tmp/
temp/
*.tmp

# User data (localStorage backups)
storage-backup/

# Deployment
deploy/
```

---

## 🎯 PRIORIDADES DE IMPLEMENTACIÓN

### CRÍTICO (Hacer ya - 2-3 horas)
1. ✅ Crear estructura de directorios
2. ✅ Migrar archivos a src/
3. ✅ Crear README_ES.md completo
4. ✅ Crear CONTRIBUTING_ES.md
5. ✅ Actualizar rutas y verificar funcionamiento

### ALTA PRIORIDAD (Siguiente - 3-4 horas)
6. ✅ Crear toda documentación en docs/es/
7. ✅ Crear configuración LATAM
8. ✅ CHANGELOG.md
9. ✅ ROADMAP.md
10. ✅ Actualizar package.json

### MEDIA PRIORIDAD (Después - 2-3 horas)
11. ⚪ Traducir documentación a inglés (docs/en/)
12. ⚪ Crear templates de issues/PRs
13. ⚪ Setup CI/CD básico
14. ⚪ Crear assets (logos, screenshots)

---

## ✅ CHECKLIST DE VALIDACIÓN POST-MIGRACIÓN

### Funcionalidad
- [ ] App carga correctamente desde src/index.html
- [ ] Todos los imports de JS funcionan
- [ ] CSS se carga correctamente
- [ ] LocalStorage funciona
- [ ] Comandos responden

### Documentación
- [ ] README_ES.md completo y claro
- [ ] Links de documentación funcionan
- [ ] Imágenes/screenshots se ven
- [ ] Ejemplos de código son correctos

### Configuración
- [ ] package.json actualizado
- [ ] .gitignore actualizado
- [ ] GitHub Pages funciona
- [ ] Scripts de deploy funcionan

### LATAM
- [ ] Monedas LATAM configuradas
- [ ] Métodos de pago documentados
- [ ] Contenido relevante para región

---

## 📊 ESTIMACIÓN DE TIEMPO TOTAL

| Fase | Duración | Prioridad |
|------|----------|-----------|
| Fase 1: Crear estructura | 30 min | CRÍTICA |
| Fase 2: Migrar docs | 1 hora | CRÍTICA |
| Fase 3: Migrar código | 45 min | CRÍTICA |
| Fase 4: Docs en español | 3-4 horas | ALTA |
| Fase 5: Config profesional | 1 hora | ALTA |
| Fase 6: Config LATAM | 1 hora | ALTA |
| Fase 7: Testing | 1 hora | ALTA |
| **TOTAL** | **8-10 horas** | |

---

## 🚀 ORDEN DE EJECUCIÓN RECOMENDADO

### Sesión 1 (2-3 horas) - Estructura Base
1. Crear directorios
2. Migrar código a src/
3. Actualizar rutas
4. Verificar funcionamiento

### Sesión 2 (3-4 horas) - Documentación Español
1. README_ES.md
2. CONTRIBUTING_ES.md
3. docs/es/ completo
4. LATAM docs

### Sesión 3 (2-3 horas) - Polish Final
1. CHANGELOG.md, ROADMAP.md
2. Configuraciones LATAM
3. Testing completo
4. Deploy y validación

---

**ESTADO**: ✅ Plan completo listo para ejecutar
**PRÓXIMO PASO**: Comenzar Fase 1 - Crear estructura de directorios
