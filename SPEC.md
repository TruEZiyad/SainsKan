# SPEC — SainsKan

**Versi:** 1.0 (MVP)  
**Tanggal:** 2026-11-25  
**Status:** Siap diimplementasikan / prototype tersedia di `index.html`  
**Penulis:** System Analyst & Software Engineer

---

## 1. Tujuan

SainsKan adalah aplikasi edukasi berbasis web yang membantu pelajar SMP/SMA memahami konsep sains dasar melalui materi singkat, kuis interaktif, umpan balik penjelasan, dan simulasi sederhana. Pendekatan gamifikasi (poin, XP, level, badge, progress bar, daily challenge, leaderboard lokal) digunakan untuk menjaga motivasi belajar tanpa memerlukan akun, backend, atau data pribadi.

Tujuan terukur MVP:

1. Menyajikan **12 materi** (3 per kategori) yang dapat dibaca tanpa koneksi internet setelah halaman dimuat.
2. Menyediakan **36 soal kuis** pilihan ganda dengan penjelasan untuk jawaban benar **dan** salah.
3. Memberikan umpan balik kuantitatif (poin, XP, level, badge) yang **tidak dapat diambil dua kali** untuk kuis yang sama.
4. Menyediakan **3 simulasi interaktif** yang memakai rumus fisika/astronomi yang benar: jatuh bebas, orbit tata surya, dan hukum Ohm.
5. Menyimpan seluruh progres di `localStorage` dan tetap konsisten setelah halaman dimuat ulang.

---

## 2. Pengguna

| Peran | Karakteristik | Kebutuhan utama |
|---|---|---|
| Pelajar SMP | Usia ±12–15 tahun, pembelajaran konkret | Materi singkat, gambar, kuis, simulasi visual |
| Pelajar SMA | Usia ±15–18 tahun, siap dengan model matematis | Penjelasan konsep, rumus, simulasi dengan parameter |
| Guru pendamping | Memakai **satu perangkat yang sama** dengan pelajar | Dashboard ringkasan, leaderboard demo, tanpa login |

**Asumsi penting:** satu perangkat = satu profil pemain lokal. Tidak ada multi-akun, tidak ada login, tidak ada sinkronisasi. Identitas ditampilkan sebagai **alias acak/preset nonpribadi** (mis. `Komet`, `Neutron`), bukan nama asli.

---

## 3. Daftar Fitur (MVP)

### 3.1 Dashboard pembelajaran (gamifikasi)

- Kartu profil: alias, level, XP, progress menuju level berikutnya.
- Statistik ringkas: total poin, materi selesai, badge diraih, streak daily challenge.
- Empat kartu progress kategori (Fisika, Kimia, Biologi, Astronomi) dengan progress bar `selesai/3`.
- Kartu **Daily Challenge** tanggal lokal.
- Ringkasan pencapaian terbaru + tautan cepat ke simulasi dan leaderboard.

### 3.2 Kategori & materi

Empat kategori dengan 3 materi masing-masing (total 12):

| Kategori | Materi |
|---|---|
| Fisika | Gerak Jatuh Bebas; Hukum Newton Kedua; Energi Potensial & Kinetik |
| Kimia | Atom dan Elektron; Ikatan Kimia; Asam, Basa, dan pH |
| Biologi | Sel sebagai Unit Dasar; Fotosintesis; Sistem Peredaran Darah |
| Astronomi | Tata Surya Kita; Fase Bulan; Gravitasi dan Orbit |

Setiap materi memuat: judul, kategori, deskripsi, konten singkat (2–3 paragraf), `imageUrl` berupa **inline SVG data URI** (tanpa aset eksternal), dan tingkat kesulitan (Mudah/Sedang/Sulit).

### 3.3 Kuis interaktif

- 3 soal per materi = **36 soal** pilihan ganda (4 opsi).
- Setiap soal: `poin` (10 / 15 / 20), `penjelasan.benar`, `penjelasan.salah`.
- Umpan balik langsung setelah menjawab, tombol lanjut ke soal berikutnya.
- Layar hasil: skor persentase, benar/total, rincian poin, badge baru, tombol ulang.
- **Idempotensi hadiah:** penghargaan (poin soal + bonus) hanya diberikan pada **penyelesaian pertama** untuk `materiId`. Pengulangan kuis hanya memperbarui skor terbaik, tidak menambah poin/XP.

