// Writes the class reference between the markers in README.md from dist/reika-ds.css.
// Usage: node scripts/readme-classes.mjs [--check]   (--check exits 1 when README is out of date)
import { readFile, writeFile } from 'node:fs/promises';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const BEGIN = '<!-- classes:begin -->';
const END = '<!-- classes:end -->';

const GROUPS = [
  ['Spacing (Carbon $spacing-01..10)', /^rk-(p|px|py|pt|pr|pb|pl|m|mx|my|mt|mr|mb|ml)-\d\d$/],
  ['Type (Carbon type-style)', /^rk-type--/],
  ['Text colour (semantic tokens)', /^rk-text-/],
  ['Background colour (semantic tokens)', /^rk-bg-/],
  ['Border colour (semantic tokens)', /^rk-border-/],
  ['Stacking (REIKA z-layers)', /^rk-z-/],
  ['Show/hide at Carbon breakpoints', /^rk-hide-/],
  ['Layout', /^rk-(row|col|wrap|between|center)$/],
  ['Text, numbers and overflow', /^rk-(truncate|truncate-front|tabular|scroll-x)$/],
  ['Measure (REIKA tokens)', /^rk-measure-/],
];

export function classNames(css) {
  return [...new Set([...css.matchAll(/\.(rk-[A-Za-z0-9_-]+)/g)].map((m) => m[1]))];
}

export function renderBlock(names) {
  const lines = [];
  for (const [title, pattern] of GROUPS) {
    const members = names.filter((n) => pattern.test(n));
    if (members.length === 0) continue;
    lines.push(`**${title}** (${members.length})`, '', members.map((n) => `\`${n}\``).join(', '), '');
  }
  const covered = GROUPS.flatMap(([, p]) => names.filter((n) => p.test(n)));
  const rest = names.filter((n) => !covered.includes(n));
  if (rest.length) lines.push(`**Other** (${rest.length})`, '', rest.map((n) => `\`${n}\``).join(', '), '');
  lines.push(`Total: ${names.length} classes.`);
  return lines.join('\n');
}

if (process.argv[1] && import.meta.url === new URL(`file://${resolve(process.argv[1])}`).href) {
  const css = await readFile(join(root, 'dist', 'reika-ds.css'), 'utf8');
  const readmePath = join(root, 'README.md');
  const readme = await readFile(readmePath, 'utf8');
  const body = `${BEGIN}\n${renderBlock(classNames(css))}\n${END}`;
  const start = readme.indexOf(BEGIN);
  const end = readme.indexOf(END);
  if (start < 0 || end < 0) throw new Error('README.md is missing the classes markers');
  const next = readme.slice(0, start) + body + readme.slice(end + END.length);
  if (process.argv.includes('--check')) {
    if (next !== readme) {
      console.error('README class reference is out of date; run: node scripts/readme-classes.mjs');
      process.exit(1);
    }
    console.log('README class reference is up to date');
  } else {
    await writeFile(readmePath, next);
    console.log(`README class reference written (${classNames(css).length} classes)`);
  }
}
