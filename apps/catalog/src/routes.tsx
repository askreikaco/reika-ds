import type { ComponentType } from 'react';
import { AppShellPage } from './pages/AppShellPage';
import { CardPage } from './pages/CardPage';
import { ChoiceControlPage } from './pages/ChoiceControlPage';
import { DataTablePage } from './pages/DataTablePage';
import { FieldPage } from './pages/FieldPage';
import { ListRowPage } from './pages/ListRowPage';
import { PageHeaderPage } from './pages/PageHeaderPage';
import { StatPage } from './pages/StatPage';
import { StateBlockPage } from './pages/StateBlockPage';
import { SheetPage } from './pages/SheetPage';
import { StatusTagPage } from './pages/StatusTagPage';
import { ToolbarPage } from './pages/ToolbarPage';

export interface Route {
  slug: string;
  title: string;
  Page: ComponentType;
}

export const routes: Route[] = [
  { slug: 'status-tag', title: 'StatusTag', Page: StatusTagPage },
  { slug: 'state-block', title: 'StateBlock', Page: StateBlockPage },
  { slug: 'card', title: 'Card', Page: CardPage },
  { slug: 'stat', title: 'Stat', Page: StatPage },
  { slug: 'list-row', title: 'ListRow', Page: ListRowPage },
  { slug: 'page-header', title: 'PageHeader', Page: PageHeaderPage },
  { slug: 'app-shell', title: 'AppShell', Page: AppShellPage },
  { slug: 'toolbar', title: 'Toolbar', Page: ToolbarPage },
  { slug: 'sheet', title: 'Sheet', Page: SheetPage },
  { slug: 'data-table', title: 'DataTable', Page: DataTablePage },
  { slug: 'choice-control', title: 'ChoiceControl', Page: ChoiceControlPage },
  { slug: 'field', title: 'Field', Page: FieldPage },
];

// Hash routes: #/<slug>. Unknown or empty hash shows the first page.
export function routeFor(hash: string): Route {
  const slug = hash.replace(/^#\/?/, '');
  return routes.find((route) => route.slug === slug) ?? routes[0];
}
