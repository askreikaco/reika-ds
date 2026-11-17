import { describe, expect, it } from 'vitest';
import { distCss, probe, ruleDeclarations } from './helpers';

const steps = Array.from({ length: 10 }, (_, i) => String(i + 1).padStart(2, '0'));
const carbon = probe(
  `@use '@carbon/styles/scss/spacing' as s; a { ${steps.map((n) => `v${n}: s.$spacing-${n};`).join(' ')} }`,
);

describe('spacing utilities use Carbon spacing values', () => {
  it('rk-p-05 equals Carbon $spacing-05', () => {
    const decl = ruleDeclarations(distCss(), 'rk-p-05');
    expect(decl.padding).toBe(carbon.v05);
  });

  it.each(steps.map((n) => [n, n]))('rk-m-%s equals Carbon $spacing-%s', (n) => {
    expect(ruleDeclarations(distCss(), `rk-m-${n}`).margin).toBe(carbon[`v${n}`]);
  });

  it.each(steps.map((n) => [n]))('rk-pt-%s uses the Carbon value (logical block-start)', (n) => {
    expect(ruleDeclarations(distCss(), `rk-pt-${n}`)['padding-block-start']).toBe(carbon[`v${n}`]);
  });
});
