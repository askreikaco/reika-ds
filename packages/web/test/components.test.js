// @vitest-environment jsdom
import { describe, expect, it } from 'vitest';
import * as W from '../src/index.js';

const dom = (html) => {
  const t = document.createElement('template');
  t.innerHTML = html;
  return t.content;
};
const XSS = '<img src=x onerror=alert(1)>"\'&';

describe('escaping', () => {
  it('escapes every text option, never parses it as markup', () => {
    const html = [
      W.listItem({ title: XSS, meta: XSS, trailing: XSS, href: '#' }),
      W.section({ title: XSS, count: XSS, body: XSS }),
      W.tag(XSS),
      W.toolbar({ search: { label: XSS, placeholder: XSS, value: XSS }, count: XSS }),
      W.menu({ id: 'm', label: XSS, items: [{ label: XSS, value: XSS }] }),
      W.sheet({ id: 's', title: XSS, body: XSS }),
      W.timelineItem({ date: XSS, sub: XSS, title: XSS, body: XSS }),
      W.emptyState({ title: XSS, text: XSS }),
      W.button(XSS),
    ].join('');
    const frag = dom(html);
    expect(frag.querySelector('img')).toBeNull();
    expect(html).not.toContain('<img');
    expect(html).toContain('&lt;img');
  });

  it('raw() passes trusted markup through once', () => {
    const html = W.listItem({ title: 'A', badges: W.raw(W.tag('x')) });
    expect(dom(html).querySelector('.rds-item__badges .rds-tag')).not.toBeNull();
  });

  it('refuses event-handler and style attributes', () => {
    expect(() => W.attrs({ onclick: 'x' })).toThrow();
    expect(() => W.attrs({ style: 'color:red' })).toThrow();
    expect(() => W.tag('a', { attrs: { onmouseover: 'x' } })).toThrow();
  });

  it('neutralises javascript: and data: links', () => {
    expect(W.safeHref('javascript:alert(1)')).toBe('#');
    expect(W.safeHref(' data:text/html,x')).toBe('#');
    expect(W.safeHref('https://a.test/x')).toBe('https://a.test/x');
    expect(W.safeHref('#person/1')).toBe('#person/1');
    const a = dom(W.listItem({ title: 'x', href: 'javascript:alert(1)' })).querySelector('a');
    expect(a.getAttribute('href')).toBe('#');
  });
});

