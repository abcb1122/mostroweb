/**
 * @file main.tsx
 * @description Entry point de la aplicación
 *
 * TODO: Configurar:
 * - Import de React
 * - Import de ReactDOM
 * - Import de App
 * - Import de estilos globales (Tailwind)
 * - Render de la app en #root
 * - StrictMode
 */

import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
