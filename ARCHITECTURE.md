# Arquitectura de Mostro Web

## Visión General

Mostro Web es una aplicación SPA (Single Page Application) completamente client-side que funciona como interfaz para el protocolo Mostro P2P sobre Nostr.

## Capas de la Aplicación

```
┌───────────────────────────────────────────────────────────┐
│                    PRESENTATION LAYER                     │
│                    (React Components)                     │
│                                                           │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐      │
│  │   Layout    │  │   Orders    │  │    Auth     │      │
│  │ Components  │  │ Components  │  │ Components  │      │
│  └─────────────┘  └─────────────┘  └─────────────┘      │
│                                                           │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐      │
│  │   Wallet    │  │     UI      │  │   Hooks     │      │
│  │ Components  │  │ Components  │  │   Custom    │      │
│  └─────────────┘  └─────────────┘  └─────────────┘      │
└───────────────────────────────────────────────────────────┘
                            │
                            ↓
┌───────────────────────────────────────────────────────────┐
│                     STATE MANAGEMENT                      │
│                      (Zustand Stores)                     │
│                                                           │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌─────────┐  │
│  │   Auth   │  │  Orders  │  │  Wallet  │  │ Relays  │  │
│  │  Store   │  │  Store   │  │  Store   │  │  Store  │  │
│  └──────────┘  └──────────┘  └──────────┘  └─────────┘  │
└───────────────────────────────────────────────────────────┘
                            │
                            ↓
┌───────────────────────────────────────────────────────────┐
│                     BUSINESS LOGIC                        │
│                        (Services)                         │
│                                                           │
│  ┌─────────────────┐  ┌──────────────────┐              │
│  │ Nostr Service   │  │ Mostro Service   │              │
│  │ - Client        │  │ - Protocol       │              │
│  │ - Events        │  │ - Orders         │              │
│  │ - Subscriptions │  │ - Messages       │              │
│  └─────────────────┘  └──────────────────┘              │
│                                                           │
│  ┌──────────────────┐  ┌──────────────────┐             │
│  │ Lightning Service│  │ Utils            │             │
│  │ - WebLN          │  │ - Crypto         │             │
│  │ - Payments       │  │ - Formatting     │             │
│  └──────────────────┘  └──────────────────┘             │
└───────────────────────────────────────────────────────────┘
                            │
                            ↓
┌───────────────────────────────────────────────────────────┐
│                   EXTERNAL PROTOCOLS                      │
│                                                           │
│  ┌─────────────────┐  ┌──────────────────┐              │
│  │  Nostr Network  │  │ Lightning Network│              │
│  │  - Relays       │  │ - WebLN          │              │
│  │  - Events       │  │ - Invoices       │              │
│  └─────────────────┘  └──────────────────┘              │
└───────────────────────────────────────────────────────────┘
```

## Flujo de Datos

### 1. Autenticación Nostr

```
User Action → NostrLogin Component
              ↓
              Check window.nostr (NIP-07)
              ↓
         ┌────┴─────┐
         │          │
    Extension    Generate
    Available    Ephemeral
         │          │
         └────┬─────┘
              ↓
         Auth Store
              ↓
    Save publicKey + authMethod
              ↓
    Initialize Nostr Client
```

### 2. Crear Orden

```
User fills OrderForm
       ↓
Validate inputs (utils/validation)
       ↓
useMostro hook → createOrder()
       ↓
services/mostro/orders → createOrder()
       ↓
Format order data (protocol.ts)
       ↓
Encrypt DM (events.ts)
       ↓
Sign event (crypto utils)
       ↓
Publish to relays (nostr/client.ts)
       ↓
Subscribe to Mostro response
       ↓
Update Orders Store
       ↓
UI reflects new order
```

### 3. Tomar Orden

```
User clicks "Take Order"
       ↓
useMostro hook → takeOrder(orderId)
       ↓
Send DM to Mostro daemon
       ↓
Daemon responds with Lightning invoice
       ↓
Display invoice in UI
       ↓
User pays with useWallet hook
       ↓
Lightning payment (webln.ts)
       ↓
Confirm payment to daemon
       ↓
Wait for peer fiat confirmation
       ↓
Daemon releases Bitcoin
       ↓
Order completed
```

## Patrones de Diseño

### 1. Custom Hooks Pattern
- `useNostr`: Abstrae lógica Nostr
- `useMostro`: Abstrae protocolo Mostro
- `useWallet`: Abstrae Lightning operations
- Beneficio: Reutilización y separación de concerns

### 2. Service Layer Pattern
- Services son funciones puras (no hooks)
- No dependen de React
- Testables independientemente
- Beneficio: Lógica portable y testable

### 3. Store Pattern (Zustand)
- State global con Zustand
- Subscripción granular (evita re-renders)
- No boilerplate
- Beneficio: Simple y performante

### 4. Component Composition
- Componentes pequeños y enfocados
- UI components reutilizables
- Props tipadas estrictamente
- Beneficio: Mantenibilidad y reusabilidad

## Gestión de Estado

