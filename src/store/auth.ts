/**
 * @file auth.ts
 * @description Zustand store para autenticación Nostr
 *
 * TODO: Implementar store con:
 *
 * State:
 * - publicKey: string | null
 * - privateKey: string | null (solo si usa claves efímeras)
 * - isUsingExtension: boolean
 * - isAuthenticated: boolean
 * - authMethod: 'extension' | 'ephemeral' | null
 *
 * Actions:
 * - loginWithExtension(): Conectar con NIP-07 extension
 * - loginWithEphemeralKeys(): Generar claves temporales
 * - logout(): Cerrar sesión y limpiar state
 * - checkExtensionAvailable(): Detectar window.nostr
 *
 * Persistence:
 * - Guardar solo publicKey en localStorage
 * - privateKey en sessionStorage si es efímera
 * - Advertencias de seguridad
 */

export {};
