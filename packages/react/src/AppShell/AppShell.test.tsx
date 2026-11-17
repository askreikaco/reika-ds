import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen, within } from '@testing-library/react';
import { Calendar, Chat, Document, Home, Settings, Task } from '@carbon/icons-react';
import { AppShell, type AppShellNavItem } from './AppShell.js';
import { setViewport } from '../../test/viewport.js';

const nav: AppShellNavItem[] = [
  { id: 'home', label: 'Example home', href: '/home', icon: Home, group: 'Work' },
  { id: 'tasks', label: 'Example tasks', href: '/tasks', icon: Task, badge: 4, group: 'Work' },
  { id: 'docs', label: 'Example docs', href: '/docs', icon: Document, dot: true, group: 'Library' },
  { id: 'calendar', label: 'Example calendar', href: '/calendar', icon: Calendar, group: 'Library' },
  { id: 'chat', label: 'Example chat', href: '/chat', icon: Chat, badge: 0 },
  { id: 'settings', label: 'Example settings', href: '/settings', icon: Settings, group: 'Account' },
  { id: 'extra', label: 'Example extra', href: '/extra', group: 'Account' },
];

const more = { label: 'Example more', href: '/more' };

afterEach(() => {
  vi.restoreAllMocks();
});

describe('AppShell on phone', () => {
  beforeEach(() => setViewport('phone'));

  it('bottom nav: up to five tabs, the first four nav items then More last', () => {
    render(<AppShell appName="Example app" nav={nav} more={more} current="home">Example content</AppShell>);
    const tabs = within(screen.getByRole('navigation', { name: 'Main navigation' })).getAllByRole('link');
    expect(tabs).toHaveLength(5);
    expect(tabs.map((tab) => tab.querySelector('.rds-app-shell__tab-label')?.textContent)).toEqual([
      'Example home',
      'Example tasks',
      'Example docs',
      'Example calendar',
      'Example more',
    ]);
  });

  it('without More the bottom nav holds up to five nav items', () => {
    render(<AppShell appName="Example app" nav={nav} current="home">Example content</AppShell>);
    const tabs = within(screen.getByRole('navigation', { name: 'Main navigation' })).getAllByRole('link');
    expect(tabs).toHaveLength(5);
    expect(tabs[4]).toHaveTextContent('Example chat');
  });

  it('marks the current item with aria-current on the bottom tab', () => {
    render(<AppShell appName="Example app" nav={nav} more={more} current="tasks">Example content</AppShell>);
    expect(screen.getByRole('link', { name: /Example tasks/ })).toHaveAttribute('aria-current', 'page');
    expect(screen.getByRole('link', { name: /Example home/ })).not.toHaveAttribute('aria-current');
  });

  it('badge renders a count Tag and dot renders an indicator with screen-reader text', () => {
    const { container } = render(<AppShell appName="Example app" nav={nav} more={more} current="home">Example content</AppShell>);
    expect(screen.getByRole('link', { name: /Example tasks/ })).toHaveTextContent('4');
    expect(container.querySelectorAll('.rds-app-shell__dot')).toHaveLength(1);
    expect(screen.getByText('Has updates')).toBeInTheDocument();
  });

  it('dot is anchored to the icon wrapper in the bottom tabs', () => {
    const { container } = render(<AppShell appName="Example app" nav={nav} more={more} current="home">Example content</AppShell>);
    const tab = container.querySelector('.rds-app-shell__tabbar .rds-app-shell__dot');
    expect(tab?.parentElement).toHaveClass('rds-app-shell__icon-wrap');
  });

  it('taskMode hides the bottom nav', () => {
    render(<AppShell appName="Example app" nav={nav} more={more} current="home" taskMode>Example content</AppShell>);
    expect(screen.queryByRole('navigation', { name: 'Main navigation' })).toBeNull();
  });

  it('phone has no side nav', () => {
    const { container } = render(<AppShell appName="Example app" nav={nav} more={more} current="home">Example content</AppShell>);
    expect(container.querySelector('.rds-app-shell__sidenav')).toBeNull();
  });

  it('switcher: the app name opens a menu of apps and selecting one calls onSelect', () => {
    const onSelect = vi.fn();
    render(
      <AppShell
        appName="Example app"
        nav={nav}
        current="home"
        switcher={{
          apps: [
            { id: 'one', label: 'Example one', href: '#/one', current: true },
            { id: 'two', label: 'Example two', href: '#/two' },
          ],
          onSelect,
        }}
      >
        Example content
      </AppShell>,
    );
    fireEvent.click(screen.getByRole('link', { name: 'Example app' }));
    fireEvent.click(screen.getByRole('link', { name: 'Example two' }));
    expect(onSelect).toHaveBeenCalledWith('two');
    expect(screen.getByRole('link', { name: 'Example one' })).toHaveAttribute('aria-current', 'page');
  });

  it('without switcher the app name is plain text and there is no menu', () => {
    render(<AppShell appName="Example app" nav={nav} more={more} current="home">Example content</AppShell>);
    expect(document.querySelector('.rds-app-shell__name')).toHaveTextContent('Example app');
    expect(screen.queryByRole('link', { name: 'Example app' })).toBeNull();
  });

  it('labels replace the default navigation names', () => {
    render(<AppShell appName="Example app" nav={nav} more={more} current="home" labels={{ mainNav: 'Example primary' }}>Example content</AppShell>);
    expect(screen.getByRole('navigation', { name: 'Example primary' })).toBeInTheDocument();
    expect(screen.queryByRole('navigation', { name: 'Main navigation' })).toBeNull();
  });
});

