/** Utilitas kecil yang dipakai lintas modul. */

const ESCAPE_MAP = {
  '&': '&amp;',
  '<': '&lt;',
  '>': '&gt;',
  '"': '&quot;',
  "'": '&#39;',
};

/** Escape teks sebelum dimasukkan ke template HTML. */
export function esc(value) {
  return String(value ?? '').replace(/[&<>"']/g, (char) => ESCAPE_MAP[char]);
}

/** Format angka dengan pemisah ribuan Indonesia. */
export function formatNumber(value) {
  const number = Number(value);
  if (!Number.isFinite(number)) return '0';
  return number.toLocaleString('id-ID');
}

/** Tanggal lokal perangkat dalam format YYYY-MM-DD (bukan UTC). */
export function todayStr(date = new Date()) {
  return [
    date.getFullYear(),
    String(date.getMonth() + 1).padStart(2, '0'),
    String(date.getDate()).padStart(2, '0'),
  ].join('-');
}

export function yesterdayStr(date = new Date()) {
  const copy = new Date(date);
  copy.setDate(copy.getDate() - 1);
  return todayStr(copy);
}

export function formatDateID(date = new Date()) {
  return date.toLocaleDateString('id-ID', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
}

export function pct(done, total) {
  if (!total) return 0;
  return Math.round((done / total) * 100);
}

export function levelOf(xp) {
  const value = Number(xp);
  const safe = Number.isFinite(value) && value > 0 ? value : 0;
  return Math.floor(safe / 100) + 1;
}

export function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value));
}

/** Validasi nama akun siswa: 3–24 karakter, huruf/angka/spasi/-/_. */
export function isValidAccountName(name) {
  return /^[\p{L}\p{N} _-]{3,24}$/u.test(name);
}

export function normalizeAccountName(name) {
  return String(name ?? '').trim().replace(/\s+/g, ' ');
}
