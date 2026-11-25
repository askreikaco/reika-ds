// @vitest-environment jsdom
// Sheet options (0.3.0): data-rds-open, openSheet(id), closeSelector, class, onClose. Each has a pass case.
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { openSheet, sheet, sheetController } from '../src/index.js';

const tap = (el) => {
  el.dispatchEvent(new window.MouseEvent('pointerdown', { bubbles: true }));
  el.click();
};
let ctl;
beforeEach(() => {
  // jsdom has no <dialog> modal API: a minimal stand-in that fires 'close' like the browser does.
  HTMLDialogElement.prototype.showModal ??= function showModal() { this.open = true; this.setAttribute('open', ''); };
  HTMLDialogElement.prototype.close ??= function close(v = '') {
    this.open = false;
    this.removeAttribute('open');
    this.returnValue = v;
    this.dispatchEvent(new Event('close'));
  };
  document.body.innerHTML =
    '<button id="opener" data-rds-open="s1">Lọc</button>' +
    '<button id="by-id">Mở</button>' +
    '<button id="pick" data-fpx>Đóng bằng dấu tùy chỉnh</button>' +
    sheet({ id: 's1', title: 'Bộ lọc', body: 'nội dung', class: 'fpanel', actions: '<button data-rds-close>Huỷ</button>' }) +
    sheet({ id: 's2', title: 'Sửa', body: 'x' });
});
afterEach(() => ctl?.destroy());
const dlg = (id) => document.getElementById(id);

describe('sheet options', () => {
  it('data-rds-open="<id>": a click on the trigger opens that sheet and focus returns to the trigger', () => {
    ctl = sheetController(document);
    const opener = document.getElementById('opener');
    tap(opener);
    expect(dlg('s1').open).toBe(true);
    tap(dlg('s1').querySelector('[data-rds-close]'));
    expect(dlg('s1').open).toBe(false);
    expect(document.activeElement).toBe(opener);
  });

  it('openSheet(id) opens a sheet by id without a controller', () => {
    openSheet('s2');
    expect(dlg('s2').open).toBe(true);
    dlg('s2').close('cancel');
    expect(dlg('s2').open).toBe(false);
  });

  it('a second open of an open sheet is ignored (no throw)', () => {
    openSheet('s2');
    expect(() => openSheet('s2')).not.toThrow();
    expect(dlg('s2').open).toBe(true);
  });

  it('[data-rds-close] closes; closeSelector adds an extra close marker', () => {
    ctl = sheetController(document, { closeSelector: '[data-fpx]' });
    openSheet('s1');
    tap(dlg('s1').querySelector('[data-rds-close]'));
    expect(dlg('s1').open).toBe(false);
    openSheet('s1');
    dlg('s1').insertAdjacentHTML('beforeend', '<button id="fx" data-fpx>x</button>');
    tap(document.getElementById('fx'));
    expect(dlg('s1').open).toBe(false);
  });

  it('without closeSelector a plain data-fpx button does not close the sheet', () => {
    ctl = sheetController(document);
    openSheet('s1');
    dlg('s1').insertAdjacentHTML('beforeend', '<button id="fx2" data-fpx>x</button>');
    tap(document.getElementById('fx2'));
    expect(dlg('s1').open).toBe(true);
  });

  it('class adds extra classes to the dialog and keeps rds-sheet-d', () => {
    expect(dlg('s1').classList.contains('fpanel')).toBe(true);
    expect(dlg('s1').classList.contains('rds-sheet-d')).toBe(true);
    expect(dlg('s2').classList.contains('fpanel')).toBe(false);
  });

  it('onClose runs once per open with the sheet id, on any close route', () => {
    const calls = [];
    openSheet('s2', { onClose: (d) => calls.push(d.id) });
    dlg('s2').close('confirm');
    expect(calls).toEqual(['s2']);
    openSheet('s2', { onClose: (d) => calls.push(d.id) });
    dlg('s2').close('cancel');
    expect(calls).toEqual(['s2', 's2']);
  });

  it('onClose from the controller map runs for a data-rds-open click', () => {
    const calls = [];
    ctl = sheetController(document, { onClose: { s1: (d) => calls.push(d.id) } });
    tap(document.getElementById('opener'));
    tap(dlg('s1').querySelector('[data-rds-close]'));
    expect(calls).toEqual(['s1']);
  });
});
