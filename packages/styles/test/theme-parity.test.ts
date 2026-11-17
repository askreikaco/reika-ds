import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import { distCss, root } from './helpers';

// Carbon theme values reach apps through two paths: tokens (packages/tokens/dist/tokens.json, read by the
// tokens build) and styles (dist/reika-ds.css, emitted by @carbon/styles). They must agree.
const tokens = JSON.parse(readFileSync(join(root, '..', 'tokens', 'dist', 'tokens.json'), 'utf8')) as {
  carbon: { themes: Record<'light' | 'dark', { name: string; tokens: Record<string, string> }> };
};
const LIGHT = tokens.carbon.themes.light.tokens['background'];
const DARK = tokens.carbon.themes.dark.tokens['background'];

// Maps each selector to its --cds-background value. Matches innermost blocks, so @media wrappers are skipped.
function backgroundBySelector(css: string): Record<string, string> {
  const out: Record<string, string> = {};
  for (const m of css.matchAll(/([^{}]+)\{([^{}]*)\}/g)) {
    const decl = m[2].match(/--cds-background:\s*([^;]+);/);
    if (decl) out[m[1].trim()] = decl[1].trim();
  }
  return out;
}

describe('theme parity: --cds-background in dist matches packages/tokens', () => {
  const bySelector = backgroundBySelector(distCss());

  it('g10 is the light default on :root', () => {
    expect(bySelector[':root']).toBe(LIGHT);
  });

  it('g100 is the dark value under [data-theme="dark"]', () => {
    expect(bySelector['[data-theme=dark]']).toBe(DARK);
  });

  it('g100 is the dark value under prefers-color-scheme (unless light is forced)', () => {
    expect(bySelector[':root:not([data-theme=light])']).toBe(DARK);
  });

  it('tokens source is g10 and g100 (sanity)', () => {
    expect(tokens.carbon.themes.light.name).toBe('g10');
    expect(tokens.carbon.themes.dark.name).toBe('g100');
  });
});
