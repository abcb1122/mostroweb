/**
 * @file crypto.ts
 * @description Utilidades criptográficas para Nostr
 */

import { generateSecretKey, getPublicKey, nip19 } from 'nostr-tools';
import { HEX_PUBKEY_REGEX, NPUB_REGEX } from './constants';

// ============================================
// UTILIDADES DE CONVERSIÓN
// ============================================

/**
 * Convierte bytes a string hexadecimal
 */
export function bytesToHex(bytes: Uint8Array): string {
  return Array.from(bytes)
    .map((byte) => byte.toString(16).padStart(2, '0'))
    .join('');
}

/**
 * Convierte string hexadecimal a bytes
 */
export function hexToBytes(hex: string): Uint8Array {
  if (hex.length % 2 !== 0) {
    throw new Error('Hex string must have an even length');
  }

  const bytes = new Uint8Array(hex.length / 2);
  for (let i = 0; i < hex.length; i += 2) {
    bytes[i / 2] = parseInt(hex.slice(i, i + 2), 16);
  }
  return bytes;
}

// ============================================
// GENERACIÓN DE CLAVES
// ============================================

/**
 * Genera un par de claves Nostr (privada y pública)
 */
export function generateKeyPair(): { privateKey: string; publicKey: string } {
  const secretKey = generateSecretKey();
  const privateKeyHex = bytesToHex(secretKey);
  const publicKeyHex = getPublicKey(secretKey);

  return {
    privateKey: privateKeyHex,
    publicKey: publicKeyHex,
  };
}

/**
 * Deriva la clave pública desde una clave privada
 */
export function pubkeyFromPrivateKey(privateKeyHex: string): string {
  try {
    const secretKey = hexToBytes(privateKeyHex);
    return getPublicKey(secretKey);
  } catch (error) {
    throw new Error('Invalid private key');
  }
}

// ============================================
// CONVERSIONES BECH32 (NIP-19)
// ============================================

/**
 * Convierte una public key hex a npub (bech32)
 */
export function npubEncode(pubkeyHex: string): string {
  try {
    return nip19.npubEncode(pubkeyHex);
  } catch (error) {
    throw new Error('Failed to encode npub');
  }
}

/**
 * Decodifica un npub (bech32) a hex
 */
export function npubDecode(npub: string): string {
  try {
    const decoded = nip19.decode(npub);
    if (decoded.type !== 'npub') {
      throw new Error('Not an npub');
    }
    return decoded.data;
  } catch (error) {
    throw new Error('Invalid npub');
  }
}

/**
 * Convierte una private key hex a nsec (bech32)
 */
export function nsecEncode(privateKeyHex: string): string {
  try {
    const bytes = hexToBytes(privateKeyHex);
    return nip19.nsecEncode(bytes);
  } catch (error) {
    throw new Error('Failed to encode nsec');
  }
}

/**
 * Decodifica un nsec (bech32) a hex
 */
export function nsecDecode(nsec: string): string {
  try {
    const decoded = nip19.decode(nsec);
    if (decoded.type !== 'nsec') {
      throw new Error('Not an nsec');
    }
    return bytesToHex(decoded.data as Uint8Array);
  } catch (error) {
    throw new Error('Invalid nsec');
  }
}

// ============================================
// VALIDACIONES
// ============================================

/**
 * Valida si una string es una public key válida (hex)
 */
export function isValidPublicKey(key: string): boolean {
  return HEX_PUBKEY_REGEX.test(key);
}

/**
 * Valida si una string es una private key válida (hex)
 */
export function isValidPrivateKey(key: string): boolean {
  // Private key es también de 64 caracteres hex
  if (!HEX_PUBKEY_REGEX.test(key)) {
    return false;
  }

  try {
    // Intentar derivar la public key
    pubkeyFromPrivateKey(key);
    return true;
  } catch {
    return false;
  }
}

/**
 * Valida si una string es un npub válido (bech32)
 */
export function isValidNpub(npub: string): boolean {
  if (!NPUB_REGEX.test(npub)) {
    return false;
  }

  try {
    npubDecode(npub);
    return true;
  } catch {
    return false;
  }
}

/**
 * Valida si una string es un nsec válido (bech32)
 */
export function isValidNsec(nsec: string): boolean {
  if (!nsec.startsWith('nsec1')) {
    return false;
  }

  try {
    nsecDecode(nsec);
    return true;
  } catch {
    return false;
  }
}

/**
 * Normaliza una public key (acepta hex o npub, retorna hex)
 */
export function normalizePublicKey(key: string): string {
  // Ya es hex
  if (isValidPublicKey(key)) {
    return key.toLowerCase();
  }

  // Es npub
  if (isValidNpub(key)) {
    return npubDecode(key).toLowerCase();
  }

  throw new Error('Invalid public key format');
}

/**
 * Genera un ID aleatorio (para subscripciones, etc)
 */
export function generateRandomId(length: number = 16): string {
  const bytes = new Uint8Array(length);
  crypto.getRandomValues(bytes);
  return bytesToHex(bytes);
}

export {};
