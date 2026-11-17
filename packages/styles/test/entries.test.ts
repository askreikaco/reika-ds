import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import { root } from './helpers';

// The three CSS entries in dist/. Apps that already load Carbon take components + utilities only.
const dist = (name: string): string => readFileSync(join(root, 'dist', name), 'utf8');
const components = dist('reika-ds.components.css');
const utilities = dist('reika-ds.utilities.css');
const bundle = dist('reika-ds.css');

// reika-ds.css size before the entry split (0.1.0 build). The full bundle must not change.
const BUNDLE_BYTES_BEFORE = 108313;

// Innermost rule blocks: [selector text, declarations]. @media wrappers are skipped, their rules are kept.
function rules(css: string): Array<{ selector: string; body: string }> {
  return [...css.matchAll(/([^{}]+)\{([^{}]*)\}/g)].map((m) => ({ selector: m[1].trim(), body: m[2] }));
}

// Selectors of a stylesheet, one entry per comma-separated part. Keyframe steps are not selectors here.
function selectors(css: string): string[] {
  return rules(css)
    .filter((r) => !/^(from|to|\d+(\.\d+)?%)$/.test(r.selector))
    .flatMap((r) => r.selector.split(',').map((s) => s.trim()))
    .filter(Boolean);
}

describe('reika-ds.components.css', () => {
  it('has no theme: no :root, no data-theme, no prefers-color-scheme, no --cds-/--rk- definitions', () => {
    expect(components).not.toMatch(/:root/);
    expect(components).not.toMatch(/data-theme/);
    expect(components).not.toMatch(/prefers-color-scheme/);
    expect(components).not.toMatch(/--(cds|rk)-[\w-]+\s*:/);
  });

  it('every selector starts with .rds-', () => {
    const bad = selectors(components).filter((s) => !s.startsWith('.rds-'));
    expect(bad).toEqual([]);
  });

  it('defines no Carbon base selector (no .cds--* rule)', () => {
    // Compound selectors such as .rds-x.cds--y are component rules, so only a bare .cds-- start counts.
    expect(components).not.toMatch(/(^|[\s,}])\.cds--/m);
    expect(selectors(components).filter((s) => s.startsWith('.cds--'))).toEqual([]);
  });

  it('has no rk- utilities', () => {
    expect(components).not.toMatch(/\.rk-[\w-]+/);
  });

  it('every selector also appears in the full bundle', () => {
    const inBundle = new Set(selectors(bundle));
    const missing = selectors(components).filter((s) => !inBundle.has(s));
    expect(missing).toEqual([]);
  });
});

describe('reika-ds.utilities.css', () => {
  it('every selector starts with .rk-', () => {
    const bad = selectors(utilities).filter((s) => !s.startsWith('.rk-'));
    expect(bad).toEqual([]);
  });

  it('has no Carbon base, theme or component rules', () => {
    expect(utilities).not.toMatch(/\.cds--/);
    expect(utilities).not.toMatch(/\.rds-/);
    expect(utilities).not.toMatch(/:root/);
    expect(utilities).not.toMatch(/--cds-[\w-]+\s*:/);
  });
});

describe('reika-ds.css (full bundle)', () => {
  it('stays within 1% of its size before the entry split', () => {
    const drift = Math.abs(bundle.length - BUNDLE_BYTES_BEFORE) / BUNDLE_BYTES_BEFORE;
    expect(drift, `bundle is ${bundle.length} bytes, expected about ${BUNDLE_BYTES_BEFORE}`).toBeLessThanOrEqual(0.01);
  });
});
