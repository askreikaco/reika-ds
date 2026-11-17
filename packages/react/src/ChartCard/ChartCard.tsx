import type { ElementType, ReactNode } from 'react';
import { Card } from '../Card/Card.js';
import { StateBlock } from '../StateBlock/StateBlock.js';

export type ChartHeight = 'sm' | 'md' | 'lg' | 'lg-sm';

export interface ChartCardEmpty {
  title: string;
  message?: ReactNode;
  icon?: ElementType;
}

export interface ChartCardProps {
  title?: ReactNode;
  /** Small secondary text in the header. */
  meta?: ReactNode;
  /** Header slot, right side (chart toolbar: table view, export). */
  action?: ReactNode;
  /** Height of the chart box (token chart-height-*). Default md. */
  height?: ChartHeight;
  /** Footer below the chart, for example a legend. */
  legend?: ReactNode;
  /** The chart. No chart library is required; any chart fits here. */
  children: ReactNode;
  /** When set, shows an empty StateBlock in the chart box instead of the chart. */
  empty?: ChartCardEmpty;
}

// A Card for one full-size chart: the chart sits in a box of a fixed token height, so the layout does not move when the chart loads.
export function ChartCard({ title, meta, action, height = 'md', legend, children, empty }: ChartCardProps) {
  return (
    <Card className="rds-chart-card" title={title} meta={meta} action={action} footer={legend}>
      <div className={`rds-chart-card__box rds-chart-card__box--${height}`}>
        {empty ? <StateBlock kind="empty" title={empty.title} message={empty.message} icon={empty.icon} /> : children}
      </div>
    </Card>
  );
}
