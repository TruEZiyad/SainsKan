# SainsKan

Aplikasi edukasi sains untuk pelajar SMP/SMA: 12 materi, 36 soal kuis dengan penjelasan, 11 badge, daily challenge, leaderboard lokal, 3 simulasi interaktif, serta dashboard guru. Seluruh data belajar disimpan di perangkat (local-first).

Versi ini adalah hasil transformasi prototype `index.html` monolitik menjadi proyek **Vite + JavaScript vanilla + HTML5 + CSS** yang siap dibangun dan dideploy sebagai situs statis.

## Menjalankan

```bash
npm install
npm run dev        # http://localhost:5173
npm run build      # output ke dist/
npm run preview    # pratinjau hasil build
npm test           # 18 test (unit + integrasi jsdom)
```

Web Crypto (PBKDF2) membutuhkan **secure context**. Gunakan `localhost` saat development atau HTTPS saat produksi; membuka `index.html` langsung lewat `file://` tidak lagi didukung.

## Akun demo

| Peran | Username | Password |
|---|---|---|
| Guru | `Guru Sains` | `123` |
| Siswa | `Komet`, `Neutron`, `Orbit`, `Awan`, `Raksa`, `Supernova` | `123` |

Akun guru dapat menambah siswa baru (password otomatis `123`). Akun dan progres hanya ada di `localStorage` perangkat tersebut; tidak ada sinkronisasi antarperangkat.

## Struktur

```
index.html                Entry Vite
public/favicon.svg
src/
  main.js                 Bootstrap, router guard, event delegation
  store.js                DB lokal, migrasi, login, akun, reset
  ui-state.js             State UI (filter, kuis, modal, simulasi)
  data/                   Materi, 36 soal, badge, akun demo, planet
  lib/
    password.js           PBKDF2-SHA256 via Web Crypto
    progress.js           Poin, XP, badge, anti-dobel, daily challenge
    scoring.js            Rumus gravitasi & Hukum Ohm
    router.js             Hash router
    storage.js            Wrapper localStorage yang aman
    art.js                Ilustrasi SVG data URI
    utils.js              Escape HTML, tanggal lokal, format angka
  ui/                     Shell, toast, modal focus-trap
  views/                  Login, dashboard, materi, kuis, simulasi, dll.
  simulations/            Canvas gravitasi, tata surya, rangkaian
  styles/app.css          Design system (CSS custom properties)
tests/                    Vitest: scoring, progres, password, store, alur UI
```

## Perubahan dari prototype

- **Build tooling:** modul ES + Vite, bundling/minifikasi, aset relatif (`base: './'`) sehingga bisa dideploy di root maupun subfolder.
- **Keamanan akun:** password tidak lagi plaintext di `localStorage`. Kredensial disimpan sebagai hash **PBKDF2-SHA256 (120.000 iterasi, salt unik)**. Perbandingan hash memakai constant-time compare. Validasi login tetap memberi pesan generik.
- **Migrasi data:** data prototype `sainskan.progress.v2`/`v1` dimigrasikan sekali ke skema v3, password plaintext di-hash, lalu salinan lama dihapus.
- **Validasi & pemulihan:** state dan akun dinormalisasi (angka, id materi/badge/simulasi, relasi `awarded` ↔ `materiSelesai`). Data korup tidak membuat aplikasi crash; fallback aman disertai notifikasi.
- **Anti-dobel dipertahankan:** hadiah kuis, bonus pertama, daily challenge, dan badge tetap idempoten.
- **Reset yang benar:** reset mengosongkan progres tanpa memunculkan kembali data contoh akun seed; preferensi tema dipertahankan.
- **Aksesibilitas:** navigasi dengan `aria-current`, label form, `aria-live` pada error/toast, modal dengan focus trap + Escape, dukungan keyboard kartu materi, skip-link, dan `prefers-reduced-motion`.
- **Performa & lifecycle:** semua animasi canvas memakai satu `requestAnimationFrame` per halaman dan dibersihkan saat pindah view; canvas diskalakan mengikuti devicePixelRatio.
- **Bug prototype yang diperbaiki:** sorting nama guru yang selalu bernilai 0, pencarian guru yang kehilangan fokus, dan guard route saat boot.

## Batasan (local-first)

- Tidak ada backend, sehingga akun/progres dapat dimodifikasi oleh pengguna perangkat dan tidak tersinkron.
- Password `123` hanya untuk akun demo. Untuk penggunaan nyata, ganti dengan autentikasi server (Argon2/bcrypt), HTTPS, rate limiting, dan penyimpanan terpusat.
- Spesifikasi prototype lengkap tersedia di [`SPEC.md`](./SPEC.md); beberapa detail penyimpanan di sana sudah digantikan oleh skema v3 di aplikasi ini.
