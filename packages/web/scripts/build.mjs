// Build: copy src/*.js + web.css to dist/ (no bundling: plain ES modules for build-free apps) and render
// dist/catalog.html, a static page with every component x variant in light and dark (the review surface).
// Usage: node scripts/build.mjs [outDir]. Output is deterministic.
import { copyFile, mkdir, readdir, writeFile } from 'node:fs/promises';
import { createRequire } from 'node:module';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { renderCatalog } from './catalog.mjs';

const require = createRequire(import.meta.url);
const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');

export async function build(out = join(root, 'dist')) {
  await mkdir(out, { recursive: true });
  for (const f of (await readdir(join(root, 'src'))).sort()) {
    if (f.endsWith('.js') || f.endsWith('.css')) await copyFile(join(root, 'src', f), join(out, f));
  }
  // tokens.css travels with the catalogue so dist/catalog.html opens on its own.
  const tokensCss = require.resolve('@reika-ds/tokens/dist/tokens.css');
  await copyFile(tokensCss, join(out, 'tokens.css'));
  await writeFile(join(out, 'catalog.html'), await renderCatalog());
  return out;
}

if (process.argv[1] && import.meta.url === pathToFileURL(resolve(process.argv[1])).href) {
  const out = await build(process.argv[2] ? resolve(process.argv[2]) : undefined);
  console.log(`web: wrote ${out}`);
}

