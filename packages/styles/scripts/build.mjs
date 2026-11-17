// Build @reika-ds/styles: tokens -> src/index.scss -> dist/reika-ds.css, dist/reika-ds.min.css, dist/scss/.
// Also src/entries/components.scss -> dist/reika-ds.components[.min].css (components only, no Carbon base or theme)
// and src/entries/utilities.scss -> dist/reika-ds.utilities[.min].css (rk- utilities only).
// Usage: node scripts/build.mjs   (also used by the vitest global setup). Output is deterministic.
import { mkdir, readFile, writeFile, copyFile, readdir, rm } from 'node:fs/promises';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import * as sass from 'sass';
import { build as buildTokens } from '../../tokens/scripts/build.mjs';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const src = join(root, 'src');
const dist = join(root, 'dist');

export async function compileSass(style, entry = 'index.scss') {
  const result = sass.compile(join(src, entry), {
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

  const entries = { components: 'entries/components.scss', utilities: 'entries/utilities.scss' };
  for (const [name, entry] of Object.entries(entries)) {
    await writeFile(join(dist, `reika-ds.${name}.css`), await compileSass('expanded', entry));
    await writeFile(join(dist, `reika-ds.${name}.min.css`), await compileSass('compressed', entry));
  }

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
  // Component partials (src/components/_<name>.scss) keep their folder: index.scss forwards components/<name>.
  await mkdir(join(dist, 'scss', 'components'), { recursive: true });
  for (const name of await readdir(join(src, 'components'))) {
    if (name.endsWith('.scss')) await copyFile(join(src, 'components', name), join(dist, 'scss', 'components', name));
  }
  const sizes = {};
  for (const name of ['components', 'utilities']) {
    sizes[`reika-ds.${name}.css`] = (await readFile(join(dist, `reika-ds.${name}.css`))).length;
    sizes[`reika-ds.${name}.min.css`] = (await readFile(join(dist, `reika-ds.${name}.min.css`))).length;
  }
  return { expanded, compressed, sizes };
}

if (process.argv[1] && import.meta.url === new URL(`file://${resolve(process.argv[1])}`).href) {
  const { expanded, compressed, sizes } = await build();
  console.log(`styles: dist/reika-ds.css ${expanded.length} bytes, dist/reika-ds.min.css ${compressed.length} bytes`);
  for (const [file, bytes] of Object.entries(sizes)) console.log(`styles: dist/${file} ${bytes} bytes`);
}
