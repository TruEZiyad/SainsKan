import { KATEGORI, KAT_ICON } from '../data/kategori.js';
import { MATERI } from '../data/materi.js';
import { esc } from '../lib/utils.js';
import { renderStudentShell } from '../ui/shell.js';
import { ui } from '../ui-state.js';

export function renderMateriList(state, user) {
  const list = MATERI.filter((materi) => ui.filter === 'Semua' || materi.kategori === ui.filter);
  const content = `<div class="page-head">
      <div><div class="eyebrow">Perpustakaan sains</div><h1>Materi Pembelajaran</h1><p>12 materi singkat · 4 kategori · pilih kategori untuk memfilter.</p></div>
    </div>
    <div class="filters" role="group" aria-label="Filter kategori">
      ${['Semua', ...KATEGORI]
        .map(
          (kategori) =>
            `<button class="filter ${ui.filter === kategori ? 'active' : ''}" type="button" aria-pressed="${ui.filter === kategori}" data-action="filter" data-kat="${esc(kategori)}">${kategori === 'Semua' ? 'Semua' : `${KAT_ICON[kategori]} ${esc(kategori)}`}</button>`,
        )
        .join('')}
    </div>
    <div class="grid g3">${list
      .map((materi) => {
        const done = Boolean(state.progres[materi.id]?.awarded);
        return `<article class="card materi-card" data-action="buka-materi" data-id="${materi.id}" tabindex="0" role="button" aria-label="Buka materi ${esc(materi.judul)}">
          <img src="${materi.imageUrl}" alt="Ilustrasi ${esc(materi.judul)}" loading="lazy" width="420" height="240" />
          <div class="materi-body">
            <div class="tags"><span class="tag">${KAT_ICON[materi.kategori]} ${esc(materi.kategori)}</span><span class="tag">${esc(materi.tingkatKesulitan)}</span>${done ? '<span class="tag done">✓ Selesai</span>' : ''}</div>
            <h3>${esc(materi.judul)}</h3><p>${esc(materi.deskripsi)}</p>
            <div class="small" style="color:var(--blue);font-weight:750">Baca &amp; kuis →</div>
          </div>
        </article>`;
      })
      .join('')}</div>`;

  return renderStudentShell('materi', content, state, user);
}

export function renderMateriDetail(state, user, id) {
  const materi = MATERI.find((item) => item.id === id);
  if (!materi) return renderMateriList(state, user);

  const progress = state.progres[id];
  const content = materi.konten
    .map((text) =>
      text.startsWith('•') ? `<li>${esc(text.slice(1).trim())}</li>` : `<p>${esc(text)}</p>`,
    )
    .join('');

  return renderStudentShell(
    'materi',
    `<div class="page-head">
      <div><div class="eyebrow">${KAT_ICON[materi.kategori]} ${esc(materi.kategori)} · ${esc(materi.tingkatKesulitan)}</div><h1>${esc(materi.judul)}</h1><p>${esc(materi.deskripsi)}</p></div>
      <a class="btn" href="#/materi">← Kembali ke materi</a>
    </div>
    <div class="detail-hero">
      <article class="card"><h2>Inti materi</h2><div class="konten">${content}</div>
        <div class="note">Konsep ini dipakai pada simulasi dan kuis. Perhatikan satuan serta asumsi yang disebutkan.</div>
      </article>
      <article class="card">
        <img src="${materi.imageUrl}" alt="Ilustrasi ${esc(materi.judul)}" width="420" height="240" style="width:100%;border-radius:14px;border:1px solid var(--line);display:block" />
        <div style="margin-top:12px"><div class="small muted">Status</div><b>${progress?.awarded ? 'Selesai' : 'Belum selesai'}</b>
          <div class="bar" style="margin:8px 0" role="progressbar" aria-valuenow="${progress?.skor || 0}" aria-valuemin="0" aria-valuemax="100" aria-label="Skor terbaik"><i style="width:${progress?.skor || 0}%"></i></div>
          <div class="small muted">Skor terbaik: ${progress?.skor || 0}% · percobaan: ${progress?.attempts || 0}</div>
        </div>
        <button class="btn primary" type="button" style="width:100%;margin-top:14px" data-action="kuis-materi" data-id="${materi.id}">${progress?.awarded ? 'Ulangi kuis (tanpa poin baru)' : 'Mulai kuis · 3 soal'}</button>
      </article>
    </div>`,
    state,
    user,
  );
}
