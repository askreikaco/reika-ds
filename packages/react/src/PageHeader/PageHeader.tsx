import type { ReactNode } from 'react';
import { Breadcrumb, BreadcrumbItem, Button } from '@carbon/react';
import { ArrowLeft } from '@carbon/icons-react';

export type PageHeaderBack = { label: string } & (
  | { href: string; onClick?: never }
  | { onClick: () => void; href?: never }
);

export interface PageHeaderCrumb {
  label: string;
  href: string;
}

export interface PageHeaderProps {
  title: string;
  subtitle?: ReactNode;
  back?: PageHeaderBack;
  /** Small secondary line under the title (status, dates, owner). */
  meta?: ReactNode;
  /** Right side: buttons or links. */
  actions?: ReactNode;
  /** Trail above the title; the last item is the current page. */
  breadcrumb?: PageHeaderCrumb[];
  /** 1 renders an h1 (page), 2 renders an h2 (section within a page). */
  level?: 1 | 2;
}

// Page title row: optional breadcrumb, back link, title, subtitle, meta and actions.
export function PageHeader({ title, subtitle, back, meta, actions, breadcrumb, level = 1 }: PageHeaderProps) {
  const Heading = level === 1 ? 'h1' : 'h2';
  const lastIndex = breadcrumb ? breadcrumb.length - 1 : -1;

  return (
    <header className="rds-page-header">
      {breadcrumb && breadcrumb.length > 0 ? (
        <Breadcrumb noTrailingSlash className="rds-page-header__breadcrumb">
          {breadcrumb.map((crumb, index) => (
            <BreadcrumbItem
              key={`${crumb.href}-${index}`}
              href={crumb.href}
              isCurrentPage={index === lastIndex}
              aria-current={index === lastIndex ? 'page' : undefined}
            >
              {crumb.label}
            </BreadcrumbItem>
          ))}
        </Breadcrumb>
      ) : null}
      <div className="rds-page-header__row">
        <div className="rds-page-header__main">
          {back ? (
            back.href !== undefined ? (
              <Button kind="ghost" size="sm" href={back.href} renderIcon={ArrowLeft} className="rds-page-header__back">
                {back.label}
              </Button>
            ) : (
              <Button kind="ghost" size="sm" onClick={back.onClick} renderIcon={ArrowLeft} className="rds-page-header__back">
                {back.label}
              </Button>
            )
          ) : null}
          <Heading className={`rds-page-header__title rds-page-header__title--${level}`}>{title}</Heading>
          {subtitle ? <p className="rds-page-header__subtitle">{subtitle}</p> : null}
          {meta ? <p className="rds-page-header__meta">{meta}</p> : null}
        </div>
        {actions ? <div className="rds-page-header__actions">{actions}</div> : null}
      </div>
    </header>
  );
}
