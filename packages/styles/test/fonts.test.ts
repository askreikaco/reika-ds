import { existsSync, readFileSync, statSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import { root } from '../../tokens/test/helpers';

// Self-hosted IBM Plex (SIL OFL 1.1): the files, the @font-face rules and the licence ship in the package.
const dir = join(root, '..', 'styles', 'fonts');
const files = [
  'IBMPlexSans-Regular.woff2',
  'IBMPlexSans-Medium.woff2',
  'IBMPlexSans-SemiBold.woff2',
  'IBMPlexMono-Regular.woff2',
];
const css = readFileSync(join(dir, 'fonts.css'), 'utf8');

describe('self-hosted IBM Plex', () => {
  for (const f of files) {
    it(`${f} is a woff2 file (magic bytes wOF2) under 100 KB`, () => {
      const bytes = readFileSync(join(dir, f));
      expect(bytes.subarray(0, 4).toString('ascii')).toBe('wOF2');
      expect(statSync(join(dir, f)).size).toBeLessThan(100 * 1024);
    });
  }

  it('fonts.css declares each file once, with the right family and weight, and loads it from the same folder', () => {
    const faces = [...css.matchAll(/font-family: "([^"]+)"; font-style: normal; font-weight: (\d+);.*?url\("\.\/([^"]+)"\)/g)];
    expect(faces.map((m) => [m[1], m[2], m[3]])).toEqual([
      ['IBM Plex Sans', '400', 'IBMPlexSans-Regular.woff2'],
      ['IBM Plex Sans', '500', 'IBMPlexSans-Medium.woff2'],
      ['IBM Plex Sans', '600', 'IBMPlexSans-SemiBold.woff2'],
      ['IBM Plex Mono', '400', 'IBMPlexMono-Regular.woff2'],
    ]);
    expect(css).toContain('font-display: swap');
    expect(css).not.toMatch(/https?:\/\//); // no third-party request
  });

  it('the OFL licence text and the IBM copyright ship next to the fonts', () => {
    expect(existsSync(join(dir, 'LICENSE-OFL.txt'))).toBe(true);
    const lic = readFileSync(join(dir, 'LICENSE-OFL.txt'), 'utf8');
    expect(lic).toContain('SIL OPEN FONT LICENSE Version 1.1');
    expect(lic).toContain('IBM Corp');
  });
});
