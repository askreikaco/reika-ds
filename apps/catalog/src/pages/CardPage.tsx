import { Button } from '@carbon/react';
import { Card } from '@reika-ds/react';
import { Cell, Section } from './shared';

export function CardPage() {
  return (
    <>
      <Section title="Header parts">
        <Cell label="title">
          <Card title="Example card">Example body text.</Card>
        </Cell>
        <Cell label="title, meta">
          <Card title="Example card" meta="Example meta">
            Example body text.
          </Card>
        </Cell>
        <Cell label="title, info, action">
          <Card
            title="Example card"
            info="Example info: explains the figures in this card."
            action={
              <Button kind="ghost" size="sm">
                Example action
              </Button>
            }
          >
            Example body text.
          </Card>
        </Cell>
        <Cell label="footer">
          <Card title="Example card" footer="Example footer: updated Example Co, 2 items.">
            Example body text.
          </Card>
        </Cell>
        <Cell label="no header">
          <Card>Example body text, no header.</Card>
        </Cell>
      </Section>
      <Section title="Body modifiers">
        <Cell label="flush">
          <Card title="Example list" flush>
            <ul>
              <li>Example row one</li>
              <li>Example row two</li>
            </ul>
          </Card>
        </Cell>
        <Cell label="bare">
          <Card bare>
            <div>Bare: no padding, the child sets its own spacing.</div>
          </Card>
        </Cell>
        <Cell label="embedded">
          <Card title="Outer card">
            <Card embedded title="Embedded part">
              Embedded body text, no tile of its own.
            </Card>
          </Card>
        </Cell>
        <Cell label="href">
          <Card title="Example link card" href="#/card">
            Whole card is a link.
          </Card>
        </Cell>
      </Section>
    </>
  );
}
