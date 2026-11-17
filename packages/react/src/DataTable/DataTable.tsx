import { useId, type ReactNode } from 'react';
import {
  Checkbox,
  Pagination,
  Table,
  TableBatchAction,
  TableBatchActions,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableHeader,
  TableRow,
  TableSelectAll,
  TableSelectRow,
  TableToolbar,
  ContainedList,
} from '@carbon/react';
import { ListRow, type ListRowProps } from '../ListRow/ListRow.js';
import { StateBlock } from '../StateBlock/StateBlock.js';
import { useIsPhone } from '../internal/useIsPhone.js';

export type DataTableSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl';
export type DataTableSortDirection = 'asc' | 'desc';

export interface DataTableColumn {
  key: string;
  header: string;
  /** Right-aligned, tabular figures. */
  numeric?: boolean;
  sortable?: boolean;
}

/** A row: id is unique; every other key is the cell content of the column with that key. */
export type DataTableRow = { id: string } & Record<string, ReactNode>;

export interface DataTableBulkAction {
  id: string;
  label: string;
  /** Called with the ids of the selected rows. */
  onClick: (ids: string[]) => void;
}

export interface DataTableLabels {
  selectAll?: string;
  selectRow?: string;
  /** Batch bar: clears the selection. */
  clearSelection?: string;
  /** Batch bar count, for example "3 selected". */
  selectedCount?: (count: number) => string;
  empty?: string;
  previous?: string;
  next?: string;
  itemsPerPage?: string;
  pageNumber?: string;
  /** Pagination range, for example "1-10 of 42". */
  itemRange?: (min: number, max: number, total: number) => string;
}

const DEFAULT_LABELS: Required<DataTableLabels> = {
  selectAll: 'Select all rows',
  selectRow: 'Select row',
  clearSelection: 'Cancel',
  selectedCount: (count) => `${count} selected`,
  empty: 'No results',
  previous: 'Previous page',
  next: 'Next page',
  itemsPerPage: 'Items per page:',
  pageNumber: 'Page number',
  itemRange: (min, max, total) => `${min}-${max} of ${total}`,
};

export interface DataTableProps {
  columns: DataTableColumn[];
  rows: DataTableRow[];
  /** Active sort. The caller sorts the rows; this component only shows the state. */
  sort?: { key: string; dir: DataTableSortDirection } | null;
  onSort?: (key: string) => void;
  size?: DataTableSize;
  selectable?: boolean;
  /** Selected row ids. */
  selected?: string[];
  onSelect?: (ids: string[]) => void;
  /** Shown in the batch bar while rows are selected. */
  bulkActions?: DataTableBulkAction[];
  /** Phone (below md): render each row as a ListRow instead of the table. Selection stays on the table. */
  phoneList?: (row: DataTableRow) => ListRowProps;
  pagination?: { page: number; pageSize: number; total: number; onChange: (state: { page: number; pageSize: number }) => void };
  /** Shown instead of the table when there are no rows. Default: StateBlock empty. */
  empty?: ReactNode;
  labels?: DataTableLabels;
}

const PAGE_SIZES = [10, 20, 50];

function cx(...parts: Array<string | false | null | undefined>): string {
  return parts.filter(Boolean).join(' ');
}

