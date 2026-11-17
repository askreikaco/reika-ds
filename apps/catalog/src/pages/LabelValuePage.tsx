import { LabelValue } from '@reika-ds/react';
import { Section } from './shared';

export function LabelValuePage() {
  return (
    <>
      <Section title="Layout">
        <div style={{ inlineSize: '100%', display: 'grid', gap: '1rem' }}>
          <LabelValue label="Example label" value="Example value" />
          <LabelValue label="Example label" value="Example value" layout="inline" />
        </div>
      </Section>
      <Section title="Dense">
        <div style={{ inlineSize: '100%', display: 'grid', gap: '1rem' }}>
          <LabelValue label="Example label" value="Example value" dense />
          <LabelValue label="Example label" value="Example value" dense layout="inline" />
        </div>
      </Section>
      <Section title="End slot">
        <div style={{ inlineSize: '100%' }}>
          <LabelValue label="Example label" value="Example value" end={<button type="button">Example action</button>} />
        </div>
      </Section>
    </>
  );
}
