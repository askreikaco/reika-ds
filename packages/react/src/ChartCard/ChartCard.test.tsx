import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import { ChartCard, type ChartHeight } from './ChartCard.js';

describe('ChartCard', () => {
  it('minimal props: a Card with the chart in a md box, no header, legend or empty state', () => {
    const { container } = render(<ChartCard>Example chart</ChartCard>);
    expect(container.querySelector('.rds-card.rds-chart-card')).not.toBeNull();
    expect(screen.getByText('Example chart')).toBeInTheDocument();
    expect(container.querySelector('.rds-chart-card__box--md')).toContainElement(screen.getByText('Example chart'));
    expect(screen.queryByRole('heading')).toBeNull();
    expect(container.querySelector('.rds-card__footer')).toBeNull();
  });

  it('every prop: title, meta, action and legend in the Card slots', () => {
    const { container } = render(
      <ChartCard
        title="Example chart title"
        meta="Example meta"
        action={<button type="button">Example action</button>}
        legend="Example legend"
        height="lg"
      >
        Example chart
      </ChartCard>,
    );
    expect(screen.getByRole('heading', { level: 2, name: 'Example chart title' })).toBeInTheDocument();
    expect(screen.getByText('Example meta')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Example action' })).toBeInTheDocument();
    expect(container.querySelector('.rds-card__footer')).toHaveTextContent('Example legend');
    expect(container.querySelector('.rds-chart-card__box--lg')).not.toBeNull();
  });

  it.each<[ChartHeight]>([['sm'], ['md'], ['lg'], ['lg-sm']])('height %s sets its box modifier', (height) => {
    const { container, unmount } = render(<ChartCard height={height}>Example chart</ChartCard>);
    expect(container.querySelector('.rds-chart-card__box')).toHaveClass(`rds-chart-card__box--${height}`);
    unmount();
  });

  it('empty: shows the empty StateBlock and not the chart', () => {
    render(<ChartCard empty={{ title: 'Example empty', message: 'Example message' }}>Example chart</ChartCard>);
    expect(screen.getByText('Example empty')).toBeInTheDocument();
    expect(screen.getByText('Example message')).toBeInTheDocument();
    expect(screen.queryByText('Example chart')).toBeNull();
  });
});
