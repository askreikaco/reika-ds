import { Fragment, useState, type ComponentType, type ReactNode } from 'react';
import {
  Header,
  HeaderGlobalBar,
  HeaderMenu,
  HeaderMenuButton,
  HeaderMenuItem,
  HeaderName,
  HeaderNavigation,
  SideNav,
  SideNavItems,
  SideNavLink,
  Tag,
} from '@carbon/react';
import { OverflowMenuHorizontal } from '@carbon/icons-react';
import { useIsPhone } from '../internal/useIsPhone.js';

// Carbon icon components (@carbon/icons-react) take a size and a class name.
export type IconComponent = ComponentType<{ size?: number | string; className?: string }>;

export interface AppShellNavItem {
  id: string;
  label: string;
  href: string;
  icon?: IconComponent;
  /** Count shown as a small Tag. Shown when set (0 included). */
  badge?: number;
  /** Small indicator for "something new". */
  dot?: boolean;
  /** Side nav heading. Items with the same group are listed under one heading, in first-seen order. */
  group?: string;
}

export interface AppShellSwitcherApp {
  id: string;
  label: string;
  href: string;
  current?: boolean;
}

export interface AppShellLabels {
  /** Accessible name of the main navigation landmarks. */
  mainNav?: string;
  /** Accessible name of the app switcher and its menu. */
  switchApp?: string;
  /** Accessible name of the side nav toggle (md and lg, where the side nav folds away). */
  toggleNav?: string;
  /** Screen-reader text for the dot indicator. */
  dot?: string;
}

const DEFAULT_LABELS: Required<AppShellLabels> = {
  mainNav: 'Main navigation',
  switchApp: 'Switch app',
  toggleNav: 'Toggle navigation',
  dot: 'Has updates',
};

export interface AppShellProps {
  appName: string;
  /** Makes the app name a menu of other apps. Without it the name is plain text. */
  switcher?: { apps: AppShellSwitcherApp[]; onSelect?: (id: string) => void };
  /** Header right side, after the global bar (for example a theme or account control). */
  headerEnd?: ReactNode;
  nav: AppShellNavItem[];
  /** Phone only: the last bottom tab. Takes the fifth slot, so only four nav items show before it. */
  more?: { label: string; href: string };
  /** id of the current nav item. It gets aria-current in both navigations. */
  current: string;
  /** Hides the bottom nav on phone (full-screen task flows). */
  taskMode?: boolean;
  children?: ReactNode;
  labels?: AppShellLabels;
}

const MAX_TABS = 5;

// Phone bottom nav: the nav items first, More last. Items past the limit are only in the side nav (md and up).
function bottomTabs(nav: AppShellNavItem[], more: AppShellProps['more']): AppShellNavItem[] {
  return nav.slice(0, more ? MAX_TABS - 1 : MAX_TABS);
}

function cx(...parts: Array<string | false | null | undefined>): string {
  return parts.filter(Boolean).join(' ');
}

