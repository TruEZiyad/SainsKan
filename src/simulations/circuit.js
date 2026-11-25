import { circuitCalc } from '../lib/scoring.js';
import { ui } from '../ui-state.js';
import { setupCanvas } from './canvas.js';

const WIDTH = 800;
const HEIGHT = 420;

function zig(ctx, x1, y1, x2, y2, label) {
  const dx = x2 - x1;
  const dy = y2 - y1;
  const length = Math.hypot(dx, dy);
  const ux = dx / length;
  const uy = dy / length;
  const nx = -uy;
  const ny = ux;

  ctx.strokeStyle = '#0a1226';
  ctx.lineWidth = 10;
  ctx.beginPath();
  ctx.moveTo(x1, y1);
  ctx.lineTo(x2, y2);
  ctx.stroke();

  ctx.strokeStyle = '#fbbf24';
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(x1, y1);
  const start = 0.22 * length;
  const end = 0.78 * length;
  const steps = 7;
  for (let k = 0; k <= steps; k += 1) {
    const distance = start + ((end - start) * k) / steps;
    const offset = k === 0 || k === steps ? 0 : k % 2 ? 10 : -10;
    ctx.lineTo(x1 + ux * distance + nx * offset, y1 + uy * distance + ny * offset);
  }
  ctx.lineTo(x2, y2);
  ctx.stroke();

  ctx.fillStyle = '#fde68a';
  ctx.font = 'bold 13px sans-serif';
  ctx.fillText(label, (x1 + x2) / 2 + 8, (y1 + y2) / 2 - 14);
}

function pathLength(path) {
  let total = 0;
  for (let i = 0; i < path.length - 1; i += 1) {
    total += Math.hypot(path[i + 1][0] - path[i][0], path[i + 1][1] - path[i][1]);
  }
  return total;
}

function pointAt(path, distance) {
  const total = pathLength(path);
  let remaining = ((distance % total) + total) % total;
  for (let i = 0; i < path.length - 1; i += 1) {
    const segment = Math.hypot(path[i + 1][0] - path[i][0], path[i + 1][1] - path[i][1]);
    if (remaining <= segment) {
      const ratio = segment ? remaining / segment : 0;
      return [
        path[i][0] + (path[i + 1][0] - path[i][0]) * ratio,
        path[i][1] + (path[i + 1][1] - path[i][1]) * ratio,
      ];
    }
    remaining -= segment;
  }
  return path[0];
}

function draw(phase) {
  const canvas = document.getElementById('circ-canvas');
  if (!canvas) return;
  const ctx = setupCanvas(canvas, WIDTH, HEIGHT);
  const calc = circuitCalc(ui.sim.circ);
  const state = ui.sim.circ;

  const paths =
    state.mode === 'seri'
      ? [
          [
            [120, 250],
            [120, 70],
            [680, 70],
            [680, 310],
            [120, 310],
            [120, 250],
          ],
        ]
      : [
          [
            [120, 250],
            [120, 70],
            [320, 70],
            [320, 310],
            [120, 310],
            [120, 250],
          ],
          [
            [120, 250],
            [120, 70],
            [520, 70],
            [520, 310],
            [120, 310],
            [120, 250],
          ],
        ];

  ctx.strokeStyle = '#38bdf8';
  ctx.lineWidth = 4;
  ctx.lineJoin = 'round';
  paths.forEach((path) => {
    ctx.beginPath();
    path.forEach(([x, y], index) => (index ? ctx.lineTo(x, y) : ctx.moveTo(x, y)));
    ctx.stroke();
  });

  ctx.strokeStyle = '#e2e8f0';
  ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.moveTo(98, 180);
  ctx.lineTo(142, 180);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(106, 222);
  ctx.lineTo(134, 222);
  ctx.stroke();

  ctx.fillStyle = '#93c5fd';
  ctx.font = 'bold 13px sans-serif';
  ctx.fillText('+', 150, 186);
  ctx.fillText('−', 150, 228);
  ctx.fillStyle = '#fde68a';
  ctx.fillText(`${state.v} V`, 72, 206);

  if (state.mode === 'seri') {
    zig(ctx, 300, 70, 430, 70, `R1 ${state.r1}Ω`);
    zig(ctx, 430, 310, 300, 310, `R2 ${state.r2}Ω`);
  } else {
    zig(ctx, 320, 130, 320, 220, `R1 ${state.r1}Ω`);
    zig(ctx, 520, 130, 520, 220, `R2 ${state.r2}Ω`);
  }

  const speeds = state.mode === 'seri' ? [calc.current] : [calc.i1, calc.i2];
  paths.forEach((path, pathIndex) => {
    const length = pathLength(path);
    const spacing = 64;
    const speed = 18 + Math.min(speeds[pathIndex], 10) * 14;
    for (let k = 0; k < Math.floor(length / spacing); k += 1) {
      const [x, y] = pointAt(path, phase * (speed / 30) + k * spacing + pathIndex * 17);
      ctx.fillStyle = '#22d3ee';
      ctx.shadowColor = '#22d3ee';
      ctx.shadowBlur = 9;
      ctx.beginPath();
      ctx.arc(x, y, 4, 0, Math.PI * 2);
      ctx.fill();
      ctx.shadowBlur = 0;
    }
  });

  ctx.fillStyle = '#e2e8f0';
  ctx.font = 'bold 15px sans-serif';
  ctx.fillText(`R = ${calc.resistance.toFixed(2)} Ω`, 380, 380);
  ctx.fillText(`I = ${calc.current.toFixed(2)} A`, 520, 380);
  ctx.fillStyle = '#93c5fd';
  ctx.font = '12px sans-serif';
  ctx.fillText(state.mode === 'seri' ? 'Rangkaian Seri' : 'Rangkaian Paralel', 360, 30);
}

function updateReadouts() {
  const calc = circuitCalc(ui.sim.circ);
  const resistance = document.getElementById('circ-r-val');
  const current = document.getElementById('circ-i-val');
  const extra = document.getElementById('circ-extra-val');
  if (resistance) resistance.textContent = calc.resistance.toFixed(2);
  if (current) current.textContent = calc.current.toFixed(2);
  if (extra) {
    extra.textContent =
      calc.mode === 'seri'
        ? `${calc.v1.toFixed(2)} / ${calc.v2.toFixed(2)} V`
        : `${calc.i1.toFixed(2)} / ${calc.i2.toFixed(2)} A`;
  }
}

/** Jalankan animasi rangkaian listrik. Mengembalikan fungsi cleanup. */
export function mountCircuit() {
  let raf = 0;
  let last = performance.now();
  let phase = 0;

  function loop(timestamp) {
    const dt = Math.min((timestamp - last) / 1000, 0.05);
    last = timestamp;
    phase += dt * 60;
    draw(phase);
    updateReadouts();
    raf = window.requestAnimationFrame(loop);
  }

  raf = window.requestAnimationFrame(loop);
  return () => window.cancelAnimationFrame(raf);
}
