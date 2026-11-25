import './styles/app.css';

import { MATERI } from './data/materi.js';
import { SOAL } from './data/soal.js';
import { ACHIEVEMENTS } from './data/achievements.js';
import { gravityReadout, circuitCalc } from './lib/scoring.js';
import {
  completeDaily,
  completeMateriQuiz,
  dailyQuestions,
  markSimulation,
} from './lib/progress.js';
import { parseRoute, navigate, replaceRoute, onRouteChange } from './lib/router.js';
import { setStorageErrorHandler } from './lib/storage.js';
import { initDialog } from './ui/modal.js';
import { resetModalHTML } from './ui/dialogs.js';
import { toast } from './ui/toast.js';
import { ui, resetSessionUi, resetSimulations, startQuiz } from './ui-state.js';
import { mountCircuit } from './simulations/circuit.js';
import { mountGravity } from './simulations/gravity.js';
import { mountSolar } from './simulations/solar.js';
import {
  activeState,
  addStudent,
  getCurrentUser,
  getState,
  getTheme,
  initNotice,
  initStore,
  login,
  logout,
  persist,
  resetProgress,
  setTheme,
} from './store.js';
import { renderDashboard } from './views/dashboard.js';
import { renderGuru } from './views/guru.js';
import { renderLogin } from './views/login.js';
import { renderLeaderboard } from './views/leaderboard.js';
import { renderMateriDetail, renderMateriList } from './views/materi.js';
import { renderQuiz } from './views/kuis.js';
import { renderPencapaian } from './views/pencapaian.js';
import { renderSimulasi } from './views/simulasi.js';

const PAGE_TITLES = {
  login: 'Masuk',
  dashboard: 'Dashboard',
  materi: 'Materi',
  kuis: 'Kuis',
  simulasi: 'Simulasi',
  pencapaian: 'Pencapaian',
  leaderboard: 'Leaderboard',
  guru: 'Dashboard Guru',
};

let cleanups = [];
let lastRouteKey = '';

function runCleanups() {
  for (const cleanup of cleanups) {
    try {
      cleanup();
    } catch {
      // Abaikan kegagalan cleanup animasi agar UI tetap dirender.
    }
  }
  cleanups = [];
}

function syncTheme() {
  const theme = getTheme();
  document.documentElement.dataset.theme = theme;
  document.documentElement.style.colorScheme = theme;
  const meta = document.querySelector('meta[name="theme-color"]');
  if (meta) meta.setAttribute('content', theme === 'dark' ? '#060a14' : '#f3f6ff');
}

function setTitle(route) {
  const title = PAGE_TITLES[route.view] || 'Belajar Sains';
  document.title = `${title} · SainsKan`;
}

function startMateriQuiz(materiId) {
  startQuiz(`materi:${materiId}`, SOAL.filter((item) => item.materiId === materiId), 'materi', materiId);
}

function startDailyQuiz() {
  startQuiz(`harian:${new Date().toDateString()}`, dailyQuestions(), 'harian');
}

function awardSimulation(id) {
  if (!activeState) return;
  const badges = markSimulation(activeState, id);
  persist();
  badges.forEach((badgeId) => {
    const achievement = ACHIEVEMENTS.find((item) => item.id === badgeId);
    if (achievement) toast(`Badge baru: ${achievement.nama}  +25 XP`, 'good');
  });
}

function toastBadges(badges) {
  badges.forEach((badgeId) => {
    const achievement = ACHIEVEMENTS.find((item) => item.id === badgeId);
    if (achievement) toast(`Badge baru: ${achievement.nama}  +25 XP`, 'good');
  });
}

function mountSimulation(view) {
  if (view !== 'simulasi') return;
  if (ui.sim.tab === 'gravitasi') cleanups.push(mountGravity());
  else if (ui.sim.tab === 'tatasurya') cleanups.push(mountSolar());
  else cleanups.push(mountCircuit());
}

