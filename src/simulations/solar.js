import { PLANETS } from '../data/planets.js';
import { esc, formatNumber } from '../lib/utils.js';
import { ui } from '../ui-state.js';
import { setupCanvas } from './canvas.js';

const WIDTH = 800;
const HEIGHT = 440;
const positions = [];

export function solarInfoHTML() {
  const planet = PLANETS[ui.sim.solar.selected] || PLANETS[0];
  return `<div class="card" style="padding:11px;box-shadow:none">
    <div class="small muted">Planet dipilih</div>
    <b style="font-size:14px">${esc(planet.n)} ${planet.color === '#38bdf8' ? '🌍' : ''}</b>
    <div class="readout"><span>Periode orbit</span><b>${planet.period} tahun</b></div>
    <div class="readout"><span>Jarak</span><b>${planet.au} AU</b></div>
    <div class="readout"><span>Diameter</span><b>${formatNumber(planet.d)} km</b></div>
  </div>`;
}

function planetRadius(planet) {
  if (planet.n === 'Jupiter') return 11;
  if (planet.n === 'Saturnus') return 10;
  if (planet.n === 'Bumi') return 8;
  return 6;
}

function draw() {
  const canvas = document.getElementById('solar-canvas');
  if (!canvas) return;
  const ctx = setupCanvas(canvas, WIDTH, HEIGHT);
  const cx = WIDTH / 2;
  const cy = HEIGHT / 2;

  ctx.shadowColor = '#fbbf24';
  ctx.shadowBlur = 34;
  ctx.fillStyle = '#facc15';
  ctx.beginPath();
  ctx.arc(cx, cy, 22, 0, Math.PI * 2);
  ctx.fill();
  ctx.shadowBlur = 0;
  ctx.fillStyle = '#fef9c3';
  ctx.font = '12px sans-serif';
  ctx.fillText('Matahari', cx + 28, cy + 4);

  positions.length = 0;
  PLANETS.forEach((planet, index) => {
    const radius = 30 + 25 * Math.pow(planet.au, 0.45);
    const angle = planet.phase + (ui.sim.solar.years / planet.period) * Math.PI * 2;
    const x = cx + Math.cos(angle) * radius;
    const y = cy + Math.sin(angle) * radius * 0.55;

    ctx.strokeStyle = 'rgba(148, 163, 184, 0.18)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.ellipse(cx, cy, radius, radius * 0.55, 0, 0, Math.PI * 2);
    ctx.stroke();

    if (planet.n === 'Saturnus') {
      ctx.strokeStyle = planet.color;
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.ellipse(x, y, 15, 5, 0.4, 0, Math.PI * 2);
      ctx.stroke();
    }

    ctx.fillStyle = planet.color;
    ctx.shadowColor = planet.color;
    ctx.shadowBlur = 10;
    ctx.beginPath();
    ctx.arc(x, y, planetRadius(planet), 0, Math.PI * 2);
    ctx.fill();
    ctx.shadowBlur = 0;

    if (index === ui.sim.solar.selected) {
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(x, y, planetRadius(planet) + 5, 0, Math.PI * 2);
      ctx.stroke();
    }

    ctx.fillStyle = '#cbd5e1';
    ctx.font = '11px sans-serif';
    ctx.fillText(planet.n, x + 12, y - 9);
    positions.push({ x, y, index });
  });

  ctx.fillStyle = '#93c5fd';
  ctx.font = 'bold 14px sans-serif';
  ctx.fillText(`Waktu: ${ui.sim.solar.years.toFixed(2)} tahun`, 18, 28);
}

/** Jalankan animasi tata surya dan interaksi klik planet. */
export function mountSolar() {
  const canvas = document.getElementById('solar-canvas');
  if (!canvas) return () => {};

  let raf = 0;
  let last = performance.now();

  function onClick(event) {
    const rect = canvas.getBoundingClientRect();
    const x = ((event.clientX - rect.left) * WIDTH) / rect.width;
    const y = ((event.clientY - rect.top) * HEIGHT) / rect.height;
    let nearest = -1;
    let nearestDistance = 22;

    positions.forEach((position) => {
      const distance = Math.hypot(position.x - x, position.y - y);
      if (distance < nearestDistance) {
        nearestDistance = distance;
        nearest = position.index;
      }
    });

    if (nearest >= 0) {
      ui.sim.solar.selected = nearest;
      const info = document.getElementById('solar-info');
      if (info) info.innerHTML = solarInfoHTML();
    }
  }

  function loop(timestamp) {
    const dt = Math.min((timestamp - last) / 1000, 0.05);
    last = timestamp;
    if (ui.sim.solar.playing) {
      ui.sim.solar.years += dt * ui.sim.solar.speed;
    }
    draw();
    const timeValue = document.getElementById('solar-time-val');
    if (timeValue) timeValue.textContent = ui.sim.solar.years.toFixed(2);
    raf = window.requestAnimationFrame(loop);
  }

  canvas.addEventListener('click', onClick);
  raf = window.requestAnimationFrame(loop);

  return () => {
    window.cancelAnimationFrame(raf);
    canvas.removeEventListener('click', onClick);
  };
}
