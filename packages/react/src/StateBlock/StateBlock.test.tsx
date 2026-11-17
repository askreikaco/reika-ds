import { describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/react';
import { StateBlock, type StateKind } from './StateBlock.js';

const TestIcon = () => <svg data-testid="state-icon" />;

describe('StateBlock', () => {
  it('minimal empty block: no icon, title, message or action', () => {
    const { container } = render(<StateBlock kind="empty" />);
    expect(container.querySelector('.rds-state-block')).toHaveClass('rds-state-block--empty');
    expect(screen.queryByTestId('state-icon')).toBeNull();
    expect(container.querySelector('.rds-state-block__title')).toBeNull();
    expect(container.querySelector('.rds-state-block__message')).toBeNull();
    expect(screen.queryByRole('button')).toBeNull();
  });

  it('every prop on a tile kind: icon, title, message and action are present', () => {
    const onAction = vi.fn();
    render(
      <StateBlock
        kind="locked"
        icon={TestIcon}
        title="Example title"
        message="Example message"
        action={<button type="button" onClick={onAction}>Example action</button>}
      />,
    );
    expect(screen.getByTestId('state-icon')).toBeInTheDocument();
    expect(screen.getByText('Example title')).toBeInTheDocument();
    expect(screen.getByText('Example message')).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Example action' }));
    expect(onAction).toHaveBeenCalledTimes(1);
  });

  it.each<StateKind>(['empty', 'locked', 'notFound'])('tile kind %s gets its modifier class', (kind) => {
    const { container, unmount } = render(<StateBlock kind={kind} title="Example title" />);
    expect(container.querySelector('.rds-state-block')).toHaveClass(`rds-state-block--${kind}`);
    unmount();
  });

  it('loading renders a skeleton inside a status region and no buttons', () => {
    const { container } = render(<StateBlock kind="loading" />);
    const region = screen.getByRole('status');
    expect(region).toHaveAttribute('aria-busy', 'true');
    expect(container.querySelector('.cds--skeleton__text')).not.toBeNull();
    expect(screen.queryByRole('button')).toBeNull();
  });

  it('error: notice with role alert and the given title', () => {
    render(<StateBlock kind="error" title="Example failure" message="Example detail" />);
    const alert = screen.getByRole('alert');
    expect(alert).toHaveTextContent('Example failure');
    expect(screen.getByText('Example detail')).toBeInTheDocument();
  });

  it('error without onRetry has no Retry button; with onRetry it calls the handler', () => {
    const onRetry = vi.fn();
    const { unmount } = render(<StateBlock kind="error" title="Example failure" />);
    expect(screen.queryByRole('button', { name: 'Retry' })).toBeNull();
    unmount();

    render(<StateBlock kind="error" title="Example failure" onRetry={onRetry} />);
    fireEvent.click(screen.getByRole('button', { name: 'Retry' }));
    expect(onRetry).toHaveBeenCalledTimes(1);
  });

  it('error with an action but no onRetry: the action shows and Retry does not', () => {
    render(<StateBlock kind="error" title="Example failure" action={<button type="button">Example action</button>} />);
    expect(screen.getByRole('button', { name: 'Example action' })).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Retry' })).toBeNull();
  });

  it('error uses a default title when none is given', () => {
    render(<StateBlock kind="error" />);
    expect(screen.getByRole('alert')).toHaveTextContent('Something went wrong');
  });
});