function render({ preserveScroll = false } = {}) {
  runCleanups();
  syncTheme();

  const app = document.getElementById('app');
  const user = getCurrentUser();
  const route = parseRoute();

  if (!user) {
    if (route.view !== 'login') {
      replaceRoute('login');
      return;
    }
    document.title = 'Masuk · SainsKan';
    app.innerHTML = renderLogin();
    lastRouteKey = 'login';
    window.scrollTo({ top: 0, behavior: 'auto' });
    return;
  }

  if (user.role === 'guru') {
    if (route.view !== 'guru') {
      replaceRoute('guru');
      return;
    }
    setTitle(route);
    app.innerHTML = renderGuru(user);
    lastRouteKey = 'guru';
    cleanups.push(initDialog());
    if (!preserveScroll) window.scrollTo({ top: 0, behavior: 'auto' });
    return;
  }

  if (route.view === 'login' || route.view === 'guru') {
    replaceRoute('dashboard');
    return;
  }

  const state = getState(user.username);
  if (!state) {
    logout();
    replaceRoute('login');
    return;
  }

  let html;
  switch (route.view) {
    case 'materi':
      html = route.param ? renderMateriDetail(state, user, route.param) : renderMateriList(state, user);
      break;
    case 'kuis': {
      if (!route.param) {
        navigate('materi');
        return;
      }
      if (route.param === 'harian') {
        if (!ui.quiz || ui.quiz.mode !== 'harian' || ui.quiz.key !== `harian:${new Date().toDateString()}`) {
          startDailyQuiz();
        }
        html = renderQuiz(state, user);
      } else if (MATERI.some((materi) => materi.id === route.param)) {
        if (!ui.quiz || ui.quiz.key !== `materi:${route.param}`) startMateriQuiz(route.param);
        html = renderQuiz(state, user);
      } else {
        navigate('materi');
        return;
      }
      break;
    }
    case 'simulasi':
      html = renderSimulasi(state, user);
      break;
    case 'pencapaian':
      html = renderPencapaian(state, user);
      break;
    case 'leaderboard':
      html = renderLeaderboard(state, user);
      break;
    default:
      html = renderDashboard(state, user);
  }

  if (ui.resetModal) html += resetModalHTML();

  setTitle(route);
  app.innerHTML = html;
  mountSimulation(route.view);
  cleanups.push(initDialog());

  const routeKey = `${route.view}/${route.param || ''}`;
  if (!preserveScroll && routeKey !== lastRouteKey) window.scrollTo({ top: 0, behavior: 'auto' });
  lastRouteKey = routeKey;
}

function updateGravityReadouts() {
  const readout = gravityReadout(ui.sim.grav);
  const set = (id, value) => {
    const element = document.getElementById(id);
    if (element) element.textContent = value;
  };
  set('grav-mass-val', ui.sim.grav.massa);
  set('grav-height-val', ui.sim.grav.tinggi);
  set('grav-t-val', readout.time);
  set('grav-v-val', readout.velocity);
  set('grav-ep-val', readout.potentialEnergy);
}

function updateCircuitReadouts() {
  const calc = circuitCalc(ui.sim.circ);
  const set = (id, value) => {
    const element = document.getElementById(id);
    if (element) element.textContent = value;
  };
  set('circ-r-val', calc.resistance.toFixed(2));
  set('circ-i-val', calc.current.toFixed(2));
  set(
    'circ-extra-val',
    ui.sim.circ.mode === 'seri'
      ? `${calc.v1.toFixed(2)} / ${calc.v2.toFixed(2)} V`
      : `${calc.i1.toFixed(2)} / ${calc.i2.toFixed(2)} A`,
  );
}

async function handleLogin(form) {
  const username = form.elements.username?.value || '';
  const password = form.elements.password?.value || '';
  const button = form.querySelector('button[type="submit"]');
  const error = form.querySelector('.error');

  ui.login.error = '';
  if (error) error.textContent = '';
  if (button) {
    button.disabled = true;
    button.textContent = 'Memeriksa…';
  }

  const result = await login(username, password);

  if (button) {
    button.disabled = false;
    button.textContent = 'Masuk ke SainsKan';
  }

  if (!result.ok) {
    ui.login.error = result.error;
    if (error) error.textContent = result.error;
    const passwordInput = form.elements.password;
    if (passwordInput) {
      passwordInput.value = '';
      passwordInput.focus();
    }
    return;
  }

  resetSessionUi();
  toast(`Selamat datang, ${result.account.displayName}!`, 'good');
  navigate(result.account.role === 'guru' ? 'guru' : 'dashboard');
}

async function handleAddStudent(form) {
  const input = form.querySelector('input');
  const button = form.querySelector('button[type="submit"]');
  ui.guru.addName = input?.value || '';
  ui.guru.addError = '';

  if (button) {
    button.disabled = true;
    button.textContent = 'Menyimpan…';
  }
  const result = await addStudent(ui.guru.addName);
  if (button) {
    button.disabled = false;
    button.textContent = 'Tambah siswa';
  }

  if (!result.ok) {
    ui.guru.addError = result.error;
    render();
    const nextInput = document.getElementById('nama-siswa-baru');
    if (nextInput) nextInput.focus();
    return;
  }

  ui.guru.addOpen = false;
  ui.guru.addName = '';
  ui.guru.addError = '';
  ui.guru.query = '';
  render();
  toast(`Siswa "${result.account.username}" ditambahkan. Progres dimulai dari 0.`, 'good');
}

