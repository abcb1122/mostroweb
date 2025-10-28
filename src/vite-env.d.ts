/// <reference types="vite/client" />

/**
 * Type definitions for Vite environment
 */

interface ImportMetaEnv {
  readonly VITE_APP_TITLE: string;
  // TODO: Agregar más variables de entorno si es necesario
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
