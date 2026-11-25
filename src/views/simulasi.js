import { circuitCalc, gravityReadout } from '../lib/scoring.js';
import { solarInfoHTML } from '../simulations/solar.js';
import { renderStudentShell } from '../ui/shell.js';
import { ui } from '../ui-state.js';

function gravityPanel() {
  const readout = gravityReadout(ui.sim.grav);
  return `<div class="sim-wrap">
    <div>
      <canvas id="grav-canvas" width="800" height="420" aria-label="Simulasi benda jatuh bebas dari ketinggian">Simulasi jatuh bebas membutuhkan canvas.</canvas>
      <div class="note">Ruang hampa: <b>t = √(2h/g)</b>, <b>v = √(2gh)</b>, <b>Ep = mgh</b>. Massa tidak memengaruhi waktu jatuh; massa hanya mengubah Ep.</div>
    </div>
    <aside class="card"><h3>Kontrol</h3>
      <div class="control"><label for="grav-mass">Massa <b><span id="grav-mass-val">${ui.sim.grav.massa}</span> kg</b></label><input id="grav-mass" type="range" min="1" max="10" step="1" value="${ui.sim.grav.massa}" data-input="grav-mass" /></div>
      <div class="control"><label for="grav-height">Tinggi <b><span id="grav-height-val">${ui.sim.grav.tinggi}</span> m</b></label><input id="grav-height" type="range" min="1" max="100" step="1" value="${ui.sim.grav.tinggi}" data-input="grav-height" /></div>
      <div class="readout"><span>Waktu</span><b><span id="grav-t-val">${readout.time}</span> s</b></div>
      <div class="readout"><span>Kecepatan</span><b><span id="grav-v-val">${readout.velocity}</span> m/s</b></div>
      <div class="readout"><span>Energi potensial</span><b><span id="grav-ep-val">${readout.potentialEnergy}</span> J</b></div>
      <div style="display:flex;gap:8px;margin-top:13px"><button class="btn primary" type="button" data-action="grav-drop">Jatuhkan</button><button class="btn" type="button" data-action="grav-reset">Ulangi</button></div>
    </aside>
  </div>`;
}

function solarPanel() {
  return `<div class="sim-wrap">
    <div>
      <canvas id="solar-canvas" width="800" height="440" aria-label="Simulasi orbit delapan planet mengelilingi Matahari">Simulasi tata surya membutuhkan canvas.</canvas>
      <div class="note">Periode orbit relatif benar (Merkurius 0,24 tahun … Neptunus 164,8 tahun). <b>Ukuran planet dan jarak tidak berskala</b>; orbit disederhanakan berbentuk lingkaran. Klik planet untuk detail.</div>
    </div>
    <aside class="card"><h3>Kontrol</h3>
      <div class="control"><label for="solar-speed">Kecepatan <b><span id="solar-speed-val">${ui.sim.solar.speed}</span> tahun/detik</b></label><input id="solar-speed" type="range" min="0.1" max="20" step="0.1" value="${ui.sim.solar.speed}" data-input="solar-speed" /></div>
      <div class="readout"><span>Waktu simulasi</span><b><span id="solar-time-val">${ui.sim.solar.years.toFixed(2)}</span> tahun</b></div>
      <button class="btn primary" type="button" style="width:100%;margin-top:12px" data-action="solar-toggle">${ui.sim.solar.playing ? '⏸ Jeda' : '▶ Putar'}</button>
      <div id="solar-info" style="margin-top:12px">${solarInfoHTML()}</div>
    </aside>
  </div>`;
}

function circuitPanel() {
  const calc = circuitCalc(ui.sim.circ);
  const state = ui.sim.circ;
  return `<div class="sim-wrap">
    <div>
      <canvas id="circ-canvas" width="800" height="420" aria-label="Simulasi rangkaian listrik seri dan paralel">Simulasi rangkaian membutuhkan canvas.</canvas>
      <div class="note">Hukum Ohm: <b>I = V/R</b>. Seri: R = R₁ + R₂. Paralel: 1/R = 1/R₁ + 1/R₂. Titik biru menggambarkan muatan yang bergerak; kecepatan mengikuti besar arus.</div>
    </div>
    <aside class="card"><h3>Kontrol</h3>
      <div class="tabs" role="group" aria-label="Jenis rangkaian">
        <button class="filter ${state.mode === 'seri' ? 'active' : ''}" type="button" aria-pressed="${state.mode === 'seri'}" data-action="circ-mode" data-mode="seri">Seri</button>
        <button class="filter ${state.mode === 'paralel' ? 'active' : ''}" type="button" aria-pressed="${state.mode === 'paralel'}" data-action="circ-mode" data-mode="paralel">Paralel</button>
      </div>
      <div class="control"><label for="circ-v">Tegangan V <b><span id="circ-v-val">${state.v}</span> V</b></label><input id="circ-v" type="range" min="1" max="12" step="1" value="${state.v}" data-input="circ-v" /></div>
      <div class="control"><label for="circ-r1">R1 <b><span id="circ-r1-val">${state.r1}</span> Ω</b></label><input id="circ-r1" type="range" min="1" max="10" step="1" value="${state.r1}" data-input="circ-r1" /></div>
      <div class="control"><label for="circ-r2">R2 <b><span id="circ-r2-val">${state.r2}</span> Ω</b></label><input id="circ-r2" type="range" min="1" max="10" step="1" value="${state.r2}" data-input="circ-r2" /></div>
      <div class="readout"><span>R total</span><b><span id="circ-r-val">${calc.resistance.toFixed(2)}</span> Ω</b></div>
      <div class="readout"><span>I total</span><b><span id="circ-i-val">${calc.current.toFixed(2)}</span> A</b></div>
      <div class="readout"><span>${state.mode === 'seri' ? 'V1 / V2' : 'I1 / I2'}</span><b id="circ-extra-val">${state.mode === 'seri' ? `${calc.v1.toFixed(2)} / ${calc.v2.toFixed(2)} V` : `${calc.i1.toFixed(2)} / ${calc.i2.toFixed(2)} A`}</b></div>
    </aside>
  </div>`;
}

export function renderSimulasi(state, user) {
  const tabs = [
    ['gravitasi', '🌍 Gravitasi'],
    ['tatasurya', '🪐 Tata Surya'],
    ['rangkaian', '⚡ Rangkaian'],
  ];
  const panel =
    ui.sim.tab === 'gravitasi'
      ? gravityPanel()
      : ui.sim.tab === 'tatasurya'
        ? solarPanel()
        : circuitPanel();

  const content = `<div class="page-head">
      <div><div class="eyebrow">Laboratorium virtual</div><h1>Simulasi Sains</h1><p>Ubah parameter, amati hasilnya, dan coba ketiga simulasi untuk membuka badge.</p></div>
    </div>
    <div class="tabs" role="tablist" aria-label="Pilih simulasi">
      ${tabs
        .map(
          ([key, label]) =>
            `<button class="filter ${ui.sim.tab === key ? 'active' : ''}" type="button" role="tab" aria-selected="${ui.sim.tab === key}" data-action="sim-tab" data-tab="${key}">${label}</button>`,
        )
        .join('')}
    </div>
    <article class="card">${panel}</article>`;

  return renderStudentShell('simulasi', content, state, user);
}
