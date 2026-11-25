// @vitest-environment jsdom
// openMenu(): a dynamic menu mounted next to its anchor (0.3.0). Each option has a pass case.
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { menu, openMenu } from '../src/index.js';

const tap = (el) => {
  el.dispatchEvent(new window.MouseEvent('pointerdown', { bubbles: true })); // jsdom has no PointerEvent
  el.click();
};
const anchor = () => document.getElementById('anchor');
const menuEl = () => document.querySelector('.rds-menu');
const press = (key) => document.dispatchEvent(new KeyboardEvent('keydown', { key, bubbles: true }));

let picked;
let handle;
beforeEach(() => {
  picked = [];
  document.body.innerHTML = '<button id="anchor" aria-label="Tùy chọn">⋯</button><p id="outside">x</p>';
});
afterEach(() => {
  handle?.close();
  handle = null;
});

// Each call to openMenu on the anchor is the anchor's click handler (toggle).
const onAnchorClick = (o) => {
  anchor().addEventListener('click', () => { handle = openMenu(anchor(), o); });
  tap(anchor());
};

describe('openMenu', () => {
  const items = [
    { label: 'Sửa', onSelect: () => picked.push('edit') },
    { label: 'Xóa', onSelect: () => picked.push('del'), tone: 'danger', divider: true },
  ];

  it('mounts a menu in the body next to the anchor and sets aria-expanded', () => {
    onAnchorClick({ title: 'Hành động', items });
    expect(menuEl()).not.toBeNull();
    expect(anchor().getAttribute('aria-expanded')).toBe('true');
    expect(document.querySelectorAll('[role="menu"]').length).toBe(1);
  });

  it('toggle: a second tap on the same anchor closes and removes the menu', () => {
    onAnchorClick({ items });
    expect(menuEl()).not.toBeNull();
    tap(anchor()); // second tap: the anchor's handler calls openMenu again
    expect(menuEl()).toBeNull();
    expect(anchor().getAttribute('aria-expanded')).toBe('false');
  });

  it('focuses the first item on open', () => {
    onAnchorClick({ items });
    expect(document.activeElement).toBe(menuEl().querySelector('[role="menuitem"]'));
  });

  it('Escape closes, removes the menu and returns focus to the anchor', () => {
    onAnchorClick({ items });
    press('Escape');
    expect(menuEl()).toBeNull();
    expect(document.activeElement).toBe(anchor());
    expect(anchor().getAttribute('aria-expanded')).toBe('false');
  });

  it('a tap outside closes it without moving focus', () => {
    onAnchorClick({ items });
    tap(document.getElementById('outside'));
    expect(menuEl()).toBeNull();
  });

  it('choosing an item calls its onSelect once, removes the menu and returns focus to the anchor', () => {
    onAnchorClick({ items });
    tap(menuEl().querySelectorAll('[role="menuitem"]')[1]);
    expect(picked).toEqual(['del']);
    expect(menuEl()).toBeNull();
    expect(document.activeElement).toBe(anchor());
  });

  it('a disabled item does not select', () => {
    onAnchorClick({ items: [{ label: 'Khóa', disabled: true, onSelect: () => picked.push('lock') }] });
    tap(menuEl().querySelector('[role="menuitem"]'));
    expect(picked).toEqual([]);
    expect(menuEl()).not.toBeNull();
  });

  it('attrs are escaped: the value is literal text, never markup', () => {
    const evil = '"><img src=x onerror=alert(1)>';
    onAnchorClick({ items: [{ label: 'A', attrs: { 'data-act': evil } }] });
    const item = menuEl().querySelector('[role="menuitem"]');
    expect(item.getAttribute('data-act')).toBe(evil);
    expect(menuEl().querySelector('img')).toBeNull();
  });

  it('divider puts a separator directly before the item', () => {
    onAnchorClick({ items });
    const del = menuEl().querySelectorAll('[role="menuitem"]')[1];
    expect(del.previousElementSibling.getAttribute('role')).toBe('separator');
    expect(del.classList.contains('rds-menu__item--danger')).toBe(true);
  });

  it('the title is a visible heading that is not aria-hidden, and names the menu', () => {
    onAnchorClick({ title: 'Hành động <b>', items });
    const h = menuEl().querySelector('h3');
    expect(h.textContent).toBe('Hành động <b>'); // escaped text, not markup
    expect(h.closest('[aria-hidden="true"]')).toBeNull();
    expect(menuEl().querySelector('[role="menu"]').getAttribute('aria-labelledby')).toBe(h.id);
  });

  it('a second anchor closes the first menu and opens its own', () => {
    document.body.insertAdjacentHTML('beforeend', '<button id="other">B</button>');
    onAnchorClick({ items });
    handle = openMenu(document.getElementById('other'), { items: [{ label: 'Z' }] });
    expect(document.querySelectorAll('.rds-menu').length).toBe(1);
    expect(anchor().getAttribute('aria-expanded')).toBe('false');
    expect(document.getElementById('other').getAttribute('aria-expanded')).toBe('true');
  });

  it('ArrowDown moves focus between items', () => {
    onAnchorClick({ items });
    press('ArrowDown');
    expect(document.activeElement.textContent).toBe('Xóa');
  });
});

describe('menu() static options: items[].attrs and tone', () => {
  it('attrs are escaped on the row; tone danger adds the danger class', () => {
    const t = document.createElement('template');
    t.innerHTML = menu({ id: 'sm', items: [{ label: 'Xóa', value: 'del', tone: 'danger', attrs: { 'data-danger': true, 'data-id': '1"x' } }] });
    const row = t.content.querySelector('[role="menuitem"]');
    expect(row.classList.contains('rds-menu__item--danger')).toBe(true);
    expect(row.getAttribute('data-id')).toBe('1"x');
    expect(row.hasAttribute('data-danger')).toBe(true);
  });
});
