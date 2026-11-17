import { useState } from 'react';
import { Toolbar } from '@reika-ds/react';
import { Cell, Section } from './shared';

const sortOptions = [
  { id: 'name', label: 'Example name' },
  { id: 'date', label: 'Example date' },
];
const columnOptions = [
  { id: 'owner', label: 'Example owner' },
  { id: 'status', label: 'Example status' },
  { id: 'amount', label: 'Example amount' },
];

export function ToolbarPage() {
  const [query, setQuery] = useState('');
  const [quick, setQuick] = useState<string[]>(['open']);
  const [sort, setSort] = useState('name');
  const [columns, setColumns] = useState<string[]>(['owner', 'status']);
  const chips = [
    { id: 'open', label: 'Example open' },
    { id: 'closed', label: 'Example closed' },
  ];
  const filters = <p className="catalog__note">Example filter: all</p>;

  return (
    <>
      <Section title="Default, with filters">
        <Cell label="search, chips, filters, sort, columns, count">
          <div className="catalog__wide">
            <Toolbar
              search={{ value: query, onChange: setQuery, placeholder: 'Example search' }}
              quick={chips.map((chip) => ({ ...chip, selected: quick.includes(chip.id) }))}
              onQuick={(id) => setQuick((current) => (current.includes(id) ? current.filter((item) => item !== id) : [...current, id]))}
              filters={filters}
              sort={{ options: sortOptions, value: sort, onChange: setSort }}
              columns={{ options: columnOptions, value: columns, onChange: setColumns }}
              count="Example 12 results"
            />
          </div>
        </Cell>
      </Section>
      <Section title="Compact density">
        <Cell label="compact, search and sort only">
          <div className="catalog__wide">
            <Toolbar
              density="compact"
              search={{ value: '', onChange: () => {} }}
              sort={{ options: sortOptions, value: 'date', onChange: () => {} }}
              count="Example 3 results"
            />
          </div>
        </Cell>
      </Section>
    </>
  );
}
