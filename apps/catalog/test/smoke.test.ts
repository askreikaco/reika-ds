import { describe, expect, it } from 'vitest';
import { version } from 'react';

describe('catalog smoke', () => {
  it('resolves the React import', () => {
    expect(version).toBe('18.3.1');
  });
});