document.addEventListener('click', (event) => {
  const skip = event.target.closest('[data-skip]');
  if (skip) {
    event.preventDefault();
    const target = document.getElementById('main-content') || document.getElementById('app');
    target?.focus();
    target?.scrollIntoView?.();
  }
});

document.addEventListener('click', async (event) => {
  const element = event.target.closest('[data-action]');
  if (!element) return;

  const action = element.dataset.action;
  if (element.classList.contains('modal-bg') && event.target.closest('.modal')) return;

  switch (action) {
    case 'logout':
      logout();
      resetSessionUi();
      navigate('login');
      break;
    case 'theme':
      setTheme(getTheme() === 'dark' ? 'light' : 'dark');
      render();
      break;
    case 'reset-open':
      ui.resetModal = true;
      render();
      break;
    case 'reset-cancel':
      ui.resetModal = false;
      render();
      break;
    case 'reset-confirm':
      resetProgress();
      resetSimulations();
      ui.quiz = null;
      ui.resetModal = false;
      navigate('dashboard');
      render();
      toast('Progres berhasil direset. Tema tetap dipertahankan.', 'good');
      break;
    case 'nav':
      navigate(element.dataset.view || 'dashboard');
      break;
    case 'filter':
      ui.filter = element.dataset.kat || 'Semua';
      render();
      break;
    case 'filter-kat':
      ui.filter = element.dataset.kat || 'Semua';
      navigate('materi');
      break;
    case 'buka-materi':
      navigate(`materi/${element.dataset.id}`);
      break;
    case 'kuis-materi':
      startMateriQuiz(element.dataset.id);
      navigate(`kuis/${element.dataset.id}`);
      break;
    case 'daily':
      startDailyQuiz();
      navigate('kuis/harian');
      break;
    case 'pilih': {
      const quiz = ui.quiz;
      if (!quiz || quiz.answered) break;
      quiz.selected = Number(element.dataset.i);
      document
        .querySelectorAll('.option')
        .forEach((option, index) => option.classList.toggle('sel', index === quiz.selected));
      const submit = document.querySelector('[data-action="submit"]');
      if (submit) submit.disabled = false;
      break;
    }
    case 'submit': {
      const quiz = ui.quiz;
      if (!quiz || quiz.answered || quiz.result) break;
      if (quiz.selected === null) {
        toast('Pilih satu jawaban dulu ya.', 'warn');
        break;
      }
      quiz.answered = true;
      quiz.answers[quiz.idx] = quiz.selected;
      render();
      break;
    }
    case 'next': {
      const quiz = ui.quiz;
      if (!quiz || !activeState) break;
      if (quiz.idx < quiz.items.length - 1) {
        quiz.idx += 1;
        quiz.selected = null;
        quiz.answered = false;
        render();
        break;
      }
      const result =
        quiz.mode === 'materi'
          ? completeMateriQuiz(activeState, quiz.materiId, quiz.items, quiz.answers)
          : completeDaily(activeState, quiz.items, quiz.answers);
      persist();
      quiz.result = result;
      render();
      toast(
        result.duplicate
          ? 'Kuis selesai. Tidak ada poin baru (sudah pernah diselesaikan).'
          : `Kuis selesai! +${result.gained} poin & XP`,
        result.duplicate ? 'warn' : 'good',
      );
      toastBadges(result.badges || []);
      break;
    }
    case 'kuis-ulang': {
      const quiz = ui.quiz;
      if (!quiz) break;
      if (quiz.mode === 'materi') startMateriQuiz(quiz.materiId);
      else startDailyQuiz();
      render();
      break;
    }
    case 'selesai-kuis': {
      const wasDaily = ui.quiz?.mode === 'harian';
      ui.quiz = null;
      navigate(wasDaily ? 'dashboard' : 'materi');
      break;
    }
    case 'sim-tab':
      ui.sim.tab = element.dataset.tab || 'gravitasi';
      render();
      break;
    case 'grav-drop':
      ui.sim.grav.t = 0;
      ui.sim.grav.done = false;
      ui.sim.grav.running = true;
      awardSimulation('gravitasi');
      render();
      break;
    case 'grav-reset':
      ui.sim.grav.t = 0;
      ui.sim.grav.done = false;
      ui.sim.grav.running = false;
      render();
      break;
    case 'solar-toggle':
      ui.sim.solar.playing = !ui.sim.solar.playing;
      awardSimulation('tatasurya');
      render();
      break;
    case 'circ-mode':
      ui.sim.circ.mode = element.dataset.mode === 'paralel' ? 'paralel' : 'seri';
      awardSimulation('rangkaian');
      render();
      break;
    case 'guru-detail':
      ui.guru.detail = element.dataset.user || null;
      render();
      break;
    case 'guru-detail-close':
      ui.guru.detail = null;
      render();
      break;
    case 'guru-add-open':
      ui.guru.addOpen = true;
      ui.guru.addName = '';
      ui.guru.addError = '';
      render();
      break;
    case 'guru-add-close':
      ui.guru.addOpen = false;
      ui.guru.addError = '';
      render();
      break;
    case 'guru-sort':
      ui.guru.sort = element.dataset.sort || 'xp';
      render();
      break;
    default:
      break;
  }
});

