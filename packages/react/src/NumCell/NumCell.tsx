import type { ReactNode } from 'react';
import { ArrowDown, ArrowUp, Subtract } from '@carbon/icons-react';

export type NumTrendDir = 'up' | 'down' | 'flat';

export interface NumTrend {
  dir: NumTrendDir;
  text: ReactNode;
}

export interface NumCellLabels {
  /** Screen-reader word for an up trend. */
  up?: string;
  /** Screen-reader word for a down trend. */
  down?: string;
  /** Screen-reader word for a flat trend. */
  flat?: string;
}

const DEFAULT_LABELS: Required<NumCellLabels> = { up: 'Up', down: 'Down', flat: 'No change' };
const TREND_ICON = { up: ArrowUp, down: ArrowDown, flat: Subtract } as const;
const ICON_SIZE = 16;
const DEFAULT_LOCALE = 'vi-VN';

export interface NumCellProps {
  value: number | string;
  /** Unit after the value (for example a currency or %). */
  unit?: ReactNode;
  /** Right-aligns the number. */
  end?: boolean;
  /** Larger value type. */
  large?: boolean;
  /** Trend under the value. The arrow icon and the text carry the direction; colour is never used alone. */
  trend?: NumTrend;
  /** Number format options (Intl.NumberFormat). Applies to number values only. */
  format?: Intl.NumberFormatOptions;
  /** Locale for number formatting. Default vi-VN. */
  locale?: string;
  /** Built-in strings, English by default. */
  labels?: NumCellLabels;
}

// A number with tabular figures, an optional unit and an optional trend (arrow icon, text and a screen-reader word).
export function NumCell({ value, unit, end = false, large = false, trend, format, locale = DEFAULT_LOCALE, labels }: NumCellProps) {
  const strings = { ...DEFAULT_LABELS, ...labels };
  const text = typeof value === 'number' ? new Intl.NumberFormat(locale, format).format(value) : value;
  const classes = ['rds-num-cell', end ? 'rds-num-cell--end' : '', large ? 'rds-num-cell--large' : '']
    .filter(Boolean)
    .join(' ');
  const TrendIcon = trend ? TREND_ICON[trend.dir] : null;

  return (
    <span className={classes}>
      <span className="rds-num-cell__figure">
        <span className="rds-num-cell__value rk-tabular">{text}</span>
        {unit ? <span className="rds-num-cell__unit">{unit}</span> : null}
      </span>
      {trend && TrendIcon ? (
        <span className={`rds-num-cell__trend rds-num-cell__trend--${trend.dir}`}>
          <TrendIcon size={ICON_SIZE} aria-hidden="true" />
          <span className="cds--visually-hidden">{strings[trend.dir]}</span>
          <span>{trend.text}</span>
        </span>
      ) : null}
    </span>
  );
}
