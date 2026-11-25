import { ACHIEVEMENTS } from '../data/achievements.js';
import { KATEGORI } from '../data/kategori.js';
import { MATERI } from '../data/materi.js';
import { SOAL } from '../data/soal.js';
import { levelOf, pct, todayStr, yesterdayStr } from '../lib/utils.js';

/** Jumlah kuis materi yang sudah pernah diselesaikan (hadiah sudah diberikan). */
export function quizCompletedCount(state) {
  return Object.values(state.progres).filter((item) => item.awarded).length;
}

/** Jumlah kuis dengan skor terbaik >= 80. */
export function highScoreCount(state) {
  return Object.values(state.progres).filter((item) => item.awarded && item.skor >= 80).length;
}

export function categoryProgress(state, kategori) {
  const ids = MATERI.filter((materi) => materi.kategori === kategori).map((materi) => materi.id);
  return {
    done: ids.filter((id) => state.player.materiSelesai.includes(id)).length,
    total: ids.length,
  };
}

/** Soal harian deterministik berdasarkan tanggal lokal YYYY-MM-DD. */
export function hashDate(dateString) {
  let hash = 0;
  for (let i = 0; i < dateString.length; i += 1) {
    hash = (hash * 31 + dateString.charCodeAt(i)) >>> 0;
  }
  return hash;
}

export function dailyQuestions(date = todayStr(), pool = SOAL) {
  const seed = hashDate(date);
  const used = new Set();
  const picked = [];
  [seed % pool.length, (seed + 13) % pool.length, (seed + 25) % pool.length].forEach((start) => {
    let index = start;
    while (used.has(index)) index = (index + 1) % pool.length;
    used.add(index);
    picked.push(pool[index]);
  });
  return picked;
}

export function isDailyDone(state, date = todayStr()) {
  return state.daily.tanggal === date && state.daily.selesai;
}

function achievementMet(state, achievement) {
  const requirement = achievement.syaratPencapaian;
  const player = state.player;
  switch (requirement.type) {
    case 'kuis':
      return quizCompletedCount(state) >= requirement.count;
    case 'skorTinggi':
      return highScoreCount(state) >= requirement.count;
    case 'kategoriLengkap': {
      const progress = categoryProgress(state, requirement.kategori);
      return progress.done >= progress.total;
    }
    case 'level':
      return player.level >= requirement.value;
    case 'poin':
      return player.totalPoin >= requirement.value;
    case 'streak':
      return state.daily.streak >= requirement.value;
    case 'simulasi':
      return state.simulasiDicoba.length >= requirement.value;
    case 'materi':
      return player.materiSelesai.length >= requirement.value;
    default:
      return false;
  }
}

/**
 * Evaluasi badge dan beri +25 XP untuk setiap badge baru.
 * Mengembalikan daftar id badge yang baru diraih.
 */
export function evaluateBadges(state) {
  const awarded = [];
  state.player.level = levelOf(state.player.xp);

  for (let pass = 0; pass <= ACHIEVEMENTS.length; pass += 1) {
    let changed = false;
    for (const achievement of ACHIEVEMENTS) {
      if (state.player.badge.includes(achievement.id)) continue;
      if (!achievementMet(state, achievement)) continue;
      state.player.badge.push(achievement.id);
      state.player.xp += 25;
      state.player.level = levelOf(state.player.xp);
      awarded.push(achievement.id);
      changed = true;
    }
    if (!changed) break;
  }

  return awarded;
}

/**
 * Catat penyelesaian kuis materi.
 * Poin soal + bonus 20 hanya diberikan pada penyelesaian pertama.
 */
export function completeMateriQuiz(state, materiId, items, answers) {
  const correct = answers.filter((answer, index) => answer === items[index].jawabanBenar).length;
  const questionPoints = answers.reduce(
    (total, answer, index) => total + (answer === items[index].jawabanBenar ? items[index].poin : 0),
    0,
  );
  const score = pct(correct, items.length);

  let progress = state.progres[materiId];
  if (!progress) {
    progress = {
      pemainId: state.player.id,
      materiId,
      skor: 0,
      status: 'sedang',
      tanggalPenyelesaian: '',
      awarded: false,
      attempts: 0,
      jawaban: {},
    };
    state.progres[materiId] = progress;
  }

  progress.attempts += 1;
  progress.skor = Math.max(progress.skor || 0, score);
  progress.status = 'selesai';
  progress.tanggalPenyelesaian = todayStr();
  progress.jawaban = { benar: correct, total: items.length };

  let gained = 0;
  if (!progress.awarded) {
    progress.awarded = true;
    gained = questionPoints + 20;
    state.player.totalPoin += gained;
    state.player.xp += gained;
    if (!state.player.materiSelesai.includes(materiId)) {
      state.player.materiSelesai.push(materiId);
    }
  }

  const badges = evaluateBadges(state);
  return {
    correct,
    total: items.length,
    score,
    questionPoints,
    gained,
    badges,
    duplicate: gained === 0,
  };
}

/** Catat daily challenge; hadiah +30 hanya sekali per tanggal lokal. */
export function completeDaily(state, items, answers, now = new Date()) {
  const correct = answers.filter((answer, index) => answer === items[index].jawabanBenar).length;
  const date = todayStr(now);
  let gained = 0;

  if (state.daily.tanggal !== date || !state.daily.selesai) {
    gained = 30;
    state.daily.streak = state.daily.terakhir === yesterdayStr(now) ? (state.daily.streak || 0) + 1 : 1;
    state.daily.tanggal = date;
    state.daily.selesai = true;
    state.daily.diambilAt = now.toISOString();
    state.daily.terakhir = date;
    state.player.totalPoin += gained;
    state.player.xp += gained;
  }

  const badges = evaluateBadges(state);
  return {
    correct,
    total: items.length,
    score: pct(correct, items.length),
    gained,
    badges,
    duplicate: gained === 0,
  };
}

/** Tandai simulasi pernah dicoba dan evaluasi badge. */
export function markSimulation(state, simulationId) {
  if (!state.simulasiDicoba.includes(simulationId)) {
    state.simulasiDicoba.push(simulationId);
  }
  return evaluateBadges(state);
}

export function categorySummary(state) {
  return KATEGORI.map((kategori) => ({
    kategori,
    ...categoryProgress(state, kategori),
  }));
}
