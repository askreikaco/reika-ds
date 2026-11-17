import * as carbon from '@carbon/themes';
import { describe, expect, it } from 'vitest';
import { cssBlock, dist, distTokens } from './helpers';

// Sampled Carbon tokens: CSS name -> @carbon/themes key.
const SAMPLE: Record<string, string> = {
  background: 'background',
  'layer-01': 'layer01',
  'text-primary': 'textPrimary',
  interactive: 'interactive',
  'border-subtle-01': 'borderSubtle01',
  'support-error': 'supportError',
  focus: 'focus',
  'link-primary': 'linkPrimary',
  'field-01': 'field01',
  'icon-primary': 'iconPrimary',
};

type Theme = Record<string, string>;
const themes = carbon as unknown as { g10: Theme; g100: Theme };
const css = dist('tokens.css');
const root = cssBlock(css, ':root {');
const dark = cssBlock(css, '[data-theme="dark"] {');
const media = css.slice(css.indexOf('@media (prefers-color-scheme: dark)'));
const mediaDark = cssBlock(media, ':root:not([data-theme="light"]) {');

describe('carbon: dist matches @carbon/themes for 10 sampled keys', () => {
  it.each(Object.entries(SAMPLE))('%s: g10 in :root, g100 in dark blocks', (cssName, key) => {
    const g10 = themes.g10[key];
    const g100 = themes.g100[key];
    expect(g10, `@carbon/themes g10.${key}`).toBeTruthy();
    expect(root[`cds-${cssName}`], `:root --cds-${cssName}`).toBe(g10);
    expect(dark[`cds-${cssName}`], `[data-theme=dark] --cds-${cssName}`).toBe(g100);
    expect(mediaDark[`cds-${cssName}`], `prefers-color-scheme --cds-${cssName}`).toBe(g100);
  });

  it('dist/tokens.json resolved maps equal @carbon/themes for the sampled keys', () => {
    const d = distTokens();
    for (const [cssName, key] of Object.entries(SAMPLE)) {
      expect(d.carbon.themes.light.tokens[cssName]).toBe(themes.g10[key]);
      expect(d.carbon.themes.dark.tokens[cssName]).toBe(themes.g100[key]);
    }
  });
});
