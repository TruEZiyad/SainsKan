import { ACHIEVEMENTS } from '../data/achievements.js';
import { KATEGORI, KAT_COLOR, KAT_ICON } from '../data/kategori.js';
import { MATERI } from '../data/materi.js';
import { esc, formatNumber, pct } from '../lib/utils.js';
import { createBlankState, getState, getStudentAccounts } from '../store.js';
import { renderTeacherShell, statCard } from '../ui/shell.js';
import { ui } from '../ui-state.js';

function states() {
  return getStudentAccounts().map((account) => ({
    account,
    state: getState(account.username) || createBlankState(account.username),
  }));
}

function detailModal() {
  const entry = states().find((row) => row.account.username === ui.guru.detail);
  if (!entry) return '';

  const { account, state } = entry;
  const badges =
    state.player.badge
      .map((id) => {
        const achievement = ACHIEVEMENTS.find((item) => item.id === id);
        return achievement
          ? `<span class="tag done">${achievement.icon} ${esc(achievement.nama)}</span>`
          : '';
      })
      .join('') || '<span class="tag">Belum ada badge</span>';

  return `<div class="modal-bg" data-action="guru-detail-close" data-modal role="presentation">
    <div class="modal" role="dialog" aria-modal="true" aria-labelledby="guru-detail-title" style="width:min(540px,100%)">
      <h2 id="guru-detail-title">Detail ${esc(account.displayName || account.username)}</h2>
      <p>Level ${state.player.level} · ${formatNumber(state.player.totalPoin)} poin · ${formatNumber(state.player.xp)} XP · streak ${state.daily.streak || 0} hari</p>
      <h3 style="font-size:14px;margin:0 0 8px">Progress per kategori</h3>
      <div class="stack">${KATEGORI.map((kategori) => {
        const ids = MATERI.filter((materi) => materi.kategori === kategori).map((materi) => materi.id);
        const done = ids.filter((id) => state.player.materiSelesai.includes(id)).length;
        return `<div><div class="small" style="display:flex;justify-content:space-between"><span>${KAT_ICON[kategori]} ${esc(kategori)}</span><b>${done}/3</b></div><div class="bar ${KAT_COLOR[kategori]}"><i style="width:${pct(done, 3)}%"></i></div></div>`;
      }).join('')}</div>
      <h3 style="font-size:14px;margin:14px 0 8px">Badge diraih</h3>
      <div class="tags">${badges}</div>
      <div class="modal-actions" style="margin-top:16px">
        <button class="btn" type="button" data-action="guru-detail-close" data-autofocus>Tutup</button>
      </div>
    </div>
  </div>`;
}

function addModal() {
  return `<div class="modal-bg" data-action="guru-add-close" data-modal role="presentation">
    <div class="modal" role="dialog" aria-modal="true" aria-labelledby="guru-add-title">
      <h2 id="guru-add-title">Tambah siswa baru</h2>
      <p>Username dipakai sebagai nama akun. Password otomatis <b>123</b>. Progres siswa baru dimulai dari nol: 0 poin, 0 XP, level 1, 0 materi, 0 badge, streak 0.</p>
      <form data-form="guru-add" novalidate>
        <div class="field">
          <label for="nama-siswa-baru">Nama akun siswa</label>
          <input id="nama-siswa-baru" value="${esc(ui.guru.addName)}" placeholder="Contoh: Bintang" maxlength="24" autocomplete="off" required data-autofocus />
        </div>
        <p class="error" role="alert" style="margin-top:8px">${esc(ui.guru.addError)}</p>
        <div class="note">Gunakan nama panggilan/alias, bukan data pribadi. Akun baru tersimpan di perangkat ini dan tetap ada setelah halaman dimuat ulang.</div>
        <div class="modal-actions" style="margin-top:16px">
          <button class="btn" type="button" data-action="guru-add-close">Batal</button>
          <button class="btn primary" type="submit">Tambah siswa</button>
        </div>
      </form>
    </div>
  </div>`;
}

