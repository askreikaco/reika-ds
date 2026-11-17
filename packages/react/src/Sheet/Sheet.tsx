import type { ReactNode } from 'react';
import { Button, ComposedModal, ModalHeader } from '@carbon/react';
import { useIsPhone } from '../internal/useIsPhone.js';

export interface SheetAction {
  label: string;
  onClick: () => void;
}

export interface SheetPrimaryAction extends SheetAction {
  /** Destructive action: danger button. */
  danger?: boolean;
  disabled?: boolean;
}

export interface SheetConfirmValue {
  label: string;
  value: ReactNode;
}

export interface SheetLabels {
  /** Accessible name of the close button in the header. */
  close?: string;
}

const DEFAULT_LABELS: Required<SheetLabels> = { close: 'Close' };

export interface SheetProps {
  open: boolean;
  onClose: () => void;
  title: string;
  children?: ReactNode;
  primary?: SheetPrimaryAction;
  secondary?: SheetAction;
  /**
   * modal: centred dialog. bottom: slides up from the bottom edge with a grab handle.
   * auto (default): bottom on phone, modal on md and up.
   */
  placement?: 'modal' | 'bottom' | 'auto';
  /** Summary of the values the user is about to confirm, shown above the children. */
  confirm?: { values: SheetConfirmValue[] };
  labels?: SheetLabels;
}

// One dialog for forms, confirmations and filter panels. Built on Carbon ComposedModal, which gives the focus trap,
// Escape to close and the scrim. The bottom placement and its footer are this component's own styles.
export function Sheet({ open, onClose, title, children, primary, secondary, placement = 'auto', confirm, labels }: SheetProps) {
  const L = { ...DEFAULT_LABELS, ...labels };
  const phone = useIsPhone();
  const resolved: 'modal' | 'bottom' = placement === 'auto' ? (phone ? 'bottom' : 'modal') : placement;
  const bottom = resolved === 'bottom';

  return (
    <ComposedModal
      open={open}
      onClose={() => {
        onClose();
      }}
      size={bottom ? undefined : 'sm'}
      className={`rds-sheet rds-sheet--${resolved}`}
      containerClassName="rds-sheet__container"
    >
      <ModalHeader title={title} iconDescription={L.close} />
      {bottom ? <span className="rds-sheet__handle" aria-hidden="true" /> : null}
      <div className="rds-sheet__body">
        {confirm ? (
          <dl className="rds-sheet__confirm">
            {confirm.values.map((item) => (
              <div key={item.label} className="rds-sheet__confirm-row">
                <dt className="rds-sheet__confirm-label">{item.label}</dt>
                <dd className="rds-sheet__confirm-value">{item.value}</dd>
              </div>
            ))}
          </dl>
        ) : null}
        {children}
      </div>
      {primary || secondary ? (
        <div className="rds-sheet__footer">
          {secondary ? (
            <Button kind="secondary" onClick={secondary.onClick}>
              {secondary.label}
            </Button>
          ) : null}
          {primary ? (
            <Button
              kind={primary.danger ? 'danger' : 'primary'}
              onClick={primary.onClick}
              disabled={primary.disabled}
            >
              {primary.label}
            </Button>
          ) : null}
        </div>
      ) : null}
    </ComposedModal>
  );
}
