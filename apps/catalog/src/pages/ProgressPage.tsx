import { Progress, type ProgressStepItem } from '@reika-ds/react';
import { Section } from './shared';

const STEPS: ProgressStepItem[] = [
  { label: 'Example first', description: 'Example done text', state: 'done' },
  { label: 'Example second', description: 'Example current text', state: 'current' },
  { label: 'Example third', description: 'Example pending text', state: 'pending' },
];

export function ProgressPage() {
  return (
    <>
      <Section title="Bar">
        <div style={{ inlineSize: '100%', display: 'grid', gap: '1.5rem' }}>
          <Progress kind="bar" value={40} label="Example upload" helper="Example helper: 2 of 5" />
          <Progress kind="bar" value={3} max={4} label="Example max" helper="Example helper: 3 of 4" />
          <Progress kind="bar" label="Example indeterminate" helper="Example helper" />
        </div>
      </Section>
      <Section title="Steps">
        <div style={{ inlineSize: '100%' }}>
          <Progress kind="steps" label="Example steps" steps={STEPS} />
        </div>
      </Section>
      <Section title="Vertical steps">
        <div style={{ inlineSize: '100%' }}>
          <Progress kind="steps" label="Example vertical steps" steps={STEPS} vertical />
        </div>
      </Section>
    </>
  );
}
