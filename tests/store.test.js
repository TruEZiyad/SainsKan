// @vitest-environment jsdom
import { beforeEach, describe, expect, it, vi } from 'vitest';

beforeEach(() => {
  window.localStorage.clear();
  vi.resetModules();
});

describe('inisialisasi store', () => {
  it('membuat 7 akun demo dengan password ter-hash, bukan plaintext', async () => {
    const store = await import('../src/store.js');
    await store.initStore();

    expect(store.getAccounts()).toHaveLength(7);
    expect(store.getStudentAccounts()).toHaveLength(6);
    expect(store.getCurrentUser()).toBeNull();

    const stored = window.localStorage.getItem('sainskan.db.v3');
    expect(stored).toBeTruthy();
    expect(stored).not.toContain('"password"');
    const db = JSON.parse(stored);
    expect(db.accounts[0].credential.algorithm).toBe('PBKDF2-SHA256');
    expect(db.accounts[0].credential.hash).not.toBe('123');
  });

  it('login lokal dan isolasi progres per akun', async () => {
    const store = await import('../src/store.js');
    await store.initStore();

    const bad = await store.login('Komet', 'salah');
    expect(bad.ok).toBe(false);

    const good = await store.login('Komet', '123');
    expect(good.ok).toBe(true);
    expect(store.activeState.alias).toBe('Komet');

    store.activeState.player.xp = 42;
    store.activeState.player.level = 1;
    store.persist();
    store.logout();

    const asNeutron = await store.login('Neutron', '123');
    expect(asNeutron.ok).toBe(true);
    expect(store.activeState.alias).toBe('Neutron');
    expect(store.activeState.player.xp).toBe(520);

    vi.resetModules();
    const reloaded = await import('../src/store.js');
    await reloaded.initStore();
    const asKomet = await reloaded.login('Komet', '123');
    expect(asKomet.ok).toBe(true);
    expect(reloaded.getState('Komet').player.xp).toBe(42);
  });

  it('guru dapat menambah siswa dan progres dimulai dari nol', async () => {
    const store = await import('../src/store.js');
    await store.initStore();
    await store.login('Guru Sains', '123');

    const invalid = await store.addStudent('ab');
    expect(invalid.ok).toBe(false);

    const added = await store.addStudent('Bintang');
    expect(added.ok).toBe(true);
    expect(store.getStudentAccounts()).toHaveLength(7);

    const duplicate = await store.addStudent('bintang');
    expect(duplicate.ok).toBe(false);

    const progress = store.getState('Bintang');
    expect(progress.player.totalPoin).toBe(0);
    expect(progress.player.materiSelesai).toEqual([]);

    store.logout();
    const login = await store.login('Bintang', '123');
    expect(login.ok).toBe(true);
  });

  it('reset progres mengosongkan data tanpa mengubah tema', async () => {
    const store = await import('../src/store.js');
    await store.initStore();
    await store.login('Komet', '123');
    store.setTheme('light');
    store.activeState.player.xp = 500;
    store.persist();

    store.resetProgress();
    expect(store.activeState.player.xp).toBe(0);
    expect(store.getTheme()).toBe('light');
  });
});

describe('migrasi prototype v2', () => {
  it('memindahkan akun plaintext ke v3 dan menghapus salinan lama', async () => {
    window.localStorage.setItem(
      'sainskan.progress.v2',
      JSON.stringify({
        version: 2,
        session: 'Komet',
        accounts: [
          {
            username: 'Komet',
            password: '123',
            role: 'siswa',
            displayName: 'Komet',
            custom: true,
            seed: { xp: 0, totalPoin: 0, materiSelesai: [], streak: 0, badge: [] },
          },
        ],
        progress: {
          Komet: {
            version: 2,
            alias: 'Komet',
            theme: 'light',
            player: {
              id: 'pemain-Komet',
              namaAlias: 'Komet',
              xp: 65,
              level: 1,
              totalPoin: 65,
              badge: ['pemula'],
              materiSelesai: ['f1'],
            },
            progres: {
              f1: {
                pemainId: 'Komet',
                materiId: 'f1',
                skor: 100,
                status: 'selesai',
                tanggalPenyelesaian: '2026-11-25',
                awarded: true,
                attempts: 1,
                jawaban: { benar: 3, total: 3 },
              },
            },
            daily: { tanggal: '', selesai: false, diambilAt: '', streak: 0, terakhir: '' },
            simulasiDicoba: [],
          },
        },
      }),
    );

    const store = await import('../src/store.js');
    await store.initStore();

    expect(store.getAccounts()).toHaveLength(7);
    expect(store.getState('Komet').player.xp).toBe(65);
    expect(store.getTheme()).toBe('light');
    expect(window.localStorage.getItem('sainskan.progress.v2')).toBeNull();
    expect(store.activeState?.alias).toBe('Komet');
  });
});
