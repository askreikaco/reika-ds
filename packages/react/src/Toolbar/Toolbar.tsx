import { useId, useState, type ReactNode } from 'react';
import { Button, Dropdown, OverflowMenu, OverflowMenuItem, Search, Tag } from '@carbon/react';
import { Column, Filter } from '@carbon/icons-react';
import { Sheet } from '../Sheet/Sheet.js';
import { useIsPhone } from '../internal/useIsPhone.js';

export interface ToolbarOption {
  id: string;
  label: string;
}

export interface ToolbarLabels {
  searchLabel?: string;
  clearSearch?: string;
  quickFilters?: string;
  filters?: string;
  sort?: string;
  columns?: string;
  done?: string;
}

const DEFAULT_LABELS: Required<ToolbarLabels> = {
  searchLabel: 'Search',
  clearSearch: 'Clear search',
  quickFilters: 'Quick filters',
  filters: 'Filters',
  sort: 'Sort',
  columns: 'Columns',
  done: 'Done',
};

export interface ToolbarProps {
  search?: { value: string; onChange: (value: string) => void; placeholder?: string };
  /** Quick filter chips: toggle buttons, one per filter. */
  quick?: Array<{ id: string; label: string; selected: boolean }>;
  onQuick?: (id: string) => void;
  /** Filter controls. Inline on md and up; in a Sheet on phone. */
  filters?: ReactNode;
  sort?: { options: ToolbarOption[]; value: string; onChange: (id: string) => void };
  /** Column visibility: each option toggles its id in value. */
  columns?: { options: ToolbarOption[]; value: string[]; onChange: (ids: string[]) => void };
  /** Buttons at the end of the search row (e.g. primary Add). Same row, never wraps. */
  actions?: ReactNode;
  /** Result count or summary, shown at the start of the second row. */
  count?: ReactNode;
  density?: 'default' | 'compact';
  labels?: ToolbarLabels;
}

// One toolbar above a list or table: search, quick chips, filters, sort, columns, count.
// Phone: the filters move into a bottom Sheet opened by a Filters button.
export function Toolbar({ search, quick, onQuick, filters, sort, columns, actions, count, density = 'default', labels }: ToolbarProps) {
  const L = { ...DEFAULT_LABELS, ...labels };
  const phone = useIsPhone();
  const searchId = useId();
  const sortId = useId();
  const [filtersOpen, setFiltersOpen] = useState(false);
  const size = density === 'compact' ? 'sm' : 'md';

  // Phone: the Filter button sits in the main row. Desktop: inline filters stay in the controls.
  const phoneFilterButton =
    filters && phone ? (
      <Button kind="tertiary" size={size} renderIcon={Filter} onClick={() => setFiltersOpen(true)} className="rds-toolbar__filter-button">
        {L.filters}
      </Button>
    ) : null;
  const filterControl = filters && !phone ? <div className="rds-toolbar__filters">{filters}</div> : null;
  const showMain = Boolean(search || actions || phoneFilterButton);

  return (
    <div className={`rds-toolbar rds-toolbar--${density}`}>
      {showMain ? (
        <div className="rds-toolbar__main">
          {search ? (
            <Search
              id={searchId}
              size={size}
              labelText={L.searchLabel}
              placeholder={search.placeholder ?? L.searchLabel}
              closeButtonLabelText={L.clearSearch}
              value={search.value}
              onChange={(event) => search.onChange(event.target.value)}
              onClear={() => search.onChange('')}
              className="rds-toolbar__search"
            />
          ) : null}
          {phoneFilterButton}
          {actions ? <div className="rds-toolbar__actions">{actions}</div> : null}
        </div>
      ) : null}

      {quick && quick.length > 0 ? (
        <div className="rds-toolbar__chips" role="group" aria-label={L.quickFilters}>
          {quick.map((chip) => (
            <Tag
              key={chip.id}
              as="button"
              type={chip.selected ? 'blue' : 'gray'}
              size={size}
              aria-pressed={chip.selected}
              onClick={() => onQuick?.(chip.id)}
              className="rds-toolbar__chip"
            >
              {chip.label}
            </Tag>
          ))}
        </div>
      ) : null}

      <div className="rds-toolbar__row">
        {count !== undefined ? <span className="rds-toolbar__count">{count}</span> : null}
        <div className="rds-toolbar__controls">
          {filterControl}
          {sort ? (
            <div className="rds-toolbar__sort">
              <Dropdown
                id={sortId}
                size={size}
                titleText={L.sort}
                hideLabel
                label={L.sort}
                items={sort.options}
                itemToString={(item) => item?.label ?? ''}
                selectedItem={sort.options.find((option) => option.id === sort.value) ?? null}
                onChange={({ selectedItem }) => {
                  if (selectedItem) sort.onChange(selectedItem.id);
                }}
              />
            </div>
          ) : null}
          {columns ? (
            <OverflowMenu aria-label={L.columns} iconDescription={L.columns} renderIcon={Column} size={size} flipped>
              {columns.options.map((option) => {
                const shown = columns.value.includes(option.id);
                return (
                  <OverflowMenuItem
                    key={option.id}
                    itemText={option.label}
                    role="menuitemcheckbox"
                    aria-checked={shown}
                    onClick={() =>
                      columns.onChange(shown ? columns.value.filter((id) => id !== option.id) : [...columns.value, option.id])
                    }
                  />
                );
              })}
            </OverflowMenu>
          ) : null}
        </div>
      </div>

      {filters && phone ? (
        <Sheet
          open={filtersOpen}
          onClose={() => setFiltersOpen(false)}
          title={L.filters}
          placement="bottom"
          primary={{ label: L.done, onClick: () => setFiltersOpen(false) }}
        >
          {filters}
        </Sheet>
      ) : null}
    </div>
  );
}
