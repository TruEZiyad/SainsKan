import { describe, expect, it } from 'vitest';
import {
  completeDaily,
  completeMateriQuiz,
  dailyQuestions,
  evaluateBadges,
  highScoreCount,
} from '../src/lib/progress.js';
import { SOAL } from '../src/data/soal.js';

function createState(username = 'Komet') {
  return {
    version: 3,
    alias: username,
    player: {
      id: `pemain-${username}`,
      namaAlias: username,
      xp: 0,
      level: 1,
      totalPoin: 0,
      badge: [],
      materiSelesai: [],
    },
    progres: {},
    daily: { tanggal: '', selesai: false, diambilAt: '', streak: 0, terakhir: '' },
    simulasiDicoba: [],
  };
}

const fisikaItems = SOAL.filter((item) => item.materiId === 'f1');

describe('penyelesaian kuis materi', () => {
  it('memberi poin soal + bonus 20 + badge pemula pada penyelesaian pertama', () => {
    const state = createState();
    const answers = fisikaItems.map((item) => item.jawabanBenar);
    const result = completeMateriQuiz(state, 'f1', fisikaItems, answers);

    expect(result.correct).toBe(3);
    expect(result.score).toBe(100);
    expect(result.gained).toBe(65);
    expect(state.player.totalPoin).toBe(65);
    expect(state.player.xp).toBe(90); // 65 + 25 dari badge Pemula
    expect(state.player.badge).toContain('pemula');
    expect(state.player.materiSelesai).toEqual(['f1']);
    expect(state.progres.f1.awarded).toBe(true);
  });

  it('tidak memberi poin kedua kali tetapi menyimpan skor terbaik', () => {
    const state = createState();
    const correct = fisikaItems.map((item) => item.jawabanBenar);
    completeMateriQuiz(state, 'f1', fisikaItems, correct);

    const wrong = fisikaItems.map((item) => (item.jawabanBenar + 1) % 4);
    const second = completeMateriQuiz(state, 'f1', fisikaItems, wrong);

    expect(second.duplicate).toBe(true);
    expect(second.gained).toBe(0);
    expect(state.player.totalPoin).toBe(65);
    expect(state.player.xp).toBe(90);
    expect(state.progres.f1.skor).toBe(100);
    expect(state.progres.f1.attempts).toBe(2);
  });

  it('menghitung kuis skor tinggi hanya sekali per materi', () => {
    const state = createState();
    const correct = fisikaItems.map((item) => item.jawabanBenar);
    completeMateriQuiz(state, 'f1', fisikaItems, correct);
    completeMateriQuiz(state, 'f1', fisikaItems, correct);
    expect(highScoreCount(state)).toBe(1);
  });
});

describe('daily challenge', () => {
  it('memilih 3 soal unik dan deterministik per tanggal', () => {
    const first = dailyQuestions('2026-11-25');
    const second = dailyQuestions('2026-11-25');
    expect(first).toHaveLength(3);
    expect(new Set(first.map((item) => item.id)).size).toBe(3);
    expect(first.map((item) => item.id)).toEqual(second.map((item) => item.id));
  });

  it('memberi hadiah sekali per tanggal dan menghitung streak', () => {
    const state = createState();
    const items = dailyQuestions('2026-11-25');
    const answers = items.map((item) => item.jawabanBenar);
    const day1 = new Date(2026, 10, 25, 10, 0, 0);

    const first = completeDaily(state, items, answers, day1);
    expect(first.gained).toBe(30);
    expect(state.daily.streak).toBe(1);

    const repeat = completeDaily(state, items, answers, day1);
    expect(repeat.gained).toBe(0);
    expect(state.player.totalPoin).toBe(30);

    const day2 = new Date(2026, 10, 26, 10, 0, 0);
    const second = completeDaily(state, dailyQuestions('2026-11-26'), answers, day2);
    expect(second.gained).toBe(30);
    expect(state.daily.streak).toBe(2);

    const skipped = new Date(2026, 10, 28, 10, 0, 0);
    completeDaily(state, dailyQuestions('2026-11-28'), answers, skipped);
    expect(state.daily.streak).toBe(1);
  });
});

describe('badge', () => {
  it('memberi badge level 3 dan XP tambahan saat level tercapai', () => {
    const state = createState();
    state.player.xp = 275;
    state.player.level = 3;
    const badges = evaluateBadges(state);
    expect(badges).toContain('pentas_ruang');
    expect(state.player.xp).toBe(300);
  });
});