### 3.4 Progression system

| Event | `totalPoin` | `xp` |
|---|---:|---:|
| Jawaban benar | + poin soal | + poin soal |
| Kuis selesai pertama kali per materi | +20 | +20 |
| Daily challenge selesai pertama kali per tanggal lokal | +30 | +30 |
| Badge baru_diraih | 0 | +25 |

- `level = Math.floor(xp / 100) + 1`
- XP menuju level berikutnya = `100 - (xp % 100)`
- Badge dievaluasi otomatis setelah setiap event di atas; satu badge hanya diberikan sekali.

### 3.5 Achievement badges (11)

| id | Nama | Syarat |
|---|---|---|
| `pemula` | Pemula Sains | Selesaikan 1 kuis |
| `akademi_sempurna` | Akademi Sempurna | 3 kuis dengan skor ≥ 80 |
| `fisikawan` | Fisikawan Cilik | Selesaikan 3 materi Fisika |
| `kimiawan` | Kimiawan Cilik | Selesaikan 3 materi Kimia |
| `biolog` | Biolog Cilik | Selesaikan 3 materi Biologi |
| `astronom` | Astronom Cilik | Selesaikan 3 materi Astronomi |
| `pentas_ruang` | Pentas Ruang | Capai level 3 |
| `kolektor` | Kolektor Ilmu | Kumpulkan 500 total poin |
| `disiplin` | Disiplin Harian | 3 daily challenge berturut-turut |
| `penjelajah_sim` | Penjelajah Simulasi | Coba ketiga simulasi |
| `master_sains` | Master Sains | Selesaikan 12 materi |

### 3.6 Progress bar per kategori

Dihitung dari jumlah `materiSelesai` unik per kategori dibagi 3. Ditampilkan di dashboard (4 kartu) dan di halaman pencapaian.

### 3.7 Daily challenge (tanggal lokal)

- Tanggalan memakai `Date.getFullYear()/getMonth()+1/getDate()` perangkat (**bukan UTC**).
- 3 soal dipilih secara deterministik dari 36 soal berdasarkan hash tanggal `YYYY-MM-DD`; sehingga semua pemain di perangkat yang sama mendapat tantangan identik pada hari yang sama.
- Hadiah +30 XP/poin hanya **sekali per tanggal**.
- Streak bertambah jika tanggal penyelesaian sebelumnya = kemarin (lokal),否则 direset ke 1.

### 3.8 Leaderboard lokal

- 5 profil demo **nonpribadi** dengan XP tetap: `Nebula` 780, `Graviton` 620, `Bunsen` 455, `Darwin` 310, `Lensa` 180.
- Profil pemain lokal disisipkan dan diurutkan berdasarkan XP; baris pemain lokal diberi penanda.
- Tidak ada data jaringan, tidak ada server, tidak ada nama asli.

### 3.9 Simulasi sains interaktif

| Simulasi | Interaksi | Model ilmiah |
|---|---|---|
| Gravitasi | Slider massa (1–10 kg) & tinggi (1–100 m), tombol Jatuhkan/Ulangi | Ruang hampa, `a = g = 9,8 m/s²`, `t = √(2h/g)`, `v = √(2gh)`, `Ep = mgh`. Massa **tidak** mengubah waktu jatuh; ditampilkan eksplisit. |
| Tata surya | Slider kecepatan waktu ( tahun/detik ), play/pause, klik planet | 8 planet, periode relatif (Merkurius 0,24 … Neptunus 164,8 tahun) dan jarak AU. Orbit disederhanakan lingkaran; ukuran planet tidak berskala (dicatat di UI). |
| Rangkaian listrik | Slider V (1–12 V), R1 & R2 (1–10 Ω), switch Seri/Paralel | Seri: `R = R1 + R2`, `I = V/R`. Paralel: `1/R = 1/R1 + 1/R2`, `I = V/R`, `I1 = V/R1`, `I2 = V/R2`. Electron bergerak mengikuti besar arus. |

### 3.10 Dashboard ringkasan pencapaian

Menampilkan: level & XP, total poin, jumlah materi per kategori, badge terakhir, streak, dan status daily challenge. Bersifat ringkasan dari data yang sama dengan halaman Pencapaian.

### 3.11 Reset progres

