import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Progress, type ProgressStepItem } from './Progress.js';

const STEPS: ProgressStepItem[] = [
  { label: 'Example first', state: 'done' },
  { label: 'Example second', description: 'Example second text', state: 'current' },
  { label: 'Example third', state: 'pending' },
];

describe('Progress', () => {
  it('bar minimal: a progressbar with the value and max 100, and no label text', () => {
    const { container } = render(<Progress kind="bar" value={40} />);
    const bar = screen.getByRole('progressbar');
    expect(bar).toHaveAttribute('aria-valuenow', '40');
    expect(bar).toHaveAttribute('aria-valuemax', '100');
    expect(container.querySelector('.cds--progress-bar__label-text')).toHaveTextContent('');
  });

  it('bar every prop: visible label, helper and max', () => {
    const { container } = render(<Progress kind="bar" value={3} max={4} label="Example upload" helper="Example helper" />);
    expect(screen.getByText('Example upload')).toBeInTheDocument();
    expect(screen.getByText('Example helper')).toBeInTheDocument();
    expect(screen.getByRole('progressbar')).toHaveAttribute('aria-valuemax', '4');
  });

  it('steps: the current step is marked, done steps are complete, and the state text is read', () => {
    const { container } = render(<Progress kind="steps" steps={STEPS} label="Example steps" />);
    expect(screen.getByRole('group', { name: 'Example steps' })).toBeInTheDocument();
    expect(container.querySelectorAll('.cds--progress-step--current')).toHaveLength(1);
    expect(container.querySelectorAll('.cds--progress-step--complete')).toHaveLength(1);
    expect(screen.getByText('Example second text')).toBeInTheDocument();
    expect(screen.getByText('Done')).toBeInTheDocument();
    expect(screen.getByText('Current')).toBeInTheDocument();
  });

  it('labels override the state text; vertical and helper are rendered', () => {
    const { container } = render(
      <Progress kind="steps" steps={STEPS} vertical helper="Example helper" labels={{ done: 'Example finished', pending: 'Example waiting' }} />,
    );
    expect(container.querySelector('.rds-progress--vertical')).not.toBeNull();
    expect(screen.getByText('Example finished')).toBeInTheDocument();
    expect(screen.getByText('Example waiting')).toBeInTheDocument();
    expect(screen.queryByText('Done')).toBeNull();
    expect(screen.getByText('Example helper')).toBeInTheDocument();
  });

  it('steps with every step done: no step is current, every step is complete', () => {
    const { container } = render(
      <Progress kind="steps" steps={[{ label: 'Example a', state: 'done' }, { label: 'Example b', state: 'done' }]} />,
    );
    expect(container.querySelectorAll('.cds--progress-step--current')).toHaveLength(0);
    expect(container.querySelectorAll('.cds--progress-step--complete')).toHaveLength(2);
  });
});
