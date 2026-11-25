# SPEC — SainsKan

**Versi:** 1.1 (MVP + akun per peran)  
**Tanggal:** 2026-11-25  
**Status:** Siap diimplementasikan / prototype tersedia di `index.html`, `users.js`  
**Penulis:** System Analyst & Software Engineer

> **Perubahan dari v1.0:** ruang lingkup ditambah dengan login lokal per pengguna dan panel guru. **Seluruh akun (guru + siswa) disimpan di `localStorage`.** `users.js` sengaja dikosongkan. Autentikasi ini **hanya untuk prototype/demo lokal** dan tidak layak untuk produksi.

---

## 1. Tujuan

SainsKan adalah aplikasi edukasi berbasis web yang membantu pelajar SMP/SMA memahami konsep sains dasar melalui materi singkat, kuis interaktif, umpan balik penjelasan, dan simulasi sederhana. Pendekatan gamifikasi (poin, XP, level, badge, progress bar, daily challenge, leaderboard lokal) digunakan untuk menjaga motivasi belajar. Versi 1.1 menambahkan **akun lokal per peran**: siswa belajar, guru memantau progres seluruh siswa pada perangkat yang sama. Tidak ada backend dan tidak ada data pribadi yang dikirim keluar perangkat.

Tujuan terukur MVP:

1. Menyajikan **12 materi** (3 per kategori) yang dapat dibaca tanpa koneksi internet setelah halaman dimuat.
2. Menyediakan **36 soal kuis** pilihan ganda dengan penjelasan untuk jawaban benar **dan** salah.
3. Memberikan umpan balik kuantitatif (poin, XP, level, badge) yang **tidak dapat diambil dua kali** untuk kuis yang sama.
4. Menyediakan **3 simulasi interaktif** yang memakai rumus fisika/astronomi yang benar: jatuh bebas, orbit tata surya, dan hukum Ohm.
5. Menyimpan seluruh progres **per akun siswa** di `localStorage` dan tetap konsisten setelah halaman dimuat ulang.
6. Menyediakan login lokal dengan username per akun dan password `123`, memisahkan fitur siswa dan guru.
7. Menyimpan **seluruh data login (guru + siswa)** — username, password, peran, dan data contoh progres siswa — di `localStorage`; `users.js` tidak berisi akun sama sekali.
8. Menyediakan dashboard guru yang menampilkan poin, XP, level, jumlah materi selesai, streak harian, badge, dan detail per siswa.

---

## 2. Pengguna

| Peran | Karakteristik | Kebutuhan utama |
|---|---|---|
| Pelajar SMP | Usia ±12–15 tahun, pembelajaran konkret | Materi singkat, gambar, kuis, simulasi visual |
| Pelajar SMA | Usia ±15–18 tahun, siap dengan model matematis | Penjelasan konsep, rumus, simulasi dengan parameter |
| Akun guru | Pendamping pada **satu perangkat yang sama** | Melihat ringkasan & detail progres setiap siswa; tidak mengerjakan kuis |

**Asumsi penting:** satu perangkat menyimpan beberapa akun demo lokal (1 guru + 6 siswa), tetapi hanya **satu sesi aktif** pada satu waktu. Tidak ada sync antar-perangkat. Username memakai **nama akun nonpribadi** (mis. `Komet`, `Neutron`, `Guru Sains`), bukan nama asli pelajar. Sesuai permintaan, password semua akun adalah `123`; ini bukan pengamanan produksi.

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

`localStorage` dengan key `sainskan.progress.v2`, versi skema `2`, berisi `{ session, accounts: [akunGuru, ...akunSiswa], progress: { [username]: stateSiswa } }`. `accounts` memuat **seluruh akun** (guru + siswa bawaan + hasil penambahan guru) beserta `seed` progres contoh untuk siswa. Ditulis saat inisialisasi dan setiap kali state berubah. Akun guru juga ikut dibootstrap di sini; `users.js` tidak dipakai sebagai sumber akun. Data lama `sainskan.progress.v1` dimigrasikan sekali ke akun `Komet`. Jika data korup/versi berbeda → fallback ke state default + toast peringatan; aplikasi tetap berjalan.

### 3.13 Login lokal & perbedaan peran

