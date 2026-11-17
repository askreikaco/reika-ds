import { useState } from 'react';
import { DataTable, type DataTableRow, type DataTableSortDirection } from '@reika-ds/react';
import { Cell, Section } from './shared';

const columns = [
  { key: 'name', header: 'Example name', sortable: true },
  { key: 'owner', header: 'Example owner' },
  { key: 'amount', header: 'Example amount', numeric: true, sortable: true },
];

const data: DataTableRow[] = [
  { id: 'r1', name: 'Example one', owner: 'Example Co', amount: '1,200' },
  { id: 'r2', name: 'Example two', owner: 'Example Ltd', amount: '350' },
  { id: 'r3', name: 'Example three', owner: 'Example Inc', amount: '9,040' },
  { id: 'r4', name: 'Example four', owner: 'Example Co', amount: '72' },
];

function sortRows(rows: DataTableRow[], key: string, dir: DataTableSortDirection): DataTableRow[] {
  const sign = dir === 'asc' ? 1 : -1;
  const value = (row: DataTableRow) => String(row[key]).replace(/,/g, '');
  return [...rows].sort((a, b) => {
    const x = value(a);
    const y = value(b);
    const numeric = !Number.isNaN(Number(x)) && !Number.isNaN(Number(y));
    return (numeric ? Number(x) - Number(y) : x.localeCompare(y)) * sign;
  });
}

export function DataTablePage() {
  const [sort, setSort] = useState<{ key: string; dir: DataTableSortDirection } | null>({ key: 'amount', dir: 'desc' });
  const [selected, setSelected] = useState<string[]>(['r2']);
  const [page, setPage] = useState({ page: 1, pageSize: 10 });
  const rows = sort ? sortRows(data, sort.key, sort.dir) : data;
  const onSort = (key: string) =>
    setSort((current) => (current?.key === key && current.dir === 'asc' ? { key, dir: 'desc' } : { key, dir: 'asc' }));

  return (
    <>
      <Section title="Sortable, numeric column right-aligned">
        <Cell label="sort on amount">
          <div className="catalog__wide">
            <DataTable columns={columns} rows={rows} sort={sort} onSort={onSort} />
          </div>
        </Cell>
      </Section>
      <Section title="Selection and bulk actions">
        <Cell label="selectable">
          <div className="catalog__wide">
            <DataTable
              columns={columns}
              rows={rows}
              selectable
              selected={selected}
              onSelect={setSelected}
              bulkActions={[{ id: 'export', label: 'Example export', onClick: () => setSelected([]) }]}
            />
          </div>
        </Cell>
      </Section>
      <Section title="Phone list and pagination">
        <Cell label="phoneList, pagination">
          <div className="catalog__wide">
            <DataTable
              columns={columns}
              rows={rows}
              phoneList={(row) => ({ title: String(row.name), meta: String(row.owner), end: <span className="rk-tabular">{String(row.amount)}</span>, chevron: true })}
              pagination={{ ...page, total: 42, onChange: setPage }}
            />
          </div>
        </Cell>
      </Section>
      <Section title="Empty">
        <Cell label="no rows">
          <div className="catalog__wide">
            <DataTable columns={columns} rows={[]} />
          </div>
        </Cell>
      </Section>
    </>
  );
}
