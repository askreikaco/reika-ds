import type { ReactNode } from 'react';
import { Toggletip, ToggletipButton, ToggletipContent } from '@carbon/react';
import { Information } from '@carbon/icons-react';

export type TipVariant = 'info' | 'term' | 'detail';

export type TipAlign =
  | 'top'
  | 'top-start'
  | 'top-end'
  | 'bottom'
  | 'bottom-start'
  | 'bottom-end'
  | 'left'
  | 'left-start'
  | 'left-end'
  | 'right'
  | 'right-start'
  | 'right-end';

export interface TipLabels {
  /** Visible text of the detail trigger. */
  detail?: string;
}

const DEFAULT_LABELS: Required<TipLabels> = { detail: 'Details' };

const DEFAULT_ALIGN: Record<TipVariant, TipAlign> = {
  info: 'bottom-end',
  term: 'top-start',
  detail: 'bottom-start',
};

const ICON_SIZE = 16;

export interface TipProps {
  /** info: an info icon. term: the label as underlined dotted text. detail: a "Details" text button. */
  variant: TipVariant;
  /** Accessible name of the trigger. For term, the label is also the visible text. */
  label: string;
  /** Toggletip content. */
  children: ReactNode;
  align?: TipAlign;
  /** Built-in strings, English by default. */
  labels?: TipLabels;
}

// A help bubble: a Carbon Toggletip with one of three triggers. Opens on click or keyboard; content is shown in the Toggletip.
export function Tip({ variant, label, children, align, labels }: TipProps) {
  const trigger =
    variant === 'info' ? (
      <Information size={ICON_SIZE} aria-hidden="true" />
    ) : variant === 'term' ? (
      <span className="rds-tip__term-text">{label}</span>
    ) : (
      (labels?.detail ?? DEFAULT_LABELS.detail)
    );

  return (
    <Toggletip align={align ?? DEFAULT_ALIGN[variant]} autoAlign className={`rds-tip rds-tip--${variant}`}>
      <ToggletipButton label={label} className="rds-tip__trigger">
        {trigger}
      </ToggletipButton>
      <ToggletipContent>{children}</ToggletipContent>
    </Toggletip>
  );
}
