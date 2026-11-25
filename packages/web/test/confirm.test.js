// @vitest-environment jsdom
import { afterEach, beforeAll, beforeEach, describe, expect, it, vi } from 'vitest';
import * as W from '../src/index.js';

// jsdom has no modal <dialog> API: a minimal stand-in that toggles [open] and fires 'close' like the browser.
beforeAll(() => {
  HTMLDialogElement.prototype.showModal = function showModal() { this.setAttribute('open', ''); };
  HTMLDialogElement.prototype.close = function close(v = '') {
    this.removeAttribute('open');
    this.returnValue = v;
    this.dispatchEvent(new Event('close'));
  };
});

const dom = (html) => {
  const t = document.createElement('template');
  t.innerHTML = html;
  return t.content;
};
const dialog = () => document.querySelector('dialog.rds-sheet-d');
const okBtn = () => document.querySelector('[data-rds-confirm]');
const cancelBtn = () => document.querySelector('.rds-btn--ghost[data-rds-close]');
const field = (sel) => document.querySelector(sel);
const click = (el) => el.click();
const flush = () => new Promise((r) => setTimeout(r, 0));
const press = (dlg) => { // what the browser does on Escape: fire cancel, close unless it was prevented
  const ev = new Event('cancel', { cancelable: true });
  dlg.dispatchEvent(ev);
  if (!ev.defaultPrevented) dlg.close('cancel');
};
const typeIn = (el, text) => {
  el.value = text;
  el.dispatchEvent(new Event('input', { bubbles: true }));
};

afterEach(() => {
  document.body.innerHTML = '';
});

// Exact markup of confirm({ id:'c', title:'Delete?', message:'Can be restored', confirmLabel:'Delete',
// cancelLabel:'Keep', danger:true }) before v2 (taken from the parent commit). v2 adds only role, data-danger on the
// confirm button, and the hidden error slot; with those removed the output must be byte-identical.
const OLD_DANGER = '<dialog class="rds-sheet-d" id="c" aria-labelledby="c-title"><div class="rds-sheet-d__panel"><header class="rds-sheet-d__head"><h2 class="rds-sheet-d__title" id="c-title">Delete?</h2><button type="button" class="rds-ibtn" aria-label="Keep" title="Keep" data-rds-close><svg class="rds-icon" viewBox="0 0 32 32" aria-hidden="true" focusable="false"><path d="M17.4141 16 24 9.4141 22.5859 8 16 14.5859 9.4143 8 8 9.4141 14.5859 16 8 22.5859 9.4143 24 16 17.4141 22.5859 24 24 22.5859 17.4141 16z"/></svg></button></header><div class="rds-sheet-d__body"><p class="rds-sheet-d__text">Can be restored</p></div><footer class="rds-sheet-d__actions"><button type="button" class="rds-btn rds-btn--ghost" data-rds-close>Keep</button><button type="button" class="rds-btn rds-btn--danger" data-rds-confirm>Delete</button></footer></div></dialog>';

describe('confirm(): backward compatibility of the old options', () => {
  it('danger:true markup is the pre-v2 markup plus role, data-danger and the error slot only', () => {
    const v2 = W.confirm({ id: 'c', title: 'Delete?', message: 'Can be restored', confirmLabel: 'Delete', cancelLabel: 'Keep', danger: true });
    const legacy = v2
      .replace(' role="alertdialog"', '')
      .replace(' data-danger', '')
      .replace('<p class="rds-confirm__error" role="alert" hidden></p>', '');
    expect(legacy).toBe(OLD_DANGER);
    expect(v2).toContain(' role="alertdialog"');
    expect(v2).toContain('data-rds-confirm data-danger>Delete</button>');
  });

  it('default (non-danger) call: role=dialog, no data-danger, OK is enabled', () => {
    const d = dom(W.confirm({ id: 'd', title: 'T', message: 'M' })).firstElementChild;
    expect(d.getAttribute('role')).toBe('dialog');
    expect(d.querySelector('[data-rds-confirm]').hasAttribute('data-danger')).toBe(false);
    expect(d.querySelector('[data-rds-confirm]').disabled).toBe(false);
    expect(d.querySelector('[data-rds-confirm]').textContent).toBe('OK');
    expect(d.querySelector('.rds-sheet-d__text').textContent).toBe('M');
  });
});

