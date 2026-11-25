import { ACHIEVEMENTS } from '../data/achievements.js';
import { KATEGORI, KAT_COLOR, KAT_ICON } from '../data/kategori.js';
import { categoryProgress, dailyQuestions, isDailyDone } from '../lib/progress.js';
import { esc, formatDateID, formatNumber, pct } from '../lib/utils.js';
import { renderStudentShell, statCard } from '../ui/shell.js';

function progressCard(state, kategori) {
  const progress = categoryProgress(state, kategori);
  const percent = pct(progress.done, progress.total);
  return `<article class="card cat-card" data-action="filter-kat" data-kat="${esc(kategori)}" role="button" tabindex="0" aria-label="Lihat materi ${esc(kategori)}">
    <div class="cat-top">
      <div class="cat-ico" aria-hidden="true">${KAT_ICON[kategori]}</div>
      <div><b>${esc(kategori)}</b><div class="muted small">${progress.done}/${progress.total} materi selesai</div></div>
    </div>
    <div class="bar ${KAT_COLOR[kategori]}" role="progressbar" aria-valuenow="${percent}" aria-valuemin="0" aria-valuemax="100" aria-label="Progres ${esc(kategori)}"><i style="width:${percent}%"></i></div>
    <div class="muted small">${percent}% selesai</div>
  </article>`;
}

function dailyCard(state) {
  const done = isDailyDone(state);
  const questions = dailyQuestions();
  return `<article class="card">
    <div style="display:flex;justify-content:space-between;gap:10px;align-items:flex-start">
      <div><div class="eyebrow">Tantangan harian</div><h2>Daily Challenge</h2></div>
      <div class="cat-ico" aria-hidden="true">📅</div>
    </div>
    <p class="muted small">${formatDateID()} · 3 soal deterministik · hadiah +30 poin &amp; XP sekali per hari.</p>
    <div class="tags">
      <span class="tag">Streak ${state.daily.streak || 0} hari</span>
      <span class="tag ${done ? 'done' : ''}">${done ? 'Selesai hari ini' : 'Belum selesai'}</span>
    </div>
    <p class="muted small">Contoh soal: ${esc(questions[0].pertanyaan)}</p>
    <button class="btn ${done ? '' : 'primary'}" type="button" data-action="daily">${done ? 'Ulangi (tanpa poin baru)' : 'Mulai tantangan'}</button>
  </article>`;
}

export function renderDashboard(state, user) {
  const player = state.player;
  const nextLevelXp = 100 - (player.xp % 100);
  const badges =
    player.badge
      .slice(-3)
      .reverse()
      .map((id) => {
        const achievement = ACHIEVEMENTS.find((item) => item.id === id);
        return achievement ? `<span class="tag done">${achievement.icon} ${esc(achievement.nama)}</span>` : '';
      })
      .join('') || '<span class="tag">Belum ada badge</span>';

  const content = `
    <section class="hero">
      <div class="hero-row">
        <div>
          <div class="eyebrow" style="color:#bfdbfe">Dashboard pembelajaran</div>
          <h1>Halo, ${esc(state.alias)}! 👋</h1>
          <p>Satu kuis lagi untuk mendekati level berikutnya. Petualangan sainsmu menunggu.</p>
        </div>
        <div class="level-badge"><div><strong>${player.level}</strong><span>Level</span></div></div>
      </div>
      <div class="xpbar" role="progressbar" aria-valuenow="${player.xp % 100}" aria-valuemin="0" aria-valuemax="100" aria-label="Progres menuju level berikutnya"><i style="width:${player.xp % 100}%"></i></div>
      <div class="small" style="margin-top:6px;opacity:.9">${formatNumber(player.xp)} XP · ${nextLevelXp} XP lagi menuju level ${player.level + 1}</div>
    </section>
    <div class="grid g4" style="margin:14px 0">
      <article class="card">${statCard('💎', 'Total poin', formatNumber(player.totalPoin))}</article>
      <article class="card">${statCard('📖', 'Materi selesai', `${player.materiSelesai.length}/12`)}</article>
      <article class="card">${statCard('🏅', 'Badge diraih', `${player.badge.length}/11`)}</article>
      <article class="card">${statCard('🔥', 'Streak harian', `${state.daily.streak || 0} hari`)}</article>
    </div>
    <div class="grid g2">
      ${dailyCard(state)}
      <article class="card">
        <div class="eyebrow">Ringkasan pencapaian</div><h2>Perjalanan belajarmu</h2>
        <div class="tags" style="margin:8px 0 12px">${badges}</div>
        ${KATEGORI.map(
          (kategori) =>
            `<div class="readout"><span>Materi ${esc(kategori)}</span><b>${categoryProgress(state, kategori).done}/3</b></div>`,
        ).join('')}
        <div style="display:flex;gap:8px;flex-wrap:wrap;margin-top:13px">
          <button class="btn small" type="button" data-action="nav" data-view="pencapaian">Lihat pencapaian</button>
          <button class="btn small" type="button" data-action="nav" data-view="leaderboard">Leaderboard</button>
        </div>
      </article>
    </div>
    <h2 style="font-size:17px;margin:20px 0 10px">Progress per kategori</h2>
    <div class="grid g4">${KATEGORI.map((kategori) => progressCard(state, kategori)).join('')}</div>
    <h2 style="font-size:17px;margin:20px 0 10px">Akses cepat</h2>
    <div class="grid g3">
      <article class="card"><h3>📚 Materi</h3><p class="muted small">12 materi singkat bergambar, lengkap dengan kuis.</p><button class="btn small primary" type="button" data-action="nav" data-view="materi">Buka materi</button></article>
      <article class="card"><h3>🧭 Simulasi</h3><p class="muted small">Gravitasi, tata surya, dan rangkaian listrik.</p><button class="btn small" type="button" data-action="nav" data-view="simulasi">Coba simulasi</button></article>
      <article class="card"><h3>🏅 Pencapaian</h3><p class="muted small">Lihat badge yang sudah dan belum diraih.</p><button class="btn small" type="button" data-action="nav" data-view="pencapaian">Lihat badge</button></article>
    </div>`;

  return renderStudentShell('dashboard', content, state, user);
}
