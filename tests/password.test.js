import { describe, expect, it } from 'vitest';
import { hashPassword, verifyPassword } from '../src/lib/password.js';

describe('hash password PBKDF2', () => {
  it('membuat salt berbeda dan memverifikasi password yang benar', async () => {
    const first = await hashPassword('123');
    const second = await hashPassword('123');

    expect(first.hash).not.toBe('123');
    expect(first.salt).not.toBe(second.salt);
    expect(await verifyPassword('123', first)).toBe(true);
    expect(await verifyPassword('123', second)).toBe(true);
  });

  it('menolak password salah dan kredensial rusak', async () => {
    const credential = await hashPassword('rahasia');
    expect(await verifyPassword('salah', credential)).toBe(false);
    expect(await verifyPassword('rahasia', { algorithm: 'unknown' })).toBe(false);
    expect(await verifyPassword('rahasia', null)).toBe(false);
  });
});
