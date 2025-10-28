# Mostro Web

Interfaz web minimalista para interactuar con el protocolo Mostro P2P sobre Nostr.

## ¿Qué es Mostro?

Mostro es un protocolo descentralizado P2P para intercambiar Bitcoin (Lightning Network) por monedas fiat. Opera completamente sobre la red Nostr, eliminando intermediarios centralizados.

- **Protocolo:** [mostro.network/protocol](https://mostro.network/protocol/)
- **Documentación:** [mostro.network/docs-english](https://mostro.network/docs-english/)
- **Repositorio principal:** [github.com/MostroP2P](https://github.com/MostroP2P)

## Características

- ✅ **Sin custodia:** Tus claves, tu Bitcoin
- ✅ **Descentralizado:** Sin servidores centrales
- ✅ **P2P puro:** Intercambio directo entre usuarios
- ✅ **Lightning Network:** Pagos instantáneos
- ✅ **Nostr nativo:** Funciona sobre relays Nostr
- ✅ **UX simple:** Diseñado para usuarios no técnicos

## Stack Tecnológico

- **Frontend:** React 18 + TypeScript
- **Build:** Vite
- **Styling:** TailwindCSS
- **State:** Zustand
- **Nostr:** nostr-tools
- **Lightning:** @getalby/bitcoin-connect + WebLN
- **Crypto:** @noble/secp256k1

## Arquitectura

```
┌─────────────────────────────────────────┐
│         FRONTEND (SPA)                  │
│  - React + TypeScript                   │
│  - UI minimalista                       │
└────────────┬────────────────────────────┘
             │
             ↓
┌─────────────────────────────────────────┐
│    NOSTR CLIENT LAYER                   │
│  - nostr-tools                          │
│  - Gestión de claves (NIP-07)           │
│  - Subscripciones a eventos             │
└────────────┬────────────────────────────┘
             │
             ↓
┌─────────────────────────────────────────┐
│       NOSTR RELAYS                      │
│  - wss://relay.mostro.network           │
│  - wss://relay.damus.io                 │
│  - (múltiples relays con failover)      │
└────────────┬────────────────────────────┘
             │
             ↓
┌─────────────────────────────────────────┐
│      MOSTRO DAEMON                      │
│  (backend del protocolo)                │
└─────────────────────────────────────────┘
```

## Estructura del Proyecto

```
src/
├── components/          # Componentes React
│   ├── auth/           # Autenticación Nostr
│   ├── wallet/         # Lightning wallet
│   ├── orders/         # Órdenes de compra/venta
│   ├── layout/         # Layout principal
│   └── ui/             # Componentes UI reutilizables
├── services/           # Lógica de negocio
│   ├── nostr/         # Cliente Nostr, eventos, subscripciones
│   ├── mostro/        # Protocolo Mostro, órdenes, mensajes
│   └── lightning/     # WebLN, pagos Lightning
├── store/             # Zustand stores (state management)
├── types/             # TypeScript types
├── utils/             # Utilidades (crypto, formatting, validation)
├── hooks/             # Custom React hooks
├── App.tsx            # Componente principal
└── main.tsx           # Entry point
```

## Instalación

### Requisitos

- Node.js >= 18.0.0
- npm o yarn

### Setup

1. **Clonar el repositorio:**
   ```bash
   git clone <repo-url>
   cd mostroweb
   ```

2. **Instalar dependencias:**
   ```bash
   npm install
   ```

3. **Iniciar desarrollo:**
   ```bash
   npm run dev
   ```

4. **Abrir en navegador:**
   ```
   http://localhost:3000
   ```

## Scripts Disponibles

- `npm run dev` - Iniciar servidor de desarrollo
- `npm run build` - Build de producción
- `npm run preview` - Preview del build
- `npm run lint` - Linting con ESLint
- `npm run type-check` - Verificar tipos TypeScript

## Desarrollo

### Configuración de Extensión Nostr

Para la mejor experiencia, instala una extensión Nostr compatible con NIP-07:

- **Alby:** [getalby.com](https://getalby.com) (recomendado)
- **nos2x:** [github.com/fiatjaf/nos2x](https://github.com/fiatjaf/nos2x)

También puedes usar claves temporales generadas en el navegador (solo para probar).

### Configuración de Wallet Lightning

La app soporta múltiples métodos de conexión Lightning:

1. **WebLN Extensions:** Alby, LNBits
2. **NWC (Nostr Wallet Connect):** Funciona sin extensión
3. **Mobile wallets:** Vía deep links

### Variables de Entorno

Crea un archivo `.env` (opcional):

```env
VITE_APP_TITLE=Mostro Web
# TODO: Agregar variables si son necesarias
```

## Flujo de Usuario

1. **Conectar identidad Nostr:**
   - Con extensión (Alby/nos2x)
   - O generar claves temporales

2. **Conectar wallet Lightning:**
   - Extensión WebLN
   - O escanear QR con NWC

3. **Explorar órdenes:**
   - Ver órdenes de compra/venta disponibles
   - Filtrar por moneda, método de pago, etc.

4. **Crear orden:**
   - Tipo: comprar/vender Bitcoin
   - Monto en fiat
   - Método de pago
   - Prima (opcional)

5. **Tomar orden:**
   - Seleccionar orden de otro usuario
   - Pagar invoice Lightning (si compras)
   - Confirmar pago fiat off-chain

6. **Completar intercambio:**
   - Mostro coordina el proceso
   - Lightning se libera automáticamente
   - Calificar al peer

## Protocolo Mostro

### Event Kinds Usados

- **Kind 4:** DMs encriptados (comunicación con daemon)
- **Kind 38383:** Órdenes públicas

### Flujo de Mensajes

```
1. Usuario → DM al daemon: "nueva orden"
2. Daemon → Evento público: orden creada (kind 38383)
3. Otro usuario → DM al daemon: "tomar orden"
4. Daemon → DM a ambos: coordina intercambio
5. Usuario paga invoice Lightning
6. Usuario confirma pago fiat recibido
7. Daemon libera Bitcoin
```

## Seguridad

- ⚠️ **Claves privadas NUNCA se envían a servidores**
- ⚠️ **Claves efímeras son solo para testing**
- ⚠️ **Usa extensión NIP-07 para producción**
- ⚠️ **Mostro no custodia fondos, pero coordina el escrow**
- ⚠️ **Siempre verifica identidad del peer**

## Roadmap

### Fase 1: MVP (En desarrollo)
- [x] Setup inicial del proyecto
- [ ] Autenticación Nostr básica
- [ ] Conexión a relays
- [ ] Listar órdenes públicas
- [ ] Crear orden simple
- [ ] Tomar orden
- [ ] Integración Lightning wallet

### Fase 2: Core Features
- [ ] Chat con peer durante intercambio
- [ ] Sistema de reputación
- [ ] Historial de órdenes
- [ ] Notificaciones en tiempo real
- [ ] Manejo de disputas

### Fase 3: Polish
- [ ] Filtros avanzados
- [ ] Multi-idioma (i18n)
- [ ] Dark mode
- [ ] PWA (Progressive Web App)
- [ ] Gráficas de mercado
- [ ] Exports de historial

## Contribuir

Las contribuciones son bienvenidas. Por favor:

1. Fork el proyecto
2. Crea una branch para tu feature
3. Commit con mensajes descriptivos
4. Push y abre un Pull Request

## Licencia

TODO: Definir licencia (MIT?)

## Enlaces

- Protocolo Mostro: https://mostro.network/protocol/
- Documentación: https://mostro.network/docs-english/
- GitHub Mostro: https://github.com/MostroP2P
- Nostr: https://nostr.com
- Lightning Network: https://lightning.network

## Soporte

- Issues: GitHub Issues
- Discusiones: GitHub Discussions
- Nostr: TODO (canal Nostr del proyecto)

---

**Nota:** Este proyecto está en desarrollo activo. No usar con grandes cantidades hasta que esté en producción estable.
