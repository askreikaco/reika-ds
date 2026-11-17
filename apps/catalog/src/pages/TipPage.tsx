import { Tip } from '@reika-ds/react';
import { Section } from './shared';

export function TipPage() {
  return (
    <>
      <Section title="Variants">
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1.5rem', alignItems: 'center' }}>
          <p style={{ margin: 0 }}>
            Example info <Tip variant="info" label="Example info help">Example info content</Tip>
          </p>
          <p style={{ margin: 0 }}>
            Example <Tip variant="term" label="Example term">Example term content</Tip> in a sentence
          </p>
          <p style={{ margin: 0 }}>
            Example detail <Tip variant="detail" label="Example detail">Example detail content</Tip>
          </p>
        </div>
      </Section>
      <Section title="Placement">
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1.5rem', alignItems: 'center' }}>
          <Tip variant="info" label="Example top help" align="top">Example top content</Tip>
          <Tip variant="info" label="Example right help" align="right">Example right content</Tip>
        </div>
      </Section>
      <Section title="Labels">
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1.5rem', alignItems: 'center' }}>
          <Tip variant="detail" label="Example custom detail" labels={{ detail: 'Example more' }}>Example custom content</Tip>
        </div>
      </Section>
    </>
  );
}
