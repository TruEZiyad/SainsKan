const KNOWN_VIEWS = new Set([
  'login',
  'dashboard',
  'materi',
  'kuis',
  'simulasi',
  'pencapaian',
  'leaderboard',
  'guru',
]);

export function parseRoute(hash = window.location.hash) {
  const clean = String(hash || '').replace(/^#\/?/, '').split('?')[0];
  const [rawView, rawParam] = clean.split('/');
  const view = KNOWN_VIEWS.has(rawView) ? rawView : 'dashboard';
  return { view, param: rawParam || null, path: clean };
}

export function navigate(path) {
  const target = `#/${String(path).replace(/^#?\/?/, '')}`;
  if (window.location.hash === target) {
    window.dispatchEvent(new HashChangeEvent('hashchange'));
    return;
  }
  window.location.hash = target;
}

export function replaceRoute(path) {
  const target = `#/${String(path).replace(/^#?\/?/, '')}`;
  window.history.replaceState(null, '', target);
  window.dispatchEvent(new HashChangeEvent('hashchange'));
}

export function onRouteChange(handler) {
  window.addEventListener('hashchange', handler);
  return () => window.removeEventListener('hashchange', handler);
}
