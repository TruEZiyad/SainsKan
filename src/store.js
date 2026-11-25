import { ACHIEVEMENTS } from './data/achievements.js';
import { DEFAULT_ACCOUNTS, DEMO_PASSWORD } from './data/accounts.js';
import { MATERI } from './data/materi.js';
import { hashPassword, isCryptoAvailable, verifyPassword } from './lib/password.js';
import { levelOf, normalizeAccountName, todayStr } from './lib/utils.js';
import { readJSON, removeKey, writeJSON } from './lib/storage.js';

export const SCHEMA = 3;
const STORAGE_KEY = 'sainskan.db.v3';
const LEGACY_V2_KEY = 'sainskan.progress.v2';
const LEGACY_V1_KEY = 'sainskan.progress.v1';
const VALID_ROLES = new Set(['guru', 'siswa']);
const SIMULATION_IDS = new Set(['gravitasi', 'tatasurya', 'rangkaian']);
const VALID_MATERI_IDS = new Set(MATERI.map((materi) => materi.id));
const VALID_BADGE_IDS = new Set(ACHIEVEMENTS.map((achievement) => achievement.id));

export const db = {
  version: SCHEMA,
  session: null,
  accounts: [],
  progress: {},
  settings: { theme: 'dark' },
};

/** State siswa yang sedang dipakai. Null saat belum login / login guru. */
export let activeState = null;

/** Pesan sekali tampil setelah boot (migrasi/pemulihan data). */
export let initNotice = '';

export function setActiveState(next) {
  activeState = next && typeof next === 'object' ? next : null;
}

export function getAccounts() {
  return db.accounts;
}

export function getStudentAccounts() {
  return db.accounts.filter((account) => account.role === 'siswa');
}

export function getCurrentUser() {
  return db.accounts.find((account) => account.username === db.session) || null;
}

export function getState(username) {
  return db.progress[username] || null;
}

export function getTheme() {
  return db.settings.theme === 'light' ? 'light' : 'dark';
}

export function setTheme(theme) {
  db.settings.theme = theme === 'light' ? 'light' : 'dark';
  saveDB();
}

export function saveDB() {
  return writeJSON(STORAGE_KEY, db);
}

/** Simpan state siswa aktif ke db lalu tulis ke localStorage. */
export function persist() {
  if (activeState?.alias) db.progress[activeState.alias] = activeState;
  saveDB();
}

function finiteNumber(value, fallback = 0, min = 0, max = Number.MAX_SAFE_INTEGER) {
  const number = Number(value);
  if (!Number.isFinite(number)) return fallback;
  return Math.min(max, Math.max(min, number));
}

function normalizeText(value, fallback = '') {
  return typeof value === 'string' ? value : fallback;
}

/** State bersih tanpa data contoh (dipakai untuk akun baru dan reset). */
export function createBlankState(username) {
  return {
    version: SCHEMA,
    alias: username,
    player: {
      id: `pemain-${username}`,
      namaAlias: username,
      xp: 0,
      level: 1,
      totalPoin: 0,
      badge: [],
      materiSelesai: [],
    },
    progres: {},
    daily: { tanggal: '', selesai: false, diambilAt: '', streak: 0, terakhir: '' },
    simulasiDicoba: [],
  };
}

/** State awal untuk akun demo, memakai data contoh bila tersedia. */
function createSeedState(account) {
  const state = createBlankState(account.username);
  const seed = account.seed && typeof account.seed === 'object' ? account.seed : null;
  if (!seed) return state;

  const completed = Array.isArray(seed.materiSelesai)
    ? [...new Set(seed.materiSelesai.filter((id) => VALID_MATERI_IDS.has(id)))]
    : [];
  state.player.xp = finiteNumber(seed.xp);
  state.player.totalPoin = finiteNumber(seed.totalPoin);
  state.player.badge = Array.isArray(seed.badge)
    ? [...new Set(seed.badge.filter((id) => VALID_BADGE_IDS.has(id)))]
    : [];
  state.player.materiSelesai = completed;
  state.player.level = levelOf(state.player.xp);
  state.daily.streak = finiteNumber(seed.streak);

  completed.forEach((id) => {
    state.progres[id] = {
      pemainId: account.username,
      materiId: id,
      skor: 100,
      status: 'selesai',
      tanggalPenyelesaian: todayStr(),
      awarded: true,
      attempts: 1,
      jawaban: { benar: 3, total: 3 },
    };
  });

  return state;
}

