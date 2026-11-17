import { execFileSync } from 'node:child_process';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import { lintPaths, lintText } from '../scripts/lint-consumer.mjs';
import { root } from './helpers';

const fixture = (...parts: string[]) => join(root, 'test', 'fixtures', ...parts);
const rulesOf = (text: string) => lintText(text).map((v) => v.rule);

describe('consumer lint', () => {
  it('passes the good fixtures', async () => {
    expect(await lintPaths([fixture('good')])).toEqual([]);
  });

  it('flags each bad fixture with its rule', async () => {
    const results = await lintPaths([fixture('bad')]);
    const byFile = (name: string) => results.filter((r) => r.file.endsWith(name)).map((r) => r.rule);
    expect(byFile('raw-hex.scss')).toEqual(['raw-hex', 'raw-hex']);
    expect(byFile('raw-px.scss')).toEqual(['raw-px', 'raw-px']);
    expect(byFile('raw-z-index.scss')).toEqual(['raw-z-index']);
    expect(byFile('internal-override.scss')).toEqual(['internal-override', 'internal-override']);
  });

  it('exits 1 from the CLI on bad input and 0 on good input', () => {
    const cli = join(root, 'scripts', 'lint-consumer.mjs');
    expect(() => execFileSync(process.execPath, [cli, fixture('good')], { stdio: 'pipe' })).not.toThrow();
    expect(() => execFileSync(process.execPath, [cli, fixture('bad')], { stdio: 'pipe' })).toThrow();
  });

  it('ignores hex and px inside comments', () => {
    expect(rulesOf('/* #fff 16px */ // color: #000;\n.a { color: var(--cds-text-primary); }')).toEqual([]);
  });

  it('allows https URLs with // inside url()', () => {
    expect(rulesOf('.a { background: url(https://example.invalid/x.png); }')).toEqual([]);
  });
});
