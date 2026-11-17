import { Button } from '@carbon/react';
import { ChartCard } from '@reika-ds/react';
import { Section } from './shared';

// Stand-in chart: any chart goes in the slot. No chart library is used here.
const BARS = [40, 65, 52, 80, 58, 70];

function SampleBars() {
  return (
    <svg viewBox="0 0 240 120" width="100%" height="100%" preserveAspectRatio="none" role="img" aria-label="Example bars">
      {BARS.map((h, i) => (
        <rect key={i} x={i * 40 + 8} y={120 - h} width={24} height={h} fill="currentColor" />
      ))}
    </svg>
  );
}

const LEGEND = <span>Example legend: one series</span>;

export function ChartCardPage() {
  return (
    <>
      <Section title="Heights">
        <div style={{ inlineSize: '100%', display: 'grid', gap: '1.5rem' }}>
          <ChartCard title="Example sm" height="sm"><SampleBars /></ChartCard>
          <ChartCard title="Example md" height="md"><SampleBars /></ChartCard>
          <ChartCard title="Example lg-sm" height="lg-sm"><SampleBars /></ChartCard>
        </div>
      </Section>
      <Section title="Header and legend">
        <div style={{ inlineSize: '100%' }}>
          <ChartCard
            title="Example chart"
            meta="Example meta"
            action={<Button kind="ghost" size="sm">Example action</Button>}
            legend={LEGEND}
            height="sm"
          >
            <SampleBars />
          </ChartCard>
        </div>
      </Section>
      <Section title="Empty">
        <div style={{ inlineSize: '100%' }}>
          <ChartCard title="Example empty" height="sm" empty={{ title: 'Example empty title', message: 'Example empty message' }}>
            <SampleBars />
          </ChartCard>
        </div>
      </Section>
    </>
  );
}
