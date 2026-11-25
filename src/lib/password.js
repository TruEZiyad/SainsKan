/**
 * Hashing password dengan PBKDF2-SHA256 (Web Crypto).
 * Password plaintext tidak pernah disimpan di localStorage.
 * Web Crypto membutuhkan secure context (HTTPS atau localhost).
 */

const ALGORITHM = 'PBKDF2-SHA256';
const ITERATIONS = 120_000;
const SALT_BYTES = 16;
const KEY_BITS = 256;
const encoder = new TextEncoder();

export function isCryptoAvailable() {
  return typeof globalThis.crypto?.subtle !== 'undefined';
}

function toHex(bytes) {
  return Array.from(bytes, (byte) => byte.toString(16).padStart(2, '0')).join('');
}

function fromHex(hex) {
  if (typeof hex !== 'string' || hex.length % 2 !== 0) {
    throw new Error('Format salt tidak valid.');
  }
  const bytes = new Uint8Array(hex.length / 2);
  for (let i = 0; i < bytes.length; i += 1) {
    bytes[i] = Number.parseInt(hex.slice(i * 2, i * 2 + 2), 16);
  }
  return bytes;
}

async function derive(password, salt, iterations) {
  if (!isCryptoAvailable()) {
    throw new Error('Browser ini tidak mendukung Web Crypto. Jalankan aplikasi melalui HTTPS atau localhost.');
  }
  const key = await globalThis.crypto.subtle.importKey(
    'raw',
    encoder.encode(password),
    'PBKDF2',
    false,
    ['deriveBits'],
  );
  const bits = await globalThis.crypto.subtle.deriveBits(
    { name: 'PBKDF2', salt, iterations, hash: 'SHA-256' },
    key,
    KEY_BITS,
  );
  return toHex(new Uint8Array(bits));
}

/** Buat kredensial baru dari password plaintext. */
export async function hashPassword(password) {
  if (typeof password !== 'string' || password.length === 0) {
    throw new Error('Password tidak boleh kosong.');
  }
  const salt = globalThis.crypto.getRandomValues(new Uint8Array(SALT_BYTES));
  return {
    algorithm: ALGORITHM,
    iterations: ITERATIONS,
    salt: toHex(salt),
    hash: await derive(password, salt, ITERATIONS),
  };
}

function timingSafeEqual(a, b) {
  if (typeof a !== 'string' || typeof b !== 'string' || a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i += 1) {
    diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  }
  return diff === 0;
}

/** Periksa password terhadap kredensial tersimpan. */
export async function verifyPassword(password, credential) {
  if (!credential || credential.algorithm !== ALGORITHM) return false;
  try {
    const salt = fromHex(credential.salt);
    const hash = await derive(password, salt, credential.iterations);
    return timingSafeEqual(hash, credential.hash);
  } catch {
    return false;
  }
}
