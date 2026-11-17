import type { ComponentType } from 'react';
import { AppShellPage } from './pages/AppShellPage';
import { CardPage } from './pages/CardPage';
import { ChartCardPage } from './pages/ChartCardPage';
import { ChoiceControlPage } from './pages/ChoiceControlPage';
import { DataTablePage } from './pages/DataTablePage';
import { FieldPage } from './pages/FieldPage';
import { LabelValuePage } from './pages/LabelValuePage';
import { NumCellPage } from './pages/NumCellPage';
import { ProgressPage } from './pages/ProgressPage';
import { SettingsGroupPage } from './pages/SettingsGroupPage';
import { ThumbPage } from './pages/ThumbPage';
import { TipPage } from './pages/TipPage';
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
  { slug: 'label-value', title: 'LabelValue', Page: LabelValuePage },
  { slug: 'settings-group', title: 'SettingsGroup', Page: SettingsGroupPage },
  { slug: 'tip', title: 'Tip', Page: TipPage },
  { slug: 'progress', title: 'Progress', Page: ProgressPage },
  { slug: 'num-cell', title: 'NumCell', Page: NumCellPage },
  { slug: 'thumb', title: 'Thumb', Page: ThumbPage },
  { slug: 'chart-card', title: 'ChartCard', Page: ChartCardPage },
];

// Hash routes: #/<slug>. Unknown or empty hash shows the first page.
export function routeFor(hash: string): Route {
  const slug = hash.replace(/^#\/?/, '');
  return routes.find((route) => route.slug === slug) ?? routes[0];
}