// Header + navigation for one app. Phone: header, then a bottom tab bar (custom: Carbon has none).
// md and up: header with a side nav listing every item by group (no More entry).
export function AppShell({ appName, switcher, headerEnd, nav, more, current, taskMode = false, children, labels }: AppShellProps) {
  const L = { ...DEFAULT_LABELS, ...labels };
  const phone = useIsPhone();
  const [sideOpen, setSideOpen] = useState(true);
  const showTabs = phone && !taskMode;
  const tabs = bottomTabs(nav, more);

  // Side nav groups, in the order each group first appears.
  const groups: Array<{ key: string; title?: string; items: AppShellNavItem[] }> = [];
  for (const item of nav) {
    const key = item.group ?? '';
    let group = groups.find((g) => g.key === key);
    if (!group) {
      group = { key, title: item.group, items: [] };
      groups.push(group);
    }
    group.items.push(item);
  }

  return (
    <div className={cx('rds-app-shell', showTabs && 'rds-app-shell--tabs')}>
      <Header aria-label={appName} className="rds-app-shell__header">
        {!phone ? (
          <HeaderMenuButton
            aria-label={L.toggleNav}
            isActive={sideOpen}
            onClick={() => setSideOpen((open) => !open)}
            className="rds-app-shell__toggle"
          />
        ) : null}
        {switcher ? (
          <HeaderNavigation aria-label={L.switchApp} className="rds-app-shell__switcher">
            <HeaderMenu menuLinkName={appName}>
              {switcher.apps.map((app) => (
                <HeaderMenuItem
                  key={app.id}
                  href={app.href}
                  isCurrentPage={app.current}
                  aria-current={app.current ? 'page' : undefined}
                  onClick={() => switcher.onSelect?.(app.id)}
                >
                  {app.label}
                </HeaderMenuItem>
              ))}
            </HeaderMenu>
          </HeaderNavigation>
        ) : (
          <HeaderName prefix="" element="span" className="rds-app-shell__name">
            {appName}
          </HeaderName>
        )}
        {headerEnd ? <HeaderGlobalBar>{headerEnd}</HeaderGlobalBar> : null}
      </Header>

      {!phone ? (
        <SideNav aria-label={L.mainNav} isFixedNav expanded={sideOpen} className="rds-app-shell__sidenav">
          <SideNavItems>
            {groups.map((group) => (
              <Fragment key={group.key || 'ungrouped'}>
                {group.title ? (
                  <li role="presentation" className="rds-app-shell__group-title">
                    {group.title}
                  </li>
                ) : null}
                {group.items.map((item) => (
                  <SideItem key={item.id} item={item} current={current === item.id} dotLabel={L.dot} />
                ))}
              </Fragment>
            ))}
          </SideNavItems>
        </SideNav>
      ) : null}

      {showTabs ? (
        <nav className="rds-app-shell__tabbar" aria-label={L.mainNav}>
          <ul className="rds-app-shell__tabs">
            {tabs.map((item) => (
              <li key={item.id} className="rds-app-shell__tab-item">
                <a
                  href={item.href}
                  className={cx('rds-app-shell__tab', current === item.id && 'rds-app-shell__tab--current')}
                  aria-current={current === item.id ? 'page' : undefined}
                >
                  {item.icon ? <item.icon size={20} aria-hidden="true" className="rds-app-shell__tab-icon" /> : null}
                  <span className="rds-app-shell__tab-label">{item.label}</span>
                  {item.badge !== undefined ? (
                    <span className="rds-app-shell__tab-badge">
                      <Tag size="sm" type="red">
                        {String(item.badge)}
                      </Tag>
                    </span>
                  ) : null}
                  {item.dot ? (
                    <>
                      <span className="rds-app-shell__dot" aria-hidden="true" />
                      <span className="rds-app-shell__sr">{L.dot}</span>
                    </>
                  ) : null}
                </a>
              </li>
            ))}
            {more ? (
              <li className="rds-app-shell__tab-item">
                <a href={more.href} className="rds-app-shell__tab">
                  <OverflowMenuHorizontal size={20} aria-hidden="true" className="rds-app-shell__tab-icon" />
                  <span className="rds-app-shell__tab-label">{more.label}</span>
                </a>
              </li>
            ) : null}
          </ul>
        </nav>
      ) : null}

      <main className="rds-app-shell__main">{children}</main>
    </div>
  );
}

function SideItem({ item, current, dotLabel }: { item: AppShellNavItem; current: boolean; dotLabel: string }) {
  return (
    <SideNavLink
      href={item.href}
      renderIcon={item.icon}
      isActive={current}
      aria-current={current ? 'page' : undefined}
    >
      {item.label}
      {item.badge !== undefined ? (
        <span className="rds-app-shell__side-badge">
          <Tag size="sm" type="red">
            {String(item.badge)}
          </Tag>
        </span>
      ) : null}
      {item.dot ? (
        <>
          <span className="rds-app-shell__dot" aria-hidden="true" />
          <span className="rds-app-shell__sr">{dotLabel}</span>
        </>
      ) : null}
    </SideNavLink>
  );
}