function normalizeState(raw, username) {
  const state = createBlankState(username);
  if (!raw || typeof raw !== 'object') return state;

  const player = raw.player && typeof raw.player === 'object' ? raw.player : {};
  const completed = Array.isArray(player.materiSelesai)
    ? [...new Set(player.materiSelesai.filter((id) => VALID_MATERI_IDS.has(id)))]
    : [];
  const badges = Array.isArray(player.badge)
    ? [...new Set(player.badge.filter((id) => VALID_BADGE_IDS.has(id)))]
    : [];

  const progress = {};
  if (raw.progres && typeof raw.progres === 'object') {
    for (const [id, value] of Object.entries(raw.progres)) {
      if (!VALID_MATERI_IDS.has(id) || !value || typeof value !== 'object') continue;
      const awarded = value.awarded === true;
      progress[id] = {
        pemainId: username,
        materiId: id,
        skor: finiteNumber(value.skor, 0, 0, 100),
        status: value.status === 'selesai' ? 'selesai' : 'sedang',
        tanggalPenyelesaian: normalizeText(value.tanggalPenyelesaian),
        awarded,
        attempts: Math.floor(finiteNumber(value.attempts)),
        jawaban:
          value.jawaban && typeof value.jawaban === 'object'
            ? {
                benar: Math.floor(finiteNumber(value.jawaban.benar)),
                total: Math.floor(finiteNumber(value.jawaban.total)),
              }
            : {},
      };
      if (awarded && !completed.includes(id)) completed.push(id);
    }
  }

  const daily = raw.daily && typeof raw.daily === 'object' ? raw.daily : {};
  const xp = finiteNumber(player.xp);

  return {
    version: SCHEMA,
    alias: username,
    player: {
      id: normalizeText(player.id, `pemain-${username}`),
      namaAlias: username,
      xp,
      level: levelOf(xp),
      totalPoin: finiteNumber(player.totalPoin),
      badge: badges,
      materiSelesai: completed,
    },
    progres: progress,
    daily: {
      tanggal: normalizeText(daily.tanggal),
      selesai: daily.selesai === true,
      diambilAt: normalizeText(daily.diambilAt),
      streak: Math.floor(finiteNumber(daily.streak)),
      terakhir: normalizeText(daily.terakhir),
    },
    simulasiDicoba: Array.isArray(raw.simulasiDicoba)
      ? [...new Set(raw.simulasiDicoba.filter((id) => SIMULATION_IDS.has(id)))]
      : [],
  };
}

function isCredential(value) {
  return (
    value &&
    typeof value === 'object' &&
    typeof value.algorithm === 'string' &&
    typeof value.salt === 'string' &&
    typeof value.hash === 'string' &&
    Number.isFinite(Number(value.iterations))
  );
}

async function createAccountRecord(base, { credential, seed } = {}) {
  const username = normalizeAccountName(base.username);
  if (!username) throw new Error('Username akun tidak valid.');
  return {
    username,
    displayName: normalizeAccountName(base.displayName || username),
    role: VALID_ROLES.has(base.role) ? base.role : 'siswa',
    custom: base.custom !== false,
    credential: credential || (await hashPassword(base.password || DEMO_PASSWORD)),
    ...(seed ? { seed } : {}),
  };
}

function mergeDefaultAccounts(accounts) {
  const result = [...accounts];
  const seen = new Set(result.map((account) => account.username.toLowerCase()));
  for (const base of DEFAULT_ACCOUNTS) {
    if (!seen.has(base.username.toLowerCase())) {
      result.push(base);
      seen.add(base.username.toLowerCase());
    }
  }
  return result;
}

