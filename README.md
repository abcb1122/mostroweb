# MostroWeb - Terminal Frontend for Mostro P2P

Cliente web frontend estilo terminal retro para Mostro P2P - Bitcoin Lightning Network trading.

## 🚀 Quick Start

### Requisitos
- Node.js 18+
- npm

### Instalación

```bash
# Instalar dependencias
npm install

# Iniciar servidor
npm start
```

El servidor estará disponible en: `http://localhost:3000`

### Modo Desarrollo (con auto-reload)

```bash
npm run dev
```

## 📁 Estructura del Proyecto

```
mostroweb/
├── index.html              # Página principal
├── server.js               # Servidor Express
├── package.json            # Dependencias
│
├── css/                    # Estilos
│   ├── reset.css           # CSS reset
│   ├── terminal.css        # Estilos principales terminal
│   ├── components.css      # Componentes UI
│   └── themes.css          # Temas de color
│
└── js/                     # JavaScript modules
    ├── main.js             # Punto de entrada
    ├── core/               # Módulos core
    │   └── storage.js      # LocalStorage wrapper
    ├── ui/                 # Componentes UI
    │   ├── terminal.js     # Lógica del terminal
    │   ├── commands.js     # Parser y ejecutor comandos
    │   └── display.js      # Rendering output
    └── utils/              # Utilidades
        ├── constants.js    # Constantes
        ├── logger.js       # Sistema de logs
        └── helpers.js      # Funciones auxiliares
```

## 🎮 Comandos Disponibles (Fase 1)

### Básicos
- `/help` - Muestra ayuda de comandos
- `/clear` - Limpia el terminal
- `/theme <color>` - Cambia el tema (green, amber, blue, matrix, dos, hacker, etc)
- `/version` - Muestra información de versión
- `/status` - Muestra estado del sistema

### Navegación
- `↑` `↓` - Navegar historial de comandos
- `Tab` - Autocompletar comandos
- `Ctrl+L` - Limpiar terminal
- `Ctrl+C` - Cancelar input actual

## 🎨 Temas Disponibles

Usa `/theme <nombre>` para cambiar el tema:

- `green` - Terminal verde clásico (default)
- `amber` - Ámbar retro
- `blue` - Azul cyan
- `matrix` - Matrix (verde intenso)
- `dos` - DOS (azul con blanco)
- `hacker` - Hacker (verde oscuro)
- `purple` - Púrpura retro
- `red` - Alerta (rojo)
- `white` - Papel verde

## 🛠️ Tecnologías

- **Frontend**: HTML5, CSS3, Vanilla JavaScript (ES6+)
- **Backend**: Node.js + Express (solo sirve archivos estáticos)
- **Librerías**:
  - nostr-tools v2.5.2+ (Protocolo Nostr)
  - uuid v10.0.0 (Generación de IDs)
  - crypto-js v4.2.0 (Encriptación)

## 📝 Estado de Desarrollo

### ✅ Fase 1 - Completada
- [x] Estructura del proyecto
- [x] Servidor Express
- [x] UI terminal retro
- [x] Sistema de comandos
- [x] Historial de comandos
- [x] Múltiples temas
- [x] Sistema de logging
- [x] LocalStorage wrapper

### 🚧 Próximas Fases
- [ ] Fase 2: Gestión de identidad Nostr
- [ ] Fase 2: Conexión a relays
- [ ] Fase 2: Descubrimiento de órdenes
- [ ] Sprint 2: Protocolo Mostro
- [ ] Sprint 3: Trading flow completo

## 📚 Documentación

- **Arquitectura completa**: Ver `READMEv1.md`
- **Guía para IA agents**: Ver `AI_AGENTS.md`
- **Próximos pasos**: Ver `NEXT_STEPS.md`

## 🔍 Debugging

Abre la consola del navegador y usa:

```javascript
// Ver estado de la aplicación
MostroWeb.getState()

// Ver información
MostroWeb.getInfo()

// Acceder al logger
MostroWeb.Logger.debug('mensaje')
```

## 🐛 Health Check

```bash
# Verificar que el servidor responde
curl http://localhost:3000/health
```

## 📦 Build Info

- **Version**: 0.1.0
- **Build Date**: 2025-10-29
- **Node**: >= 18.0.0
- **License**: MIT

## 🤝 Contribuir

Este proyecto sigue la filosofía de código minimalista, seguro y auditable. Ver `AI_AGENTS.md` para reglas de desarrollo.

---

**Desarrollado con ⚡ para la comunidad Bitcoin P2P**