- Halaman login tampil sebelum aplikasi jika belum ada sesi aktif.
- Username: sesuai nama akun demo; password: `123` untuk semua akun.
- **`users.js` sengaja kosong** (`window.SAINSKAN_USERS = []`), tetap dimuat via `<script src="./users.js"></script>` agar struktur file terpisah terjaga pada `file://` (fetch JSON diblokir CORS).
- **Seluruh akun** — guru (`Guru Sains`), 6 siswa contoh (`Komet`, `Neutron`, `Orbit`, `Awan`, `Raksa`, `Supernova`), dan akun yang ditambahkan guru — disimpan di `localStorage` (`db.accounts`) beserta password `123`, peran, dan `seed` progres untuk siswa. Akun bawaan dipakai sekali sebagai bootstrap saat penyimpanan kosong, lalu dibaca dari `localStorage` pada load berikutnya.
- Halaman login dan tabel guru membaca daftar dari `ACCOUNTS` yang berasal dari `db.accounts` (`localStorage`) + kemungkinan `users.js` jika suatu hari diisi ulang, sehingga akun tetap tersedia setelah reload.
- Akun siswa → dashboard siswa, materi, kuis, simulasi, pencapaian, leaderboard.
- Akun guru → panel guru saja; tidak melihat/mengerjakan kuis, simulasi, atau leaderboard siswa.
- Sesi tersimpan di `localStorage`; tombol Keluar menghapus sesi dan kembali ke login.
- Kredensial salah menampilkan pesan kesalahan inline; tidak ada penguncian akun (prototype).

### 3.14 Dashboard guru

