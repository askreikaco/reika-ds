import { NumCell } from '@reika-ds/react';
import { Section } from './shared';

export function NumCellPage() {
  return (
    <>
      <Section title="Value">
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '2rem', alignItems: 'flex-start' }}>
          <NumCell value={1234567} />
          <NumCell value={1234.5} format={{ maximumFractionDigits: 1 }} />
          <NumCell value="Example text" />
        </div>
      </Section>
      <Section title="Unit and large">
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '2rem', alignItems: 'flex-start' }}>
          <NumCell value={42} unit="Example unit" />
          <NumCell value={98} unit="%" large />
        </div>
      </Section>
      <Section title="Trend">
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '2rem', alignItems: 'flex-start' }}>
          <NumCell value={1200} trend={{ dir: 'up', text: 'Example up 4%' }} />
          <NumCell value={980} trend={{ dir: 'down', text: 'Example down 2%' }} />
          <NumCell value={1000} trend={{ dir: 'flat', text: 'Example flat' }} />
        </div>
      </Section>
      <Section title="Right aligned">
        <div style={{ inlineSize: '100%', maxInlineSize: '12rem' }}>
          <NumCell value={5600} end unit="Example unit" trend={{ dir: 'up', text: 'Example up' }} />
        </div>
      </Section>
    </>
  );
}
