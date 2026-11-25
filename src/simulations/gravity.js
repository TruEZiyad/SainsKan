import { GRAVITY, gravityReadout } from '../lib/scoring.js';
import { ui } from '../ui-state.js';
import { setupCanvas } from './canvas.js';

const WIDTH = 800;
const HEIGHT = 420;

function draw() {
  const canvas = document.getElementById('grav-canvas');
  if (!canvas) return;
  const ctx = setupCanvas(canvas, WIDTH, HEIGHT);
  const state = ui.sim.grav;
  const duration = Math.sqrt((2 * state.tinggi) / GRAVITY);
  const time = Math.min(state.t, duration);
  const fallen = 0.5 * GRAVITY * time * time;
  const remaining = Math.max(0, state.tinggi - fallen);

  const groundY = HEIGHT - 46;
  const topY = 34;
  const usable = groundY - topY;
  const y = groundY - (remaining / state.tinggi) * usable;

  ctx.strokeStyle = 'rgba(56, 189, 248, 0.35)';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(70, topY);
  ctx.lineTo(70, groundY);
  ctx.stroke();

  ctx.fillStyle = '#93c5fd';
  ctx.font = '12px sans-serif';
  for (let i = 0; i <= 4; i += 1) {
    const tickY = groundY - (i / 4) * usable;
    ctx.beginPath();
    ctx.moveTo(64, tickY);
    ctx.lineTo(76, tickY);
    ctx.stroke();
    ctx.fillText(`${Math.round((state.tinggi * i) / 4)} m`, 80, tickY + 4);
  }

  ctx.fillStyle = '#1e293b';
  ctx.fillRect(0, groundY, WIDTH, HEIGHT - groundY);
  ctx.strokeStyle = '#38bdf8';
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(0, groundY);
  ctx.lineTo(WIDTH, groundY);
  ctx.stroke();

  ctx.beginPath();
  ctx.setLineDash([5, 6]);
  ctx.moveTo(130, topY);
  ctx.lineTo(130, groundY);
  ctx.stroke();
  ctx.setLineDash([]);

  ctx.shadowColor = '#38bdf8';
  ctx.shadowBlur = 18;
  ctx.fillStyle = '#60a5fa';
  ctx.beginPath();
  ctx.arc(130, y, 14, 0, Math.PI * 2);
  ctx.fill();
  ctx.shadowBlur = 0;
  ctx.fillStyle = '#bfdbfe';
  ctx.beginPath();
  ctx.arc(125, y - 5, 4, 0, Math.PI * 2);
  ctx.fill();

  const readout = gravityReadout(state);
  ctx.fillStyle = '#e2e8f0';
  ctx.font = 'bold 16px sans-serif';
  ctx.fillText(`t = ${readout.time} s`, 340, 70);
  ctx.fillText(`v = ${readout.velocity} m/s`, 340, 96);
  ctx.fillText(`Ep = ${(state.massa * GRAVITY * remaining).toFixed(0)} J`, 340, 122);
  ctx.font = '13px sans-serif';
  ctx.fillStyle = '#93c5fd';
  ctx.fillText(`h = ${state.tinggi} m   m = ${state.massa} kg   g = 9,8 m/s²`, 340, 158);
  ctx.fillStyle = state.done ? '#34d399' : state.running ? '#fbbf24' : '#94a3b8';
  ctx.font = 'bold 16px sans-serif';
  ctx.fillText(
    state.done ? '✓ Sampai permukaan' : state.running ? 'Jatuh…' : 'Tekan "Jatuhkan" untuk mulai',
    340,
    210,
  );
}

/** Jalankan animasi jatuh bebas. Mengembalikan fungsi cleanup. */
export function mountGravity() {
  const state = ui.sim.grav;
  let raf = 0;
  let last = performance.now();

  function loop(timestamp) {
    const dt = Math.min((timestamp - last) / 1000, 0.05);
    last = timestamp;

    if (state.running) {
      state.t += dt;
      const duration = Math.sqrt((2 * state.tinggi) / GRAVITY);
      if (state.t >= duration) {
        state.t = duration;
        state.running = false;
        state.done = true;
      }
    }

    draw();
    raf = window.requestAnimationFrame(loop);
  }

  raf = window.requestAnimationFrame(loop);
  return () => window.cancelAnimationFrame(raf);
}