- Ringkasan: jumlah siswa, rata-rata XP, streak tertinggi. **Tidak menampilkan total materi selesai secara agregat.**
- Tabel per siswa: nama, **poin**, **XP**, level, **jumlah materi selesai**, **streak harian**, jumlah badge, tombol Detail. Data materi per siswa tetap dipertahankan.
- Kontrol: pencarian nama dan pengurutan (XP tertinggi / poin tertinggi / nama A–Z).
- Modal detail siswa: progress bar 4 kategori, daftar badge, dan ringkasan level/poin/XP/streak.
- Tombol **Tambah siswa** membuka form nama akun (3–24 karakter; huruf, angka, spasi, `-`, `_`), menolak nama duplikat, dan otomatis memberi password `123` serta peran `siswa`.
- Akun baru langsung muncul di tabel, **jumlah siswa bertambah 1**, dan progresnya dicatat dari awal: `0 poin`, `0 XP`, `level 1`, `0/12 materi`, `0 badge`, `streak 0`.
- Data berasal dari `db.progress[username]` yang diperbarui siswa saat mereka memakai perangkat; akun contoh yang belum dipakai menampilkan data contoh dari `seed` di `db.accounts` (`localStorage`).

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
Akun      = { username, password, role: 'guru' | 'siswa', displayName, seed?, custom? }
```

State tersimpan (`localStorage` `sainskan.progress.v2`):

```js
{
  version: 2,
  session: 'Komet' | 'Guru Sains' | null,
  accounts: [ /* seluruh akun: guru + 6 siswa contoh + tambahan guru; custom: true, seed untuk siswa */ ],
  progress: {
    'Komet': {
      version: 2,
      theme: 'dark' | 'light',
      alias: 'Komet',          // = username akun, bukan input bebas
      player: Pemain,
      progres: { [materiId]: Progres },
      daily: { tanggal, selesai, diambilAt, streak, terakhir },
      simulasiDicoba: ['gravitasi', 'tatasurya', 'rangkaian']
    },
    'Neutron': { /* struktur sama */ }
  }
}
```

File `users.js` memuat `window.SAINSKAN_USERS = []` — **sengaja kosong, tanpa akun guru maupun siswa**. Seluruh akun (guru `Guru Sains`, 6 siswa contoh, dan hasil menu **Tambah siswa**) disimpan di `db.accounts` pada `localStorage`, lengkap dengan `username`, `password: '123'`, `role`, `displayName`, `custom: true`, dan `seed` progres untuk siswa. Konstanta `DEFAULT_GURU` dan `DEFAULT_SISWA` di `index.html` hanya dipakai sekali untuk mengisi `localStorage` saat kosong; setelah itu semua akun dibaca dari penyimpanan lokal. Password plaintext disimpan sesuai permintaan prototype; **jangan dipakai untuk data nyata**.

Relasi: `Kuis.materiId → Materi.id`; `Progres.pemainId → Akun.username`; `Pemain.badge[] → Achievement.id`; `Akun.username → db.progress[username]`.

**Aturan integritas:**
- `materiSelesai` dan `progres` keduanya dipakai; keduanya diperbarui bersamaan dalam satu transaksi `save()`.
- `awarded=true` menjadi sumber kebenaran anti-dobel-poin.
- `skor` menyimpan **nilai terbaik** (maksimum dari semua attempt), bukan nilai attempt terakhir.

---

## 5. Nonfunctional Requirements

| Kode | Requirement |
|---|---|
| NFR-1 | **Tanpa instalasi.** `index.html` berisi HTML + CSS + JS dan dibuka langsung via `file://`; `users.js` (kosong) tetap dimuat via tag `<script>`. Tanpa build/server/CDN. |
| NFR-2 | **Tanpa backend.** Login divalidasi lokal terhadap `db.accounts` di `localStorage` (guru + siswa); tidak ada fetch ke API eksternal, tidak ada API key/token. |
| NFR-3 | **Privasi.** Username memakai nama akun demo nonpribadi; tidak mengumpulkan nama asli, email, sekolah, atau data pribadi lain. Password `123` hanya untuk demo. |
| NFR-4 | **Akurasi sains.** Rumus dan penjelasan sesuai fisika/kimia/biologi/astronomi standar SMA; simplifikasi simulasi diberi label. |
| NFR-5 | **Idempotensi.** Kuis yang sama tidak pernah memberikan poin/XP/badge dua kali; daily challenge sekali per tanggal lokal. |
| NFR-6 | **Responsif.** Tata letak usable di desktop ≥1024px dan smartphone ≥360px; navigasi menjadi horizontal scroller di layar sempit. |
| NFR-7 | **Tema.** Dark/light mode via CSS custom properties, tersimpan di localStorage, kontras teks memadai. |
| NFR-8 | **Animasi ringan.** Transisi ≤200ms; `prefers-reduced-motion` menonaktifkan animasi non-esensial; RAF dihentikan saat view/simulasi diganti. |
| NFR-9 | **Keamanan.** Tidak ada `eval`, tidak ada `innerHTML` dari input pengguna; semua teks dinamis di-escape. |
| NFR-10 | **Recovery.** localStorage korup ditangani dengan fallback aman, aplikasi tidak crash. |
| NFR-11 | **Aksesibilitas.** Tombol memiliki label, fokus terlihat, teks alternatif pada gambar, kontrol keyboard untuk kuis dan form login. |
| NFR-12 | **Akun terpisah.** `users.js` sengaja kosong; **seluruh akun (guru + siswa) disimpan di `localStorage` (`db.accounts`)**. Daftar akun dikelola lewat bootstrap di `index.html` dan panel guru, bukan file kredensial. |
| NFR-13 | **Isolasi peran.** Guru tidak melihat menu kuis/simulasi; siswa tidak melihat panel guru. Progres tiap akun tidak saling menimpa. |

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
| Satu perangkat dipakai bergantian | Progres tercampur | Setiap akun punya `db.progress[username]` sendiri; hanya satu sesi aktif |
| Password `123` plaintext | Tidak aman untuk produksi | Dinyatakan sebagai akun demo; **dilarang** dipakai dengan data nyata |
| Pengguna melihat `localStorage` | Password demo terbaca | Sesuai desain prototype; tidak ada kerahasiaan yang dijanjikan. Gunakan backend+hashing jika produksi |
| `fetch('users.json')` gagal pada `file://` | Akun tidak termuat | Semua akun dibaca dari `localStorage`; `users.js` tetap dimuat via `<script>` meski kosong |
| Guru menambah akun baru | Browser tidak bisa menulis file | Simpan akun baru di `db.accounts` (`localStorage`) saat load; beri `custom: true` |
| `localStorage` kosong saat pertama dibuka | Akun belum ada | `DEFAULT_GURU` + `DEFAULT_SISWA` dipakai sekali sebagai bootstrap, langsung ditulis ke `localStorage` oleh `saveDB()` saat inisialisasi |
| Nama siswa duplikat | Progres dua akun tercampur | Validasi case-insensitive terhadap semua `ACCOUNTS` sebelum menambah |

---

## 7. Out of Scope (MVP)

