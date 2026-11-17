import { Button } from '@carbon/react';
import { PageHeader } from '@reika-ds/react';
import { Section } from './shared';

const CRUMBS = [
  { label: 'Example Co', href: '#/page-header' },
  { label: 'Example workspace', href: '#/page-header' },
  { label: 'Example page', href: '#/page-header' },
];

export function PageHeaderPage() {
  return (
    <>
      <Section title="Level 1, all parts">
        <div style={{ inlineSize: '100%' }}>
          <PageHeader
            title="Example page"
            subtitle="Example subtitle that says what the page is for."
            meta="Example meta: status active, Person 1"
            back={{ label: 'Example back', href: '#/page-header' }}
            breadcrumb={CRUMBS}
            actions={
              <>
                <Button kind="secondary" size="md">
                  Example secondary
                </Button>
                <Button kind="primary" size="md">
                  Example primary
                </Button>
              </>
            }
          />
        </div>
      </Section>
      <Section title="Minimal">
        <div style={{ inlineSize: '100%' }}>
          <PageHeader title="Example page" />
        </div>
      </Section>
      <Section title="Back with onClick">
        <div style={{ inlineSize: '100%' }}>
          <PageHeader title="Example page" back={{ label: 'Example back', onClick: () => {} }} />
        </div>
      </Section>
      <Section title="Level 2">
        <div style={{ inlineSize: '100%' }}>
          <PageHeader level={2} title="Example section" subtitle="Example subtitle" />
        </div>
      </Section>
    </>
  );
}
