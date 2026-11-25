const ICONS = { good: '✓', warn: '!', '': 'i' };

/** Tampilkan notifikasi singkat; aman untuk teks dinamis (textContent). */
export function toast(message, kind = '') {
  const host = document.getElementById('toasts');
  if (!host) return;

  const element = document.createElement('div');
  element.className = `toast ${kind}`.trim();
  element.setAttribute('role', kind === 'warn' ? 'alert' : 'status');

  const icon = document.createElement('span');
  icon.className = 'toast-ico';
  icon.setAttribute('aria-hidden', 'true');
  icon.textContent = ICONS[kind] ?? ICONS[''];

  const text = document.createElement('span');
  text.textContent = message;

  element.append(icon, text);
  host.appendChild(element);

  window.setTimeout(() => element.remove(), 3800);
}
