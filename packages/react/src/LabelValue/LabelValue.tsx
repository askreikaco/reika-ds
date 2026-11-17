import type { ReactNode } from 'react';

export type LabelValueLayout = 'inline' | 'stack';

export interface LabelValueProps {
  label: ReactNode;
  value: ReactNode;
  /** Smaller value type and tighter spacing (list rows, dense cards). */
  dense?: boolean;
  /** Right-side slot after the pair (a button, a StatusTag, a link). */
  end?: ReactNode;
  /** inline: label and value on one line. stack: label above value. */
  layout?: LabelValueLayout;
}

// One label and its value as a description list (dt, dd). Carbon has no pair component; type comes from Carbon type tokens.
export function LabelValue({ label, value, dense = false, end, layout = 'stack' }: LabelValueProps) {
  const classes = ['rds-label-value', `rds-label-value--${layout}`, dense ? 'rds-label-value--dense' : '']
    .filter(Boolean)
    .join(' ');
  return (
    <div className={classes}>
      <dl className="rds-label-value__pair">
        <dt className="rds-label-value__label">{label}</dt>
        <dd className="rds-label-value__value">{value}</dd>
      </dl>
      {end ? <div className="rds-label-value__end">{end}</div> : null}
    </div>
  );
}
