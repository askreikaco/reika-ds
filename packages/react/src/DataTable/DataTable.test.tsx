import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen, within } from '@testing-library/react';
import { DataTable, type DataTableRow } from './DataTable.js';
import { setViewport } from '../../test/viewport.js';

const columns = [
  { key: 'name', header: 'Example name', sortable: true },
  { key: 'amount', header: 'Example amount', numeric: true, sortable: true },
];
const rows: DataTableRow[] = [
  { id: 'r1', name: 'Example one', amount: '1,200' },
  { id: 'r2', name: 'Example two', amount: '350' },
  { id: 'r3', name: 'Example three', amount: '9' },
];

describe('DataTable', () => {
  beforeEach(() => setViewport('desktop'));
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('renders headers and cells; numeric cells are right-aligned with tabular figures', () => {
    const { container } = render(<DataTable columns={columns} rows={rows} />);
    expect(screen.getByRole('columnheader', { name: /Example amount/ })).toBeInTheDocument();
    expect(screen.getByRole('cell', { name: 'Example one' })).toBeInTheDocument();
    const amount = screen.getByRole('cell', { name: '1,200' });
    expect(amount).toHaveClass('rk-tabular', 'rds-data-table__numeric');
    expect(container.querySelectorAll('.rds-data-table__numeric').length).toBeGreaterThan(0);
  });

  it('size sets the Carbon table size class', () => {
    const { container } = render(<DataTable columns={columns} rows={rows} size="xs" />);
    expect(container.querySelector('.cds--data-table')).toHaveClass('cds--data-table--xs');
  });

  it('sortable header: click calls onSort with the key and the active column shows its direction', () => {
    const onSort = vi.fn();
    render(<DataTable columns={columns} rows={rows} sort={{ key: 'amount', dir: 'desc' }} onSort={onSort} />);
    expect(screen.getByRole('columnheader', { name: /Example amount/ })).toHaveAttribute('aria-sort', 'descending');
    expect(screen.getByRole('columnheader', { name: /Example name/ })).toHaveAttribute('aria-sort', 'none');
    fireEvent.click(screen.getByRole('button', { name: /Example name/ }));
    expect(onSort).toHaveBeenCalledWith('name');
  });

  it('selection: row checkboxes and select-all report the selected ids', () => {
    const onSelect = vi.fn();
    const { rerender } = render(<DataTable columns={columns} rows={rows} selectable selected={[]} onSelect={onSelect} />);
    fireEvent.click(screen.getAllByRole('checkbox', { name: 'Select row' })[0]);
    expect(onSelect).toHaveBeenLastCalledWith(['r1']);
    fireEvent.click(screen.getByRole('checkbox', { name: 'Select all rows' }));
    expect(onSelect).toHaveBeenLastCalledWith(['r1', 'r2', 'r3']);

    rerender(<DataTable columns={columns} rows={rows} selectable selected={['r1', 'r2', 'r3']} onSelect={onSelect} />);
    fireEvent.click(screen.getByRole('checkbox', { name: 'Select all rows' }));
    expect(onSelect).toHaveBeenLastCalledWith([]);
  });

  it('batch bar sits inside the table toolbar, above the table body, not over a row', () => {
    const { container } = render(
      <DataTable columns={columns} rows={rows} selectable selected={['r2']} onSelect={() => {}} bulkActions={[{ id: 'x', label: 'Example x', onClick: () => {} }]} />,
    );
    const bar = container.querySelector('.cds--table-toolbar .cds--batch-actions--active');
    expect(bar).not.toBeNull();
    expect(container.querySelector('tbody .cds--batch-actions')).toBeNull();
  });

  it('phone list rows sit in a ContainedList', () => {
    setViewport('phone');
    const { container } = render(
      <DataTable columns={columns} rows={rows} selectable phoneList={(row) => ({ title: String(row.name) })} />,
    );
    expect(container.querySelector('.rds-data-table__list.cds--contained-list')).not.toBeNull();
    expect(container.querySelectorAll('.rds-data-table__list .rds-list-row')).toHaveLength(3);
  });

  it('bulk actions appear for a selection and receive the selected ids', () => {
    const onClick = vi.fn();
    render(
      <DataTable
        columns={columns}
        rows={rows}
        selectable
        selected={['r2']}
        onSelect={() => {}}
        bulkActions={[{ id: 'export', label: 'Example export', onClick }]}
      />,
    );
    fireEvent.click(screen.getByRole('button', { name: 'Example export' }));
    expect(onClick).toHaveBeenCalledWith(['r2']);
    expect(screen.getByText('1 selected')).toBeInTheDocument();
  });

  it('pagination: page changes call onChange with the new page and size', () => {
    const onChange = vi.fn();
    render(<DataTable columns={columns} rows={rows} pagination={{ page: 1, pageSize: 10, total: 42, onChange }} />);
    expect(screen.getByText(/1.10 of 42/)).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Next page' }));
    expect(onChange).toHaveBeenCalledWith({ page: 2, pageSize: 10 });
  });

  it('no rows: the default StateBlock empty shows, and labels.empty replaces its title', () => {
    const { unmount } = render(<DataTable columns={columns} rows={[]} />);
    expect(document.querySelector('.rds-state-block--empty')).not.toBeNull();
    expect(screen.getByText('No results')).toBeInTheDocument();
    unmount();

    render(<DataTable columns={columns} rows={[]} labels={{ empty: 'Example nothing' }} />);
    expect(screen.getByText('Example nothing')).toBeInTheDocument();
  });

  it('phone with phoneList: rows render as ListRow and the table is not shown', () => {
    setViewport('phone');
    const { container } = render(
      <DataTable columns={columns} rows={rows} phoneList={(row) => ({ title: String(row.name), meta: String(row.amount) })} />,
    );
    expect(container.querySelector('table')).toBeNull();
    const list = container.querySelector('.rds-data-table__list') as HTMLElement;
    expect(within(list).getAllByText(/Example/)).toHaveLength(3);
    expect(list.querySelectorAll('.rds-list-row')).toHaveLength(3);
  });

  it('desktop with phoneList still renders the table', () => {
    const { container } = render(
      <DataTable columns={columns} rows={rows} phoneList={(row) => ({ title: String(row.name) })} />,
    );
    expect(container.querySelector('table')).not.toBeNull();
    expect(container.querySelector('.rds-data-table__list')).toBeNull();
  });
});
