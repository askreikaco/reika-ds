import type { ElementType, ReactNode } from 'react';
import { Button, InlineNotification, SkeletonText, Tile } from '@carbon/react';

export type StateKind = 'empty' | 'loading' | 'error' | 'locked' | 'notFound';

export interface StateBlockLabels {
  /** Error only: Retry button text. */
  retry?: string;
  /** Error only: notice title when no title prop is given. */
  errorTitle?: string;
}

const DEFAULT_LABELS: Required<StateBlockLabels> = { retry: 'Retry', errorTitle: 'Something went wrong' };

export interface StateBlockProps {
  kind: StateKind;
  title?: string;
  message?: ReactNode;
  /** Carbon icon for the tile kinds (empty, locked, notFound). Error uses the notice icon. */
  icon?: ElementType;
  action?: ReactNode;
  /** Error only: adds a Retry button. */
  onRetry?: () => void;
  /** Built-in strings, English by default. */
  labels?: StateBlockLabels;
}

const ICON_SIZE = 32;

// One block for every empty, loading, error, locked and not-found state.
// loading: skeleton, role status. error: inline notice, role alert, Retry when onRetry is set.
// empty, locked, notFound: tile with optional icon, title, message and action.
export function StateBlock({ kind, title, message, icon: Icon, action, onRetry, labels }: StateBlockProps) {
  const labelSet = { ...DEFAULT_LABELS, ...labels };
  if (kind === 'loading') {
    return (
      <div className="rds-state-block rds-state-block--loading" data-kind={kind} role="status" aria-busy="true">
        {title ? <p className="rds-state-block__title">{title}</p> : null}
        {message ? <p className="rds-state-block__message">{message}</p> : null}
        <SkeletonText paragraph lineCount={3} />
      </div>
    );
  }

  if (kind === 'error') {
    return (
      <div className="rds-state-block rds-state-block--error" data-kind={kind}>
        <InlineNotification
          kind="error"
          role="alert"
          title={title ?? labelSet.errorTitle}
          hideCloseButton
          lowContrast
        />
        {message ? <p className="rds-state-block__message">{message}</p> : null}
        {onRetry || action ? (
          <div className="rds-state-block__actions">
            {onRetry ? (
              <Button kind="tertiary" size="sm" onClick={onRetry}>
                {labelSet.retry}
              </Button>
            ) : null}
            {action}
          </div>
        ) : null}
      </div>
    );
  }

  return (
    <Tile className={`rds-state-block rds-state-block--${kind}`} data-kind={kind}>
      {Icon ? <Icon size={ICON_SIZE} className="rds-state-block__icon" aria-hidden="true" /> : null}
      {title ? <p className="rds-state-block__title">{title}</p> : null}
      {message ? <p className="rds-state-block__message">{message}</p> : null}
      {action ? <div className="rds-state-block__actions">{action}</div> : null}
    </Tile>
  );
}