### Auth Store
```typescript
{
  publicKey: string | null,
  privateKey: string | null,
  isAuthenticated: boolean,
  authMethod: 'extension' | 'ephemeral'
}
```

### Orders Store
```typescript
{
  orders: Order[],
  myOrders: Order[],
  activeOrder: Order | null,
  loading: boolean,
  filters: OrderFilters
}
```

### Wallet Store
```typescript
{
  isConnected: boolean,
  walletInfo: WalletInfo | null,
  provider: string | null
}
```

### Relays Store
```typescript
{
  relays: Record<url, RelayStatus>,
  connectedCount: number,
  isHealthy: boolean
}
```

## Manejo de Errores

### Capas de Error Handling

1. **Services Layer:**
   - Try/catch en funciones async
   - Return `Result<T, Error>` types
   - Log errors

2. **Hooks Layer:**
   - Captura errores de services
   - Actualiza estado local `error`
   - Propaga a UI

3. **Component Layer:**
   - Display error messages
   - Toast notifications
   - Error boundaries para crashes

### Ejemplo de Flujo de Error

```
Service throws error
       ↓
Hook catches error
       ↓
Hook updates error state
       ↓
Component reads error from hook
       ↓
Display Toast notification
       ↓
User sees friendly error message
```

## Seguridad

### Manejo de Claves

1. **NIP-07 Extension (Preferido):**
   - Claves NUNCA entran a la app
   - Firma delegada a extensión
   - Más seguro

2. **Claves Efímeras (Fallback):**
   - Generadas en browser
   - Guardadas en sessionStorage (no localStorage)
   - Warning claro al usuario
   - Solo para testing/pequeñas cantidades

### Validación de Eventos

- Verificar firma de todos los eventos recibidos
- Validar estructura antes de procesar
- Checkear que eventos son del pubkey esperado (Mostro daemon)

### XSS Protection

- React escapa por defecto
- No usar dangerouslySetInnerHTML
- Validar inputs del usuario

## Performance

### Optimizaciones Implementadas

1. **Code Splitting:**
   - Vite genera chunks automáticamente
   - React.lazy para lazy loading (si se necesita)

2. **Bundle Optimization:**
   - Vendors separados (react, nostr, lightning)
   - Tree shaking automático

3. **State Updates:**
   - Zustand solo re-renderiza componentes suscritos
   - Selectores granulares

4. **Network:**
   - Múltiples relays en paralelo
   - Deduplicación de eventos
   - Caché local (IndexedDB futuro)

### Métricas Objetivo

- First Contentful Paint: < 1.5s
- Time to Interactive: < 3s
- Bundle size: < 300KB gzipped
- Lighthouse score: > 90

## Testing Strategy (Futuro)

### Unit Tests
- Utils (crypto, formatting, validation)
- Services (nostr, mostro, lightning)
- Pure functions

### Integration Tests
- Hooks con stores
- Service interactions
- Event flows

### E2E Tests
- User flows completos
- Crear orden → Tomar orden → Completar

### Tools
- Vitest para unit tests
- Testing Library para components
- Playwright para E2E

## Deployment

### Build
```bash
npm run build
```
- Output: `dist/` folder
- Static files
- Optimized bundles

### Hosting Options

1. **Vercel/Netlify:** (Recomendado)
   - Zero config
   - CDN global
   - HTTPS automático

2. **GitHub Pages:**
   - Gratis
   - Simple deploy

3. **IPFS:**
   - Descentralizado
   - Aligns with Nostr philosophy

4. **Self-hosted:**
   - Nginx/Apache
   - Servir archivos estáticos

## Escalabilidad

### Horizontal Scaling
- Al ser client-side, escala naturalmente
- No backend propio
- Nostr relays manejan la carga

### Future Improvements

1. **PWA (Progressive Web App):**
   - Service Worker
   - Offline support
   - Install to home screen

2. **IndexedDB Cache:**
   - Caché local de órdenes
   - Historial offline
   - Sync al reconectar

3. **WebRTC P2P Chat:**
   - Chat directo entre peers
   - Sin pasar por relays
   - Más privacidad

4. **Multi-language:**
   - i18n con react-intl
   - Español, Inglés, Portugués

## Extensibilidad

### Agregar Nuevo Feature

1. Definir types en `src/types/`
2. Implementar service en `src/services/`
3. Crear store si necesita state global
4. Crear custom hook para usar el feature
5. Crear componentes UI
6. Integrar en routing

### Ejemplo: Agregar Reputación

```
types/reputation.ts → Interface de reputación
services/reputation.ts → Lógica de reputación
store/reputation.ts → State de reputación
hooks/useReputation.ts → Hook personalizado
components/reputation/ → Componentes UI
```

## Referencias

- **Nostr NIPs:** https://github.com/nostr-protocol/nips
- **Mostro Protocol:** https://mostro.network/protocol/
- **Lightning Network:** https://lightning.network
- **React Docs:** https://react.dev
- **Zustand Docs:** https://docs.pmnd.rs/zustand

---

**Última actualización:** Estructura inicial del proyecto