describe('confirm(): markup for each v2 option', () => {
  it('note: a callout with role=note; text is escaped, raw() passes markup through', () => {
    const t = dom(W.confirm({ id: 'n', title: 'T', message: 'M', note: '<b>x</b>' })).firstElementChild;
    const note = t.querySelector('.rds-confirm__note');
    expect(note.getAttribute('role')).toBe('note');
    expect(note.textContent).toBe('<b>x</b>');
    expect(note.querySelector('b')).toBeNull();
    const r = dom(W.confirm({ id: 'n2', title: 'T', message: 'M', note: W.raw('<b>x</b>') })).firstElementChild;
    expect(r.querySelector('.rds-confirm__note b')).not.toBeNull();
  });

  it('role: alertdialog when danger, dialog otherwise, explicit role wins', () => {
    expect(dom(W.confirm({ id: 'a', title: 'T', message: 'M', danger: true })).firstElementChild.getAttribute('role')).toBe('alertdialog');
    expect(dom(W.confirm({ id: 'b', title: 'T', message: 'M' })).firstElementChild.getAttribute('role')).toBe('dialog');
    expect(dom(W.confirm({ id: 'c', title: 'T', message: 'M', danger: true, role: 'dialog' })).firstElementChild.getAttribute('role')).toBe('dialog');
  });

  it('initialFocus is recorded on the dialog; data-danger sits on the confirm button only when danger is set', () => {
    const d = dom(W.confirm({ id: 'f', title: 'T', message: 'M', initialFocus: 'heading', danger: true })).firstElementChild;
    expect(d.getAttribute('data-initial-focus')).toBe('heading');
    expect(d.querySelector('[data-rds-confirm]').getAttribute('data-danger')).toBe('');
    expect(dom(W.confirm({ id: 'g', title: 'T', message: 'M' })).firstElementChild.hasAttribute('data-initial-focus')).toBe(false);
  });

  it('typeToConfirm: labelled text input, OK starts disabled', () => {
    const d = dom(W.confirm({ id: 't', title: 'T', message: 'M', typeToConfirm: { value: 'DELETE', label: 'Type DELETE' } })).firstElementChild;
    const input = d.querySelector('input[data-rds-type]');
    expect(input.type).toBe('text');
    expect(d.querySelector(`label[for="${input.id}"]`).textContent).toBe('Type DELETE');
    expect(d.querySelector('[data-rds-confirm]').disabled).toBe(true);
  });

  it('reason: labelled textarea with maxlength (default 500); OK starts disabled while min is above 0', () => {
    const d = dom(W.confirm({ id: 'r', title: 'T', message: 'M', reason: { label: 'Why' } })).firstElementChild;
    const ta = d.querySelector('textarea[data-rds-reason]');
    expect(ta.getAttribute('maxlength')).toBe('500');
    expect(d.querySelector(`label[for="${ta.id}"]`).textContent).toBe('Why');
    expect(d.querySelector('[data-rds-confirm]').disabled).toBe(true);
    const zero = dom(W.confirm({ id: 'r0', title: 'T', message: 'M', reason: { min: 0 } })).firstElementChild;
    expect(zero.querySelector('[data-rds-confirm]').disabled).toBe(false);
  });

  it('error slot: role=alert, hidden until used', () => {
    const e = dom(W.confirm({ id: 'e', title: 'T', message: 'M' })).firstElementChild.querySelector('.rds-confirm__error');
    expect(e.getAttribute('role')).toBe('alert');
    expect(e.hasAttribute('hidden')).toBe(true);
  });

  it('requires an id', () => {
    expect(() => W.confirm({ title: 'T', message: 'M' })).toThrow(/id/);
  });
});

