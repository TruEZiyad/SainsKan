import { ACHIEVEMENTS } from '../data/achievements.js';
import { MATERI } from '../data/materi.js';
import { esc, pct } from '../lib/utils.js';
import { renderStudentShell } from '../ui/shell.js';
import { renderMateriList } from './materi.js';
import { ui } from '../ui-state.js';

export function renderQuiz(state, user) {
  const quiz = ui.quiz;
  if (!quiz) return renderMateriList(state, user);

  const item = quiz.items[quiz.idx];
  const isDaily = quiz.mode === 'harian';
  const title = isDaily
    ? 'Tantangan Harian'
    : MATERI.find((materi) => materi.id === quiz.materiId)?.judul || 'Kuis';
  const backView = isDaily ? 'dashboard' : 'materi';

  const head = `<div class="page-head">
      <div><div class="eyebrow">${isDaily ? 'Daily challenge' : 'Kuis materi'} · soal ${quiz.idx + 1}/${quiz.items.length}</div>
        <h1>${esc(title)}</h1><p>Setiap jawaban mendapat penjelasan. Poin hanya diberikan sekali per materi.</p></div>
      <a class="btn" href="#/${backView}">Keluar</a>
    </div>
    <div class="bar" style="margin-bottom:14px" role="progressbar" aria-valuenow="${pct(quiz.idx + (quiz.answered ? 1 : 0), quiz.items.length)}" aria-valuemin="0" aria-valuemax="100" aria-label="Progres kuis"><i style="width:${pct(quiz.idx + (quiz.answered ? 1 : 0), quiz.items.length)}%"></i></div>`;

  if (quiz.result) {
    const result = quiz.result;
    const badgeTags = (result.badges || [])
      .map((id) => {
        const achievement = ACHIEVEMENTS.find((entry) => entry.id === id);
        return achievement
          ? `<span class="tag done">${achievement.icon} ${esc(achievement.nama)} +25 XP</span>`
          : '';
      })
      .join('');

    return renderStudentShell(
      'materi',
      `${head}<article class="card" style="max-width:760px;margin:auto;text-align:center">
        <div style="font-size:54px" aria-hidden="true">${result.score >= 80 ? '🎉' : '📚'}</div>
        <h2>Hasil kuis: ${result.score}%</h2>
        <p class="muted">Benar ${result.correct} dari ${result.total} soal.${
          isDaily ? '' : ` Poin soal: ${result.questionPoints} + bonus pertama 20.`
        }</p>
        <p><b>${result.duplicate ? 'Tidak ada poin baru — kuis ini sudah pernah diselesaikan.' : `+${result.gained} poin & +${result.gained} XP`}</b></p>
        ${badgeTags ? `<div class="tags" style="justify-content:center">${badgeTags}</div>` : ''}
        <div style="display:flex;gap:8px;justify-content:center;flex-wrap:wrap;margin-top:18px">
          <button class="btn primary" type="button" data-action="kuis-ulang">Ulangi kuis</button>
          <button class="btn" type="button" data-action="selesai-kuis">Kembali</button>
        </div>
      </article>`,
      state,
      user,
    );
  }

  const options = item.pilihanJawaban
    .map((option, index) => {
      let className = quiz.selected === index ? 'sel' : '';
      if (quiz.answered) {
        if (index === item.jawabanBenar) className = 'benar';
        else if (index === quiz.selected) className = 'salah';
      }
      return `<button class="option ${className}" type="button" data-action="pilih" data-i="${index}" ${quiz.answered ? 'disabled' : ''} aria-label="Pilihan ${String.fromCharCode(65 + index)}: ${esc(option)}"><span class="key" aria-hidden="true">${String.fromCharCode(65 + index)}</span><span>${esc(option)}</span></button>`;
    })
    .join('');

  const feedback = quiz.answered
    ? quiz.selected === item.jawabanBenar
      ? `<div class="feedback ok" role="status"><b>✅ Benar! +${item.poin} poin</b><p>${esc(item.penjelasan.benar)}</p></div>`
      : `<div class="feedback bad" role="status"><b>❌ Belum tepat. Jawaban benar: ${String.fromCharCode(65 + item.jawabanBenar)}</b><p><b>Mengapa salah:</b> ${esc(item.penjelasan.salah)}</p><p><b>Penjelasan jawaban benar:</b> ${esc(item.penjelasan.benar)}</p></div>`
    : '';

  return renderStudentShell(
    'materi',
    `${head}<article class="card" style="max-width:760px;margin:auto">
      <div class="soal-num">SOAL ${quiz.idx + 1} · ${item.poin} POIN</div>
      <h2 style="margin:6px 0 14px;font-size:19px">${esc(item.pertanyaan)}</h2>
      ${options}${feedback}
      <div style="display:flex;justify-content:flex-end;margin-top:16px;gap:8px">
        <button class="btn primary" type="button" data-action="${quiz.answered ? 'next' : 'submit'}" ${quiz.selected === null && !quiz.answered ? 'disabled' : ''}>${quiz.answered ? (quiz.idx === quiz.items.length - 1 ? 'Lihat hasil' : 'Soal berikutnya') : 'Kirim jawaban'}</button>
      </div>
    </article>`,
    state,
    user,
  );
}