- Tombol Reset di header → modal konfirmasi.
- Menghapus `xp`, `totalPoin`, `badge`, `materiSelesai`, `progres`, `daily`, `simulasiDicoba`.
- **Tidak** menghapus preferensi tema dan alias (preferensi UI dipertahankan).
- Setelah reset, dashboard kembali ke kondisi awal dan notifikasi tampil.

### 3.12 Penyimpanan

`localStorage` dengan key `sainskan.progress.v1`, versi skema `1`. Ditulis setiap kali state berubah. Jika data korup/versi berbeda → fallback ke state default + toast peringatan; aplikasi tetap berjalan.

---

## 4. Data Model

```js
Materi  = { id, judul, kategori, deskripsi, konten, imageUrl, tingkatKesulitan }
Kuis    = { id, materiId, pertanyaan, pilihanJawaban: string[],
            jawabanBenar: number, penjelasan: { benar, salah }, poin: number }
Pemain  = { id, namaAlias, xp, level, totalPoin, badge: string[], materiSelesai: string[] }
Progres = { pemainId, materiId, skor, status, tanggalPenyelesaian,
            awarded: boolean, attempts: number, jawaban: object }
Achievement = { id, nama, deskripsi, icon, syaratPencapaian: { type, value?, kategori? } }
```

State tersimpan:

```js
{
  version: 1,
  theme: 'dark' | 'light',
  alias: 'Komet',              // dari preset, bukan input bebas
  player: Pemain,
  progres: { [materiId]: Progres },
  daily: { tanggal, selesai, diambilAt, streak, terakhir },
  simulasiDicoba: ['gravitasi', 'tatasurya', 'rangkaian']
}
```

Relasi: `Kuis.materiId → Materi.id`; `Progres.pemainId → Pemain.id`; `Pemain.badge[] → Achievement.id`.

**Aturan integritas:**
- `materiSelesai` dan `progres` keduanya dipakai; keduanya diperbarui bersamaan dalam satu transaksi `save()`.
- `awarded=true` menjadi sumber kebenaran anti-dobel-poin.
- `skor` menyimpan **nilai terbaik** (maksimum dari semua attempt), bukan nilai attempt terakhir.

---

## 5. Nonfunctional Requirements

| Kode | Requirement |
|---|---|
| NFR-1 | **Single file.** Prototipe `index.html` berisi HTML + CSS + JS; dibuka langsung via `file://`, tanpa build, server, CDN, atau instalasi. |
| NFR-2 | **Tanpa backend & tanpa login.** Tidak ada form kredensial, tidak ada fetch ke API eksternal. |
| NFR-3 | **Privasi.** Tidak mengumpulkan nama, email, sekolah, atau data pribadi lain. Alias hanya dari preset. Tidak ada API key/token di kode. |
| NFR-4 | **Akurasi sains.** Rumus dan penjelasan sesuai fisika/kimia/biologi/astronomi standar SMA; simplifikasi simulasi diberi label. |
| NFR-5 | **Idempotensi.** Kuis yang sama tidak pernah memberikan poin/XP/badge dua kali; daily challenge sekali per tanggal lokal. |
| NFR-6 | **Responsif.** Tata letak usable di desktop ≥1024px dan smartphone ≥360px; navigasi menjadi horizontal scroller di layar sempit. |
| NFR-7 | **Tema.** Dark/light mode via CSS custom properties, tersimpan di localStorage, kontras teks memadai. |
| NFR-8 | **Animasi ringan.** Transisi ≤200ms; `prefers-reduced-motion` menonaktifkan animasi non-esensial; RAF dihentikan saat view/simulasi diganti. |
| NFR-9 | **Keamanan.** Tidak ada `eval`, tidak ada `innerHTML` dari input pengguna; semua teks dinamis di-escape. |
| NFR-10 | **Recovery.** localStorage korup ditangani dengan fallback aman, aplikasi tidak crash. |
| NFR-11 | **Aksesibilitas.** Tombol memiliki label, fokus terlihat, teks alternatif pada gambar, kontrol keyboard untuk kuis. |

---

## 6. Risiko & Mitigasi

