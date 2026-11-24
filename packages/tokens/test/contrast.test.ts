import { describe, expect, it } from 'vitest';
import { distTokens } from './helpers';

// WCAG 2.x relative luminance and contrast ratio.
const lum = (hex: string): number => {
  const [r, g, b] = [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16) / 255);
  const f = (c: number): number => (c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4);
  return 0.2126 * f(r) + 0.7152 * f(g) + 0.0722 * f(b);
};
const ratio = (a: string, b: string): number => {
  const [hi, lo] = [lum(a), lum(b)].sort((x, y) => y - x);
  return (hi + 0.05) / (lo + 0.05);
};

describe('surname tiles: text on the tile is readable, the tile edge is visible', () => {
  const d = distTokens();
  const tiles = (theme: 'light' | 'dark'): [string, string][] =>
    Object.entries(d.palette[theme]).filter(([n]) => n.startsWith('tile-'));

  it('eight tiles in each theme', () => {
    expect(tiles('light')).toHaveLength(8);
    expect(tiles('dark')).toHaveLength(8);
  });

  for (const theme of ['light', 'dark'] as const) {
    it(`${theme}: Carbon text-on-color on every tile is at least 4.5:1`, () => {
      const onColor = d.carbon.themes[theme].tokens['text-on-color'];
      for (const [name, hex] of tiles(theme)) expect(ratio(onColor, hex), `${theme} ${name}`).toBeGreaterThanOrEqual(4.5);
    });

    it(`${theme}: every tile is at least 3:1 against background and layer-01`, () => {
      const t = d.carbon.themes[theme].tokens;
      for (const [name, hex] of tiles(theme)) {
        expect(ratio(hex, t.background), `${theme} ${name} vs background`).toBeGreaterThanOrEqual(3);
        expect(ratio(hex, t['layer-01']), `${theme} ${name} vs layer-01`).toBeGreaterThanOrEqual(3);
      }
    });
  }
});
