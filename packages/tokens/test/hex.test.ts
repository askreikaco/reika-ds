import { describe, expect, it } from 'vitest';
import { dist } from './helpers';

describe('no hex outside the chart palette', () => {
  it('_tokens.scss has hex only on the $rk-chart lines', () => {
    const lines = dist('_tokens.scss').split('\n');
    const outside = lines.filter((l) => !l.startsWith('$rk-chart-') && /#[0-9a-f]{3,8}\b/i.test(l));
    expect(outside).toEqual([]);
    const chart = lines.filter((l) => l.startsWith('$rk-chart-'));
    expect(chart).toHaveLength(2);
    for (const l of chart) expect(l.match(/#[0-9a-f]{6}\b/gi)).toHaveLength(5);
  });
});
