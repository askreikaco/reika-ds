import * as carbonType from '@carbon/type';
import * as carbonMotion from '@carbon/motion';
import { describe, expect, it } from 'vitest';
import { cssBlock, dist, distTokens } from './helpers';

type Style = { fontSize: string; lineHeight: number; letterSpacing: string | number };
const type = carbonType as unknown as Record<string, Style>;
const motion = carbonMotion as unknown as Record<string, unknown> & {
  easings: Record<string, Record<string, string>>;
};
const root = cssBlock(dist('tokens.css'), ':root {');

describe('type scale and motion come from Carbon by key', () => {
  const d = distTokens() as unknown as {
    type: Record<string, { carbon: string; fontSize: string; lineHeight: string; letterSpacing: string }>;
    motion: Record<string, string>;
  };

  it('six steps, sizes ascending, each equal to its @carbon/type style', () => {
    const steps = Object.keys(d.type);
    expect(steps).toEqual(['fs-1', 'fs-2', 'fs-3', 'fs-4', 'fs-5', 'fs-6']);
    let prev = 0;
    for (const step of steps) {
      const t = d.type[step];
      const style = type[t.carbon];
      expect(t.fontSize, step).toBe(style.fontSize);
      const lh = Math.round(parseFloat(style.fontSize) * style.lineHeight * 16) / 16;
      expect(t.lineHeight, step).toBe(`${lh}rem`);
      const size = parseFloat(t.fontSize);
      expect(size).toBeGreaterThan(prev);
      prev = size;
      const n = step.slice(3);
      expect(root[`rk-fs-${n}`]).toBe(t.fontSize);
      expect(root[`rk-lh-${n}`]).toBe(t.lineHeight);
      expect(root[`rk-ls-${n}`]).toBe(t.letterSpacing);
    }
  });

  it('line heights sit on the 1px grid and are at least the font size', () => {
    for (const t of Object.values(d.type)) {
      const lh = parseFloat(t.lineHeight);
      expect(Number.isInteger(lh * 16)).toBe(true);
      expect(lh).toBeGreaterThanOrEqual(parseFloat(t.fontSize));
    }
  });

  it('motion durations and easings equal @carbon/motion', () => {
    expect(d.motion['dur-fast']).toBe(motion.fast02);
    expect(d.motion['dur-moderate']).toBe(motion.moderate01);
    expect(d.motion['dur-slow']).toBe(motion.moderate02);
    expect(d.motion['ease-standard']).toBe(motion.easings.standard.productive);
    expect(d.motion['ease-entrance']).toBe(motion.easings.entrance.productive);
    expect(d.motion['ease-exit']).toBe(motion.easings.exit.productive);
    for (const [name, value] of Object.entries(d.motion)) expect(root[`rk-${name}`], name).toBe(value);
  });
});