describe('AppShell on desktop', () => {
  beforeEach(() => setViewport('desktop'));

  it('side nav lists every item grouped, with no More entry and no bottom nav', () => {
    const { container } = render(<AppShell appName="Example app" nav={nav} more={more} current="home">Example content</AppShell>);
    const side = container.querySelector('.rds-app-shell__sidenav') as HTMLElement;
    expect(side).not.toBeNull();
    const links = within(side).getAllByRole('link');
    expect(links).toHaveLength(nav.length);
    expect(screen.queryByText('Example more')).toBeNull();
    expect(container.querySelector('.rds-app-shell__tabbar')).toBeNull();
    expect(within(side).getByText('Work', { selector: '.rds-app-shell__group-title' })).toBeInTheDocument();
    expect(within(side).getByText('Account', { selector: '.rds-app-shell__group-title' })).toBeInTheDocument();
  });

  it('the toggle folds the side nav away and opens it again', () => {
    const { container } = render(<AppShell appName="Example app" nav={nav} current="home">Example content</AppShell>);
    const toggle = screen.getByRole('button', { name: 'Toggle navigation' });
    const side = () => container.querySelector('.rds-app-shell__sidenav');
    expect(side()).toHaveClass('cds--side-nav--expanded');
    fireEvent.click(toggle);
    expect(side()).not.toHaveClass('cds--side-nav--expanded');
    fireEvent.click(toggle);
    expect(side()).toHaveClass('cds--side-nav--expanded');
  });

  it('dot is anchored to the icon wrapper in the side nav', () => {
    const { container } = render(<AppShell appName="Example app" nav={nav} current="home">Example content</AppShell>);
    const dot = container.querySelector('.rds-app-shell__sidenav .rds-app-shell__dot');
    expect(dot?.parentElement).toHaveClass('rds-app-shell__icon-wrap');
    expect(dot?.parentElement?.querySelector('svg')).not.toBeNull();
  });

  it('marks the current side nav item with aria-current', () => {
    render(<AppShell appName="Example app" nav={nav} current="docs">Example content</AppShell>);
    expect(screen.getByRole('link', { name: /Example docs/ })).toHaveAttribute('aria-current', 'page');
  });
});
