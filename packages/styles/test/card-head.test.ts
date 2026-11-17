import { describe, expect, it } from 'vitest';
import { distCss, ruleDeclarations } from './helpers';

// Card header: the title takes the free width, the tools keep their size, and the head may wrap on narrow cards.
describe('card header row', () => {
  it('head wraps so a long title on a phone drops the action below it', () => {
    expect(ruleDeclarations(distCss(), 'rds-card__head')['flex-wrap']).toBe('wrap');
  });

  it('title takes the free width and shrinks (flex: 1 1 0)', () => {
    expect(ruleDeclarations(distCss(), 'rds-card__title').flex).toBe('1 1 0');
  });

  it('tools and action never shrink (flex: 0 0 auto)', () => {
    expect(ruleDeclarations(distCss(), 'rds-card__tools').flex).toBe('0 0 auto');
  });
});
