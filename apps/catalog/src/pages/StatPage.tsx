import { Stat, StatGrid } from '@reika-ds/react';
import { Cell, Section } from './shared';

const SPARK = (
  <svg viewBox="0 0 120 32" width="100%" height="32" role="img" aria-label="Example trend">
    <polyline points="0,24 20,18 40,20 60,10 80,14 100,6 120,8" fill="none" stroke="currentColor" strokeWidth="2" />
  </svg>
);

export function StatPage() {
  return (
    <>
      <Section title="Size">
        <div style={{ inlineSize: '100%' }}>
          <StatGrid cols={3}>
            <Stat size="sm" label="Example sm" value="1,234" sub="Example sub" />
            <Stat size="md" label="Example md" value="1,234" sub="Example sub" />
            <Stat size="lg" label="Example lg" value="1,234" sub="Example sub" />
          </StatGrid>
        </div>
      </Section>
      <Section title="Tone">
        <div style={{ inlineSize: '100%' }}>
          <StatGrid cols={3}>
            <Stat label="Example neutral" value="500" />
            <Stat tone="success" label="Example success" value="+12" />
            <Stat tone="error" label="Example error" value="-3" />
          </StatGrid>
        </div>
      </Section>
      <Section title="Trend">
        <div style={{ inlineSize: '100%' }}>
          <StatGrid cols={3}>
            <Stat label="Example up" value="42" trend={{ dir: 'up', text: 'Example up 4%' }} />
            <Stat label="Example down" value="38" trend={{ dir: 'down', text: 'Example down 2%' }} />
            <Stat label="Example flat" value="40" trend={{ dir: 'flat', text: 'Example flat' }} />
          </StatGrid>
        </div>
      </Section>
      <Section title="Sparkline and tile">
        <div style={{ inlineSize: '100%' }}>
          <StatGrid cols={2}>
            <Stat label="Example sparkline" value="98" sparkline={SPARK} />
            <Stat label="Example tile" value="98" tile sub="Example sub" />
          </StatGrid>
        </div>
      </Section>
      <Section title="Column count">
        <div style={{ inlineSize: '100%' }}>
          <StatGrid cols={4}>
            <Stat label="Example one" value="1" />
            <Stat label="Example two" value="2" />
            <Stat label="Example three" value="3" />
            <Stat label="Example four" value="4" />
          </StatGrid>
        </div>
      </Section>
      <Section title="Inside a table cell">
        <Cell label="as td">
          <table>
            <tbody>
              <tr>
                <Stat as="td" label="Example cell" value="7" />
              </tr>
            </tbody>
          </table>
        </Cell>
      </Section>
    </>
  );
}
