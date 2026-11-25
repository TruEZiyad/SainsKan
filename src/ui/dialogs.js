export function resetModalHTML() {
  return `<div class="modal-bg" data-action="reset-cancel" data-modal role="presentation">
    <div class="modal" role="dialog" aria-modal="true" aria-labelledby="reset-title">
      <h2 id="reset-title">Reset progres pembelajaran?</h2>
      <p>Seluruh poin, XP, level, badge, materi selesai, daily challenge, dan riwayat kuis akan dihapus. Tema tetap dipertahankan. Tindakan ini tidak dapat dibatalkan.</p>
      <div class="modal-actions">
        <button class="btn" type="button" data-action="reset-cancel" data-autofocus>Batal</button>
        <button class="btn danger" type="button" data-action="reset-confirm">Ya, reset progres</button>
      </div>
    </div>
  </div>`;
}
