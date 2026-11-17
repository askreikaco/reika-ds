import { Children, type ReactNode } from 'react';
import { ArrowDown, ArrowUp, Subtract } from '@carbon/icons-react';
import { Column, Grid, Tile } from '@carbon/react';

export type StatSize = 'sm' | 'md' | 'lg';
export type StatTone = 'neutral' | 'success' | 'error';
export type StatTrendDir = 'up' | 'down' | 'flat';

export interface StatTrend {
  dir: StatTrendDir;
  text: ReactNode;
}

export interface StatProps {
  label: ReactNode;
  value: ReactNode;
  sub?: ReactNode;
  /** Value size. The size is the emphasis: the value is never bold. */
  size?: StatSize;
  tone?: StatTone;
  trend?: StatTrend;
  /** Visual after the value (a Sparkline, for example). */
  sparkline?: ReactNode;
  /** Wraps the stat in a Carbon Tile. */
  tile?: boolean;
  /** Root element. Use 'td' inside a table. */
  as?: 'div' | 'td';
}

const TREND_ICON = { up: ArrowUp, down: ArrowDown, flat: Subtract } as const;
const TREND_ICON_SIZE = 16;

export function Stat({ label, value, sub, size = 'md', tone = 'neutral', trend, sparkline, tile = false, as = 'div' }: StatProps) {
  const Root = as;
  const TrendIcon = trend ? TREND_ICON[trend.dir] : null;
  const body = (
    <>
      <span className="rds-stat__label">{label}</span>
      <span className="rds-stat__figure">
        <span className={`rds-stat__value rds-stat__value--${size} rds-stat__value--${tone}`}>{value}</span>
        {sparkline ? <span className="rds-stat__sparkline">{sparkline}</span> : null}
      </span>
      {sub ? <span className="rds-stat__sub">{sub}</span> : null}
      {trend ? (
        <span className={`rds-stat__trend rds-stat__trend--${trend.dir}`}>
          {TrendIcon ? <TrendIcon size={TREND_ICON_SIZE} aria-hidden="true" /> : null}
          <span>{trend.text}</span>
        </span>
      ) : null}
    </>
  );

  if (tile) {
    return <Tile className="rds-stat rds-stat--tile">{body}</Tile>;
  }
  return <Root className="rds-stat">{body}</Root>;
}

export interface StatGridProps {
  cols?: 2 | 3 | 4;
  children: ReactNode;
}

// Carbon 16-column grid for large screens (lg), 8 columns from md (two per row), 4 on phones (one per row).
const LG_SPAN = { 2: 8, 3: 5, 4: 4 } as const;
const MD_SPAN = 4;
const SM_SPAN = 4;

export function StatGrid({ cols = 3, children }: StatGridProps) {
  return (
    <Grid className="rds-stat-grid">
      {Children.toArray(children).map((child, index) => (
        <Column key={index} sm={SM_SPAN} md={MD_SPAN} lg={LG_SPAN[cols]}>
          {child}
        </Column>
      ))}
    </Grid>
  );
}