describe('listItem', () => {
  it('row: one link for the whole item, chevron when there is no action', () => {
    const li = dom(W.listItem({ title: 'A', meta: 'm', href: '#a' })).firstElementChild;
    expect(li.className).toContain('rds-item--row');
    expect(li.querySelectorAll('a').length).toBe(1);
    expect(li.querySelector('.rds-item__chevron')).not.toBeNull();
  });

  it('action: a sibling button (never inside the link), no chevron, accessible name', () => {
    const li = dom(W.listItem({ title: 'A', href: '#a', action: { label: 'Tùy chọn cho A', icon: 'overflow-menu-horizontal', haspopup: 'menu', controls: 'm1' } })).firstElementChild;
    const btn = li.querySelector('button');
    expect(btn.closest('a')).toBeNull();
    expect(li.querySelector('a button, a a, button a')).toBeNull();
    expect(btn.getAttribute('aria-label')).toBe('Tùy chọn cho A');
    expect(btn.getAttribute('aria-haspopup')).toBe('menu');
    expect(btn.getAttribute('aria-expanded')).toBe('false');
    expect(btn.getAttribute('aria-controls')).toBe('m1');
    expect(li.querySelector('.rds-item__chevron')).toBeNull();
  });

  it('show options hide parts; static items have no link', () => {
    const li = dom(W.listItem({ title: 'A', meta: 'm', leading: 'L', href: '#', show: { leading: false, meta: false, chevron: false } })).firstElementChild;
    expect(li.querySelector('.rds-item__leading')).toBeNull();
    expect(li.querySelector('.rds-item__meta')).toBeNull();
    expect(li.querySelector('.rds-item__chevron')).toBeNull();
    const st = dom(W.listItem({ title: 'A' })).firstElementChild;
    expect(st.querySelector('a')).toBeNull();
    expect(st.querySelector('.rds-item__hit--static')).not.toBeNull();
  });

  it('every variant keeps the same inner contract (hit > main > title)', () => {
    for (const variant of ['row', 'card', 'compact', 'tree']) {
      const li = dom(W.listItem({ title: 'A', meta: 'm', href: '#', variant })).firstElementChild;
      expect(li.className).toContain(`rds-item--${variant}`);
      expect(li.querySelector('.rds-item__hit > .rds-item__main > .rds-item__title')).not.toBeNull();
    }
  });

  it('tree: depth class, clamped to 0..12', () => {
    expect(W.listItem({ title: 'A', variant: 'tree', depth: 3 })).toContain('rds-item--d3');
    expect(W.listItem({ title: 'A', variant: 'tree', depth: 99 })).toContain('rds-item--d12');
    expect(W.listItem({ title: 'A', variant: 'tree', depth: -2 })).toContain('rds-item--d0');
  });

  it('table-row: a row header with the link, then cells; list() wraps it in a table', () => {
    const html = W.list([{ title: 'A', href: '#a', cells: ['x', 'y'] }], { variant: 'table-row', head: ['T', 'X', 'Y'], label: 'People' });
    const table = dom(html).querySelector('table');
    expect(table.getAttribute('aria-label')).toBe('People');
    expect(table.querySelectorAll('thead th').length).toBe(3);
    const tr = table.querySelector('tbody tr');
    expect(tr.querySelector('th[scope="row"] a').getAttribute('href')).toBe('#a');
    expect(tr.querySelectorAll('td').length).toBe(2);
  });

  it('list(): ul for list variants with a label', () => {
    const ul = dom(W.list([{ title: 'A' }, { title: 'B' }], { variant: 'card', label: 'L' })).firstElementChild;
    expect(ul.tagName).toBe('UL');
    expect(ul.className).toContain('rds-list--card');
    expect(ul.querySelectorAll('li.rds-item--card').length).toBe(2);
  });
});

