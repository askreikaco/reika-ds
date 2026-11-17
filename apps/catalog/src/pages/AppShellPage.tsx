import { AppShell, type AppShellNavItem } from '@reika-ds/react';
import { Calendar, Chat, Document, Home, Settings, Task } from '@carbon/icons-react';
import type { ReactNode } from 'react';
import { Cell, Section } from './shared';

const nav: AppShellNavItem[] = [
  { id: 'home', label: 'Example home', href: '#/app-shell', icon: Home, group: 'Work' },
  { id: 'tasks', label: 'Example tasks', href: '#/app-shell', icon: Task, badge: 4, group: 'Work' },
  { id: 'docs', label: 'Example docs', href: '#/app-shell', icon: Document, dot: true, group: 'Library' },
  { id: 'calendar', label: 'Example calendar', href: '#/app-shell', icon: Calendar, group: 'Library' },
  { id: 'chat', label: 'Example chat', href: '#/app-shell', icon: Chat, badge: 0, group: 'Library' },
  { id: 'settings', label: 'Example settings', href: '#/app-shell', icon: Settings, group: 'Account' },
];

const more = { label: 'Example more', href: '#/app-shell' };

const apps = [
  { id: 'one', label: 'Example one', href: '#/app-shell', current: true },
  { id: 'two', label: 'Example two', href: '#/app-shell' },
];

// The frame gives the fixed header and tab bar a containing block, so they stay inside the example.
function Frame({ children }: { children: ReactNode }) {
  return <div className="catalog__frame">{children}</div>;
}

export function AppShellPage() {
  return (
    <>
      <Section title="Phone (below md): header and bottom tab bar">
        <Cell label="four items and More">
          <Frame>
            <AppShell appName="Example app" nav={nav} more={more} current="tasks">
              <p className="catalog__note">Example content</p>
            </AppShell>
          </Frame>
        </Cell>
      </Section>
      <Section title="Phone: taskMode hides the bottom nav">
        <Cell label="taskMode">
          <Frame>
            <AppShell appName="Example app" nav={nav} more={more} current="tasks" taskMode>
              <p className="catalog__note">Example task flow</p>
            </AppShell>
          </Frame>
        </Cell>
      </Section>
      <Section title="Phone: app switcher">
        <Cell label="switcher">
          <Frame>
            <AppShell appName="Example app" nav={nav} more={more} current="home" switcher={{ apps }}>
              <p className="catalog__note">Example content</p>
            </AppShell>
          </Frame>
        </Cell>
      </Section>
      <Section title="md and up: side nav grouped, no More">
        <Cell label="side nav">
          <Frame>
            <AppShell appName="Example app" nav={nav} more={more} current="docs" switcher={{ apps }}>
              <p className="catalog__note">Example content</p>
            </AppShell>
          </Frame>
        </Cell>
      </Section>
    </>
  );
}
