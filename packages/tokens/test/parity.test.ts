import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import { distTokens, root } from './helpers';

const fixture = JSON.parse(readFileSync(join(root, 'test', 'fixtures', 'app-values.json'), 'utf8')) as {
  reika: Record<string, unknown>;
  chart: { light: string[]; dark: string[] };
};
// Keys with no value in the reika-app files (fixture cannot check them). Listed so a new unchecked key fails the suite.
const UNSOURCED = ['measure-form', 'measure-text'];

describe('parity: dist equals the reika-app values in the fixture', () => {
  const dist = distTokens();

  it('every fixture reika value equals dist', () => {
    for (const [key, value] of Object.entries(fixture.reika)) {
      expect(dist.reika[key], `reika.${key}`).toEqual(value);
    }
  });

  it('chart palette equals dist (light and dark)', () => {
    expect(dist.chart).toEqual(fixture.chart);
  });

  it('every dist reika key is in the fixture or in the documented unsourced list', () => {
    const extra = Object.keys(dist.reika).filter((k) => !(k in fixture.reika) && !UNSOURCED.includes(k));
    expect(extra).toEqual([]);
  });
});
