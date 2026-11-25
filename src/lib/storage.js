/**
 * Pembungkus localStorage yang tidak pernah melempar error ke UI.
 * Jika penyimpanan penuh/diblokir, aplikasi tetap berjalan di memori
 * dan pemanggil bisa memberi tahu pengguna lewat onError.
 */

let errorHandler = () => {};

export function setStorageErrorHandler(handler) {
  errorHandler = typeof handler === 'function' ? handler : () => {};
}

export function readRaw(key) {
  try {
    return { ok: true, value: window.localStorage.getItem(key) };
  } catch {
    return { ok: false, value: null };
  }
}

export function readJSON(key) {
  const result = readRaw(key);
  if (!result.ok || result.value === null) return { ok: false, value: null };
  try {
    return { ok: true, value: JSON.parse(result.value) };
  } catch {
    return { ok: false, value: null, corrupt: true };
  }
}

export function writeJSON(key, value) {
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
    return { ok: true };
  } catch {
    errorHandler('Penyimpanan penuh atau diblokir. Progres hanya tersimpan di memori sesi ini.');
    return { ok: false };
  }
}

export function removeKey(key) {
  try {
    window.localStorage.removeItem(key);
    return { ok: true };
  } catch {
    return { ok: false };
  }
}

export function isStorageAvailable() {
  try {
    const probe = '__sainskan_probe__';
    window.localStorage.setItem(probe, '1');
    window.localStorage.removeItem(probe);
    return true;
  } catch {
    return false;
  }
}
