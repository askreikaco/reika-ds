import { readFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import * as sass from 'sass';

export const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
export const distCss = (): string => readFileSync(join(root, 'dist', 'reika-ds.css'), 'utf8');
export const sourceFile = (name: string): string => readFileSync(join(root, 'src', name), 'utf8');

// Same load paths as scripts/build.mjs, so probes resolve the same Carbon pin.
const loadPaths = [join(root, 'node_modules'), join(root, '..', '..', 'node_modules')];

// Compiles a Sass snippet against the pinned Carbon and returns the declared values by name.
export function probe(snippet: string): Record<string, string> {
  const css = sass.compileString(`${snippet}`, { loadPaths, logger: sass.Logger.silent, quietDeps: true }).css;
  const out: Record<string, string> = {};
  for (const m of css.matchAll(/([\w-]+):\s*([^;]+);/g)) out[m[1]] = m[2].trim();
  return out;
}

// Declarations of the first rule whose selector is exactly `.<className>`.
export function ruleDeclarations(css: string, className: string): Record<string, string> {
  const start = css.indexOf(`.${className} {`);
  if (start < 0) throw new Error(`no rule for .${className}`);
  const open = css.indexOf('{', start);
  const close = css.indexOf('}', open);
  const out: Record<string, string> = {};
  for (const m of css.slice(open + 1, close).matchAll(/([\w-]+):\s*([^;]+);/g)) out[m[1]] = m[2].trim();
  return out;
}
