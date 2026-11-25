import { mkdtempSync, readFileSync, readdirSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import { build } from '../scripts/build.mjs';

describe('build', () => {
  it('writes the same files byte for byte twice, catalogue included', async () => {
    const a = await build(mkdtempSync(join(tmpdir(), 'rds-web-a-')));
    const b = await build(mkdtempSync(join(tmpdir(), 'rds-web-b-')));
    const names = readdirSync(a).sort();
    expect(names).toEqual(['catalog.html', 'components.js', 'confirm.js', 'html.js', 'index.js', 'menu-controller.js', 'tokens.css', 'web.css']);
    for (const n of names) expect(readFileSync(join(b, n)).equals(readFileSync(join(a, n))), n).toBe(true);
  });

  it('the catalogue renders every component in light and dark', async () => {
    const out = await build(mkdtempSync(join(tmpdir(), 'rds-web-c-')));
    const html = readFileSync(join(out, 'catalog.html'), 'utf8');
    for (const cls of ['rds-item--row', 'rds-item--card', 'rds-item--compact', 'rds-item--tree', 'rds-item--table-row', 'rds-section--card', 'rds-section--fold', 'rds-tbar', 'rds-tag--error', 'rds-ibtn', 'rds-menu', 'rds-sheet-d', 'rds-tl--band', 'rds-tl--quiet', 'rds-empty--block', 'rds-btn--danger']) {
      expect(html, cls).toContain(cls);
    }
    expect(html).toContain('data-theme="light"');
    expect(html).toContain('data-theme="dark"');
  });
});
