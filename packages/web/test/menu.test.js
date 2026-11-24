// @vitest-environment jsdom
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { iconButton, menu, list, menuController } from '../src/index.js';

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
