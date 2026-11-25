// openConfirm(o): mounts confirm() markup in document.body, shows it modal and resolves when it closes.
// Each dialog carries its own callbacks (o.onConfirm, o.onCancel); the global sheetController onConfirm is not used.
// Resolves { ok: true } (or { ok: true, reason } when o.reason is set) when OK succeeds, and { ok: false } when the
// dialog is closed another way (Escape, the close or cancel buttons, a backdrop tap).
// The node is removed on close and focus goes back to whatever had focus before the dialog opened.
import { confirm } from './components.js';

// Comparison form for type-to-confirm: NFC, trimmed, lower-cased. Both sides use it.
const normalise = (s) => String(s ?? '').normalize('NFC').trim().toLowerCase();

let seq = 0;

/**
 * @param {Parameters<typeof confirm>[0] & {
 *   onConfirm?: (r: { reason?: string }) => any, onCancel?: () => void, errorText?: string }} o
 *   onConfirm may return a promise: OK shows the pending state until it settles. A resolve closes the dialog;
 *   a reject shows err.message (or errorText) in the error slot and keeps the dialog open.
 * @returns {Promise<{ ok: boolean, reason?: string }>}
 */
export function openConfirm(o = {}) {
  return new Promise((resolve) => {
    const id = o.id || `rds-confirm-${++seq}`;
    const tpl = document.createElement('template');
    tpl.innerHTML = confirm({ ...o, id });
    const dlg = tpl.content.firstElementChild;
    const ok = dlg.querySelector('[data-rds-confirm]');
    const err = dlg.querySelector('.rds-confirm__error');
    const heading = dlg.querySelector('.rds-sheet-d__title');
    const cancelBtn = dlg.querySelector('.rds-btn--ghost[data-rds-close]');
    const typeInput = o.typeToConfirm ? dlg.querySelector('[data-rds-type]') : null;
    const reasonInput = o.reason ? dlg.querySelector('[data-rds-reason]') : null;
    const expected = o.typeToConfirm ? normalise(o.typeToConfirm.value) : '';
    const reasonMin = o.reason ? (o.reason.min ?? 3) : 0;
    const reasonMax = o.reason ? (o.reason.max ?? 500) : Infinity;
    const opener = document.activeElement;
    let pending = false;
    let result = { ok: false };

    const reasonText = () => (reasonInput ? reasonInput.value.trim() : undefined);

    // OK is enabled only when the type-to-confirm text matches, the reason length is in range, and nothing is pending.
    function gate() {
      const typeOk = !typeInput || normalise(typeInput.value) === expected;
      const r = reasonText();
      const reasonOk = r === undefined || (r.length >= reasonMin && r.length <= reasonMax);
      ok.disabled = pending || !typeOk || !reasonOk;
    }

    function setPending(on) {
      pending = on;
      if (on) ok.setAttribute('aria-busy', 'true');
      else ok.removeAttribute('aria-busy');
      dlg.querySelectorAll('[data-rds-close]').forEach((b) => { b.disabled = on; });
      gate();
    }

    function showError(e) {
      err.textContent = (e && e.message) || o.errorText || 'Something went wrong. Try again.';
      err.hidden = false;
      gate();
    }

    function finish(reason) {
      result = reason === undefined ? { ok: true } : { ok: true, reason };
      dlg.close('confirm');
    }

    function submit() {
      if (pending || ok.disabled) return;
      err.hidden = true;
      err.textContent = '';
      const reason = reasonText();
      let out;
      try {
        out = o.onConfirm ? o.onConfirm(reason === undefined ? {} : { reason }) : undefined;
      } catch (e) {
        showError(e);
        return;
      }
      if (out && typeof out.then === 'function') {
        setPending(true);
        out.then(
          () => { setPending(false); finish(reason); },
          (e) => { setPending(false); showError(e); },
        );
      } else {
        finish(reason);
      }
    }

    // Clicks inside the dialog stop here, so a global sheetController does not also act on this dialog.
    dlg.addEventListener('click', (e) => {
      e.stopPropagation();
      if (e.target === dlg) { if (!pending) dlg.close(); return; } // backdrop
      if (e.target.closest('[data-rds-confirm]')) { submit(); return; }
      if (e.target.closest('[data-rds-close]') && !pending) dlg.close();
    });
    dlg.addEventListener('input', gate);
    dlg.addEventListener('cancel', (e) => { if (pending) e.preventDefault(); }); // Escape waits for a pending OK
    dlg.addEventListener('close', () => {
      dlg.remove();
      if (!result.ok && o.onCancel) o.onCancel();
      if (opener && opener.isConnected && typeof opener.focus === 'function') opener.focus({ preventScroll: true });
      resolve(result);
    }, { once: true });

    document.body.appendChild(dlg);
    dlg.showModal();
    gate();

    const wanted = { heading, confirm: ok }[o.initialFocus];
    const first = wanted && !wanted.disabled ? wanted : cancelBtn;
    if (first === heading) heading.tabIndex = -1;
    first.focus({ preventScroll: true });
  });
}
