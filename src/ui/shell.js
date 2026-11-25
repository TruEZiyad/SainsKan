import { esc, formatNumber } from '../lib/utils.js';
import { getTheme } from '../store.js';

function navLink(view, label, icon, active) {
  const current = active === view;
  return `<a href="#/${view}" class="nav-link ${current ? 'active' : ''}" ${
    current ? 'aria-current="page"' : ''
  }><span class="ico" aria-hidden="true">${icon}</span>${label}</a>`;
}

function themeButton() {
  const dark = getTheme() === 'dark';
  return `<button class="icon-btn" type="button" data-action="theme" aria-label="Ganti ke tema ${
    dark ? 'terang' : 'gelap'
  }" title="Ganti tema">${dark ? '☀️ Light' : '🌙 Dark'}</button>`;
}

function brand(title = 'SainsKan', tagline = 'Belajar sains jadi petualangan') {
  return `<div class="brand">
    <div class="brand-mark" aria-hidden="true">⚛</div>
    <div><div class="brand-name">${title}</div><div class="brand-tag">${tagline}</div></div>
  </div>`;
}

export function renderStudentShell(active, content, state, user) {
  const player = state.player;
  return `
  <header class="topbar">
    ${brand()}
    <span class="chip" title="Akun siswa yang sedang masuk">👤 ${esc(state.alias)}</span>
    <span class="chip" title="Level saat ini">⭐ Level <b>${player.level}</b></span>
    <span class="chip" title="Total experience point">XP <b>${formatNumber(player.xp)}</b></span>
    ${themeButton()}
    <button class="btn small danger" type="button" data-action="reset-open">Reset</button>
    <button class="btn small" type="button" data-action="logout">Keluar</button>
  </header>
  <div class="layout">
    <nav class="nav" aria-label="Navigasi utama">
      <div class="nav-title">Menu belajar</div>
      ${navLink('dashboard', 'Dashboard', '🏠', active)}
      ${navLink('materi', 'Materi', '📚', active)}
      ${navLink('simulasi', 'Simulasi', '🧭', active)}
      <div class="nav-title">Progres</div>
      ${navLink('pencapaian', 'Pencapaian', '🏅', active)}
      ${navLink('leaderboard', 'Leaderboard', '📊', active)}
    </nav>
    <main class="main" id="main-content" tabindex="-1">${content}</main>
  </div>`;
}

export function renderTeacherShell(content, user) {
  return `
  <header class="topbar">
    ${brand('SainsKan · Panel Guru', 'Pantau progres belajar siswa')}
    <span class="chip">👤 ${esc(user?.displayName || 'Guru')}</span>
    <span class="role-pill">AKUN GURU</span>
    ${themeButton()}
    <button class="btn small" type="button" data-action="logout">Keluar</button>
  </header>
  <div class="layout">
    <nav class="nav" aria-label="Navigasi guru">
      <div class="nav-title">Menu guru</div>
      <a href="#/guru" class="nav-link active" aria-current="page"><span class="ico" aria-hidden="true">📊</span>Dashboard Guru</a>
    </nav>
    <main class="main" id="main-content" tabindex="-1">${content}</main>
  </div>`;
}

export function statCard(icon, label, value) {
  return `<div class="stat"><div class="stat-ico" aria-hidden="true">${icon}</div><div><b>${value}</b><span>${label}</span></div></div>`;
}