describe('section, toolbar, tag, buttons', () => {
  it('section: heading level, count, toolbar slot; fold uses native details', () => {
    const s = dom(W.section({ title: 'T', count: 3, level: 3, toolbar: W.raw('<div class="tb"></div>'), body: 'b' })).firstElementChild;
    expect(s.querySelector('h3.rds-section__title').textContent).toContain('T');
    expect(s.querySelector('.rds-section__count').textContent).toBe('3');
    expect(s.querySelector('.rds-section__toolbar .tb')).not.toBeNull();
    const f = dom(W.section({ title: 'F', fold: { open: true }, body: 'b' })).firstElementChild;
    expect(f.querySelector('details[open] > summary h2')).not.toBeNull();
  });

  it('toolbar: labelled search input + icon buttons', () => {
    const t = dom(W.toolbar({ search: { label: 'Tìm', placeholder: 'Tìm' }, actions: [{ label: 'Lọc', icon: 'filter' }], count: '3' })).firstElementChild;
    const input = t.querySelector('input[type="search"]');
    expect(input.closest('label').textContent).toContain('Tìm');
    expect(t.querySelector('.rds-tbar__actions button[aria-label="Lọc"]')).not.toBeNull();
    expect(t.querySelector('.rds-tbar__count').textContent).toBe('3');
  });

  it('tag: tone and size classes; unknown tone falls back to gray; button tags expose aria-pressed', () => {
    expect(W.tag('a', { tone: 'error', size: 'sm' })).toContain('rds-tag--error rds-tag--sm');
    expect(W.tag('a', { tone: 'nope' })).toContain('rds-tag--gray');
    const b = dom(W.tag('a', { as: 'button', pressed: true })).firstElementChild;
    expect(b.tagName).toBe('BUTTON');
    expect(b.getAttribute('aria-pressed')).toBe('true');
  });

  it('iconButton needs an accessible name; unknown icons fail loudly', () => {
    expect(() => W.iconButton({ icon: 'add' })).toThrow();
    expect(() => W.iconButton({ label: 'x', icon: 'nope' })).toThrow();
    const b = dom(W.iconButton({ label: 'Thêm', icon: 'add' })).firstElementChild;
    expect(b.getAttribute('type')).toBe('button');
    expect(b.querySelector('svg').getAttribute('aria-hidden')).toBe('true');
  });

  it('menu: hidden role=menu with menuitems; danger tone; id required', () => {
    expect(() => W.menu({ items: [] })).toThrow();
    const m = dom(W.menu({ id: 'm', label: 'A', items: [{ label: 'Sửa', value: 'e' }, { label: 'Xóa', value: 'd', tone: 'danger' }] })).firstElementChild;
    expect(m.hidden).toBe(true);
    expect(m.getAttribute('role')).toBe('menu');
    expect(m.querySelectorAll('[role="menuitem"]').length).toBe(2);
    expect(m.querySelector('.rds-menu__item--danger').textContent).toBe('Xóa');
  });

  it('sheet/confirm: dialog labelled by its title, close + confirm hooks', () => {
    const d = dom(W.confirm({ id: 'c', title: 'Xóa?', message: 'm', danger: true })).firstElementChild;
    expect(d.tagName).toBe('DIALOG');
    expect(d.getAttribute('aria-labelledby')).toBe('c-title');
    expect(d.querySelector('#c-title').textContent).toBe('Xóa?');
    expect(d.querySelectorAll('[data-rds-close]').length).toBe(2);
    expect(d.querySelector('[data-rds-confirm]').className).toContain('rds-btn--danger');
  });

  it('timelineItem: variants, date + age line, external links open safely', () => {
    const li = dom(W.timelineItem({ date: '1945', sub: 'lúc 14 tuổi', title: 'T', variant: 'quiet', href: 'https://x.test', external: true })).firstElementChild;
    expect(li.className).toContain('rds-tl--quiet');
    expect(li.querySelector('.rds-tl__sub').textContent).toBe('lúc 14 tuổi');
    const a = li.querySelector('a.rds-tl__box');
    expect(a.getAttribute('target')).toBe('_blank');
    expect(a.getAttribute('rel')).toBe('noopener');
    expect(W.timelineItem({ date: '1', title: 'x', variant: 'weird' })).toContain('rds-tl--card');
  });

  it('emptyState: status role, block/inline', () => {
    const e = dom(W.emptyState({ title: 'Trống', variant: 'inline' })).firstElementChild;
    expect(e.getAttribute('role')).toBe('status');
    expect(e.className).toContain('rds-empty--inline');
  });
});

describe('infoTip (toggletip)', () => {
  it('a ⓘ button with an accessible name, aria-expanded false and aria-controls to a hidden popover', () => {
    const f = dom(W.infoTip('Chi tiết', { id: 'tip-1', label: 'Giải thích' }));
    const btn = f.querySelector('button.rds-tip__btn');
    expect(btn.getAttribute('aria-label')).toBe('Giải thích');
    expect(btn.getAttribute('aria-expanded')).toBe('false');
    expect(btn.getAttribute('aria-controls')).toBe('tip-1');
    expect(btn.hasAttribute('data-rds-toggletip')).toBe(true);
    expect(btn.querySelector('svg.rds-icon')).not.toBeNull();
    const pop = f.querySelector('#tip-1');
    expect(pop.hidden).toBe(true);
    expect(pop.textContent).toBe('Chi tiết');
    expect(f.querySelector('[role="menu"]')).toBeNull(); // a toggletip is not a menu
  });

  it('requires an id and an accessible label; escapes its text', () => {
    expect(() => W.infoTip('x', { label: 'a' })).toThrow(/id/);
    expect(() => W.infoTip('x', { id: 'a' })).toThrow(/label/);
    const f = dom(W.infoTip(XSS, { id: 't', label: 'l' }));
    expect(f.querySelector('#t').querySelector('img')).toBeNull();
    expect(f.querySelector('#t').textContent).toBe(XSS);
  });

  it('the information icon is a Carbon shape (no unknown-icon error)', () => {
    expect(W.iconNames).toContain('information');
  });
});

describe('button', () => {
  it('button: variant class, href renders a link', () => {
    expect(dom(W.button('Lưu', { variant: 'primary' })).firstElementChild.className).toContain('rds-btn--primary');
    expect(dom(W.button('Mở', { href: '#x' })).firstElementChild.tagName).toBe('A');
  });
});
