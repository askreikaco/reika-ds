import { execFileSync } from 'node:child_process';
import { mkdtempSync, readFileSync, readdirSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import { root } from './helpers';

const build = (out: string): void => {
  execFileSync(process.execPath, [join(root, 'scripts', 'build.mjs'), out], { stdio: 'pipe' });
};

describe('determinism', () => {
  it('two builds produce identical bytes', () => {
    const a = mkdtempSync(join(tmpdir(), 'rk-tokens-a-'));
    const b = mkdtempSync(join(tmpdir(), 'rk-tokens-b-'));
    build(a);
    build(b);
    const names = readdirSync(a).sort();
    expect(names).toEqual(['_tokens.scss', 'tokens.css', 'tokens.json', 'tokens.ts']);
    for (const name of names) {
      expect(readFileSync(join(b, name)).equals(readFileSync(join(a, name))), name).toBe(true);
    }
  });
});