| Risiko | Dampak | Mitigasi |
|---|---|---|
| Pemain mengulang kuis untuk "farming" poin | Skor tidak valid | Flag `awarded`; hadiah hanya sekali, attempt tetap dicatat |
| Pemain mengubah jam perangkat | Daily challenge bisa diulang | Tampilkan tanggal lokal; simpan `terakhir`; batasi streak hanya jika selisih tepat 1 hari |
| `localStorage` penuh / diblokir | Progres hilang | `try/catch` pada `setItem`, toast peringatan, state tetap berjalan di memori |
| Simulasi tata surya tampak "tidak realistis" | Kesalahpahaman konsep | Label "ukuran tidak berskala, orbit lingkaran"; periode relatif tetap benar |
| Massa dianggap mempercepat jatuh | Miskonsepsi fisika | UI menampilkan `t = √(2h/g)` dan catatan massa tidak berpengaruh di ruang hampa |
| Kuis dianggap "nilai akhir" | Attempt kedua menimpa skor terbaik | Simpan `Math.max(skorLama, skorBaru)` |
| Konten SVG data URI terlalu panjang | File besar | Ilustrasi generator parametrik per kategori, bukan gambar mentah |
| Satu perangkat dipakai bergantian | Progal tercampur | Dinyatakan sebagai batasan desain; alias dapat diganti tanpa menghapus progres |

---

## 7. Out of Scope (MVP)

- Login, registrasi, multi-akun, atau profil personal.
- Backend, database server, sync antar-perangkat, cloud save.
- Upload gambar/foto, kamera, mikrofon, atau suara.
- Soal isian/uraian, esai, atau penilaian guru otomatis.
- Simulasi 3D, kimia reaksi interaktif, atau laboratorium virtu­al penuh.
- Notifikasi push, email,/widget, atau Pengaturan akun.
- Analitik pihak ketiga, iklan, monetisasi.
- Konten kurikulum lengkap lintas jenjang; MVP hanya 12 materi contoh.
- Perubahan alias bebas (hanya preset) untuk mencegah data pribadi.

---

## 8. Acceptance Criteria (dapat diperiksa manual)

> Semua langkah dimulai dari kondisi **Reset progres** dan halaman dimuat ulang.

### AC-1 — Struktur & akses
1. Buka `index.html` langsung di browser (tanpa server/install).
2. **Expected:** aplikasi tampil, 4 kategori, 12 kartu materi, tidak ada permintaan jaringan, tidak ada kolom login.

### AC-2 — Kuis & penjelasan
1. Buka Fisika → Gerak Jatuh Bebas → Mulai Kuis; jawab salah satu soal dengan sengaja.
2. **Expected:** opsi salah ditandai merah, opsi benar ditandai hijau, teks penjelasan muncul untuk **keduanya**, tombol lanjut tersedia.
3. Selesaikan kuis dengan 3 jawaban benar.
4. **Expected:** layar hasil menampilkan `3/3`, `100%`, rincian `10 + 15 + 20 = 45`.

### AC-3 — Perhitungan poin & anti-dobel
1. Langsung setelah AC-2: cek dashboard.
2. **Expected:** `totalPoin = 65` (45 + bonus pertama 20), `xp = 90` (65 + badge `pemula` 25), `level = 1`, progress Fisika `1/3 = 33%`.
3. Ulangi kuis yang sama, jawab semua salah, lalu cek dashboard.
4. **Expected:** `totalPoin` tetap 65, `xp` tetap 90, skor terbaik tetap 100%, jumlah badge tidak bertambah, tombol结果显示 "Tidak ada poin baru (kuis sudah pernah diselesaikan)".

### AC-4 — Level
1. Selesaikan kuis materi berikutnya dengan skor ≥80.
2. **Expected:** XP naik sesuai aturan; saat `xp ≥ 100`, level berubah menjadi 2 dan progress bar menuju level 3 bergeser. (Contoh: setelah kuis K1 sempurna → `totalPoin = 130`, `xp = 155`, `level = 2`.)

### AC-5 — Badge
1. Selesaikan 3 materi Fisika.
2. **Expected:** badge `fisikawan` muncul di halaman Pencapaian dan XP bertambah 25.
2b. Selesaikan 3 kuis dengan skor ≥ 80 → `akademi_sempurna` muncul.
2c. Capai level 3 → `pentas_ruang` muncul.

### AC-6 — Daily challenge
1. Buka dashboard, catat 3 soal tantangan hari ini, selesaikan.
2. **Expected:** `+30` poin & XP masuk sekali; kartu berubah menjadi "Selesai hari ini"; streak = 1.
3. Muat ulang halaman.
4. **Expected:** status "Selesai hari ini" tetap, tidak ada tambahan poin.

