// Consumer lint for apps that write their own scss/css on top of @reika-ds/styles.
// Usage: node scripts/lint-consumer.mjs <file-or-dir> [...]   (exit 1 on any violation)
// Rules:
//   raw-hex            no #rgb/#rrggbb literals; use var(--cds-*) or var(--rk-*)
//   raw-px             px only as 0 or 1px; use Carbon/REIKA tokens (rem) otherwise
//   raw-z-index        no numeric z-index; use the rk-z-* classes or the --rk-z-* values
//   internal-override  no descendant/child selector that targets .cds-- or .rk- internals
import { readdir, readFile, stat } from 'node:fs/promises';
import { join, extname, resolve, relative } from 'node:path';
import { fileURLToPath } from 'node:url';

const EXTENSIONS = new Set(['.scss', '.css']);
const HEX = /#(?:[0-9a-fA-F]{3,4}|[0-9a-fA-F]{6}|[0-9a-fA-F]{8})(?![\w-])/g;
const PX = /(?<![\w.])(\d*\.?\d+)px\b/g;
const Z_INDEX = /z-index\s*:\s*-?\d+/g;
const INTERNAL = /\.(?:cds--|rk-)[\w-]+/;

// Replaces comments with spaces (newlines kept, so line numbers stay right).
export function stripComments(text) {
  const blank = (m) => m.replace(/[^\n]/g, ' ');
  return text
    .replace(/\/\*[\s\S]*?\*\//g, blank)
    .replace(/(^|\s)\/\/[^\n]*/gm, (m, lead) => lead + blank(m.slice(lead.length)));
}

function lineOf(text, index) {
  return text.slice(0, index).split('\n').length;
}

function scanPattern(text, pattern, rule, message, onMatch = () => true) {
  const out = [];
  for (const m of text.matchAll(pattern)) {
    if (!onMatch(m)) continue;
    out.push({ rule, line: lineOf(text, m.index), text: m[0].trim(), message });
  }
  return out;
}

function internalOverrides(text) {
  const out = [];
  for (const m of text.matchAll(/([^{};]+)\{/g)) {
    const selector = m[1].trim();
    if (!selector || selector.startsWith('@')) continue;
    for (const complex of selector.split(',')) {
      const tokens = complex.trim().replace(/\s*([>+~])\s*/g, ' $1 ').split(/\s+/).filter(Boolean);
      if (tokens.length > 1 && tokens.some((t) => INTERNAL.test(t))) {
        out.push({
          rule: 'internal-override',
          line: lineOf(text, m.index + m[0].indexOf(complex.trim())),
          text: complex.trim(),
          message: 'selector overrides .cds-- or .rk- internals through a descendant/child combinator',
        });
      }
    }
  }
  return out;
}

// Returns violations for one file's text: [{ rule, line, text, message }].
export function lintText(raw) {
  const text = stripComments(raw);
  return [
    ...scanPattern(text, HEX, 'raw-hex', 'raw hex colour; use a Carbon token (var(--cds-*)) or var(--rk-*)'),
    ...scanPattern(text, PX, 'raw-px', 'raw px; use rem or a token (only 0 and 1px are allowed)', (m) => {
      const value = parseFloat(m[1]);
      return !(value === 0 || value === 1);
    }),
    ...scanPattern(text, Z_INDEX, 'raw-z-index', 'numeric z-index; use the rk-z-* classes or var(--rk-z-*)'),
    ...internalOverrides(text),
  ];
}

async function collect(path, out) {
  const info = await stat(path);
  if (info.isDirectory()) {
    for (const entry of (await readdir(path)).sort()) await collect(join(path, entry), out);
  } else if (EXTENSIONS.has(extname(path))) {
    out.push(path);
  }
  return out;
}

// Lints files or directories. Returns [{ file, rule, line, text, message }].
export async function lintPaths(paths) {
  const files = [];
  for (const p of paths) await collect(resolve(p), files);
  const results = [];
  for (const file of files) {
    for (const v of lintText(await readFile(file, 'utf8'))) {
      results.push({ file, ...v });
    }
  }
  return results;
}

if (process.argv[1] && fileURLToPath(import.meta.url) === resolve(process.argv[1])) {
  const paths = process.argv.slice(2);
  if (paths.length === 0) {
    console.error('usage: lint-consumer.mjs <file-or-dir> [...]');
    process.exit(2);
  }
  const results = await lintPaths(paths);
  for (const r of results) {
    console.error(`${relative(process.cwd(), r.file)}:${r.line}: [${r.rule}] ${r.message}: ${r.text}`);
  }
  console.log(`lint-consumer: ${results.length} violation(s)`);
  process.exit(results.length ? 1 : 0);
}
