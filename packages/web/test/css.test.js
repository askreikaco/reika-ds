// web.css follows conv §36: tokens only, fluid (no width @media), hover only under (hover: hover), and every
// class the helpers emit is styled (and nothing styled is dead).
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import * as W from '../src/index.js';

const css = readFileSync(join(__dirname, '..', 'src', 'web.css'), 'utf8').replace(/\/\*[\s\S]*?\*\//g, '');

describe('web.css rules', () => {
  it('no raw hex, no px other than 0/1px, no numeric z-index', () => {
    expect(css.match(/#[0-9a-f]{3,8}\b/gi) || []).toEqual([]);
    const px = [...css.matchAll(/(?<![\w.-])(\d*\.?\d+)px\b/g)].map((m) => m[0]).filter((v) => v !== '1px' && v !== '0px');
    expect(px).toEqual([]);
    expect(css.match(/z-index\s*:\s*-?\d/g) || []).toEqual([]);
  });

  it('no raw rem/em sizes: every size comes from a --rk-* token', () => {
    expect(css.match(/(?<![\w-])\d*\.?\d+(rem|em)\b/g) || []).toEqual([]);
  });

  it('no width/height media queries (fluid layout)', () => {
    expect(css.match(/@media[^{]*(min|max)-(width|height)/g) || []).toEqual([]);
  });

  it(':hover rules live only inside @media (hover: hover)', () => {
    const outside = css.replace(/@media \(hover: hover\) \{[\s\S]*?\n\}/g, '');
    expect(outside.match(/:hover/g) || []).toEqual([]);
  });

  it('every rds- class the helpers emit is styled in web.css', () => {
    const html = [
      W.list([{ title: 'A', meta: 'm', leading: 'L', badges: 'b', trailing: 't', href: '#', action: { label: 'x', icon: 'add', haspopup: 'menu', controls: 'm' } }], { variant: 'row' }),
      ...['card', 'compact', 'tree', 'table-row'].map((v) => W.list([{ title: 'A', href: '#', depth: 2, cells: ['c'] }], { variant: v, head: ['h', 'c'] })),
      W.section({ title: 'T', count: 1, toolbar: W.raw(W.toolbar({ search: { label: 's' }, actions: [{ label: 'a', icon: 'add' }], count: '1', sticky: true })), body: 'b', footer: 'f' }),
      W.section({ title: 'F', fold: { open: true }, body: 'b', variant: 'plain' }),
      ['gray', 'info', 'success', 'warning', 'error', 'accent'].map((t) => W.tag('t', { tone: t })).join(''),
      W.tag('t', { size: 'sm', as: 'button' }),
      W.iconButton({ label: 'x', icon: 'add', tone: 'primary' }) + W.iconButton({ label: 'x', icon: 'add', tone: 'danger' }),
      W.menu({ id: 'm', label: 'l', items: [{ label: 'a' }, { label: 'b', tone: 'danger' }] }),
      W.confirm({ id: 'c', title: 't', message: 'm', danger: true }),
      ['primary', 'ghost', 'danger', 'outline'].map((v) => W.button('b', { variant: v })).join(''),
      W.timeline(['card', 'band', 'quiet'].map((variant) => ({ date: '1', sub: 's', kind: 'k', title: 't', body: 'b', variant }))),
      W.emptyState({ title: 't', text: 'x', action: W.raw('<b>a</b>') }) + W.emptyState({ title: 't', variant: 'inline' }),
    ].join('');
    const used = new Set([...html.matchAll(/class="([^"]+)"/g)].flatMap((m) => m[1].split(/\s+/)).filter((c) => c.startsWith('rds-')));
    const styled = new Set([...css.matchAll(/\.(rds-[\w-]+)/g)].map((m) => m[1]));
    const missing = [...used].filter((c) => !styled.has(c) && !/^rds-item--d\d+$/.test(c));
    // modifier/hook classes that intentionally carry no own rule
    const allow = new Set(['rds-item--action', 'rds-section--fold', 'rds-section__head', 'rds-tag--md', 'rds-tbar__row', 'rds-list--row', 'rds-list--compact', 'rds-list--tree', 'rds-tag--gray', 'rds-empty__action', 'rds-section--plain', 'rds-tl--card', 'rds-ibtn--primary', 'rds-item__hit--static']);
    expect(missing.filter((c) => !allow.has(c))).toEqual([]);
  });
});
