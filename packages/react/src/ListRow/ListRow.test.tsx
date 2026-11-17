import { describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/react';
import { ListRow } from './ListRow.js';

const TestLeading = () => <svg data-testid="row-leading" />;

// ListRow renders li elements, so every test puts it in a ul.
const inList = (node: React.ReactNode) => <ul>{node}</ul>;

describe('ListRow', () => {
  it('minimal props: title only, not interactive', () => {
    const { container } = render(inList(<ListRow title="Example row" />));
    expect(screen.getByText('Example row')).toBeInTheDocument();
    expect(screen.queryByRole('button')).toBeNull();
    expect(screen.queryByRole('link')).toBeNull();
    expect(container.querySelector('.rds-list-row__meta')).toBeNull();
    expect(container.querySelector('.rds-list-row__badge')).toBeNull();
    expect(container.querySelector('.rds-list-row__end')).toBeNull();
    expect(container.querySelector('.rds-list-row__chevron')).toBeNull();
    expect(container.querySelector('.rds-list-row__leading')).toBeNull();
  });

  it('every prop: leading, meta, badge, end, chevron and error icon are present', () => {
    const { container } = render(
      inList(
        <ListRow
          title="Example row"
          leading={<TestLeading />}
          meta="Example meta"
          badge={<span>Example badge</span>}
          end={<span>Example end</span>}
          chevron
          error
          onClick={() => {}}
        />,
      ),
    );
    expect(screen.getByTestId('row-leading')).toBeInTheDocument();
    expect(screen.getByText('Example meta')).toBeInTheDocument();
    expect(screen.getByText('Example badge')).toBeInTheDocument();
    expect(screen.getByText('Example end')).toBeInTheDocument();
    expect(container.querySelector('.rds-list-row__chevron')).not.toBeNull();
    expect(container.querySelector('.rds-list-row__error-icon')).not.toBeNull();
  });

  it('onClick makes the row a button named by its title; the handler runs', () => {
    const onClick = vi.fn();
    render(inList(<ListRow title="Example row" onClick={onClick} />));
    fireEvent.click(screen.getByRole('button', { name: 'Example row' }));
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it('href makes the row a link named by its title', () => {
    render(inList(<ListRow title="Example row" href="#example" />));
    expect(screen.getByRole('link', { name: 'Example row' })).toHaveAttribute('href', '#example');
  });

  it('disabled interactive row: button is disabled, link is not rendered', () => {
    const { container, unmount } = render(inList(<ListRow title="Example row" onClick={() => {}} disabled />));
    expect(screen.getByRole('button', { name: 'Example row' })).toBeDisabled();
    unmount();
    render(inList(<ListRow title="Example other" href="#example" disabled />));
    expect(screen.queryByRole('link')).toBeNull();
    expect(container.querySelector('[aria-disabled="true"]')).toBeNull();
  });

  it('disabled non-interactive row is marked aria-disabled', () => {
    const { container } = render(inList(<ListRow title="Example row" disabled />));
    expect(container.querySelector('li')).toHaveAttribute('aria-disabled', 'true');
  });

  it.each<['default' | 'compact']>([['default'], ['compact']])('density %s sets its modifier class', (density) => {
    const { container, unmount } = render(inList(<ListRow title="Example row" density={density} />));
    expect(container.querySelector('li')).toHaveClass(`rds-list-row--${density}`);
    unmount();
  });

  it('muted sets the muted modifier', () => {
    const { container } = render(inList(<ListRow title="Example row" muted />));
    expect(container.querySelector('li')).toHaveClass('rds-list-row--muted');
  });

  it('every interactive row has an accessible name', () => {
    render(
      inList(
        <>
          <ListRow title="Example button row" onClick={() => {}} />
          <ListRow title="Example link row" href="#example" />
        </>,
      ),
    );
    expect(screen.getByRole('button', { name: 'Example button row' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Example link row' })).toBeInTheDocument();
  });
});
