// Build: src/tokens.json -> dist/ (tokens.json, _tokens.scss, tokens.css, tokens.ts).
// Carbon colours are read from @carbon/themes at build time by key; REIKA values come from src only.
// Usage: node scripts/build.mjs [outDir]   (default: <package>/dist). Output is deterministic.
import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { createRequire } from 'node:module';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const require = createRequire(import.meta.url);
const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const defaultDir = join(root, 'dist');
const carbonThemes = require('@carbon/themes');
const carbonColors = require('@carbon/colors');
const carbonType = require('@carbon/type');
const carbonMotion = require('@carbon/motion');
const carbonLayout = require('@carbon/layout');

const HEX = /^#[0-9a-f]{6}$/i;

// Carbon JS keys are camelCase (layer01, borderSubtle01); CSS custom properties are kebab (layer-01, border-subtle-01).
export function kebab(key) {
  return key
    .replace(/([a-z])([A-Z0-9])/g, '$1-$2')
    .replace(/([0-9])([A-Za-z])/g, '$1-$2')
    .toLowerCase();
}

function carbonTheme(name) {
  const theme = carbonThemes[name];
  if (!theme || typeof theme !== 'object') throw new Error(`build: @carbon/themes has no theme "${name}"`);
  const out = {};
  for (const key of Object.keys(theme).sort()) {
    const token = kebab(key);
    if (token in out) throw new Error(`build: kebab collision for ${key} in ${name}`);
    out[token] = theme[key];
  }
  return out;
}

// px suffix for icon sizes and *-px keys; other numbers (radius 0) are unitless.
function reikaValue(key, value) {
  if (typeof value === 'number') return key.startsWith('icon-') || key.endsWith('-px') ? `${value}px` : String(value);
  return String(value);
}

// Flat [name, value] list for the reika section; z-layers expand to z-<layer>.
function reikaEntries(reika) {
  const entries = [];
  for (const key of Object.keys(reika).sort()) {
    if (key === 'density') {
      entries.push([key, reika[key].default]);
    } else if (key === 'z-layers') {
      for (const layer of Object.keys(reika[key])) entries.push([`z-${layer}`, reika[key][layer]]);
    } else {
      entries.push([key, reika[key]]);
    }
  }
  return entries;
}

// Type scale: each REIKA step names a Carbon type style; size, line height (rounded to 1px = 0.0625rem) and letter
// spacing are read from @carbon/type, never copied.
function typeScale(map) {
  const out = {};
  for (const step of Object.keys(map)) {
    const style = carbonType[map[step]];
    if (!style || typeof style.fontSize !== 'string' || !style.fontSize.endsWith('rem')) {
      throw new Error(`build: @carbon/type has no rem style "${map[step]}" for ${step}`);
    }
    const size = parseFloat(style.fontSize);
    const lh = Math.round(size * Number(style.lineHeight) * 16) / 16;
    const ls = style.letterSpacing === 0 || style.letterSpacing === undefined ? '0' : String(style.letterSpacing);
    out[step] = { carbon: map[step], fontSize: style.fontSize, lineHeight: `${lh}rem`, letterSpacing: ls };
  }
  return out;
}

// Motion: durations and easings by Carbon key (@carbon/motion), never copied.
function motionTokens(map) {
  const out = {};
  for (const [name, key] of Object.entries(map.duration)) {
    if (typeof carbonMotion[key] !== 'string') throw new Error(`build: @carbon/motion has no duration ${key}`);
    out[name] = carbonMotion[key];
  }
  for (const [name, [kind, mode]] of Object.entries(map.easing)) {
    const v = carbonMotion.easings?.[kind]?.[mode];
    if (typeof v !== 'string') throw new Error(`build: @carbon/motion has no easing ${kind}.${mode}`);
    out[name] = v;
  }
  return out;
}

// Spacing scale: sp-01..sp-13 read from @carbon/layout (spacing01..spacing13), never copied.
function spacingTokens(steps) {
  const out = {};
  for (const n of steps) {
    const key = `spacing${n}`;
    const v = carbonLayout[key];
    if (typeof v !== 'string' || !v.endsWith('rem')) throw new Error(`build: @carbon/layout has no rem ${key}`);
    out[`sp-${n}`] = v;
  }
  return out;
}

