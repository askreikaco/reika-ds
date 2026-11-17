import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { classNames, renderBlock } from '../scripts/readme-classes.mjs';
import { distCss, root, sourceFile } from './helpers';

// Literal selectors allowed in src/_utilities.scss. Everything else must come from an @each loop.
const ALLOWED_LITERALS = [
  'rk-row',
  'rk-col',
  'rk-wrap',
  'rk-between',
  'rk-center',
  'rk-tabular',
  'rk-scroll-x',
  'rk-truncate',
  'rk-truncate-front',
];

const range = (n: number) => Array.from({ length: n }, (_, i) => String(i + 1).padStart(2, '0'));
const SPACING_PROPS = ['p', 'px', 'py', 'pt', 'pr', 'pb', 'pl', 'm', 'mx', 'my', 'mt', 'mr', 'mb', 'ml'];
const TYPE_TOKENS = [
  'body-01', 'body-02', 'body-compact-01', 'body-compact-02', 'heading-compact-01', 'heading-compact-02',
  'heading-03', 'heading-04', 'heading-05', 'heading-06', 'productive-heading-02', 'productive-heading-03',
  'productive-heading-04', 'productive-heading-05', 'label-01', 'helper-text-01', 'code-01', 'code-02',
];

// Names the generator must produce, written from the spec, not read from the scss.
const EXPECTED_GENERATED = new Set<string>([
  ...SPACING_PROPS.flatMap((p) => range(10).map((n) => `rk-${p}-${n}`)),
  ...TYPE_TOKENS.map((t) => `rk-type--${t}`),
  ...['primary', 'secondary', 'helper', 'error', 'on-color', 'disabled', 'inverse', 'placeholder'].map((t) => `rk-text-${t}`),
  ...['background', 'layer-01', 'layer-02', 'field-01', 'inverse'].map((t) => `rk-bg-${t}`),
  ...['border-subtle-01', 'border-strong-01', 'border-interactive'].map((t) => `rk-${t}`),
  ...['raised', 'bar', 'shell', 'toast'].map((z) => `rk-z-${z}`),
  ...['md', 'lg'].flatMap((b) => [`rk-hide-${b}-up`, `rk-hide-${b}-down`]),
  'rk-measure-form',
  'rk-measure-text',
]);

const classesIn = (css: string) => new Set([...css.matchAll(/\.(rk-[A-Za-z0-9_-]+)/g)].map((m) => m[1]));

describe('rk- utilities are generated', () => {
  it('has no literal rk- selector in src/_utilities.scss outside the allowlist', () => {
    // A literal selector is a full class name; `.rk-#{$x}` (interpolated, generated) is not one.
    const literals = [...sourceFile('_utilities.scss').matchAll(/\.(rk-[A-Za-z0-9_-]+)(?![\w#-])/g)].map((m) => m[1]);
    const unexpected = literals.filter((name) => !ALLOWED_LITERALS.includes(name));
    expect(unexpected, `unexpected literal selectors: ${unexpected.join(', ')}`).toEqual([]);
  });

  it('dist defines exactly the generated set plus the allowlisted literals', () => {
    const found = classesIn(distCss());
    const expected = new Set([...EXPECTED_GENERATED, ...ALLOWED_LITERALS]);
    const extra = [...found].filter((c) => !expected.has(c));
    const missing = [...expected].filter((c) => !found.has(c));
    expect({ extra, missing }).toEqual({ extra: [], missing: [] });
  });

  it('reports the rk- class count and stays under 300', () => {
    const count = classesIn(distCss()).size;
    console.log(`rk- class count: ${count} (generated ${EXPECTED_GENERATED.size}, literal ${ALLOWED_LITERALS.length})`);
    expect(count).toBeLessThanOrEqual(300);
  });
});

describe('README class reference', () => {
  it('matches the classes in dist (run node scripts/readme-classes.mjs to refresh)', () => {
    const readme = readFileSync(join(root, 'README.md'), 'utf8');
    const block = readme.slice(readme.indexOf('<!-- classes:begin -->'), readme.indexOf('<!-- classes:end -->') + '<!-- classes:end -->'.length);
    expect(block).toBe(`<!-- classes:begin -->\n${renderBlock(classNames(distCss()))}\n<!-- classes:end -->`);
  });
});
