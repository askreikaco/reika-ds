import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Stat, StatGrid, type StatSize, type StatTone } from './Stat.js';

const TestSpark = () => <svg data-testid="spark" />;

describe('Stat', () => {
  it('minimal props: label and value only', () => {
    const { container } = render(<Stat label="Example label" value="42" />);
    expect(screen.getByText('Example label')).toBeInTheDocument();
    expect(screen.getByText('42')).toBeInTheDocument();
    expect(container.querySelector('.rds-stat__sub')).toBeNull();
    expect(container.querySelector('.rds-stat__trend')).toBeNull();
    expect(container.querySelector('.rds-stat__sparkline')).toBeNull();
    expect(container.querySelector('.cds--tile')).toBeNull();
  });

  it('every prop: sub, trend, sparkline and tile are present', () => {
    const { container } = render(
      <Stat
        label="Example label"
        value="42"
        sub="Example sub"
        size="lg"
        tone="success"
        trend={{ dir: 'up', text: 'Example trend' }}
        sparkline={<TestSpark />}
        tile
      />,
    );
    expect(screen.getByText('Example sub')).toBeInTheDocument();
    expect(screen.getByText('Example trend')).toBeInTheDocument();
    expect(screen.getByTestId('spark')).toBeInTheDocument();
    expect(container.querySelector('.rds-stat--tile.cds--tile')).not.toBeNull();
    expect(container.querySelector('.rds-stat__value')).toHaveClass('rds-stat__value--lg', 'rds-stat__value--success');
  });

  it.each<[StatSize]>([['sm'], ['md'], ['lg']])('size %s sets the value modifier', (size) => {
    const { container, unmount } = render(<Stat label="Example label" value="42" size={size} />);
    expect(container.querySelector('.rds-stat__value')).toHaveClass(`rds-stat__value--${size}`);
    unmount();
  });

  it.each<[StatTone]>([['neutral'], ['success'], ['error']])('tone %s sets the value modifier', (tone) => {
    const { container, unmount } = render(<Stat label="Example label" value="42" tone={tone} />);
    expect(container.querySelector('.rds-stat__value')).toHaveClass(`rds-stat__value--${tone}`);
    unmount();
  });

  it('defaults to size md and a div root', () => {
    const { container } = render(<Stat label="Example label" value="42" />);
    expect(container.querySelector('.rds-stat')?.tagName).toBe('DIV');
    expect(container.querySelector('.rds-stat__value')).toHaveClass('rds-stat__value--md');
  });

  it('as="td" renders a table cell', () => {
    const { container } = render(
      <table>
        <tbody>
          <tr>
            <Stat as="td" label="Example label" value="42" />
          </tr>
        </tbody>
      </table>,
    );
    expect(container.querySelector('td.rds-stat')).not.toBeNull();
  });

  it('trend shows its direction class', () => {
    const { container } = render(<Stat label="Example label" value="42" trend={{ dir: 'down', text: 'Example trend' }} />);
    expect(container.querySelector('.rds-stat__trend')).toHaveClass('rds-stat__trend--down');
  });
});

describe('StatGrid', () => {
  it('lays each child in a Carbon Column; cols 3 is 5 of 16 columns on large screens', () => {
    const { container } = render(
      <StatGrid cols={3}>
        <Stat label="Example one" value="1" />
        <Stat label="Example two" value="2" />
        <Stat label="Example three" value="3" />
      </StatGrid>,
    );
    expect(screen.getByText('Example two')).toBeInTheDocument();
    expect(container.querySelectorAll('[class*="lg:col-span-5"]')).toHaveLength(3);
  });

  it('cols 2 and 4 set their large-screen spans', () => {
    const { container, unmount } = render(
      <StatGrid cols={2}>
        <Stat label="Example one" value="1" />
        <Stat label="Example two" value="2" />
      </StatGrid>,
    );
    expect(container.querySelectorAll('[class*="lg:col-span-8"]')).toHaveLength(2);
    unmount();
    const four = render(
      <StatGrid cols={4}>
        <Stat label="Example one" value="1" />
      </StatGrid>,
    );
    expect(four.container.querySelectorAll('[class*="lg:col-span-4"]')).toHaveLength(1);
  });
});
