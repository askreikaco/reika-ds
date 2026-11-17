import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

export const root = join(dirname(fileURLToPath(import.meta.url)), '..');
export const dist = (name: string): string => readFileSync(join(root, 'dist', name), 'utf8');

export interface DistTokens {
  version: number;
  carbon: { themes: Record<'light' | 'dark', { name: string; tokens: Record<string, string> }> };
  reika: Record<string, unknown>;
  chart: { light: string[]; dark: string[] };
}
export const distTokens = (): DistTokens => JSON.parse(dist('tokens.json')) as DistTokens;

// Parses "--name: value;" declarations inside the block that starts at `selector`.
export function cssBlock(css: string, selector: string): Record<string, string> {
  const start = css.indexOf(selector);
  if (start < 0) throw new Error(`no block ${selector}`);
  const open = css.indexOf('{', start);
  const close = css.indexOf('\n}', open);
  const out: Record<string, string> = {};
  for (const m of css.slice(open, close).matchAll(/--([a-z0-9-]+):\s*([^;]+);/g)) out[m[1]] = m[2].trim();
  return out;
}