### AC-7 — Simulasi sains
1. **Gravitasi:** atur tinggi 20 m, massa 1 kg → Jatuhkan; ubah massa jadi 10 kg → Jatuhkan lagi.
   **Expected:** waktu ≈ `2,02 s` pada kedua percobaan, energi potensial 10× lebih besar pada massa 10 kg.
2. **Tata surya:** set 1 tahun/detik → Bumi menyelesaikan 1 orbit dalam ≈1 detik; Merkurius ≈0,24 detik; klik Bumi muncul info periode 1 tahun.
3. **Rangkaian:** V=12, R1=2, R2=4, mode Seri → `R=6 Ω`, `I=2 A`, `V1=4 V`, `V2=8 V`. Ganti Paralel → `R=1,33 Ω`, `I=9 A`, `I1=6 A`, `I2=3 A`.

### AC-8 — Persistensi
1. Selesaikan 1 kuis, ubah tema ke light, muat ulang halaman.
2. **Expected:** poin/XP/level/badge/progress/daily/alias/tema kembali seperti sebelum reload.

### AC-9 — Reset
1. Klik Reset → konfirmasi.
3. **Expected:** poin = 0, XP = 0, level = 1, badge = 0, materi selesai = 0, semua progress bar 0%; tema & alias tetap; notifikasi reset muncul; setelah reload kondisi tetap kosong.

### AC-10 — Responsif & tema
1. Buka di smartphone 360px dan desktop 1280px; toggle dark/light.
2. **Expected:** tidak ada horizontal overflow, navigasi dapat diakses, teks terbaca di kedua tema, pilihan tersimpan setelah reload.

---

## 9. Implementation Plan per Iterasi

| Iterasi | Fokus | Deliverable | Done ketika |
|---|---|---|---|
| **0 — Fondasi** | Struktur HTML, CSS variables, theme toggle, state + localStorage + migrasi/validasi, router hash, toast, modal | Kerangka aplikasi, stylesheet, `store.js` (inline) | Tema & state bertahan setelah reload; data korup fallback |
| **1 — Konten & Navigasi** | Definisi 12 materi + generator SVG, 36 soal + penjelasan, halaman Materi & Detail | `data` lengkap, daftar & detail materi | 12 kartu tampil, filter kategori bekerja, gambar tampil tanpa jaringan |
| **2 — Kuis & Progression** | Engine kuis, perhitungan skor, `awarded`, XP/poin/level, evaluasi badge, layar hasil | Kuis 36 soal + progression | AC-2, AC-3, AC-4, AC-5 lolos |
| **3 — Dashboard & Harian** | Dashboard gamifikasi, progress bar per kategori, daily challenge lokal + streak, leaderboard demo, ringkasan pencapaian | Dashboard lengkap | AC-1, AC-6 lolos |
| **4 — Simulasi** | Canvas gravitasi, tata surya, rangkaian; kontrol & label ilmiah; pencatatan `simulasiDicoba` | 3 simulasi interaktif | AC-7 lolos; badge penjelajah muncul |
| **5 — Finishing** | Responsivitas, aksesibilitas, reduced-motion, reset, dokumentasi, uji manual AC-1…AC-10 | `index.html` final + `SPEC.md` | Semua AC lolos, tidak ada error konsol |

**Urutan pengerjaan prototype:** Iterasi 0 → 5 dikerjakan dalam satu `index.html` agar dapat langsung dijalankan, dengan urutan logika yang sama seperti tabel di atas.

---

## 10. Catatan Implementasi Prototipe

- Prototipe memakai **hash routing** (`#/dashboard`, `#/materi`, `#/materi/f1`, `#/kuis/f1`, `#/simulasi`, `#/pencapaian`, `#/leaderboard`) sehingga tombol Back browser berfungsi.
- Ilustrasi materi dibuat sebagai `data:image/svg+xml;charset=utf-8,...` dari fungsi generator; `imageUrl` tetap menjadi field data sesuai model.
- Seluruh teks dinamis melalui helper `esc()` sebelum disisipkan ke template.
- Simulasi memakai `requestAnimationFrame`; semua loop dihentikan pada `cleanup()` saat pindah halaman.
- Tidak ada dependensi eksternal sama sekali (tidak ada font CDN, tidak ada library UI).
