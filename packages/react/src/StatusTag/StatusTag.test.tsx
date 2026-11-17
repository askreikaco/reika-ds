import { describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/react';
import { StatusTag, STATUS_TONE_TYPE, type StatusTone } from './StatusTag.js';

const TestIcon = () => <svg data-testid="status-icon" />;

describe('StatusTag', () => {
  it('minimal props: text only, no icon, count or dismiss button', () => {
    render(<StatusTag>Example status</StatusTag>);
    expect(screen.getByText('Example status')).toBeInTheDocument();
    expect(screen.queryByTestId('status-icon')).toBeNull();
    expect(screen.queryByRole('button')).toBeNull();
    expect(document.querySelector('.rds-status-tag__count')).toBeNull();
  });

  it('every prop: icon, count and dismiss button are present', () => {
    const onClose = vi.fn();
    render(
      <StatusTag tone="warn" icon={TestIcon} count={3} onClose={onClose} size="md">
        Example status
      </StatusTag>,
    );
    expect(screen.getByTestId('status-icon')).toBeInTheDocument();
    expect(screen.getByText(/Example status \(3\)/)).toBeInTheDocument();
    const dismiss = screen.getByRole('button', { name: 'Dismiss' });
    fireEvent.click(dismiss);
    expect(onClose).toHaveBeenCalledTimes(1);
    expect(document.querySelector('.cds--tag--md')).not.toBeNull();
  });

  it('count 0 still renders (only undefined hides it)', () => {
    const { container } = render(<StatusTag count={0}>Example status</StatusTag>);
    expect(container.querySelector('.rds-status-tag__count')).toHaveTextContent('0');
  });

  it.each<[StatusTone, string]>([
    ['good', 'green'],
    ['bad', 'red'],
    ['warn', 'magenta'],
    ['info', 'blue'],
    ['neutral', 'gray'],
    ['cool', 'cool-gray'],
  ])('tone %s maps to Carbon type %s', (tone, type) => {
    expect(STATUS_TONE_TYPE[tone]).toBe(type);
    const { container, unmount } = render(<StatusTag tone={tone}>Example status</StatusTag>);
    expect(container.querySelector('.cds--tag')).toHaveClass(`cds--tag--${type}`);
    unmount();
  });

  it('defaults to neutral (gray) when tone is omitted', () => {
    const { container } = render(<StatusTag>Example status</StatusTag>);
    expect(container.querySelector('.cds--tag')).toHaveClass('cds--tag--gray');
  });

  it('labels.dismiss replaces the default dismiss name', () => {
    render(<StatusTag labels={{ dismiss: 'Example remove' }} onClose={() => {}}>Example status</StatusTag>);
    expect(screen.getByRole('button', { name: 'Example remove' })).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Dismiss' })).toBeNull();
  });
});
