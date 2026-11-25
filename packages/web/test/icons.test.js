// @vitest-environment jsdom
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';
import { icon, iconNames } from '../src/index.js';

// Carbon 32px paths, copied from @carbon/icons-react 11.92.0 (Apache-2.0). The fixture is the source of truth:
// a web icon must equal its Carbon shape, so nothing is hand-drawn.
const here = dirname(fileURLToPath(import.meta.url));
const carbon = JSON.parse(readFileSync(join(here, 'fixtures', 'carbon-icons-32.json'), 'utf8'));

const inner = (svg) => svg.replace(/^<svg[^>]*>/, '').replace(/<\/svg>$/, '');

describe('icons are Carbon shapes', () => {
  it('the icon set is exactly the Carbon fixture (no extra or missing names)', () => {
    expect([...iconNames].sort()).toEqual(Object.keys(carbon).sort());
  });

  it('the set has 28 Carbon icons (11 original + 17 added in 0.2.1)', () => {
    expect(Object.keys(carbon)).toHaveLength(28);
    expect(iconNames).toHaveLength(28);
  });

  for (const name of Object.keys(carbon)) {
    it(`${name} equals the Carbon 32px shape`, () => {
      expect(inner(icon(name))).toBe(carbon[name]);
    });
  }
});
