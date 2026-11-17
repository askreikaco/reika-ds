import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen, within } from '@testing-library/react';
import { Toolbar } from './Toolbar.js';
import { setViewport } from '../../test/viewport.js';

const sortOptions = [
  { id: 'name', label: 'Example name' },
  { id: 'date', label: 'Example date' },
];
const columnOptions = [
  { id: 'owner', label: 'Example owner' },
  { id: 'status', label: 'Example status' },
];

describe('Toolbar', () => {
  beforeEach(() => setViewport('desktop'));
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('search: typing calls onChange with the value; clear calls it with an empty string', () => {
    const onChange = vi.fn();
    render(<Toolbar search={{ value: '', onChange, placeholder: 'Example find' }} />);
    fireEvent.change(screen.getByRole('searchbox'), { target: { value: 'abc' } });
    expect(onChange).toHaveBeenLastCalledWith('abc');
    expect(screen.getByRole('searchbox')).toHaveAttribute('placeholder', 'Example find');
  });

  it('search label can be replaced by labels.searchLabel', () => {
    render(<Toolbar search={{ value: '', onChange: () => {} }} labels={{ searchLabel: 'Example search label' }} />);
    expect(screen.getByRole('searchbox', { name: 'Example search label' })).toBeInTheDocument();
  });

  it('quick chips: a button per chip with aria-pressed, and onQuick receives the id', () => {
    const onQuick = vi.fn();
    render(
      <Toolbar
        quick={[
          { id: 'open', label: 'Example open', selected: true },
          { id: 'closed', label: 'Example closed', selected: false },
        ]}
        onQuick={onQuick}
      />,
    );
    const group = screen.getByRole('group', { name: 'Quick filters' });
    expect(within(group).getByRole('button', { name: 'Example open' })).toHaveAttribute('aria-pressed', 'true');
    expect(within(group).getByRole('button', { name: 'Example closed' })).toHaveAttribute('aria-pressed', 'false');
    fireEvent.click(within(group).getByRole('button', { name: 'Example closed' }));
    expect(onQuick).toHaveBeenCalledWith('closed');
  });

  it('sort: the dropdown shows the selected option and reports a new choice', () => {
    const onChange = vi.fn();
    render(<Toolbar sort={{ options: sortOptions, value: 'name', onChange }} />);
    expect(screen.getByRole('combobox')).toHaveTextContent('Example name');
    fireEvent.click(screen.getByRole('combobox'));
    fireEvent.click(screen.getByText('Example date'));
    expect(onChange).toHaveBeenCalledWith('date');
  });

  it('columns: each option is a checkbox menu item that toggles its id', () => {
    const onChange = vi.fn();
    render(<Toolbar columns={{ options: columnOptions, value: ['owner'], onChange }} />);
    fireEvent.click(screen.getByRole('button', { name: 'Columns' }));
    // Carbon marks the open menu body aria-hidden in jsdom, so the item queries opt in to hidden elements.
    const item = (name: string) => screen.getAllByRole('menuitemcheckbox', { hidden: true }).find((node) => node.textContent === name) as HTMLElement;
    const owner = item('Example owner');
    expect(owner).toHaveAttribute('aria-checked', 'true');
    expect(item('Example status')).toHaveAttribute('aria-checked', 'false');
    fireEvent.click(owner);
    expect(onChange).toHaveBeenLastCalledWith([]);
    // Carbon closes the overflow menu after each item, so it is opened again for the next choice.
    fireEvent.click(screen.getByRole('button', { name: 'Columns' }));
    fireEvent.click(item('Example status'));
    expect(onChange).toHaveBeenLastCalledWith(['owner', 'status']);
  });

  it('count renders its ReactNode', () => {
    render(<Toolbar count={<strong>Example 12 results</strong>} />);
    expect(screen.getByText('Example 12 results')).toBeInTheDocument();
  });

  it('desktop: filters are inline; phone: a Filters button opens them in a bottom sheet', () => {
    const { unmount } = render(<Toolbar filters={<p>Example inline filter</p>} />);
    expect(screen.getByText('Example inline filter')).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Filters' })).toBeNull();
    unmount();

    setViewport('phone');
    render(<Toolbar filters={<p>Example sheet filter</p>} />);
    const button = screen.getByRole('button', { name: 'Filters' });
    fireEvent.click(button);
    expect(document.querySelector('.rds-sheet')).toHaveClass('rds-sheet--bottom', 'is-visible');
    expect(screen.getByText('Example sheet filter')).toBeInTheDocument();
  });

  it('density compact adds its modifier class', () => {
    const { container } = render(<Toolbar density="compact" />);
    expect(container.querySelector('.rds-toolbar')).toHaveClass('rds-toolbar--compact');
  });
});
