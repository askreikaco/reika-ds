// Extracts the REIKA token values from a reika-app checkout into test/fixtures/app-values.json (values only).
// Usage: node scripts/extract-app-values.mjs <path-to-reika-app> [outFile]
// Reads: app/src/styles/_tokens.scss, app/src/ui/layout.ts, app/src/styles/charts.scss, scripts/gen-ds-tokens.mjs.
// Spacing (sp.$spacing-NN, u(n)) is resolved with the Carbon spacing scale from @carbon/layout.
import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { createRequire } from 'node:module';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const require = createRequire(import.meta.url);
const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const carbonLayout = require('@carbon/layout');

const [appArg, outArg] = process.argv.slice(2);
if (!appArg) {
  console.error('usage: node scripts/extract-app-values.mjs <path-to-reika-app> [outFile]');
  process.exit(2);
}
const app = resolve(appArg);
const outFile = resolve(outArg ?? join(root, 'test', 'fixtures', 'app-values.json'));

// Carbon spacing in rem, from the @carbon/layout scale (spacing-05 -> spacing05 -> "1rem").
const spacingRem = (name) => {
  const key = `spacing${name.replace(/^spacing-/, '')}`;
  const value = carbonLayout[key];
  if (typeof value !== 'string' || !value.endsWith('rem')) throw new Error(`extract: no Carbon ${name}`);
  return parseFloat(value);
};

// Turns one SCSS value into the source unit: "1rem", "2.75rem", "1px" or a number.
function scssValue(expr) {
  const e = expr.trim();
  let m = e.match(/^u\(([\d.]+)\)$/);
  if (m) return `${Number(m[1]) * spacingRem('spacing-05')}rem`;
  m = e.match(/^(?:sp\.)?\$(spacing-\d{2})$/);
  if (m) return `${spacingRem(m[1])}rem`;
  m = e.match(/^(\d+(?:\.\d+)?)(rem|px)$/);
  if (m) return `${m[1]}${m[2]}`;
  return undefined; // not a value this extractor understands (reported below)
}

// Name mapping: app SCSS variable -> token key.
const SCSS_RENAME = { 'chart-height': 'chart-height-md' };
// Carbon's own layout heights and the playground-only names are not REIKA tokens.
const SCSS_SKIP = /^layout-height-/;

async function scssTokens() {
  const text = await readFile(join(app, 'app/src/styles/_tokens.scss'), 'utf8');
  const out = {};
  const unknown = [];
  for (const line of text.split('\n')) {
    const m = line.match(/^\$([a-z0-9-]+):\s*([^;]+);/);
    if (!m || SCSS_SKIP.test(m[1])) continue;
    const value = scssValue(m[2]);
    const key = SCSS_RENAME[m[1]] ?? m[1];
    if (value === undefined) unknown.push(m[1]);
    else out[key] = value;
  }
  // $z-layers map
  const z = text.match(/\$z-layers:\s*\(([\s\S]*?)\);/);
  if (z) {
    out['z-layers'] = Object.fromEntries(
      [...z[1].matchAll(/^\s*([a-z]+):\s*(\d+),/gm)].map((mm) => [mm[1], Number(mm[2])]),
    );
  }
  if (unknown.length) throw new Error(`extract: unparsed _tokens.scss values: ${unknown.join(', ')}`);
  return out;
}

async function layoutTokens() {
  const text = await readFile(join(app, 'app/src/ui/layout.ts'), 'utf8');
  const get = (name) => {
    const m = text.match(new RegExp(`export const ${name} = ([^;]+);`));
    if (!m) throw new Error(`extract: layout.ts has no ${name}`);
    return m[1].trim();
  };
  const mq = (name) => {
    const m = get(name).match(/min-width: ([\d.]+rem)/);
    if (!m) throw new Error(`extract: ${name} has no min-width`);
    return m[1];
  };
  return {
    'breakpoint-md': mq('MQ_MD_UP'),
    'breakpoint-lg': mq('MQ_LG_UP'),
    'breakpoint-lg-px': Number(get('LG_PX')),
    'icon-sm': Number(get('ICON_SM')),
    'icon-md': Number(get('ICON_MD')),
    'icon-xl': Number(get('ICON_XL')),
  };
}

async function genTokens() {
  const text = await readFile(join(app, 'scripts/gen-ds-tokens.mjs'), 'utf8');
  const radius = text.match(/radius:\s*\{([^}]*)\}/);
  if (!radius) throw new Error('extract: gen-ds-tokens.mjs has no radius');
  const out = {};
  for (const [, k, v] of radius[1].matchAll(/(\w+):\s*(\d+)/g)) out[`radius-${k}`] = Number(v);
  const shadow = text.match(/shadow:\s*'([a-z]+)'/);
  const density = text.match(/density:\s*'([a-z]+)'/);
  if (!shadow || !density) throw new Error('extract: gen-ds-tokens.mjs has no shadow/density');
  out.shadow = shadow[1];
  out.density = density[1];
  return out;
}

async function chartPalette() {
  const text = await readFile(join(app, 'app/src/styles/charts.scss'), 'utf8');
  const blocks = [...text.matchAll(/\[data-carbon-theme='(g10|g100)'\]\s*\{([\s\S]*?)\}/g)];
  const pick = (name) => {
    const block = blocks.find((b) => b[1] === name);
    if (!block) throw new Error(`extract: charts.scss has no ${name} block`);
    const cats = [...block[2].matchAll(/--r-cat-(\d):\s*(#[0-9a-f]{6});/gi)];
    if (cats.length !== 5) throw new Error(`extract: ${name} has ${cats.length} categorical colours, want 5`);
    return cats.sort((a, b) => Number(a[1]) - Number(b[1])).map((c) => c[2].toLowerCase());
  };
  return { light: pick('g10'), dark: pick('g100') };
}

const reika = { ...(await scssTokens()), ...(await layoutTokens()), ...(await genTokens()) };
const fixture = {
  source: 'reika-app: app/src/styles/_tokens.scss, app/src/ui/layout.ts, app/src/styles/charts.scss, scripts/gen-ds-tokens.mjs',
  reika: Object.fromEntries(Object.keys(reika).sort().map((k) => [k, reika[k]])),
  chart: await chartPalette(),
};

await mkdir(dirname(outFile), { recursive: true });
await writeFile(outFile, `${JSON.stringify(fixture, null, 2)}\n`);
console.log(`extract-app-values: wrote ${outFile} (${Object.keys(fixture.reika).length} reika keys)`);