async function materializeAccounts(list) {
  const accounts = [];
  const seen = new Set();

  for (const base of list) {
    if (!base || typeof base !== 'object') continue;
    const username = normalizeAccountName(base.username);
    if (!username || seen.has(username.toLowerCase())) continue;
    if (!VALID_ROLES.has(base.role)) continue;

    const credential = isCredential(base.credential)
      ? base.credential
      : await hashPassword(typeof base.password === 'string' ? base.password : DEMO_PASSWORD);
    const seed = base.seed && typeof base.seed === 'object' ? base.seed : undefined;
    const account = await createAccountRecord(base, { credential, seed });
    accounts.push(account);
    seen.add(username.toLowerCase());
  }

  return accounts;
}

async function attachDefaults(rawAccounts) {
  const materialized = await materializeAccounts(rawAccounts);
  const withDefaults = mergeDefaultAccounts(materialized);
  // Default yang baru dimasukkan belum punya kredensial.
  return materializeAccounts(withDefaults);
}

async function buildProgress(accounts, rawProgress) {
  const progress = {};
  for (const account of accounts) {
    if (account.role !== 'siswa') continue;
    const raw = rawProgress && typeof rawProgress === 'object' ? rawProgress[account.username] : null;
    progress[account.username] = raw
      ? normalizeState(raw, account.username)
      : createSeedState(account);
  }
  return progress;
}

function themeFrom(raw) {
  const theme = raw?.settings?.theme;
  if (theme === 'light' || theme === 'dark') return theme;
  if (raw?.session && raw?.progress?.[raw.session]?.theme === 'light') return 'light';
  return 'dark';
}

async function normalizeDB(raw) {
  if (!raw || typeof raw !== 'object' || !Array.isArray(raw.accounts)) return null;
  const accounts = await attachDefaults(raw.accounts);
  if (!accounts.length) return null;
  const progress = await buildProgress(accounts, raw.progress);
  const session = accounts.some((account) => account.username === raw.session) ? raw.session : null;
  return {
    version: SCHEMA,
    session,
    accounts,
    progress,
    settings: { theme: themeFrom(raw) },
  };
}

async function createFreshDB() {
  const accounts = await materializeAccounts(DEFAULT_ACCOUNTS);
  const progress = await buildProgress(accounts, {});
  return {
    version: SCHEMA,
    session: null,
    accounts,
    progress,
    settings: { theme: 'dark' },
  };
}

/** Migrasi data prototype v2 (password plaintext) ke skema v3. */
async function migrateV2(raw) {
  if (!raw || raw.version !== 2 || !Array.isArray(raw.accounts)) return null;

  const rawAccounts = raw.accounts.map((account) => ({
    username: account?.username,
    displayName: account?.displayName,
    role: account?.role,
    custom: true,
    password: typeof account?.password === 'string' ? account.password : DEMO_PASSWORD,
    seed: account?.seed,
  }));
  const accounts = await attachDefaults(rawAccounts);
  const progress = await buildProgress(accounts, raw.progress);
  const session = accounts.some((account) => account.username === raw.session) ? raw.session : null;

  return {
    version: SCHEMA,
    session,
    accounts,
    progress,
    settings: { theme: themeFrom(raw) },
  };
}

/** Migrasi progres v1 ke akun Komet. */
async function migrateV1() {
  const legacy = readJSON(LEGACY_V1_KEY);
  if (!legacy.ok || !legacy.value?.player?.namaAlias) return null;
  const fresh = await createFreshDB();
  const name = normalizeAccountName(legacy.value.player.namaAlias);
  const target = name || 'Komet';
  if (!fresh.accounts.some((account) => account.username === target)) return fresh;
  fresh.progress[target] = normalizeState(legacy.value, target);
  fresh.session = target;
  return fresh;
}

function stripSeeds() {
  db.accounts = db.accounts.map(({ seed, ...account }) => account);
}

/**
 * Inisialisasi database: migrasi dari prototype, validasi, lalu simpan.
 * Melempar error yang bisa ditampilkan main.js bila Web Crypto tidak tersedia.
 */
