// @vitest-environment jsdom
import { expect, test, vi } from 'vitest';

test('alur login siswa, filter materi, dan kuis berjalan end-to-end', async () => {
  window.localStorage.clear();
  window.history.replaceState(null, '', '/');
  document.body.innerHTML = '<div id="app" tabindex="-1"></div><div id="toasts"></div>';
  document.documentElement.dataset.theme = 'dark';

  await import('../src/main.js');

  await vi.waitFor(() => expect(document.querySelector('#login-form')).toBeTruthy(), { timeout: 8000 });

  const form = document.querySelector('#login-form');
  form.elements.username.value = 'Komet';
  form.elements.password.value = 'salah';
  form.dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }));
  await vi.waitFor(() =>
    expect(document.querySelector('.login-form .error').textContent).toContain('Username atau password salah'),
  );

  form.elements.username.value = 'Komet';
  form.elements.password.value = '123';
  form.dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }));

  await vi.waitFor(
    () => expect(document.querySelector('.hero h1')?.textContent).toContain('Halo, Komet'),
    { timeout: 8000 },
  );

  window.location.hash = '#/materi';
  await vi.waitFor(() => expect(document.querySelectorAll('.materi-card').length).toBe(12));

  document.querySelector('[data-action="filter"][data-kat="Kimia"]').click();
  await vi.waitFor(() => expect(document.querySelectorAll('.materi-card').length).toBe(3));

  document.querySelector('.materi-card').click();
  await vi.waitFor(() => expect(document.querySelector('.detail-hero')).toBeTruthy());

  document.querySelector('[data-action="kuis-materi"]').click();
  await vi.waitFor(() => expect(document.querySelector('.option')).toBeTruthy());

  for (let index = 0; index < 3; index += 1) {
    const options = document.querySelectorAll('.option');
    const correct = options[0];
    correct.click();
    const submit = document.querySelector('[data-action="submit"]');
    expect(submit.disabled).toBe(false);
    submit.click();
    await vi.waitFor(() => expect(document.querySelector('.feedback')).toBeTruthy());
    document.querySelector('[data-action="next"]').click();
    await vi.waitFor(() => expect(document.querySelectorAll('.option').length || document.querySelector('.card h2')).toBeTruthy());
  }

  await vi.waitFor(() =>
    expect(document.querySelector('.card h2')?.textContent || '').toMatch(/Hasil kuis/),
  );
});
