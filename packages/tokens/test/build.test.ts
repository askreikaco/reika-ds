import { execFileSync } from 'node:child_process';
import { existsSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');

describe('tokens build', () => {
  it('writes dist/tokens.json', () => {
    execFileSync(process.execPath, [join(root, 'scripts', 'build.mjs')], { stdio: 'inherit' });
    expect(existsSync(join(root, 'dist', 'tokens.json'))).toBe(true);
  });
});
