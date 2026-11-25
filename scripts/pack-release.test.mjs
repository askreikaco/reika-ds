import { execFileSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { mkdtempSync, readFileSync, readdirSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { beforeAll, describe, expect, it } from 'vitest';
import { assertTagMatches, packRelease } from './pack-release.mjs';

const VERSION = '0.3.1';
const TARBALLS = [
  'reika-ds-react-0.3.1.tgz',
  'reika-ds-styles-0.3.1.tgz',
  'reika-ds-tokens-0.3.1.tgz',
  'reika-ds-web-0.3.1.tgz',
];

let out;

beforeAll(() => {
  out = mkdtempSync(join(tmpdir(), 'reika-ds-release-test-'));
  packRelease({ outDir: out });
}, 600_000);

const packageJson = (file) =>
  JSON.parse(
    execFileSync('tar', ['-xzOf', join(out, file), 'package/package.json'], {
      encoding: 'utf8',
    }),
  );

describe('pack-release', () => {
  it('packs exactly four tarballs and no other files besides SHA256SUMS', () => {
    const names = readdirSync(out).sort();
    expect(names).toEqual([...TARBALLS, 'SHA256SUMS'].sort());
  });

  it('rewrites internal deps to the exact release asset URLs', () => {
    const react = packageJson('reika-ds-react-0.3.1.tgz');
    const styles = packageJson('reika-ds-styles-0.3.1.tgz');
    const tokens = packageJson('reika-ds-tokens-0.3.1.tgz');
    const web = packageJson('reika-ds-web-0.3.1.tgz');

    expect(react.dependencies['@reika-ds/styles']).toBe(
      'https://github.com/askreikaco/reika-ds/releases/download/v0.3.1/reika-ds-styles-0.3.1.tgz',
    );
    expect(styles.dependencies['@reika-ds/tokens']).toBe(
      'https://github.com/askreikaco/reika-ds/releases/download/v0.3.1/reika-ds-tokens-0.3.1.tgz',
    );
    expect(tokens.dependencies?.['@reika-ds/styles']).toBeUndefined();
    expect(web.dependencies ?? {}).toEqual({});

    for (const pj of [react, styles, tokens, web]) {
      expect(pj.version).toBe(VERSION);
      for (const [dep, spec] of Object.entries(pj.dependencies ?? {})) {
        if (dep.startsWith('@reika-ds/')) {
          expect(spec.startsWith('https://github.com/askreikaco/reika-ds/releases/download/v0.3.1/')).toBe(true);
        }
      }
    }
  });

  it('keeps the built payload inside the rewritten tarballs', () => {
    const list = execFileSync('tar', ['-tzf', join(out, 'reika-ds-react-0.3.1.tgz')], {
      encoding: 'utf8',
    });
    expect(list).toContain('package/dist/index.js');
    expect(list).toContain('package/dist/index.d.ts');
  });

  it('SHA256SUMS lists all four tarballs with matching hashes', () => {
    const lines = readFileSync(join(out, 'SHA256SUMS'), 'utf8').trimEnd().split('\n');
    expect(lines).toHaveLength(4);
    const entries = lines.map((line) => {
      const [hash, name] = line.split('  ');
      return { hash, name };
    });
    expect(entries.map((e) => e.name)).toEqual(TARBALLS);
    for (const { hash, name } of entries) {
      const actual = createHash('sha256')
        .update(readFileSync(join(out, name)))
        .digest('hex');
      expect(hash).toBe(actual);
    }
  });
});

describe('tag guard', () => {
  it('compares the tag when the ref is a tag and it matches', () => {
    expect(() =>
      assertTagMatches('0.3.1', { GITHUB_REF_TYPE: 'tag', GITHUB_REF_NAME: 'v0.3.1' }),
    ).not.toThrow();
  });

  it('throws when a tag does not match the package version', () => {
    expect(() =>
      assertTagMatches('0.3.1', { GITHUB_REF_TYPE: 'tag', GITHUB_REF_NAME: 'v0.1.3' }),
    ).toThrow(/does not match package version v0.3.1/);
  });

  it('skips PR refs such as "20/merge"', () => {
    expect(() =>
      assertTagMatches('0.3.1', { GITHUB_REF_TYPE: 'branch', GITHUB_REF_NAME: '20/merge' }),
    ).not.toThrow();
  });

  it('skips when no ref env is set (local runs)', () => {
    expect(() => assertTagMatches('0.3.1', {})).not.toThrow();
  });

  it('compares RELEASE_TAG on a branch run (manual dispatch)', () => {
    expect(() =>
      assertTagMatches('0.3.1', { RELEASE_TAG: 'v0.3.1', GITHUB_REF_TYPE: 'branch', GITHUB_REF_NAME: 'main' }),
    ).not.toThrow();
    expect(() =>
      assertTagMatches('0.3.1', { RELEASE_TAG: 'v0.1.3', GITHUB_REF_TYPE: 'branch', GITHUB_REF_NAME: 'main' }),
    ).toThrow(/RELEASE_TAG v0.1.3 does not match package version v0.3.1/);
  });
});
