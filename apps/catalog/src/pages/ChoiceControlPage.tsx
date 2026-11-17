import { useState } from 'react';
import { ChoiceControl, type ChoiceOption, type ChoiceVariant } from '@reika-ds/react';
import { Cell, Section } from './shared';

const periods: ChoiceOption[] = [
  { id: 'day', label: 'Example day' },
  { id: 'week', label: 'Example week' },
  { id: 'month', label: 'Example month' },
  { id: 'year', label: 'Example year', disabled: true },
];

const ranges: ChoiceOption[] = [
  { id: '7', label: 'Example 7 days' },
  { id: '30', label: 'Example 30 days' },
  { id: '90', label: 'Example 90 days' },
];

const variants: ChoiceVariant[] = ['segmented', 'dropdown', 'radio', 'chips'];

export function ChoiceControlPage() {
  const [value, setValue] = useState('week');
  const [range, setRange] = useState('30');

  return (
    <>
      {variants.map((variant) => (
        <Section key={variant} title={variant}>
          <Cell label={variant}>
            <div className="catalog__wide">
              <ChoiceControl variant={variant} options={periods} value={value} onChange={setValue} label="Example period" />
            </div>
          </Cell>
        </Section>
      ))}
      <Section title="range (fixed ranges)">
        <Cell label="range">
          <div className="catalog__wide">
            <ChoiceControl variant="range" options={ranges} value={range} onChange={setRange} label="Example range" />
          </div>
        </Cell>
      </Section>
      <Section title="size and readonly">
        <Cell label="size sm">
          <ChoiceControl variant="segmented" size="sm" options={periods} value={value} onChange={setValue} label="Example small" />
        </Cell>
        <Cell label="readonly">
          <ChoiceControl variant="segmented" options={periods} value={value} onChange={() => {}} label="Example period" readonly />
        </Cell>
      </Section>
    </>
  );
}
