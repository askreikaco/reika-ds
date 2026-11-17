import { useState } from 'react';
import { Field } from '@reika-ds/react';
import { Cell, Section } from './shared';

export function FieldPage() {
  const [text, setText] = useState('');
  const [amount, setAmount] = useState<number | null>(null);
  const [note, setNote] = useState('');
  const [kind, setKind] = useState('');
  const [agree, setAgree] = useState(false);
  const [day, setDay] = useState('');

  return (
    <>
      <Section title="Text kinds">
        <Cell label="text, helper">
          <Field kind="text" label="Example name" value={text} onChange={setText} helper="Example helper text" />
        </Cell>
        <Cell label="email">
          <Field kind="email" label="Example email" value="" onChange={() => {}} />
        </Cell>
        <Cell label="tel, optional">
          <Field kind="tel" label="Example phone" value="" onChange={() => {}} optional />
        </Cell>
      </Section>
      <Section title="Number and textarea">
        <Cell label="number, min 0">
          <Field kind="number" label="Example count" value={amount} onChange={setAmount} min={0} />
        </Cell>
        <Cell label="textarea">
          <Field kind="textarea" label="Example note" value={note} onChange={setNote} rows={3} />
        </Cell>
      </Section>
      <Section title="Select, checkbox, date, file">
        <Cell label="select">
          <Field
            kind="select"
            label="Example kind"
            value={kind}
            onChange={setKind}
            placeholder="Example choose"
            options={[
              { id: 'a', label: 'Example A' },
              { id: 'b', label: 'Example B' },
            ]}
          />
        </Cell>
        <Cell label="checkbox">
          <Field kind="checkbox" label="Example agree" checked={agree} onChange={setAgree} />
        </Cell>
        <Cell label="date">
          <Field kind="date" label="Example day" value={day} onChange={setDay} />
        </Cell>
        <Cell label="file">
          <Field kind="file" label="Example attachment" onChange={() => {}} accept=".pdf,.png" />
        </Cell>
      </Section>
      <Section title="Error">
        <Cell label="error">
          <Field kind="text" label="Example name" value="" onChange={() => {}} error="Example error: name is required" required />
        </Cell>
        <Cell label="checkbox error">
          <Field kind="checkbox" label="Example agree" checked={false} onChange={() => {}} error="Example error: must agree" />
        </Cell>
      </Section>
    </>
  );
}
