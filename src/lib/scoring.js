export const GRAVITY = 9.8;

/** Bacaan simulasi jatuh bebas untuk state kontrol. */
export function gravityReadout({ massa, tinggi, t }) {
  const duration = Math.sqrt((2 * Math.max(0, tinggi)) / GRAVITY);
  const time = Math.min(Math.max(0, Number(t) || 0), duration);
  return {
    time: time.toFixed(2),
    duration,
    velocity: (GRAVITY * time).toFixed(2),
    potentialEnergy: (massa * GRAVITY * Math.max(0, tinggi)).toFixed(0),
  };
}

/** Hukum Ohm: rangkaian seri dan paralel. */
export function circuitCalc({ mode, v, r1, r2 }) {
  const voltage = Number(v) || 0;
  const first = Number(r1) || 0;
  const second = Number(r2) || 0;

  if (mode === 'seri') {
    const resistance = first + second;
    const current = resistance > 0 ? voltage / resistance : 0;
    return {
      resistance,
      current,
      v1: current * first,
      v2: current * second,
      i1: current,
      i2: current,
      mode: 'seri',
    };
  }

  const resistance = first + second > 0 ? (first * second) / (first + second) : 0;
  const current = resistance > 0 ? voltage / resistance : 0;
  return {
    resistance,
    current,
    v1: voltage,
    v2: voltage,
    i1: first > 0 ? voltage / first : 0,
    i2: second > 0 ? voltage / second : 0,
    mode: 'paralel',
  };
}
