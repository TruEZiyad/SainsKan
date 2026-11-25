/**
 * Focus trap untuk modal: fokus awal, Tab/Shift+Tab melingkar,
 * Escape menutup lewat action bawaan backdrop.
 */
export function initDialog() {
  const backdrop = document.querySelector('.modal-bg');
  if (!backdrop) return () => {};

  const modal = backdrop.querySelector('.modal');
  if (!modal) return () => {};

  const previousFocus = document.activeElement;
  const getFocusable = () =>
    Array.from(
      modal.querySelectorAll(
        'button:not([disabled]), input:not([disabled]), select:not([disabled]), a[href], [tabindex]:not([tabindex="-1"])',
      ),
    );

  const initial = modal.querySelector('[data-autofocus]') || getFocusable()[0] || modal;
  window.requestAnimationFrame(() => initial.focus());

  function onKeydown(event) {
    if (event.key === 'Escape') {
      event.preventDefault();
      backdrop.dispatchEvent(new MouseEvent('click', { bubbles: true }));
      return;
    }
    if (event.key !== 'Tab') return;

    const focusable = getFocusable();
    if (!focusable.length) return;
    const first = focusable[0];
    const last = focusable[focusable.length - 1];

    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first.focus();
    }
  }

  document.addEventListener('keydown', onKeydown);

  return () => {
    document.removeEventListener('keydown', onKeydown);
    if (previousFocus instanceof HTMLElement && previousFocus.isConnected) {
      previousFocus.focus();
    }
  };
}
