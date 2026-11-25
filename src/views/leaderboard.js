import { esc, formatNumber, levelOf } from '../lib/utils.js';
import { getState, getStudentAccounts } from '../store.js';
import { renderStudentShell } from '../ui/shell.js';
import { createBlankState } from '../store.js';

export function renderLeaderboard(state, user) {
  const rows = getStudentAccounts()
    .map((account) => {
      const studentState = getState(account.username) || createBlankState(account.username);
      return {
        name: account.username,
        xp: studentState.player.xp,
        me: account.username === state.alias,
      };
    })
    .sort((a, b) => b.xp - a.xp || a.name.localeCompare(b.name, 'id'));

  const content = `<div class="page-head">
      <div><div class="eyebrow">Papan peringkat perangkat</div><h1>Leaderboard Lokal</h1><p>Perbandingan XP antar akun siswa pada perangkat ini. Tidak ada data yang dikirim ke internet.</p></div>
    </div>
    <article class="card" style="max-width:760px;margin:auto">
      <div class="stack">${rows
        .map(
          (row, index) => `<div class="leader ${row.me ? 'me' : ''}">
            <div class="rank">${index + 1}</div>
            <div class="who"><b>${esc(row.name)} ${row.me ? '(kamu)' : ''}</b><span>Akun siswa · Level ${levelOf(row.xp)}</span></div>
            <span class="chip">⭐ ${formatNumber(row.xp)} XP</span>
          </div>`,
        )
        .join('')}</div>
      <div class="note">Peringkat dihitung ulang dari XP tiap akun siswa. Akun yang belum pernah dipakai memakai data contoh sampai siswa tersebut masuk.</div>
    </article>`;

  return renderStudentShell('leaderboard', content, state, user);
}
