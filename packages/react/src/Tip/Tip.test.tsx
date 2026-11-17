import { describe, expect, it } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/react';
import { Tip } from './Tip.js';

describe('Tip', () => {
  it('minimal props: info trigger named by label, content hidden until opened', () => {
    render(<Tip variant="info" label="Example help">Example content</Tip>);
    const trigger = screen.getByRole('button', { name: 'Example help' });
    expect(trigger).toHaveAttribute('aria-expanded', 'false');
    fireEvent.click(trigger);
    expect(trigger).toHaveAttribute('aria-expanded', 'true');
    expect(screen.getByText('Example content')).toBeInTheDocument();
  });

  it('term: the label is the visible underlined text and the accessible name', () => {
    const { container } = render(<Tip variant="term" label="Example term">Example content</Tip>);
    const trigger = screen.getByRole('button', { name: 'Example term' });
    expect(trigger).toHaveTextContent('Example term');
    expect(container.querySelector('.rds-tip--term')).not.toBeNull();
    expect(container.querySelector('.rds-tip__term-text')).toHaveTextContent('Example term');
    fireEvent.click(trigger);
    expect(trigger).toHaveAttribute('aria-expanded', 'true');
    expect(screen.getByText('Example content')).toBeInTheDocument();
  });

  it('detail: the visible trigger text is "Details" by default and the label is the accessible name', () => {
    render(<Tip variant="detail" label="Example detail">Example content</Tip>);
    const trigger = screen.getByRole('button', { name: 'Example detail' });
    expect(trigger).toHaveTextContent('Details');
    fireEvent.click(trigger);
    expect(trigger).toHaveAttribute('aria-expanded', 'true');
    expect(screen.getByText('Example content')).toBeInTheDocument();
  });

  it('labels.detail replaces the visible detail text; align sets the placement', () => {
    const { container } = render(
      <Tip variant="detail" label="Example detail" labels={{ detail: 'Example more' }} align="top">
        Example content
      </Tip>,
    );
    expect(screen.getByRole('button', { name: 'Example detail' })).toHaveTextContent('Example more');
    expect(screen.queryByText('Details')).toBeNull();
    expect(container.querySelector('.cds--popover--top')).not.toBeNull();
  });
});