// Table with optional selection, bulk actions, sort, pagination and a phone list. Built on Carbon Table
// primitives (TableBatchActions, Pagination), so selection and sort stay controlled by the caller.
export function DataTable({
  columns,
  rows,
  sort = null,
  onSort,
  size = 'md',
  selectable = false,
  selected = [],
  onSelect,
  bulkActions,
  phoneList,
  pagination,
  empty,
  labels,
}: DataTableProps) {
  const L = { ...DEFAULT_LABELS, ...labels };
  const phone = useIsPhone();
  const baseId = useId();

  if (rows.length === 0) {
    return <div className="rds-data-table">{empty ?? <StateBlock kind="empty" title={L.empty} />}</div>;
  }

  const selectedSet = new Set(selected);
  const selectedCount = rows.filter((row) => selectedSet.has(row.id)).length;
  const allSelected = selectedCount === rows.length;
  const someSelected = selectedCount > 0 && !allSelected;

  const toggle = (id: string) => {
    const next = selectedSet.has(id) ? selected.filter((item) => item !== id) : [...selected, id];
    onSelect?.(next);
  };
  const toggleAll = () => onSelect?.(allSelected ? [] : rows.map((row) => row.id));

  const pageSizes = pagination ? [...new Set([...PAGE_SIZES, pagination.pageSize])].sort((a, b) => a - b) : [];

  // Batch bar: a Carbon TableToolbar, so the bar replaces the toolbar strip above the table and never covers rows.
  const toolbar = selectable ? (
    <TableToolbar>
      <TableBatchActions
        shouldShowBatchActions={selectedCount > 0}
        totalSelected={selectedCount}
        onCancel={() => onSelect?.([])}
        translateWithId={(id, options) => {
          if (id === 'carbon.table.batch.cancel') return L.clearSelection;
          if (id === 'carbon.table.batch.selectAll') return L.selectAll;
          return L.selectedCount(options?.totalSelected ?? selectedCount);
        }}
      >
        {(bulkActions ?? []).map((action) => (
          <TableBatchAction key={action.id} onClick={() => action.onClick(selected)}>
            {action.label}
          </TableBatchAction>
        ))}
      </TableBatchActions>
    </TableToolbar>
  ) : null;

  const body =
    phoneList && phone ? (
      <>
        {toolbar}
        <ContainedList className="rds-data-table__list">
        {rows.map((row) => {
          const props = phoneList(row);
          const check = selectable ? (
            <Checkbox
              id={`${baseId}-phone-${row.id}`}
              labelText={L.selectRow}
              hideLabel
              checked={selectedSet.has(row.id)}
              onChange={() => toggle(row.id)}
            />
          ) : null;
          return <ListRow key={row.id} {...props} leading={check ?? props.leading} />;
        })}
        </ContainedList>
      </>
    ) : (
      <TableContainer className="rds-data-table__scroll">
        {toolbar}
        <Table size={size} className="rds-data-table__table">
          <TableHead>
            <TableRow>
              {selectable ? (
                <TableSelectAll
                  id={`${baseId}-all`}
                  name={`${baseId}-all`}
                  ariaLabel={L.selectAll}
                  checked={allSelected}
                  indeterminate={someSelected}
                  onSelect={toggleAll}
                />
              ) : null}
              {columns.map((column) => {
                const active = sort?.key === column.key;
                return (
                  <TableHeader
                    key={column.key}
                    className={cx(column.numeric && 'rds-data-table__numeric')}
                    isSortable={Boolean(column.sortable)}
                    isSortHeader={active}
                    sortDirection={active ? (sort.dir === 'asc' ? 'ASC' : 'DESC') : 'NONE'}
                    onClick={() => onSort?.(column.key)}
                  >
                    {column.header}
                  </TableHeader>
                );
              })}
            </TableRow>
          </TableHead>
          <TableBody>
            {rows.map((row) => (
              <TableRow key={row.id} isSelected={selectedSet.has(row.id)}>
                {selectable ? (
                  <TableSelectRow
                    id={`${baseId}-row-${row.id}`}
                    name={`${baseId}-row-${row.id}`}
                    ariaLabel={L.selectRow}
                    checked={selectedSet.has(row.id)}
                    onSelect={() => toggle(row.id)}
                  />
                ) : null}
                {columns.map((column) => (
                  <TableCell key={column.key} className={cx(column.numeric && 'rk-tabular rds-data-table__numeric')}>
                    {row[column.key]}
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    );

  return (
    <div className={`rds-data-table rds-data-table--${size}`}>
      {body}

      {pagination ? (
        <Pagination
          page={pagination.page}
          pageSize={pagination.pageSize}
          pageSizes={pageSizes}
          totalItems={pagination.total}
          backwardText={L.previous}
          forwardText={L.next}
          itemsPerPageText={L.itemsPerPage}
          pageNumberText={L.pageNumber}
          itemRangeText={L.itemRange}
          onChange={({ page, pageSize }) => pagination.onChange({ page, pageSize })}
        />
      ) : null}
    </div>
  );
}
