import { webcrypto } from 'node:crypto';

// Vitest berjalan di Node; pastikan Web Crypto tersedia juga saat environment jsdom.
if (typeof globalThis.crypto?.subtle === 'undefined') {
  Object.defineProperty(globalThis, 'crypto', {
    value: webcrypto,
    configurable: true,
  });
}

if (typeof window !== 'undefined') {
  window.scrollTo = () => {};
  window.HTMLElement.prototype.scrollIntoView = () => {};
}