export function renderGuru(user) {
  const all = states();
  const query = ui.guru.query.trim().toLowerCase();
  let rows = query
    ? all.filter((row) => row.account.username.toLowerCase().includes(query))
    : [...all];

  rows.sort((a, b) => {
    if (ui.guru.sort === 'nama') return a.account.username.localeCompare(b.account.username, 'id');
    if (ui.guru.sort === 'poin') return b.state.player.totalPoin - a.state.player.totalPoin;
    return b.state.player.xp - a.state.player.xp;
  });

  const averageXp = all.length
    ? Math.round(all.reduce((total, row) => total + row.state.player.xp, 0) / all.length)
    : 0;
  const bestStreak = all.reduce((best, row) => Math.max(best, row.state.daily.streak || 0), 0);

  const content = `<div class="page-head">
      <div><div class="eyebrow">Panel pendamping</div><h1>Dashboard Guru</h1><p>Progres seluruh siswa pada perangkat ini. Data diperbarui setiap siswa menyelesaikan aktivitas.</p></div>
      <button class="btn primary" type="button" data-action="guru-add-open">＋ Tambah siswa</button>
    </div>
    <div class="grid g3" style="margin-bottom:14px">
      <article class="card">${statCard('👥', 'Jumlah siswa', all.length)}</article>
      <article class="card">${statCard('⭐', 'Rata-rata XP', formatNumber(averageXp))}</article>
      <article class="card">${statCard('🔥', 'Streak tertinggi', `${bestStreak} hari`)}</article>
    </div>
    <article class="card">
      <h2>Ringkasan progres siswa</h2>
      <div style="display:flex;gap:8px;flex-wrap:wrap;align-items:center;margin:10px 0 12px">
        <input id="guru-search" data-input="guru-search" value="${esc(ui.guru.query)}" placeholder="Cari nama siswa…" aria-label="Cari siswa" style="flex:1;min-width:180px;padding:9px 11px;border-radius:11px;border:1px solid var(--line);background:var(--panel2);color:var(--text)" />
        ${[
          ['xp', 'XP tertinggi'],
          ['poin', 'Poin tertinggi'],
          ['nama', 'Nama A–Z'],
        ]
          .map(
            ([key, label]) =>
              `<button class="filter ${ui.guru.sort === key ? 'active' : ''}" type="button" aria-pressed="${ui.guru.sort === key}" data-action="guru-sort" data-sort="${key}">${label}</button>`,
          )
          .join('')}
      </div>
      <div class="table-wrap"><table>
        <caption class="sr-only">Progres seluruh siswa</caption>
        <thead><tr><th scope="col">Siswa</th><th scope="col">Poin</th><th scope="col">XP</th><th scope="col">Level</th><th scope="col">Materi selesai</th><th scope="col">Streak harian</th><th scope="col">Badge</th><th scope="col">Aksi</th></tr></thead>
        <tbody>${
          rows
            .map(
              ({ account, state }) => `<tr>
              <td><b>${esc(account.displayName || account.username)}</b></td>
              <td>${formatNumber(state.player.totalPoin)}</td>
              <td>${formatNumber(state.player.xp)}</td>
              <td>${state.player.level}</td>
              <td>${state.player.materiSelesai.length}/12</td>
              <td>${state.daily.streak || 0} hari</td>
              <td>${state.player.badge.length} badge</td>
              <td><button class="btn small" type="button" data-action="guru-detail" data-user="${esc(account.username)}">Detail</button></td>
            </tr>`,
            )
            .join('') || '<tr><td colspan="8" class="muted">Tidak ada siswa yang cocok.</td></tr>'
        }</tbody>
      </table></div>
      <div class="note">Guru tidak mengerjakan kuis atau simulasi. Fokus panel ini adalah monitoring: poin, XP, materi selesai, streak, dan detail badge siswa.</div>
    </article>
    ${ui.guru.detail ? detailModal() : ''}
    ${ui.guru.addOpen ? addModal() : ''}`;

  return renderTeacherShell(content, user);
}
