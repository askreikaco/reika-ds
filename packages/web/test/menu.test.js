// @vitest-environment jsdom
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { iconButton, menu, list, menuController, sheetController } from '../src/index.js';
import * as W from '../src/index.js';

let ctl;
let selected;
const items = [{ label: 'Sửa', value: 'edit' }, { label: 'Xóa', value: 'del', tone: 'danger' }];

beforeEach(() => {
  selected = [];
  document.body.innerHTML =
    list([
      { title: 'A', href: '#a', action: { label: 'Tùy chọn A', icon: 'overflow-menu-horizontal', haspopup: 'menu', controls: 'ma' } },
      { title: 'B', href: '#b', action: { label: 'Tùy chọn B', icon: 'overflow-menu-horizontal', haspopup: 'menu', controls: 'mb' } },
    ]) +
    menu({ id: 'ma', label: 'A', items }) +
    menu({ id: 'mb', label: 'B', items }) +
    '<p id="outside">outside</p>';
  ctl = menuController(document, { onSelect: (d) => selected.push(d.value) });
});
afterEach(() => ctl.destroy());

const trigger = (name) => document.querySelector(`button[aria-label="Tùy chọn ${name}"]`);
const tap = (el) => {
  el.dispatchEvent(new window.MouseEvent('pointerdown', { bubbles: true })); // jsdom has no PointerEvent
  el.click();
};

describe('menu controller', () => {
  it('opens on the trigger: aria-expanded true, menu shown, first item focused', () => {
    tap(trigger('A'));
    const m = document.getElementById('ma');
    expect(m.hidden).toBe(false);
    expect(trigger('A').getAttribute('aria-expanded')).toBe('true');
    expect(document.activeElement).toBe(m.querySelector('[role="menuitem"]'));
  });

  it('a second tap on the same trigger closes it (no close-then-reopen race)', () => {
    tap(trigger('A'));
    tap(trigger('A'));
    expect(document.getElementById('ma').hidden).toBe(true);
    expect(trigger('A').getAttribute('aria-expanded')).toBe('false');
    expect(ctl.isOpen()).toBe(false);
  });

  it('Escape closes and returns focus to the trigger', () => {
    tap(trigger('A'));
    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));
    expect(document.getElementById('ma').hidden).toBe(true);
    expect(document.activeElement).toBe(trigger('A'));
  });

  it('a tap outside closes it', () => {
    tap(trigger('A'));
    tap(document.getElementById('outside'));
    expect(document.getElementById('ma').hidden).toBe(true);
  });

  it('another trigger switches menus', () => {
    tap(trigger('A'));
    tap(trigger('B'));
    expect(document.getElementById('ma').hidden).toBe(true);
    expect(document.getElementById('mb').hidden).toBe(false);
    expect(trigger('A').getAttribute('aria-expanded')).toBe('false');
    expect(trigger('B').getAttribute('aria-expanded')).toBe('true');
  });

  it('choosing an item reports its value and closes', () => {
    tap(trigger('A'));
    tap(document.querySelector('#ma [data-value="del"]'));
    expect(selected).toEqual(['del']);
    expect(document.getElementById('ma').hidden).toBe(true);
  });

  it('arrow keys move focus between items', () => {
    tap(trigger('A'));
    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowDown', bubbles: true }));
    expect(document.activeElement.getAttribute('data-value')).toBe('del');
    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowDown', bubbles: true }));
    expect(document.activeElement.getAttribute('data-value')).toBe('edit');
  });

  it('a standalone iconButton trigger works the same way', () => {
    document.body.insertAdjacentHTML('beforeend', iconButton({ label: 'More', icon: 'overflow-menu-vertical', haspopup: 'menu', controls: 'mb' }));
    const t = document.querySelector('button[aria-label="More"]');
    tap(t);
    expect(document.getElementById('mb').hidden).toBe(false);
    tap(t);
    expect(document.getElementById('mb').hidden).toBe(true);
  });
});

