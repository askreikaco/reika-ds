import { Thumb } from '@reika-ds/react';
import { Section } from './shared';

// Neutral sample image, drawn inline so the catalog needs no network access.
const SAMPLE = `data:image/svg+xml;utf8,${encodeURIComponent(
  '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 160 120"><rect width="160" height="120" fill="#8d8d8d"/><circle cx="110" cy="40" r="18" fill="#c6c6c6"/><path d="M0 120 L60 60 L100 100 L130 75 L160 110 V120 Z" fill="#525252"/></svg>',
)}`;

export function ThumbPage() {
  return (
    <>
      <Section title="Size">
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1.5rem', alignItems: 'flex-end' }}>
          <Thumb size="sm" alt="Example small" src={SAMPLE} />
          <Thumb size="md" alt="Example medium" src={SAMPLE} />
          <Thumb size="lg" alt="Example large" src={SAMPLE} />
        </div>
      </Section>
      <Section title="Ratio">
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1.5rem', alignItems: 'flex-end' }}>
          <Thumb size="md" ratio="1:1" alt="Example square" src={SAMPLE} />
          <Thumb size="md" ratio="4:3" alt="Example four by three" src={SAMPLE} />
          <Thumb size="lg" ratio="16:9" alt="Example wide" src={SAMPLE} />
        </div>
      </Section>
      <Section title="Placeholder and fallback">
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1.5rem', alignItems: 'flex-end' }}>
          <Thumb size="md" alt="Example no image" />
          <Thumb size="lg" ratio="4:3" alt="Example custom fallback" fallback="Example" />
        </div>
      </Section>
    </>
  );
}
