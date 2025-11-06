# 🤝 Guía de Contribución - MostroWeb

¡Gracias por tu interés en contribuir a MostroWeb! Esta guía te ayudará a comenzar.

> 🇪🇸 **Español** | [🇬🇧 English](CONTRIBUTING.md)

---

## 📋 Tabla de Contenidos

- [Código de Conducta](#código-de-conducta)
- [¿Cómo Puedo Contribuir?](#cómo-puedo-contribuir)
- [Configuración del Entorno](#configuración-del-entorno)
- [Proceso de Desarrollo](#proceso-de-desarrollo)
- [Estándares de Código](#estándares-de-código)
- [Pull Requests](#pull-requests)
- [Reportar Bugs](#reportar-bugs)
- [Sugerir Features](#sugerir-features)

---

## 📜 Código de Conducta

Al participar en este proyecto, te comprometes a mantener un ambiente respetuoso y acogedor para todos. Por favor:

- ✅ Sé respetuoso y constructivo
- ✅ Acepta críticas constructivas
- ✅ Enfócate en lo mejor para la comunidad
- ❌ No acoses ni discrimines
- ❌ No publiques contenido inapropiado

---

## 🎯 ¿Cómo Puedo Contribuir?

### 1. Reportar Bugs 🐛

¿Encontraste un bug? Ayúdanos a corregirlo:

1. Busca en [Issues existentes](https://github.com/abcb1122/mostroweb/issues) para evitar duplicados
2. Si no existe, crea un nuevo Issue con:
   - Título descriptivo
   - Pasos para reproducir
   - Comportamiento esperado vs actual
   - Screenshots si aplica
   - Información de tu entorno (navegador, OS)

**Template de Bug Report**:
```markdown
### Descripción del Bug
[Descripción clara y concisa]

### Pasos para Reproducir
1. Ir a '...'
2. Ejecutar comando '...'
3. Ver error

### Comportamiento Esperado
[Qué debería pasar]

### Comportamiento Actual
[Qué está pasando]

### Screenshots
[Si aplica]

### Entorno
- Navegador: [ej. Chrome 120]
- OS: [ej. Ubuntu 22.04]
- Versión MostroWeb: [ej. 0.1.0]
```

### 2. Sugerir Features ✨

¿Tienes una idea para mejorar MostroWeb?

1. Revisa [Discussions](https://github.com/abcb1122/mostroweb/discussions)
2. Abre un nuevo Discussion con tag "Feature Request"
3. Describe:
   - Problema que resuelve
   - Solución propuesta
   - Alternativas consideradas
   - Mockups/wireframes si aplica

### 3. Contribuir Código 💻

Las contribuciones de código son bienvenidas en:

- 🐛 Corrección de bugs
- ✨ Nuevas features
- 📝 Documentación
- 🧪 Tests
- 🎨 Mejoras de UI/UX
- ♿ Accesibilidad
- 🌍 Traducciones

### 4. Mejorar Documentación 📚

- Corregir typos
- Aclarar instrucciones confusas
- Añadir ejemplos
- Traducir a otros idiomas
- Documentar features no documentadas

### 5. Ayudar a la Comunidad 🌟

- Responder preguntas en Issues/Discussions
- Revisar Pull Requests
- Mejorar tests
- Reportar bugs de seguridad (ver SECURITY.md)

---

## 🛠️ Configuración del Entorno

### Prerequisitos

- **Node.js** >= 18.0.0
- **npm** >= 9.0.0 (o pnpm/yarn)
- **Git** >= 2.30

### Setup

```bash
# 1. Fork el repositorio en GitHub

# 2. Clonar tu fork
git clone https://github.com/TU_USUARIO/mostroweb.git
cd mostroweb

# 3. Añadir upstream remote
git remote add upstream https://github.com/abcb1122/mostroweb.git

# 4. Instalar dependencias
npm install

# 5. Crear branch para tu feature
git checkout -b feature/mi-feature

# 6. Iniciar servidor de desarrollo
npm run dev
```

### Verificar Setup

```bash
# Servidor debe estar corriendo en http://localhost:3000
# Abrir en navegador y verificar que cargue correctamente

# En la terminal de MostroWeb:
/help        # Debe mostrar comandos
/start       # Debe generar identidad
/discover    # Debe conectar a relays
```

---

## 🔄 Proceso de Desarrollo

### 1. Mantener Fork Actualizado

```bash
# Traer cambios del repositorio original
git fetch upstream

# Mergear cambios en tu main
git checkout main
git merge upstream/main

# Pushear a tu fork
git push origin main
```

### 2. Crear Feature Branch

```bash
# Desde main actualizado
git checkout -b feature/nombre-descriptivo

# Ejemplos:
git checkout -b fix/relay-connection-bug
git checkout -b feat/dispute-system
git checkout -b docs/update-readme
```

### 3. Hacer Cambios

```bash
# Editar archivos
# Probar cambios localmente
npm run dev

# Añadir archivos
git add .

# Commit con mensaje descriptivo
git commit -m "feat: añadir sistema de disputas"
```

### 4. Pushear Cambios

```bash
git push origin feature/nombre-descriptivo
```

### 5. Abrir Pull Request

1. Ve a tu fork en GitHub
2. Click en "Compare & pull request"
3. Llena el template de PR (ver abajo)
4. Espera revisión

---

## 📝 Estándares de Código

### Estructura de Archivos

```
src/
├── css/           # Estilos organizados por propósito
├── js/
│   ├── core/      # Funcionalidad core (RelayManager, KeyManager)
│   ├── models/    # Modelos de datos (Order, Mostro)
│   ├── mostro/    # Protocolo Mostro (Discovery, Messaging)
│   ├── ui/        # Interfaz (Terminal, Display, Commands)
│   └── utils/     # Utilidades compartidas
└── index.html     # Punto de entrada
```

### Convenciones de Código

#### JavaScript

```javascript
// ✅ CORRECTO: camelCase para variables y funciones
const orderCount = 10;
function calculatePremium(amount) { }

// ✅ CORRECTO: PascalCase para clases
class OrderManager { }

// ✅ CORRECTO: UPPER_CASE para constantes
const MAX_ORDERS = 1000;

// ✅ CORRECTO: Comentarios descriptivos
/**
 * Calcula el premium basado en el monto
 * @param {number} amount - Monto en satoshis
 * @returns {number} Premium en porcentaje
 */
function calculatePremium(amount) {
  // Lógica de cálculo
}

// ✅ CORRECTO: ES6 modules
import { RelayManager } from './core/relayManager.js';
export class Discovery { }

// ❌ INCORRECTO: var (usar const/let)
var x = 10;

// ❌ INCORRECTO: Funciones sin documentar
function foo(x, y, z) { }
```

#### CSS

```css
/* ✅ CORRECTO: BEM naming */
.terminal-container { }
.terminal-container__header { }
.terminal-container__header--active { }

/* ✅ CORRECTO: Variables CSS */
:root {
  --color-primary: #00ff00;
  --font-mono: 'Courier New', monospace;
}

/* ✅ CORRECTO: Mobile-first */
.element {
  width: 100%;
}

@media (min-width: 768px) {
  .element {
    width: 50%;
  }
}
```

#### HTML

```html
<!-- ✅ CORRECTO: Semantic HTML -->
<section class="orders-list">
  <article class="order-card">
    <h2>Order Title</h2>
  </article>
</section>

<!-- ✅ CORRECTO: Accessibility -->
<button aria-label="Close dialog" title="Close">×</button>

<!-- ✅ CORRECTO: Data attributes para JS -->
<div data-order-id="abc123" data-status="pending">
```

### Convenciones de Commits

Usamos [Conventional Commits](https://www.conventionalcommits.org/es/):

```
<type>(<scope>): <subject>

<body>

<footer>
```

**Types**:
- `feat`: Nueva funcionalidad
- `fix`: Corrección de bug
- `docs`: Cambios en documentación
- `style`: Formateo, comas faltantes, etc.
- `refactor`: Refactorización sin cambiar funcionalidad
- `test`: Añadir o corregir tests
- `chore`: Tareas de build, dependencias, etc.
- `perf`: Mejoras de performance

**Ejemplos**:

```bash
# Feature
git commit -m "feat(discovery): añadir filtro por moneda fiat"

# Bug fix
git commit -m "fix(relay): corregir reconexión automática"

# Documentación
git commit -m "docs: actualizar README con ejemplos de uso"

# Refactor
git commit -m "refactor(messaging): simplificar lógica de gift wrap"

# Con cuerpo y footer
git commit -m "feat(orders): implementar órdenes de rango

Permite crear órdenes con min/max amounts en lugar
de un monto fijo. Útil para mayor flexibilidad.

Closes #123"
```

### Linting y Formatting

```bash
# Ejecutar linter
npm run lint

# Auto-fix issues
npm run lint:fix

# Formatear código
npm run format
```

---

## 🔍 Pull Requests

### Checklist Antes de Abrir PR

- [ ] Código sigue los estándares del proyecto
- [ ] Commits siguen Conventional Commits
- [ ] Tests pasan (cuando aplique)
- [ ] Documentación actualizada
- [ ] No hay console.logs olvidados
- [ ] Branch está actualizado con main

### Template de Pull Request

```markdown
## Descripción
[Descripción clara de los cambios]

## Tipo de Cambio
- [ ] Bug fix (cambio que corrige un issue)
- [ ] Nueva feature (cambio que añade funcionalidad)
- [ ] Breaking change (cambio que rompe compatibilidad)
- [ ] Documentación

## ¿Cómo se ha Testeado?
[Describe las pruebas realizadas]

## Checklist
- [ ] Mi código sigue los estándares del proyecto
- [ ] He realizado self-review de mi código
- [ ] He comentado código complejo
- [ ] He actualizado la documentación
- [ ] Mis cambios no generan nuevos warnings
- [ ] He añadido tests si aplica
- [ ] Tests nuevos y existentes pasan localmente

## Screenshots
[Si aplica]

## Issues Relacionados
Closes #123
```

### Proceso de Revisión

1. Abres PR → Auto-checks corren (linting, tests)
2. Mantenedor revisa código
3. Si hay feedback:
   - Hacer cambios solicitados
   - Push a mismo branch (PR se actualiza automáticamente)
4. Una vez aprobado → Merge!

---

## 🐛 Reportar Bugs de Seguridad

**NO** abras un Issue público para bugs de seguridad.

En su lugar:
1. Envía email a: [SEGURIDAD_EMAIL]
2. Incluye:
   - Descripción del problema
   - Pasos para reproducir
   - Impacto potencial
   - Sugerencias de fix (si las tienes)

Responderemos en 48 horas.

---

## 🌍 Traducciones

¿Quieres traducir MostroWeb a tu idioma?

1. Duplica `docs/es/` a `docs/[CODIGO_IDIOMA]/`
2. Traduce archivos manteniendo estructura
3. Añade link en README principal
4. Abre PR con tag `translation`

Idiomas prioritarios:
- 🇪🇸 Español (Principal)
- 🇬🇧 Inglés
- 🇧🇷 Portugués
- 🇫🇷 Francés

---

## 🧪 Tests

### Ejecutar Tests

```bash
# Todos los tests
npm test

# Watch mode
npm run test:watch

# Con cobertura
npm run test:coverage
```

### Escribir Tests

```javascript
// tests/unit/discovery.test.js
import { describe, it, expect } from 'vitest';
import { Discovery } from '../src/js/mostro/discovery.js';

describe('Discovery', () => {
  it('should initialize correctly', () => {
    const discovery = new Discovery();
    expect(discovery.orders.size).toBe(0);
  });

  it('should filter orders by currency', () => {
    // Test implementation
  });
});
```

---

## 📚 Recursos Útiles

### Protocolo Mostro
- [Mostro Docs](https://mostro.network/protocol/)
- [mostro-core](https://github.com/MostroP2P/mostro-core)

### Nostr
- [NIPs Repository](https://github.com/nostr-protocol/nips)
- [nostr-tools](https://github.com/nbd-wtf/nostr-tools)

### JavaScript/Web
- [MDN Web Docs](https://developer.mozilla.org/es/)
- [JavaScript.info](https://javascript.info/)

---

## ❓ Preguntas Frecuentes

### ¿Cómo puedo probar mis cambios?

```bash
npm run dev
# Abre http://localhost:3000
# Prueba funcionalidad manualmente
```

### ¿Dónde pido ayuda?

- [GitHub Discussions](https://github.com/abcb1122/mostroweb/discussions)
- [Issues con tag "question"](https://github.com/abcb1122/mostroweb/issues?q=label%3Aquestion)

### ¿Qué tan grande debe ser mi PR?

- ✅ Pequeño y enfocado (1 feature/fix)
- ❌ Gigante con múltiples cambios no relacionados

Divide PRs grandes en varios PRs pequeños.

### ¿Puedo trabajar en un Issue asignado a alguien más?

No, respeta las asignaciones. Si un Issue lleva >2 semanas sin actividad, comenta preguntando si está disponible.

---

## 🎓 Guías para Contribuidores Nuevos

### Primera Contribución

1. Busca Issues con tag `good-first-issue`
2. Comenta "Me gustaría trabajar en esto"
3. Espera asignación
4. Pide ayuda si la necesitas

### Issues Recomendados

- `good-first-issue`: Ideal para principiantes
- `help-wanted`: Necesitamos ayuda
- `documentation`: Mejorar docs
- `translation`: Traducir contenido

---

## 🏆 Reconocimientos

Todos los contribuidores aparecen en:
- README principal
- Página de Contributors en GitHub
- Release notes

¡Gracias por hacer MostroWeb mejor! 🙌

---

## 📞 Contacto

- GitHub Issues: [Issues](https://github.com/abcb1122/mostroweb/issues)
- Discussions: [Discussions](https://github.com/abcb1122/mostroweb/discussions)

---

<p align="center">
  <sub>¿Tienes dudas? No dudes en preguntar. Todos empezamos desde cero.</sub>
</p>
