import { describe, expect, it } from 'vitest';
import { cssBlock, dist, distTokens } from './helpers';

// Generic app-shell sizes and the modal scrim, as they appear in the generated tokens.css (no-build apps read it).
const light = cssBlock(dist('tokens.css'), ':root {');
const dark = cssBlock(dist('tokens.css'), '[data-theme="dark"] {');
const media = dist('tokens.css').slice(dist('tokens.css').indexOf('@media (prefers-color-scheme: dark)'));
const mediaDark = cssBlock(media, ':root:not([data-theme="light"]) {');

describe('app shell sizes: plain rem values, emitted in tokens.css and the scss map', () => {
  const d = distTokens();
  const sizes = ['topbar-h', 'tabs-h', 'sidenav-w', 'sidenav-rail'] as const;

  it('each size is declared in the source and in :root', () => {
    for (const name of sizes) {
      expect(d.reika[name], name).toMatch(/^\d+(\.\d+)?rem$/);
      expect(light[`rk-${name}`], name).toBe(d.reika[name]);
    }
  });

  it('the collapsed rail is narrower than the expanded side nav; header and tabs are one Carbon row (3rem)', () => {
    expect(parseFloat(String(d.reika['sidenav-rail']))).toBeLessThan(parseFloat(String(d.reika['sidenav-w'])));
    expect(d.reika['topbar-h']).toBe('3rem');
    expect(d.reika['tabs-h']).toBe('3rem');
  });

  it('sizes are not theme-specific: declared once in :root, never repeated in the dark blocks', () => {
    for (const name of sizes) {
      expect(dark[`rk-${name}`], `dark ${name}`).toBeUndefined();
      expect(mediaDark[`rk-${name}`], `media ${name}`).toBeUndefined();
    }
  });
});

describe('scrim: a Carbon overlay token, so light and dark both get their own colour', () => {
  it('--rk-scrim points at --cds-overlay in :root, [data-theme=dark] and the dark media block', () => {
    expect(light['rk-scrim']).toBe('var(--cds-overlay)');
    expect(dark['rk-scrim']).toBe('var(--cds-overlay)');
    expect(mediaDark['rk-scrim']).toBe('var(--cds-overlay)');
  });

  it('--cds-overlay is defined in both themes (Carbon values, read by the build)', () => {
    expect(light['cds-overlay']).toMatch(/^rgba\(/);
    expect(dark['cds-overlay']).toMatch(/^rgba\(/);
  });

  it('the scss map carries the scrim reference too (no hex)', () => {
    expect(dist('_tokens.scss')).toContain('$scrim: var(--cds-overlay);');
  });
});