- Login produksi, registrasi bebas, reset password, multi-akun sungguhan, atau profil personal.
- Backend, database server, hashing password, sync antar-perangkat, cloud save.
- Guru mengubah nilai siswa atau mengirim notifikasi/penilaian ke siswa.
- Upload gambar/foto, kamera, mikrofon, atau suara.
- Soal isian/uraian, esai, atau penilaian guru otomatis.
- Simulasi 3D, kimia reaksi interaktif, atau laboratorium virtu­al penuh.
- Notifikasi push, email,/widget, atau Pengaturan akun.
- Analitik pihak ketiga, iklan, monetisasi.
- Konten kurikulum lengkap lintas jenjang; MVP hanya 12 materi contoh.
- Perubahan username bebas (username = nama akun di `users.js`) untuk mencegah data pribadi.

---

## 8. Acceptance Criteria (dapat diperiksa manual)

> Kecuali AC-11, semua langkah dimulai setelah **login sebagai `Komet` / `123`**, kondisi progres awal (Reset progres), dan halaman dimuat ulang.

### AC-1 — Struktur & akses
1. Buka `index.html` langsung di browser (tanpa server/install).
2. **Expected:** halaman login tampil, daftar 7 akun demo terlihat, tidak ada permintaan jaringan.
3. Masuk sebagai `Komet` dengan password `123`.
4. **Expected:** dashboard siswa tampil dengan 4 kategori, 12 kartu materi di halaman Materi, dan menu "Dashboard Guru" **tidak** tersedia.

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

### AC-8 — Persistensi & sesi
1. Selesaikan 1 kuis sebagai `Komet`, ubah tema ke light, muat ulang halaman.
2. **Expected:** tetap login sebagai `Komet`; poin/XP/level/badge/progress/daily/tema kembali seperti sebelum reload.
3. Keluar, masuk sebagai `Neutron`, lalu masuk lagi sebagai `Komet`.
4. **Expected:** progres `Komet` tidak berubah dan berbeda dari data contoh `Neutron` (520 XP).

### AC-9 — Reset
1. Klik Reset → konfirmasi.
3. **Expected:** poin = 0, XP = 0, level = 1, badge = 0, materi selesai = 0, semua progress bar 0%; tema & alias tetap; notifikasi reset muncul; setelah reload kondisi tetap kosong.

### AC-10 — Responsif & tema
1. Buka di smartphone 360px dan desktop 1280px; toggle dark/light.
2. **Expected:** tidak ada horizontal overflow, navigasi dapat diakses, teks terbaca di kedua tema, pilihan tersimpan setelah reload.

### AC-11 — Login & pemisahan peran
1. Buka `index.html` saat belum ada sesi. Coba username `Komet` + password `salah`.
2. **Expected:** pesan "Username atau password salah" tampil, aplikasi tidak masuk.
3. Masuk sebagai `Guru Sains` / `123`.
4. **Expected:** halaman "Dashboard Guru" tampil; menu Materi, Kuis, Simulasi, dan Leaderboard **tidak ada**.
5. Klik Keluar, masuk sebagai `Komet` / `123`.
6. **Expected:** dashboard siswa tampil; menu "Dashboard Guru" tidak ada; header menampilkan username `Komet`.

### AC-12 — Dashboard guru
1. Masuk sebagai `Guru Sains` / `123` setelah siswa `Komet` menyelesaikan 1 kuis.
2. **Expected:** ringkasan menampilkan 6 siswa, rata-rata XP, streak tertinggi, dan **tidak ada** kartu "Total materi selesai".
3. Lihat baris `Komet`.
3. **Expected:** Poin `65`, XP `90`, Level `1`, Materi selesai `1/12`, Streak `0 hari`, Badge `1 badge`.
4. Klik tombol **Detail** pada `Neutron`.
4. **Expected:** modal menampilkan `Detail Neutron`, 4 progress bar kategori, badge `Pemula`, `Fisikawan Cilik`, `Akademi Sempurna`, XP `520`, materi `5/12`.
5. Ketik `orbit` di kolom cari; klik urutan "Poin tertinggi".
6. **Expected:** hanya baris `Orbit` yang tampil; pengurutan kembali bekerja saat kolom cari dikosongkan.

