import { useState } from 'react';
import { Button } from '@carbon/react';
import { SettingsGroup } from '@reika-ds/react';
import { Section } from './shared';

function ToggleGroup({ status }: { status?: { kind: 'saved' | 'saving' | 'error' } }) {
  const [checked, setChecked] = useState(true);
  return (
    <SettingsGroup
      title="Example group"
      description="Example description"
      status={status}
      rows={[
        { id: `example-${status?.kind ?? 'plain'}-toggle`, kind: 'toggle', label: 'Example toggle', description: 'Example help', checked, onToggle: setChecked },
        { id: `example-${status?.kind ?? 'plain'}-value`, kind: 'labelValue', label: 'Example value row', value: 'Example value' },
        { id: `example-${status?.kind ?? 'plain'}-action`, kind: 'action', label: 'Example action row', action: <Button kind="tertiary" size="sm">Example action</Button> },
      ]}
      footer="Example footer"
    />
  );
}

export function SettingsGroupPage() {
  return (
    <>
      <Section title="Rows">
        <div style={{ inlineSize: '100%' }}>
          <ToggleGroup />
        </div>
      </Section>
      <Section title="Status: saved, saving, error">
        <div style={{ inlineSize: '100%', display: 'grid', gap: '1.5rem' }}>
          <ToggleGroup status={{ kind: 'saved' }} />
          <ToggleGroup status={{ kind: 'saving' }} />
          <ToggleGroup status={{ kind: 'error' }} />
        </div>
      </Section>
    </>
  );
}
