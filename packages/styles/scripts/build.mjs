// Build @reika-ds/styles: tokens -> src/index.scss -> dist/reika-ds.css, dist/reika-ds.min.css, dist/scss/.
// Usage: node scripts/build.mjs   (also used by the vitest global setup). Output is deterministic.
import { mkdir, readFile, writeFile, copyFile, readdir, rm } from 'node:fs/promises';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import * as sass from 'sass';
import { build as buildTokens } from '../../tokens/scripts/build.mjs';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const src = join(root, 'src');
const dist = join(root, 'dist');

export async function compileSass(style) {
  const result = sass.compile(join(src, 'index.scss'), {
    style,
    // Package-local node_modules first (pins of this package), then the monorepo root (workspace links).
    loadPaths: [join(root, 'node_modules'), join(root, '..', '..', 'node_modules')],
    quietDeps: true,
    logger: sass.Logger.silent,
  });
  return result.css;
}

export async function build() {
  await buildTokens(); // packages/tokens/dist must exist before Sass resolves @reika-ds/tokens
  await rm(dist, { recursive: true, force: true });
  await mkdir(join(dist, 'scss'), { recursive: true });

  const expanded = await compileSass('expanded');
  const compressed = await compileSass('compressed');
  await writeFile(join(dist, 'reika-ds.css'), expanded);
  await writeFile(join(dist, 'reika-ds.min.css'), compressed);

  // Sass consumers: copy the sources. _tokens.scss is replaced by the generated tokens file, so the
  // copy does not depend on the monorepo layout. Carbon itself is still a peer for Sass consumers.
  for (const name of await readdir(src)) {
    if (!name.endsWith('.scss')) continue;
    if (name === '_tokens.scss') {
      const generated = await readFile(join(root, '..', 'tokens', 'dist', '_tokens.scss'), 'utf8');
      await writeFile(join(dist, 'scss', name), generated);
    } else {
      await copyFile(join(src, name), join(dist, 'scss', name));
    }
  }
  return { expanded, compressed };
}

if (process.argv[1] && import.meta.url === new URL(`file://${resolve(process.argv[1])}`).href) {
  const { expanded, compressed } = await build();
  console.log(`styles: dist/reika-ds.css ${expanded.length} bytes, dist/reika-ds.min.css ${compressed.length} bytes`);
}
