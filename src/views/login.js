import { esc } from '../lib/utils.js';
import { getAccounts } from '../store.js';
import { ui } from '../ui-state.js';

export function renderLogin() {
  const accounts = getAccounts();
  const daftar = accounts
    .map(
      (account) =>
        `<span class="tag">${esc(account.username)} · ${account.role === 'guru' ? 'guru' : 'siswa'}</span>`,
    )
    .join('');

  return `<div class="login-page">
    <section class="login-card" aria-labelledby="login-title">
      <div class="login-art">
        <div>
          <div class="eyebrow" style="color:#bfdbfe">Aplikasi edukasi sains</div>
          <h1>Selamat datang di SainsKan</h1>
          <p>Materi singkat, kuis interaktif, dan simulasi sains dalam satu petualangan.</p>
        </div>
        <div class="orb" aria-hidden="true">🪐⚛️🧪</div>
        <p style="font-size:12px;opacity:.8">Masuk untuk melanjutkan. Akun guru melihat progres kelas; akun siswa belajar dan mengerjakan kuis.</p>
      </div>
      <form class="login-form" id="login-form" method="post" autocomplete="on" novalidate>
        <div>
          <h2 id="login-title">Masuk akun</h2>
          <p class="muted small" style="margin:4px 0 0">Gunakan username akun demo dan password <b>123</b>.</p>
        </div>
        <div class="field">
          <label for="login-user">Username</label>
          <input id="login-user" name="username" list="daftar-akun" placeholder="Contoh: Komet" autocomplete="username" autocapitalize="words" required data-autofocus />
        </div>
        <datalist id="daftar-akun">${accounts
          .map((account) => `<option value="${esc(account.username)}"></option>`)
          .join('')}</datalist>
        <div class="field">
          <label for="login-pass">Password</label>
          <input id="login-pass" name="password" type="password" placeholder="123" autocomplete="current-password" required />
        </div>
        <p class="error" role="alert" aria-live="assertive">${esc(ui.login.error)}</p>
        <button class="btn primary" type="submit" ${ui.login.pending ? 'disabled' : ''}>
          ${ui.login.pending ? 'Memeriksa…' : 'Masuk ke SainsKan'}
        </button>
        <div class="hint">
          <b>Akun demo:</b>
          <div class="tags" style="margin-top:7px">${daftar}</div>
          <div style="margin-top:7px">Password semua akun demo: <b>123</b>. Akun &amp; progres hanya tersimpan di perangkat ini.</div>
        </div>
      </form>
    </section>
  </div>`;
}