describe('toggletip (infoTip) on the same controller', () => {
  let tctl;
  beforeEach(() => {
    ctl.destroy(); // the file-level controller would also handle these triggers
    document.body.innerHTML = W.infoTip('Ghi chú dài', { id: 'tip-a', label: 'Giải thích A' }) + '<p id="outside2">x</p>';
    tctl = menuController(document);
  });
  afterEach(() => tctl.destroy());
  const tipBtn = () => document.querySelector('button[data-rds-toggletip]');
  const pop = () => document.getElementById('tip-a');

  it('tap opens the popover and keeps focus on the trigger (no menu items to move to)', () => {
    tap(tipBtn());
    expect(pop().hidden).toBe(false);
    expect(tipBtn().getAttribute('aria-expanded')).toBe('true');
    expect(document.activeElement).not.toBe(pop());
  });

  it('a second tap closes it', () => {
    tap(tipBtn());
    tap(tipBtn());
    expect(pop().hidden).toBe(true);
    expect(tipBtn().getAttribute('aria-expanded')).toBe('false');
  });

  it('Escape closes it and returns focus to the trigger', () => {
    tap(tipBtn());
    tipBtn().blur();
    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));
    expect(pop().hidden).toBe(true);
    expect(document.activeElement).toBe(tipBtn());
  });

  it('a tap outside closes it', () => {
    tap(tipBtn());
    tap(document.getElementById('outside2'));
    expect(pop().hidden).toBe(true);
    expect(tctl.isOpen()).toBe(false);
  });
});

describe('sheet / confirm: focus returns to the opener, close paths', () => {
  let sctl;
  let onConfirm;
  beforeEach(() => {
    ctl.destroy();
    // jsdom has no <dialog> modal API: a minimal stand-in that fires 'close' like the browser does.
    HTMLDialogElement.prototype.showModal ??= function showModal() { this.open = true; this.setAttribute('open', ''); };
    HTMLDialogElement.prototype.close ??= function close(v = '') {
      this.open = false;
      this.removeAttribute('open');
      this.returnValue = v;
      this.dispatchEvent(new Event('close'));
    };
    document.body.innerHTML =
      '<button id="opener">Xóa</button>' +
      W.confirm({ id: 'cf', title: 'Xóa quan hệ?', message: 'Không hoàn tác được.', confirmLabel: 'Xóa', cancelLabel: 'Hủy', danger: true });
    onConfirm = [];
    sctl = sheetController(document, { onConfirm: (d) => onConfirm.push(d.dialog.id) });
  });
  afterEach(() => sctl.destroy());
  const dlg = () => document.getElementById('cf');

  it('opens modal and moves nothing else; close button closes and returns focus to the opener', () => {
    const opener = document.getElementById('opener');
    opener.focus();
    sctl.open('cf');
    expect(dlg().open).toBe(true);
    tap(dlg().querySelector('[data-rds-close]'));
    expect(dlg().open).toBe(false);
    expect(document.activeElement).toBe(opener);
    expect(onConfirm).toHaveLength(0);
  });

  it('confirm button calls onConfirm once, closes, and returns focus', () => {
    const opener = document.getElementById('opener');
    opener.focus();
    sctl.open('cf');
    tap(dlg().querySelector('[data-rds-confirm]'));
    expect(onConfirm).toEqual(['cf']);
    expect(dlg().open).toBe(false);
    expect(document.activeElement).toBe(opener);
  });

  it('a tap on the backdrop (the dialog element itself) closes it; a tap inside the panel does not', () => {
    sctl.open('cf');
    tap(dlg().querySelector('.rds-sheet-d__text'));
    expect(dlg().open).toBe(true);
    tap(dlg());
    expect(dlg().open).toBe(false);
  });

  it('closing by any other route (Escape in the browser fires close) still returns focus', () => {
    const opener = document.getElementById('opener');
    opener.focus();
    sctl.open('cf');
    dlg().close('cancel'); // what the browser does on Escape
    expect(document.activeElement).toBe(opener);
  });
});
