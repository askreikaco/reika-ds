import { useState } from 'react';
import { Button, TextInput } from '@carbon/react';
import { Sheet, type SheetProps } from '@reika-ds/react';
import { Cell, Section } from './shared';

type Placement = NonNullable<SheetProps['placement']>;

export function SheetPage() {
  const [formPlacement, setFormPlacement] = useState<Placement | null>(null);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [name, setName] = useState('');
  const placements: Placement[] = ['auto', 'modal', 'bottom'];

  return (
    <>
      <Section title="Form sheet: placement auto (bottom on phone, modal on md and up), modal and bottom">
        {placements.map((placement) => (
          <Cell key={placement} label={placement}>
            <Button kind="tertiary" size="sm" onClick={() => setFormPlacement(placement)}>
              Example open {placement}
            </Button>
          </Cell>
        ))}
      </Section>
      <Section title="Confirm sheet with values and danger action">
        <Cell label="confirm">
          <Button kind="danger--tertiary" size="sm" onClick={() => setConfirmOpen(true)}>
            Example delete
          </Button>
        </Cell>
      </Section>

      <Sheet
        open={formPlacement !== null}
        onClose={() => setFormPlacement(null)}
        title="Example sheet"
        placement={formPlacement ?? 'auto'}
        primary={{ label: 'Example save', onClick: () => setFormPlacement(null), disabled: name.trim().length === 0 }}
        secondary={{ label: 'Example cancel', onClick: () => setFormPlacement(null) }}
      >
        <TextInput id="catalog-sheet-name" labelText="Example name" value={name} onChange={(event) => setName(event.target.value)} />
      </Sheet>

      <Sheet
        open={confirmOpen}
        onClose={() => setConfirmOpen(false)}
        title="Example confirm"
        placement="auto"
        confirm={{
          values: [
            { label: 'Example item', value: 'Example order 1042' },
            { label: 'Example amount', value: '1,200' },
          ],
        }}
        primary={{ label: 'Example delete', onClick: () => setConfirmOpen(false), danger: true }}
        secondary={{ label: 'Example keep', onClick: () => setConfirmOpen(false) }}
      >
        <p className="catalog__note">Example: this cannot be undone.</p>
      </Sheet>
    </>
  );
}
