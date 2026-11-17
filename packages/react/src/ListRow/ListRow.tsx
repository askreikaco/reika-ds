import type { ElementType, ReactNode } from 'react';
import { ContainedListItem } from '@carbon/react';
import { ChevronRight, Warning } from '@carbon/icons-react';

export interface ListRowProps {
  title: string;
  /** Left slot: thumbnail, icon or avatar. */
  leading?: ReactNode;
  /** Secondary line under the title. */
  meta?: ReactNode;
  /** Right side, before end (for example a StatusTag). */
  badge?: ReactNode;
  /** Right side, last slot. */
  end?: ReactNode;
  chevron?: boolean;
  /** Makes the row a link. */
  href?: string;
  /** Element used for the link (default 'a'). Pass a router adapter to navigate client-side, for example one wrapping react-router's Link. */
  linkAs?: ElementType;
  /** Makes the row a button. */
  onClick?: () => void;
  density?: 'default' | 'compact';
  muted?: boolean;
  disabled?: boolean;
  /** Marks the row as failed: error colour and warning icon. */
  error?: boolean;
}

const ICON_SIZE = 16;

// One row in a ContainedList (render rows inside a ul). Built on ContainedListItem.
// Interactive rows (href or onClick) get a focus ring and a 44px minimum height.
export function ListRow({
  title,
  leading,
  meta,
  badge,
  end,
  chevron = false,
  href,
  linkAs = 'a',
  onClick,
  density = 'default',
  muted = false,
  disabled = false,
  error = false,
}: ListRowProps) {
  const interactive = Boolean(href || onClick) && !disabled;
  const classes = [
    'rds-list-row',
    `rds-list-row--${density}`,
    interactive ? 'rds-list-row--interactive' : '',
    muted ? 'rds-list-row--muted' : '',
    disabled ? 'rds-list-row--disabled' : '',
    error ? 'rds-list-row--error' : '',
  ]
    .filter(Boolean)
    .join(' ');

  const content = (
    <span className="rds-list-row__body">
      {leading ? <span className="rds-list-row__leading">{leading}</span> : null}
      <span className="rds-list-row__main">
        <span className="rds-list-row__title">{title}</span>
        {meta ? <span className="rds-list-row__meta">{meta}</span> : null}
      </span>
      {error ? <Warning size={ICON_SIZE} className="rds-list-row__error-icon" aria-hidden="true" /> : null}
      {badge ? <span className="rds-list-row__badge">{badge}</span> : null}
      {end ? <span className="rds-list-row__end">{end}</span> : null}
      {chevron ? <ChevronRight size={ICON_SIZE} className="rds-list-row__chevron" aria-hidden="true" /> : null}
    </span>
  );

  if (href && !disabled) {
    const LinkAs = linkAs;
    return (
      <ContainedListItem className={classes}>
        <LinkAs className="rds-list-row__hit" href={href}>
          {content}
        </LinkAs>
      </ContainedListItem>
    );
  }
  if (onClick) {
    return (
      <ContainedListItem className={classes} onClick={onClick} disabled={disabled}>
        {content}
      </ContainedListItem>
    );
  }
  return (
    <ContainedListItem className={classes} aria-disabled={disabled ? 'true' : undefined}>
      {content}
    </ContainedListItem>
  );
}