document.addEventListener('input', (event) => {
  const element = event.target.closest('[data-input]');
  if (!element) return;
  const key = element.dataset.input;
  const value = element.value;

  switch (key) {
    case 'grav-mass':
      ui.sim.grav.massa = Number(value);
      updateGravityReadouts();
      break;
    case 'grav-height':
      ui.sim.grav.tinggi = Number(value);
      ui.sim.grav.t = 0;
      ui.sim.grav.running = false;
      ui.sim.grav.done = false;
      updateGravityReadouts();
      break;
    case 'solar-speed': {
      ui.sim.solar.speed = Number(value);
      const label = document.getElementById('solar-speed-val');
      if (label) label.textContent = Number(value).toFixed(1);
      break;
    }
    case 'circ-v':
      ui.sim.circ.v = Number(value);
      awardSimulation('rangkaian');
      updateCircuitReadouts();
      break;
    case 'circ-r1':
      ui.sim.circ.r1 = Number(value);
      awardSimulation('rangkaian');
      updateCircuitReadouts();
      break;
    case 'circ-r2':
      ui.sim.circ.r2 = Number(value);
      awardSimulation('rangkaian');
      updateCircuitReadouts();
      break;
    case 'guru-search': {
      const caret = element.selectionStart ?? value.length;
      ui.guru.query = value;
      render({ preserveScroll: true });
      const next = document.getElementById('guru-search');
      if (next) {
        next.focus();
        next.setSelectionRange(caret, caret);
      }
      break;
    }
    default:
      break;
  }
});

document.addEventListener('submit', (event) => {
  const form = event.target;
  if (form.id === 'login-form') {
    event.preventDefault();
    handleLogin(form);
    return;
  }
  if (form.dataset.form === 'guru-add') {
    event.preventDefault();
    handleAddStudent(form);
  }
});

document.addEventListener('keydown', (event) => {
  const target = event.target;
  if (!(target instanceof Element)) return;

  const roleButton = target.closest('[role="button"][data-action]');
  if (roleButton && (event.key === 'Enter' || event.key === ' ')) {
    event.preventDefault();
    roleButton.click();
    return;
  }

  if (event.key === 'Escape' && ui.resetModal) {
    ui.resetModal = false;
    render();
  }
});

function showFatalError(error) {
  const app = document.getElementById('app');
  const cryptoIssue = error?.code === 'CRYPTO_UNAVAILABLE';
  app.innerHTML = `<div class="login-page">
    <section class="login-card" style="grid-template-columns:1fr;max-width:560px">
      <div class="login-form">
        <div class="eyebrow">SainsKan</div>
        <h1 style="margin:0;font-size:24px">${cryptoIssue ? 'Browser belum mendukung mode aman' : 'Aplikasi gagal dimuat'}</h1>
        <p class="muted">${
          cryptoIssue
            ? 'SainsKan menyimpan akun dengan hash PBKDF2 melalui Web Crypto. Jalankan melalui HTTPS atau http://localhost (mode development Vite), bukan dengan membuka file HTML langsung.'
            : 'Terjadi kesalahan saat membaca data lokal. Coba muat ulang halaman.'
        }</p>
        <button class="btn primary" type="button" id="reload-app">Muat ulang</button>
      </div>
    </section>
  </div>`;
  document.getElementById('reload-app')?.addEventListener('click', () => window.location.reload());
}

async function boot() {
  setStorageErrorHandler((message) => toast(message, 'warn'));
  try {
    await initStore();
  } catch (error) {
    showFatalError(error);
    return;
  }
  if (initNotice) toast(initNotice, 'warn');
  // Daftarkan listener lebih dulu: guard route memakai replaceRoute yang
  // memicu hashchange dan perlu render kedua untuk melukis halaman login.
  onRouteChange(() => render());
  render();
}

boot();
