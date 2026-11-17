import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import { LabelValue } from './LabelValue.js';

describe('LabelValue', () => {
  it('minimal props: label and value as term and definition, stack layout, no end slot', () => {
    const { container } = render(<LabelValue label="Example label" value="Example value" />);
    expect(screen.getByRole('term')).toHaveTextContent('Example label');
    expect(screen.getByRole('definition')).toHaveTextContent('Example value');
    expect(container.querySelector('.rds-label-value--stack')).not.toBeNull();
    expect(container.querySelector('.rds-label-value--dense')).toBeNull();
    expect(container.querySelector('.rds-label-value__end')).toBeNull();
  });

  it('every prop: dense, end and inline layout are present', () => {
    const { container } = render(
      <LabelValue label="Example label" value="Example value" dense layout="inline" end={<button type="button">Example end</button>} />,
    );
    expect(container.querySelector('.rds-label-value--inline.rds-label-value--dense')).not.toBeNull();
    expect(container.querySelector('.rds-label-value__end')).toContainElement(screen.getByRole('button', { name: 'Example end' }));
  });

  it('end sits outside the description list', () => {
    const { container } = render(<LabelValue label="Example label" value="Example value" end="Example end" />);
    expect(container.querySelector('dl')).not.toContainElement(screen.getByText('Example end'));
  });
});
