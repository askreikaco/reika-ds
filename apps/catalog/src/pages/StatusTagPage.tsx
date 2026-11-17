import { useState } from 'react';
import { StatusTag, type StatusTone } from '@reika-ds/react';
import { CheckmarkFilled, Information, Warning } from '@carbon/icons-react';
import { Cell, Section } from './shared';

const TONES: StatusTone[] = ['good', 'bad', 'warn', 'info', 'neutral', 'cool'];
const SIZES = ['sm', 'md', 'lg'] as const;

export function StatusTagPage() {
  const [tags, setTags] = useState(['Example one', 'Example two', 'Example three']);

  return (
    <>
      <Section title="Tone">
        {TONES.map((tone) => (
          <Cell key={tone} label={tone}>
            <StatusTag tone={tone}>{`Example ${tone}`}</StatusTag>
          </Cell>
        ))}
      </Section>
      <Section title="Size">
        {SIZES.map((size) => (
          <Cell key={size} label={size}>
            <StatusTag tone="info" size={size}>
              Example size
            </StatusTag>
          </Cell>
        ))}
      </Section>
      <Section title="Icon and count">
        <Cell label="icon">
          <StatusTag tone="good" icon={CheckmarkFilled}>
            Example done
          </StatusTag>
        </Cell>
        <Cell label="icon, warn">
          <StatusTag tone="warn" icon={Warning}>
            Example warning
          </StatusTag>
        </Cell>
        <Cell label="count">
          <StatusTag tone="bad" count={3}>
            Example failed
          </StatusTag>
        </Cell>
        <Cell label="count 0">
          <StatusTag tone="neutral" count={0}>
            Example empty
          </StatusTag>
        </Cell>
        <Cell label="icon, count, info">
          <StatusTag tone="info" icon={Information} count={12}>
            Example queue
          </StatusTag>
        </Cell>
      </Section>
      <Section title="Dismissible">
        {tags.map((tag) => (
          <Cell key={tag} label="onClose">
            <StatusTag tone="cool" onClose={() => setTags((current) => current.filter((item) => item !== tag))}>
              {tag}
            </StatusTag>
          </Cell>
        ))}
        {tags.length === 0 ? (
          <button type="button" onClick={() => setTags(['Example one', 'Example two', 'Example three'])}>
            Reset
          </button>
        ) : null}
      </Section>
    </>
  );
}
