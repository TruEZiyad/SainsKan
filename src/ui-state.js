/** State UI yang tidak perlu disimpan ke localStorage. */
export const ui = {
  filter: 'Semua',
  quiz: null,
  resetModal: false,
  login: { error: '', pending: false },
  guru: { detail: null, addOpen: false, addName: '', addError: '', sort: 'xp', query: '' },
  sim: {
    tab: 'gravitasi',
    grav: { massa: 2, tinggi: 20, t: 0, running: false, done: false },
    solar: { years: 0, speed: 1, playing: true, selected: 3 },
    circ: { mode: 'seri', v: 12, r1: 2, r2: 4 },
  },
};

export function resetSessionUi() {
  ui.filter = 'Semua';
  ui.quiz = null;
  ui.resetModal = false;
  ui.login = { error: '', pending: false };
  ui.guru = { detail: null, addOpen: false, addName: '', addError: '', sort: 'xp', query: '' };
  resetSimulations();
}

export function resetSimulations() {
  ui.sim = {
    tab: 'gravitasi',
    grav: { massa: 2, tinggi: 20, t: 0, running: false, done: false },
    solar: { years: 0, speed: 1, playing: true, selected: 3 },
    circ: { mode: 'seri', v: 12, r1: 2, r2: 4 },
  };
}

export function startQuiz(key, items, mode, materiId = null) {
  ui.quiz = {
    key,
    mode,
    materiId,
    items,
    idx: 0,
    selected: null,
    answered: false,
    answers: [],
    result: null,
  };
}

export function resetQuiz() {
  ui.quiz = null;
}
