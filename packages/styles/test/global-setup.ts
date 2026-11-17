import { execFileSync } from 'node:child_process';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

// Builds dist/ once before the suite; every test reads dist/ and never rebuilds it.
export default function setup(): void {
  const root = join(dirname(fileURLToPath(import.meta.url)), '..');
  execFileSync(process.execPath, [join(root, 'scripts', 'build.mjs')], { stdio: 'inherit' });
}
