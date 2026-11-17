import type { ComponentType } from 'react';
import { CardPage } from './pages/CardPage';
import { ListRowPage } from './pages/ListRowPage';
import { PageHeaderPage } from './pages/PageHeaderPage';
import { StatPage } from './pages/StatPage';
import { StateBlockPage } from './pages/StateBlockPage';
import { StatusTagPage } from './pages/StatusTagPage';

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
];

// Hash routes: #/<slug>. Unknown or empty hash shows the first page.
export function routeFor(hash: string): Route {
  const slug = hash.replace(/^#\/?/, '');
  return routes.find((route) => route.slug === slug) ?? routes[0];
}
