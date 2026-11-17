import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import { NumCell } from './NumCell.js';

describe('NumCell', () => {
  it('minimal props: a number formatted for vi-VN, no unit, trend or end alignment', () => {
    const { container } = render(<NumCell value={1234.5} />);
    expect(screen.getByText('1.234,5')).toBeInTheDocument();
    expect(container.querySelector('.rds-num-cell__value')).toHaveClass('rk-tabular');
    expect(container.querySelector('.rds-num-cell__unit')).toBeNull();
    expect(container.querySelector('.rds-num-cell__trend')).toBeNull();
    expect(container.querySelector('.rds-num-cell--end')).toBeNull();
  });

  it('string values are shown as given, not formatted', () => {
    render(<NumCell value="1.2M" />);
    expect(screen.getByText('1.2M')).toBeInTheDocument();
  });

  it('every prop: unit, end, large, trend and format', () => {
    const { container } = render(
      <NumCell
        value={12}
        unit="Example unit"
        end
        large
        format={{ minimumFractionDigits: 2 }}
        trend={{ dir: 'up', text: 'Example trend' }}
      />,
    );
    expect(screen.getByText('12,00')).toBeInTheDocument();
    expect(screen.getByText('Example unit')).toBeInTheDocument();
    expect(container.querySelector('.rds-num-cell--end.rds-num-cell--large')).not.toBeNull();
    expect(container.querySelector('.rds-num-cell__trend--up')).toHaveTextContent('Up');
    expect(screen.getByText('Example trend')).toBeInTheDocument();
  });

  it.each([
    ['up', 'Up'],
    ['down', 'Down'],
    ['flat', 'No change'],
  ] as const)('trend %s has an icon and a screen-reader word, so colour is not the only cue', (dir, word) => {
    const { container, unmount } = render(<NumCell value={5} trend={{ dir, text: 'Example trend' }} />);
    expect(container.querySelector(`.rds-num-cell__trend--${dir} svg`)).not.toBeNull();
    expect(container.querySelector(`.rds-num-cell__trend--${dir} .cds--visually-hidden`)).toHaveTextContent(word);
    unmount();
  });

  it('labels override the screen-reader trend words', () => {
    const { container } = render(
      <NumCell value={5} trend={{ dir: 'down', text: 'Example trend' }} labels={{ down: 'Example lower' }} />,
    );
    expect(container.querySelector('.rds-num-cell__trend--down .cds--visually-hidden')).toHaveTextContent('Example lower');
  });

  it('locale overrides the default vi-VN formatting', () => {
    render(<NumCell value={1234.5} locale="en-US" />);
    expect(screen.getByText('1,234.5')).toBeInTheDocument();
  });
});
