// @vitest-environment jsdom
// listItem options (0.3.0): string attrs, chevron without href, density dense, tone danger, variant ghost.
import { describe, expect, it } from 'vitest';
import * as W from '../src/index.js';

const dom = (html) => {
  const t = document.createElement('template');
  t.innerHTML = html;
  return t.content;
};

describe('listItem v2 options', () => {
  it('attrs as a string are raw markup on the row (caller-trusted)', () => {
    const li = dom(W.listItem({ title: 'A', href: '#a', attrs: 'data-rvx aria-expanded="false" aria-controls="p1"' })).firstElementChild;
    expect(li.hasAttribute('data-rvx')).toBe(true);
    expect(li.getAttribute('aria-expanded')).toBe('false');
    expect(li.getAttribute('aria-controls')).toBe('p1');
    expect(li.classList.contains('rds-item')).toBe(true);
  });

  it('attrs as an object are still escaped', () => {
    const li = dom(W.listItem({ title: 'A', attrs: { 'data-x': '"><b>' } })).firstElementChild;
    expect(li.getAttribute('data-x')).toBe('"><b>');
    expect(li.querySelector('b')).toBeNull();
  });

  it('chevron:true shows the chevron on a button row (no href)', () => {
    const li = dom(W.listItem({ title: 'Lọc', chevron: true })).firstElementChild;
    expect(li.querySelector('.rds-item__chevron')).not.toBeNull();
    expect(li.querySelector('a')).toBeNull();
  });

  it('without chevron:true a button row has no chevron (unchanged)', () => {
    expect(dom(W.listItem({ title: 'Lọc' })).querySelector('.rds-item__chevron')).toBeNull();
  });

  it('density dense adds the dense class (tokens in CSS)', () => {
    const li = dom(W.listItem({ title: 'A', href: '#a', density: 'dense' })).firstElementChild;
    expect(li.classList.contains('rds-item--dense')).toBe(true);
    expect(dom(W.listItem({ title: 'A', href: '#a' })).firstElementChild.classList.contains('rds-item--dense')).toBe(false);
  });

  it('tone danger adds the danger class to the row', () => {
    const li = dom(W.listItem({ title: 'Xóa', href: '#x', tone: 'danger' })).firstElementChild;
    expect(li.classList.contains('rds-item--danger')).toBe(true);
  });

  it('variant ghost: its own class, no row class, so no divider', () => {
    const html = W.list([{ title: 'Thêm', href: '#add' }, { title: 'Khác', href: '#o' }], { variant: 'ghost' });
    const items = dom(html).querySelectorAll('li');
    expect(items[0].classList.contains('rds-item--ghost')).toBe(true);
    expect(items[0].classList.contains('rds-item--row')).toBe(false);
    expect(dom(W.listItem({ title: 'A', variant: 'ghost', href: '#a' })).querySelector('.rds-item__hit > .rds-item__main > .rds-item__title')).not.toBeNull();
  });
});
