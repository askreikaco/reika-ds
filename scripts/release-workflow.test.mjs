import { readFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const WORKFLOW = join(ROOT, '.github', 'workflows', 'release.yml');

// Returns the job's step items ("      - ..." blocks) as text. Indentation-based,
// as the workflow uses plain block YAML with no anchors or flow steps.
export function jobSteps(text) {
  const lines = text.split('\n');
  const start = lines.indexOf('    steps:');
  if (start < 0) throw new Error('release job has no steps block');
  const steps = [];
  for (const line of lines.slice(start + 1)) {
    if (/^ {0,4}\S/.test(line)) break;
    if (/^ {6}- /.test(line)) steps.push(`${line}\n`);
    else if (steps.length && /^ {8}/.test(line)) steps[steps.length - 1] += `${line}\n`;
  }
  return steps;
}

describe('release workflow', () => {
  const steps = jobSteps(readFileSync(WORKFLOW, 'utf8'));

  it('checks out the repo as the first step, before any step reads repo files', () => {
    expect(steps.length).toBeGreaterThan(1);
    expect(steps[0]).toMatch(/uses: actions\/checkout@/);
  });

  it('resolves VERSION only after checkout', () => {
    const checkout = steps.findIndex((s) => /uses: actions\/checkout@/.test(s));
    const resolveIdx = steps.findIndex((s) => /name: Resolve version/.test(s));
    expect(checkout).toBeGreaterThanOrEqual(0);
    expect(resolveIdx).toBeGreaterThan(checkout);
  });
});
