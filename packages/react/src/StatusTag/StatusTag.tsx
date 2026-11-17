import type { ElementType } from 'react';
import { DismissibleTag, Tag } from '@carbon/react';

export type StatusTone = 'good' | 'bad' | 'warn' | 'info' | 'neutral' | 'cool';
export type StatusTagSize = 'sm' | 'md' | 'lg';

// Tone -> Carbon Tag type. warn uses magenta, the Carbon colour for warnings.
export const STATUS_TONE_TYPE = {
  good: 'green',
  bad: 'red',
  warn: 'magenta',
  info: 'blue',
  neutral: 'gray',
  cool: 'cool-gray',
} as const satisfies Record<StatusTone, string>;

export interface StatusTagLabels {
  /** Accessible name of the dismiss button. */
  dismiss?: string;
}

const DEFAULT_LABELS: Required<StatusTagLabels> = { dismiss: 'Dismiss' };

export interface StatusTagProps {
  tone?: StatusTone;
  /** Tag text. A string, because the dismissible variant needs one. */
  children: string;
  /** Carbon icon component, rendered before the text. */
  icon?: ElementType;
  size?: StatusTagSize;
  /** Count shown after the text. Rendered when set (0 included). With onClose it is appended to the text. */
  count?: number;
  /** Adds a dismiss button when set. */
  onClose?: () => void;
  /** Built-in strings, English by default. */
  labels?: StatusTagLabels;
}

const ICON_SIZE_DEFAULT = 16;
const ICON_SIZE_LG = 20;

// Carbon Tag draws its own renderIcon only at md and lg, so the icon is rendered here, as the first child.
export function StatusTag({ tone = 'neutral', children, icon: Icon, size = 'sm', count, onClose, labels }: StatusTagProps) {
  const type = STATUS_TONE_TYPE[tone];
  const dismissLabel = labels?.dismiss ?? DEFAULT_LABELS.dismiss;
  const hasCount = count !== undefined;
  const iconSize = size === 'lg' ? ICON_SIZE_LG : ICON_SIZE_DEFAULT;
  const iconEl = Icon ? (
    <span className="rds-status-tag__icon" aria-hidden="true">
      <Icon size={iconSize} />
    </span>
  ) : null;

  if (onClose) {
    // DismissibleTag takes plain text only, so the count is appended to the text here.
    const text = hasCount ? `${children} (${count})` : children;
    return (
      <span className="rds-status-tag rds-status-tag--dismissible">
        {iconEl}
        <DismissibleTag type={type} size={size} text={text} title={dismissLabel} onClose={() => onClose()} />
      </span>
    );
  }

  return (
    <Tag className="rds-status-tag" type={type} size={size}>
      {iconEl}
      {children}
      {hasCount ? <span className="rds-status-tag__count">{count}</span> : null}
    </Tag>
  );
}
