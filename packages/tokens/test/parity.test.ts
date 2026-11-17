import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import { cssBlock, dist, distTokens, root } from './helpers';

const fixture = JSON.parse(readFileSync(join(root, 'test', 'fixtures', 'app-values.json'), 'utf8')) as {
  reika: Record<string, unknown>;
  chart: { light: string[]; dark: string[] };
  palette: Record<string, { light: string; dark: string }>;
};

describe('parity: dist equals the reika-app values in the fixture', () => {
  const d = distTokens();

  it('every fixture reika value equals dist (including density options)', () => {
    for (const [key, value] of Object.entries(fixture.reika)) {
      expect(d.reika[key], `reika.${key}`).toEqual(value);
    }
  });

  it('chart palette equals dist (light and dark)', () => {
    expect(d.chart).toEqual(fixture.chart);
  });

  it('REIKA palette (carbon-palette refs) equals the app values', () => {
    for (const [name, pair] of Object.entries(fixture.palette)) {
      expect(d.palette.light[name], `palette.light.${name}`).toBe(pair.light);
      expect(d.palette.dark[name], `palette.dark.${name}`).toBe(pair.dark);
    }
  });

  it('tag-background-green resolves to #a7f0ba (light) and #044317 (dark)', () => {
    expect(d.palette.light['tag-background-green']).toBe('#a7f0ba');
    expect(d.palette.dark['tag-background-green']).toBe('#044317');
    const css = dist('tokens.css');
    expect(cssBlock(css, ':root {')['rk-tag-background-green']).toBe('#a7f0ba');
    expect(cssBlock(css, '[data-theme="dark"] {')['rk-tag-background-green']).toBe('#044317');
  });

  it('every dist reika key not in the fixture is workforce-sourced in _sources', () => {
    const unchecked = Object.keys(d.reika).filter((k) => !(k in fixture.reika));
    expect(unchecked.sort()).toEqual(Object.keys(d.sources).sort());
    for (const key of unchecked) expect(d.sources[key], `sources.${key}`).toMatch(/^workforce /);
  });
});
