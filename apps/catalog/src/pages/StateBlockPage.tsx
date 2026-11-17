import { Button } from '@carbon/react';
import { Information, Locked, Search } from '@carbon/icons-react';
import { StateBlock } from '@reika-ds/react';
import { Cell, Section } from './shared';

export function StateBlockPage() {
  return (
    <>
      <Section title="Empty">
        <Cell label="with icon, message and action">
          <StateBlock
            kind="empty"
            icon={Information}
            title="Example empty"
            message="Nothing here yet. Example Co has no items."
            action={
              <Button kind="tertiary" size="sm">
                Example action
              </Button>
            }
          />
        </Cell>
        <Cell label="title only">
          <StateBlock kind="empty" title="Example empty" />
        </Cell>
      </Section>
      <Section title="Locked">
        <Cell label="locked">
          <StateBlock kind="locked" icon={Locked} title="Example locked" message="Ask an admin to grant access." />
        </Cell>
      </Section>
      <Section title="Not found">
        <Cell label="notFound">
          <StateBlock
            kind="notFound"
            icon={Search}
            title="Example not found"
            message="The page moved or never existed."
            action={
              <Button kind="tertiary" size="sm">
                Example action
              </Button>
            }
          />
        </Cell>
      </Section>
      <Section title="Loading">
        <Cell label="skeleton">
          <StateBlock kind="loading" />
        </Cell>
        <Cell label="with title and message">
          <StateBlock kind="loading" title="Example loading" message="Loading example items." />
        </Cell>
        <Cell label="with message">
          <StateBlock kind="loading" message="Loading rules..." />
        </Cell>
      </Section>
      <Section title="Error">
        <Cell label="with Retry">
          <StateBlock kind="error" title="Example failure" message="Example detail: the request timed out." onRetry={() => {}} />
        </Cell>
        <Cell label="no Retry">
          <StateBlock kind="error" title="Example failure" />
        </Cell>
        <Cell label="default title">
          <StateBlock kind="error" />
        </Cell>
      </Section>
    </>
  );
}