export async function initStore() {
  if (!isCryptoAvailable()) {
    const error = new Error('Web Crypto tidak tersedia. Buka aplikasi melalui HTTPS atau localhost.');
    error.code = 'CRYPTO_UNAVAILABLE';
    throw error;
  }

  const storedV3 = readJSON(STORAGE_KEY);
  let notice = '';
  if (storedV3.corrupt) {
    notice = 'Data lokal tidak terbaca. Aplikasi dimulai ulang dengan progres awal.';
  }

  let next = storedV3.ok ? await normalizeDB(storedV3.value) : null;

  if (!next) {
    const v2 = readJSON(LEGACY_V2_KEY);
    next = v2.ok ? await migrateV2(v2.value) : null;
    if (next) {
      notice = 'Data prototype berhasil dimigrasikan ke penyimpanan aman.';
    } else {
      next = await migrateV1();
      if (next) notice = 'Progres prototype berhasil dimigrasikan.';
    }
  }

  if (!next) next = await createFreshDB();
  initNotice = notice;


  Object.assign(db, next);
  stripSeeds();
  saveDB();

  removeKey(LEGACY_V1_KEY);
  // Jangan tinggalkan salinan akun berpassword plaintext dari prototype v2.
  removeKey(LEGACY_V2_KEY);

  if (db.session) {
    const user = getCurrentUser();
    if (!user) {
      db.session = null;
    } else if (user.role === 'siswa') {
      activeState = db.progress[user.username] || null;
    }
  }

  return db;
}

/** Login lokal; password diverifikasi terhadap hash PBKDF2. */
export async function login(username, password) {
  const name = normalizeAccountName(username);
  const account = db.accounts.find((item) => item.username.toLowerCase() === name.toLowerCase());
  const genericError = 'Username atau password salah.';

  if (!account) {
    // Tetap lakukan verifikasi palsu agar waktu respons tidak membocorkan akun.
    await verifyPassword(password, {
      algorithm: 'PBKDF2-SHA256',
      iterations: 120_000,
      salt: '00'.repeat(16),
      hash: '00'.repeat(32),
    });
    return { ok: false, error: genericError };
  }

  const valid = await verifyPassword(password, account.credential);
  if (!valid) return { ok: false, error: genericError };

  db.session = account.username;
  activeState = null;
  if (account.role === 'siswa') {
    if (!db.progress[account.username]) {
      db.progress[account.username] = createBlankState(account.username);
    }
    activeState = db.progress[account.username];
  }
  saveDB();
  return { ok: true, account };
}

export function logout() {
  db.session = null;
  activeState = null;
  saveDB();
}

/**
 * Tambah akun siswa baru (khusus guru).
 * Username unik case-insensitive; password demo di-hash.
 */
export async function addStudent(rawName) {
  const name = normalizeAccountName(rawName);

  if (!/^[\p{L}\p{N} _-]{3,24}$/u.test(name)) {
    return {
      ok: false,
      error: 'Gunakan 3–24 karakter: huruf, angka, spasi, tanda hubung, atau garis bawah.',
    };
  }
  if (db.accounts.some((account) => account.username.toLowerCase() === name.toLowerCase())) {
    return { ok: false, error: `Username "${name}" sudah digunakan. Pilih nama akun lain.` };
  }

  const account = await createAccountRecord(
    { username: name, displayName: name, role: 'siswa', custom: true },
    { credential: await hashPassword(DEMO_PASSWORD) },
  );
  db.accounts.push(account);
  db.progress[name] = createBlankState(name);
  saveDB();
  return { ok: true, account };
}

/** Reset progres siswa aktif; tema (preferensi perangkat) dipertahankan. */
export function resetProgress() {
  const user = getCurrentUser();
  if (!user || user.role !== 'siswa') return null;
  activeState = createBlankState(user.username);
  db.progress[user.username] = activeState;
  saveDB();
  return activeState;
}

export function totalStudents() {
  return getStudentAccounts().length;
}
