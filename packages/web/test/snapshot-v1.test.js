// @vitest-environment jsdom
// Snapshot of the options that existed before 0.3.0 (menu, listItem, sheet). The v2 options must not change these
// outputs: existing callers render exactly as before. Update only with a deliberate, reviewed markup change.
import { describe, expect, it } from 'vitest';
import * as W from '../src/index.js';

describe('0.2.x options render exactly as before', () => {
  it('menu(): label, value, href, tone danger, disabled', () => {
    expect(
      W.menu({
        id: 'm-old',
        label: 'Tùy chọn',
        items: [
          { label: 'Sửa', value: 'edit' },
          { label: 'Mở', href: '/mo' },
          { label: 'Xóa', value: 'del', tone: 'danger' },
          { label: 'Khóa', value: 'lock', disabled: true },
        ],
      }),
    ).toMatchSnapshot();
  });

  it('listItem(): row with meta, href and chevron; action button; static item', () => {
    expect(W.listItem({ title: 'A', meta: 'm', href: '#a' })).toMatchSnapshot();
    expect(W.listItem({ title: 'A', href: '#a', action: { label: 'Tùy chọn A', icon: 'overflow-menu-horizontal', haspopup: 'menu', controls: 'm1' } })).toMatchSnapshot();
    expect(W.listItem({ title: 'Tĩnh', meta: 'x' })).toMatchSnapshot();
  });

  it('listItem(): object attrs, compact and tree variants, show options', () => {
    expect(W.listItem({ title: 'A', attrs: { 'data-act': 'edit', 'data-id': 7 }, href: '#a' })).toMatchSnapshot();
    expect(W.listItem({ title: 'A', meta: 'm', href: '#', variant: 'compact' })).toMatchSnapshot();
    expect(W.listItem({ title: 'A', variant: 'tree', depth: 3 })).toMatchSnapshot();
    expect(W.listItem({ title: 'A', meta: 'm', leading: 'L', href: '#', show: { leading: false, meta: false, chevron: false } })).toMatchSnapshot();
  });

  it('sheet(): id, title, body, actions', () => {
    expect(W.sheet({ id: 's-old', title: 'Bộ lọc', body: 'nội dung', actions: 'hành động' })).toMatchSnapshot();
  });
});
