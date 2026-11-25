import { ACHIEVEMENTS } from '../data/achievements.js';
import { KATEGORI, KAT_COLOR, KAT_ICON } from '../data/kategori.js';
import { categoryProgress } from '../lib/progress.js';
import { esc, formatNumber, pct } from '../lib/utils.js';
import { renderStudentShell, statCard } from '../ui/shell.js';

export function renderPencapaian(state, user) {
  const player = state.player;
  const content = `<div class="page-head">
      <div><div class="eyebrow">Galeri prestasi</div><h1>Pencapaian</h1><p>${player.badge.length} dari ${ACHIEVEMENTS.length} badge diraih · setiap badge +25 XP.</p></div>
    </div>
    <div class="grid g3" style="margin-bottom:16px">
      ${KATEGORI.map((kategori) => {
        const progress = categoryProgress(state, kategori);
        const percent = pct(progress.done, progress.total);
        return `<article class="card"><h3>${KAT_ICON[kategori]} ${esc(kategori)}</h3>
          <div class="bar ${KAT_COLOR[kategori]}" role="progressbar" aria-valuenow="${percent}" aria-valuemin="0" aria-valuemax="100" aria-label="Progres ${esc(kategori)}"><i style="width:${percent}%"></i></div>
          <div class="small muted" style="margin-top:6px">${progress.done}/${progress.total} materi · ${percent}%</div></article>`;
      }).join('')}
    </div>
    <div class="grid g3">${ACHIEVEMENTS.map((achievement) => {
      const unlocked = player.badge.includes(achievement.id);
      return `<div class="badge-item ${unlocked ? '' : 'locked'}">
        <div class="badge-ico" aria-hidden="true">${achievement.icon}</div>
        <div><b>${esc(achievement.nama)} ${unlocked ? '✓' : ''}</b><p>${esc(achievement.deskripsi)}</p><span class="tag">${unlocked ? 'Diraih' : 'Terkunci'}</span></div>
      </div>`;
    }).join('')}</div>
    <article class="card" style="margin-top:16px"><h2>Ringkasan</h2>
      <div class="grid g4">
        ${statCard('⭐', 'Level', player.level)}
        ${statCard('💎', 'Poin', formatNumber(player.totalPoin))}
        ${statCard('📖', 'Materi', `${player.materiSelesai.length}/12`)}
        ${statCard('🔥', 'Streak', `${state.daily.streak || 0} hari`)}
      </div>
    </article>`;

  return renderStudentShell('pencapaian', content, state, user);
}
