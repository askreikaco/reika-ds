// Placeholder build: copies src/tokens.json to dist/tokens.json. Real generators land in WP2b.
import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const src = join(root, 'src', 'tokens.json');
const out = join(root, 'dist', 'tokens.json');

const tokens = JSON.parse(await readFile(src, 'utf8'));
await mkdir(dirname(out), { recursive: true });
await writeFile(out, JSON.stringify(tokens, null, 2) + '\n');
console.log(`tokens: wrote ${out}`);
