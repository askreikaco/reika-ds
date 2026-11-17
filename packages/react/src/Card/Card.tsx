import type { ReactNode } from 'react';
import { ClickableTile, Tile, Toggletip, ToggletipButton, ToggletipContent } from '@carbon/react';
import { Information } from '@carbon/icons-react';

export interface CardProps {
  title?: ReactNode;
  /** Small secondary text in the header, after the title. */
  meta?: ReactNode;
  /** Shows an info button in the header; the content opens in a Toggletip. */
  info?: ReactNode;
  /** Header slot, right side (for example a link or a small button). */
  action?: ReactNode;
  /** Footer below the body, separated from it. */
  footer?: ReactNode;
  /** Body has no side padding (full-width rows with inset dividers). */
  flush?: boolean;
  /** No padding at all; the children set their own spacing (charts, maps). */
  bare?: boolean;
  /** Sits inside another card: no tile of its own, h3 title. */
  embedded?: boolean;
  /** Makes the whole card a link (ClickableTile). Ignored when embedded. */
  href?: string;
  className?: string;
  children?: ReactNode;
}

const INFO_LABEL = 'More information';
const ICON_SIZE = 16;

// Carbon Tile with an optional header (title, meta, info, action), body and footer.
// Every part renders only when its prop is set.
export function Card({ title, meta, info, action, footer, flush = false, bare = false, embedded = false, href, className, children }: CardProps) {
  const hasHead = Boolean(title || meta || info || action);
  const Heading = embedded ? 'h3' : 'h2';
  const classes = [
    'rds-card',
    flush ? 'rds-card--flush' : '',
    bare ? 'rds-card--bare' : '',
    embedded ? 'rds-card--embedded' : '',
    className ?? '',
  ]
    .filter(Boolean)
    .join(' ');

  const inner = (
    <>
      {hasHead ? (
        <div className="rds-card__head">
          {title ? <Heading className="rds-card__title">{title}</Heading> : null}
          {meta || info || action ? (
            <div className="rds-card__tools">
              {meta ? <span className="rds-card__meta">{meta}</span> : null}
              {info ? (
                <Toggletip align="bottom-end" autoAlign>
                  <ToggletipButton label={INFO_LABEL}>
                    <Information size={ICON_SIZE} aria-hidden="true" />
                  </ToggletipButton>
                  <ToggletipContent>{info}</ToggletipContent>
                </Toggletip>
              ) : null}
              {action ? <div className="rds-card__action">{action}</div> : null}
            </div>
          ) : null}
        </div>
      ) : null}
      {children !== undefined && children !== null && children !== false ? (
        <div className="rds-card__body">{children}</div>
      ) : null}
      {footer ? <div className="rds-card__footer">{footer}</div> : null}
    </>
  );

  if (embedded) {
    return <div className={classes}>{inner}</div>;
  }
  if (href) {
    return (
      <ClickableTile className={classes} href={href}>
        {inner}
      </ClickableTile>
    );
  }
  return <Tile className={classes}>{inner}</Tile>;
}