describe('openConfirm()', () => {
  it('OK resolves { ok: true } and removes the dialog', async () => {
    const p = W.openConfirm({ id: 'a', title: 'T', message: 'M', confirmLabel: 'Yes' });
    expect(dialog().open).toBe(true);
    click(okBtn());
    expect(await p).toEqual({ ok: true });
    expect(document.getElementById('a')).toBeNull();
  });

  it('Esc resolves { ok: false } and calls onCancel once', async () => {
    const onCancel = vi.fn();
    const onConfirm = vi.fn();
    const p = W.openConfirm({ id: 'b', title: 'T', onCancel, onConfirm });
    press(dialog());
    expect(await p).toEqual({ ok: false });
    expect(onCancel).toHaveBeenCalledTimes(1);
    expect(onConfirm).not.toHaveBeenCalled();
    expect(document.getElementById('b')).toBeNull();
  });

  it('cancel button and backdrop tap also resolve { ok: false }', async () => {
    const onCancel = vi.fn();
    const p1 = W.openConfirm({ id: 'c1', title: 'T', onCancel });
    click(cancelBtn());
    expect(await p1).toEqual({ ok: false });
    const p2 = W.openConfirm({ id: 'c2', title: 'T', onCancel });
    click(document.getElementById('c2')); // the dialog element itself is the backdrop
    expect(await p2).toEqual({ ok: false });
    expect(onCancel).toHaveBeenCalledTimes(2);
  });

  it('async success: OK is disabled with aria-busy while pending, Esc waits, dialog closes on resolve', async () => {
    let finish;
    const onConfirm = vi.fn(() => new Promise((r) => { finish = r; }));
    const p = W.openConfirm({ id: 's', title: 'T', onConfirm });
    click(okBtn());
    expect(onConfirm).toHaveBeenCalledTimes(1);
    expect(okBtn().disabled).toBe(true);
    expect(okBtn().getAttribute('aria-busy')).toBe('true');
    click(okBtn()); // a second click while pending does nothing
    press(dialog()); // Esc while pending keeps the dialog open
    expect(dialog().open).toBe(true);
    expect(onConfirm).toHaveBeenCalledTimes(1);
    finish();
    expect(await p).toEqual({ ok: true });
    expect(document.getElementById('s')).toBeNull();
  });

  it('async reject: shows err.message in the error slot, keeps the dialog open, re-enables OK', async () => {
    const onConfirm = vi.fn(() => Promise.reject(new Error('Server refused')));
    const p = W.openConfirm({ id: 'x', title: 'T', onConfirm, errorText: 'Generic failure' });
    click(okBtn());
    await flush();
    const err = document.querySelector('.rds-confirm__error');
    expect(err.hidden).toBe(false);
    expect(err.textContent).toBe('Server refused');
    expect(dialog().open).toBe(true);
    expect(okBtn().disabled).toBe(false);
    expect(okBtn().hasAttribute('aria-busy')).toBe(false);
    press(dialog());
    expect(await p).toEqual({ ok: false });
  });

  it('async reject without a message uses errorText', async () => {
    const p = W.openConfirm({ id: 'y', title: 'T', onConfirm: () => Promise.reject(new Error('')), errorText: 'Generic failure' });
    click(okBtn());
    await flush();
    expect(document.querySelector('.rds-confirm__error').textContent).toBe('Generic failure');
    press(dialog());
    await p;
  });

  it('typeToConfirm: OK enabled only when the trimmed, NFC, case-insensitive text equals the value', async () => {
    const p = W.openConfirm({ id: 't', title: 'T', typeToConfirm: { value: '  Café DELETE ', label: 'Type' } });
    const input = field('[data-rds-type]');
    expect(okBtn().disabled).toBe(true);
    typeIn(input, 'café dele');
    expect(okBtn().disabled).toBe(true);
    typeIn(input, '  CAFÉ delete  '); // decomposed accent, other case, extra spaces
    expect(okBtn().disabled).toBe(false);
    click(okBtn());
    expect(await p).toEqual({ ok: true });
  });

  it('reason: OK enabled at min length after trimming; resolves with the trimmed reason', async () => {
    const onConfirm = vi.fn();
    const p = W.openConfirm({ id: 'r', title: 'T', onConfirm, reason: { label: 'Why', min: 3, max: 10 } });
    const ta = field('[data-rds-reason]');
    typeIn(ta, 'ab');
    expect(okBtn().disabled).toBe(true);
    typeIn(ta, '   ab   '); // trimmed length 2
    expect(okBtn().disabled).toBe(true);
    typeIn(ta, '  abc  ');
    expect(okBtn().disabled).toBe(false);
    typeIn(ta, 'x'.repeat(11));
    expect(okBtn().disabled).toBe(true);
    typeIn(ta, '  abc  ');
    click(okBtn());
    expect(onConfirm).toHaveBeenCalledWith({ reason: 'abc' });
    expect(await p).toEqual({ ok: true, reason: 'abc' });
  });

  it('initialFocus: cancel by default, confirm when asked, heading when asked', async () => {
    const p1 = W.openConfirm({ id: 'i1', title: 'T' });
    expect(document.activeElement).toBe(cancelBtn());
    press(dialog());
    await p1;
    const p2 = W.openConfirm({ id: 'i2', title: 'T', initialFocus: 'confirm' });
    expect(document.activeElement).toBe(okBtn());
    press(dialog());
    await p2;
    const p3 = W.openConfirm({ id: 'i3', title: 'T', initialFocus: 'heading' });
    expect(document.activeElement).toBe(document.querySelector('.rds-sheet-d__title'));
    press(dialog());
    await p3;
  });

  it('focus return: closing puts focus back on the element that had it before opening', async () => {
    const opener = document.createElement('button');
    opener.id = 'opener';
    document.body.appendChild(opener);
    opener.focus();
    const p = W.openConfirm({ id: 'f', title: 'T' });
    expect(document.activeElement).not.toBe(opener);
    click(okBtn());
    await p;
    expect(document.activeElement).toBe(opener);
  });
});
