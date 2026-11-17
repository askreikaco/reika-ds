import { useState } from 'react';
import { ContainedList } from '@carbon/react';
import { ListRow, StatusTag } from '@reika-ds/react';
import { Section } from './shared';

export function ListRowPage() {
  const [last, setLast] = useState('none');

  return (
    <>
      <Section title="Variants">
        <div style={{ inlineSize: '100%' }}>
          <ContainedList label="Example list" kind="on-page">
            <ListRow title="Example plain row" />
            <ListRow title="Example row with meta" meta="Example meta, Person 1" chevron />
            <ListRow
              title="Example row with leading"
              leading={<span className="catalog__avatar" aria-hidden="true">P1</span>}
              meta="Person 1"
              end={<span>Example end</span>}
            />
            <ListRow
              title="Example row with badge"
              badge={<StatusTag tone="good">Example ok</StatusTag>}
              chevron
            />
            <ListRow title="Example compact row" density="compact" meta="Example meta" />
            <ListRow title="Example muted row" muted meta="Example meta" />
            <ListRow title="Example error row" error meta="Example failure" badge={<StatusTag tone="bad">Example bad</StatusTag>} />
            <ListRow title="Example disabled row" disabled meta="Example meta" chevron onClick={() => {}} />
          </ContainedList>
        </div>
      </Section>
      <Section title="Interactive">
        <div style={{ inlineSize: '100%' }}>
          <ContainedList label="Example actions" kind="on-page">
            <ListRow title="Example button row" meta="Click to record it" chevron onClick={() => setLast('button row')} />
            <ListRow title="Example link row" meta="Opens the catalog home" chevron href="#/status-tag" />
          </ContainedList>
          <p className="catalog__note">Last clicked: {last}</p>
        </div>
      </Section>
    </>
  );
}
