import { describe, expect, it } from 'vitest';
import { distCss } from './helpers';

// Carbon theme and chart custom properties may hold hex; nothing else in the output may.
const withoutThemeProperties = (css: string) => css.replace(/--(?:cds|rk-chart)[\w-]*\s*:[^;}]*[;}]/g, '');

describe('dist has no raw hex outside custom properties', () => {
  it('finds no hex in rules, selectors or non-theme declarations', () => {
    const offenders = [...withoutThemeProperties(distCss()).matchAll(/#[0-9a-fA-F]{3,8}\b/g)].map((m) => m[0]);
    expect(offenders, `raw hex found: ${offenders.join(', ')}`).toEqual([]);
  });

  it('keeps hex only inside the Carbon theme custom properties', () => {
    expect(distCss()).toMatch(/--cds-[\w-]+:\s*#[0-9a-fA-F]{6}/);
  });
});