### AC-13 — Menambah siswa baru
1. Masuk sebagai `Guru Sains` / `123`, klik tombol **＋ Tambah siswa**, isi `Bintang`, lalu kirim.
2. **Expected:** kartu "Jumlah siswa" berubah dari `6` menjadi `7`; baris baru `Bintang` muncul dengan Poin `0`, XP `0`, Level `1`, Materi selesai `0/12`, Streak `0 hari`, Badge `0 badge`.
3. Coba tambahkan nama `Bintang` lagi.
4. **Expected:** pesan "Username sudah digunakan" tampil; jumlah siswa tetap `7`.
5. Muat ulang halaman (tetap sebagai guru), lalu keluar dan lihat daftar akun di halaman login.
6. **Expected:** `Bintang` tetap ada di tabel guru dan di daftar login; password `123` berhasil dipakai untuk masuk sebagai `Bintang`, dengan dashboard progres nol.

### AC-14 — Seluruh data login hanya di `localStorage`
1. Buka `users.js` dengan editor teks.
2. **Expected:** file hanya berisi `window.SAINSKAN_USERS = []`; tidak ada `Guru Sains`, `Komet`, `Neutron`, `Orbit`, `Awan`, `Raksa`, `Supernova`, atau akun lain.
3. Buka aplikasi, lalu periksa `localStorage` key `sainskan.progress.v2`.
4. **Expected:** field `accounts` berisi 7 akun — 1 guru (`Guru Sains`) dan 6 siswa — lengkap dengan `username`, `password: '123'`, dan `role`; siswa juga punya `seed`.
5. Keluar, muat ulang, lalu masuk sebagai `Guru Sains` / `123` dan sebagai `Komet` / `123`.
6. **Expected:** keduanya berhasil login dan sesuai perannya, tanpa membaca akun dari `users.js`.

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
| **6 — Akun & panel guru** | `users.js` dikosongkan, halaman login, sesi `localStorage`, `db.accounts` untuk seluruh akun (guru + siswa), `db.progress[username]`, migrasi v1→v2, panel guru + detail siswa + tambah siswa, isolasi peran | `users.js`, `index.html` v2, `SPEC.md` v1.1 | AC-1, AC-11, AC-12, AC-13, AC-14 lolos; progres tiap akun terpisah |

**Urutan pengerjaan prototype:** Iterasi 0 → 6 dikerjakan dalam `index.html` + `users.js` agar dapat langsung dijalankan, dengan urutan logika yang sama seperti tabel di atas.

---

## 10. Catatan Implementasi Prototipe

- Prototipe memakai **hash routing** (`#/login`, `#/dashboard`, `#/materi`, `#/materi/f1`, `#/kuis/f1`, `#/simulasi`, `#/pencapaian`, `#/leaderboard`, `#/guru`) sehingga tombol Back browser berfungsi. Router memaksa halaman login jika belum ada sesi dan memaksa panel guru untuk akun guru.
- Ilustrasi materi dibuat sebagai `data:image/svg+xml;charset=utf-8,...` dari fungsi generator; `imageUrl` tetap menjadi field data sesuai model.
- Seluruh teks dinamis melalui helper `esc()` sebelum disisipkan ke template.
- Simulasi memakai `requestAnimationFrame`; semua loop dihentikan pada `cleanup()` saat pindah halaman.
- Tidak ada dependensi eksternal sama sekali (tidak ada font CDN, tidak ada library UI). Satu-satunya file lokal tambahan adalah `users.js`.
- Kredensial tidak dimuat dengan `fetch()` karena browser memblokir `file://` CORS; `users.js` tetap dimuat lewat tag `<script src="./users.js">` meski isinya kosong, semua akun dibaca dari `localStorage`.
- `users.js` berisi `window.SAINSKAN_USERS = []` — **tanpa akun guru maupun siswa**. Seluruh akun (guru + 6 siswa contoh + hasil tombol **Tambah siswa**) disimpan di `db.accounts` pada `localStorage` beserta `seed` progres siswa. `loadDB()` menggabungkan `BASE_ACCOUNTS` dari file dengan `db.accounts`; `DEFAULT_GURU` + `DEFAULT_SISWA` di `index.html` hanya bootstrap sekali saat penyimpanan kosong dan langsung ditulis oleh `saveDB()` saat inisialisasi.
- Password `123` plaintext adalah keputusan prototype sesuai permintaan; lingkungan produksi harus memakai backend + hashing (bcrypt/Argon2) + HTTPS.
