import { describe, expect, it } from 'vitest';
import { circuitCalc, gravityReadout } from '../src/lib/scoring.js';

describe('simulasi gravitasi', () => {
  it('menghitung waktu jatuh 20 m sesuai t = akar(2h/g)', () => {
    const readout = gravityReadout({ massa: 1, tinggi: 20, t: 10 });
    expect(readout.time).toBe('2.02');
    expect(readout.velocity).toBe('19.80');
  });

  it('massa tidak mengubah waktu jatuh', () => {
    const light = gravityReadout({ massa: 1, tinggi: 20, t: 0 });
    const heavy = gravityReadout({ massa: 10, tinggi: 20, t: 0 });
    expect(light.time).toBe(heavy.time);
    expect(Number(heavy.potentialEnergy)).toBe(Number(light.potentialEnergy) * 10);
  });
});

describe('simulasi rangkaian listrik', () => {
  it('menghitung rangkaian seri V=12, R1=2, R2=4', () => {
    const result = circuitCalc({ mode: 'seri', v: 12, r1: 2, r2: 4 });
    expect(result.resistance).toBe(6);
    expect(result.current).toBe(2);
    expect(result.v1).toBe(4);
    expect(result.v2).toBe(8);
  });

  it('menghitung rangkaian paralel V=12, R1=2, R2=4', () => {
    const result = circuitCalc({ mode: 'paralel', v: 12, r1: 2, r2: 4 });
    expect(result.resistance).toBeCloseTo(1.333, 3);
    expect(result.current).toBeCloseTo(9, 5);
    expect(result.i1).toBe(6);
    expect(result.i2).toBe(3);
  });
});