export function buildOutputs(src) {
  if (src.version !== 1) throw new Error('build: src version must be 1');
  const names = src.carbon.themes; // { light: 'g10', dark: 'g100' }
  const light = { name: names.light, tokens: carbonTheme(names.light) };
  const dark = { name: names.dark, tokens: carbonTheme(names.dark) };
  for (const [label, theme] of [['light', light], ['dark', dark]]) {
    if (!Object.values(theme.tokens).some((v) => HEX.test(v))) throw new Error(`build: ${label} theme has no colours`);
  }
  for (const [label, list] of Object.entries(src.chart)) {
    if (list.length !== 5 || !list.every((c) => HEX.test(c))) throw new Error(`build: chart.${label} needs 5 hex colours`);
  }

  // REIKA colours that reference the Carbon palette by name (no hex in src).
  const palette = { light: {}, dark: {} };
  for (const [name, refs] of Object.entries(src['carbon-palette'])) {
    for (const theme of ['light', 'dark']) {
      const hex = carbonColors[refs[theme]];
      if (!HEX.test(hex ?? '')) throw new Error(`build: @carbon/colors has no ${refs[theme]} for ${name}`);
      palette[theme][name] = hex;
    }
  }
  const resolved = {
    version: 1,
    carbon: { themes: { light, dark } },
    reika: Object.fromEntries(Object.keys(src.reika).sort().map((k) => [k, src.reika[k]])),
    chart: { light: src.chart.light, dark: src.chart.dark },
    palette,
    type: typeScale(src['carbon-type']),
    motion: motionTokens(src['carbon-motion']),
    spacing: spacingTokens(src['carbon-spacing']),
    sources: src._sources,
  };
  // fs-N / lh-N / ls-N per type step, then the motion names.
  const typeLines = Object.entries(resolved.type).flatMap(([step, t]) => {
    const n = step.slice(3);
    return [[`fs-${n}`, t.fontSize], [`lh-${n}`, t.lineHeight], [`ls-${n}`, t.letterSpacing]];
  });
  const motionLines = Object.entries(resolved.motion);
  const spacingLines = Object.entries(resolved.spacing);
  const entries = reikaEntries(src.reika);
  const chartLines = (theme) => src.chart[theme].map((c, i) => `--rk-chart-${i + 1}: ${c};`);

  // tokens.json
  const jsonText = `${JSON.stringify(resolved, null, 2)}\n`;

  // _tokens.scss
  const scss = [
    '// GENERATED by @reika-ds/tokens scripts/build.mjs from src/tokens.json. Do not edit.',
    '// Carbon colours are not here: use the --cds-* custom properties from tokens.css.',
    '@use "sass:map";',
    '',
  ];
  for (const [name, value] of entries) {
    if (!name.startsWith('z-')) scss.push(`$${name}: ${reikaValue(name, value)};`);
  }
  scss.push('');
  scss.push('// Type scale, motion and spacing, resolved from @carbon/type, @carbon/motion and @carbon/layout.');
  for (const [name, value] of [...typeLines, ...motionLines, ...spacingLines]) scss.push(`$${name}: ${value};`);
  scss.push('');
  scss.push('$z-layers: (');
  for (const layer of Object.keys(src.reika['z-layers'])) scss.push(`  ${layer}: ${src.reika['z-layers'][layer]},`);
  scss.push(');');
  scss.push('@function z($layer) {');
  scss.push('  @if not map.has-key($z-layers, $layer) {');
  scss.push('    @error "Unknown z-layer: #{$layer}";');
  scss.push('  }');
  scss.push('  @return map.get($z-layers, $layer);');
  scss.push('}');
  scss.push('');
  scss.push('// Chart categorical palette (5 slots, light and dark). The only hex values in this file.');
  scss.push(`$rk-chart-light: (${src.chart.light.join(', ')});`);
  scss.push(`$rk-chart-dark: (${src.chart.dark.join(', ')});`);
  const scssText = `${scss.join('\n')}\n`;

  // tokens.css
  const cdsLines = (tokens) => Object.keys(tokens).map((k) => `--cds-${k}: ${tokens[k]};`);
  const rkLines = entries.map(([name, value]) => `--rk-${name}: ${reikaValue(name, value)};`);
  const paletteLines = (theme) => Object.keys(palette[theme]).map((n) => `--rk-${n}: ${palette[theme][n]};`);
  const scaleLines = [...typeLines, ...motionLines, ...spacingLines].map(([name, value]) => `--rk-${name}: ${value};`);
  const lightBlock = [...cdsLines(light.tokens), ...rkLines, ...scaleLines, ...chartLines('light'), ...paletteLines('light')];
  // A --rk-* value that points at a --cds-* token (e.g. scrim) must be declared again in the dark block: a custom
  // property's var() is resolved where it is declared, so the :root value would otherwise keep the light colour.
  const themeRefLines = entries.filter(([, value]) => String(value).startsWith('var(--cds-')).map(([name, value]) => `--rk-${name}: ${value};`);
  const darkBlock = [...cdsLines(dark.tokens), ...themeRefLines, ...chartLines('dark'), ...paletteLines('dark')];
  const indent = (lines, pad = '  ') => lines.map((l) => `${pad}${l}`).join('\n');
  const cssText = [
    '/* GENERATED by @reika-ds/tokens scripts/build.mjs. Do not edit. */',
    `:root {\n${indent(lightBlock)}\n}`,
    `[data-theme="dark"] {\n${indent(darkBlock)}\n}`,
    `@media (prefers-color-scheme: dark) {\n  :root:not([data-theme="light"]) {\n${indent(darkBlock, '    ')}\n  }\n}`,
    '',
  ].join('\n');

  // tokens.ts
  const tsText = [
    '// GENERATED by @reika-ds/tokens scripts/build.mjs. Do not edit.',
    `export const tokens = ${JSON.stringify(resolved, null, 2)} as const;`,
    'export type Tokens = typeof tokens;',
    'export default tokens;',
    '',
  ].join('\n');

  return { 'tokens.json': jsonText, '_tokens.scss': scssText, 'tokens.css': cssText, 'tokens.ts': tsText };
}

export async function build(dir = defaultDir) {
  const src = JSON.parse(await readFile(join(root, 'src', 'tokens.json'), 'utf8'));
  const outputs = buildOutputs(src);
  await mkdir(dir, { recursive: true });
  for (const [name, text] of Object.entries(outputs)) await writeFile(join(dir, name), text);
  return dir;
}

if (process.argv[1] && import.meta.url === pathToFileURL(resolve(process.argv[1])).href) {
  const dir = await build(process.argv[2] ? resolve(process.argv[2]) : defaultDir);
  console.log(`tokens: wrote ${dir}`);
}
