import { useState, type ReactNode } from 'react';
import { Image as ImageIcon } from '@carbon/icons-react';

export type ThumbSize = 'sm' | 'md' | 'lg';
export type ThumbRatio = '1:1' | '4:3' | '16:9';

export interface ThumbProps {
  /** Image address. Without it, or when the image fails to load, the fallback shows. */
  src?: string;
  /** Text for the image; for the placeholder, its accessible name. */
  alt: string;
  size?: ThumbSize;
  /** Replaces the default placeholder icon. */
  fallback?: ReactNode;
  /** Shape of the box. Default 1:1. */
  ratio?: ThumbRatio;
}

const ICON_SIZE: Record<ThumbSize, number> = { sm: 16, md: 20, lg: 32 };
const RATIO_CLASS: Record<ThumbRatio, string> = {
  '1:1': 'rds-thumb--ratio-1-1',
  '4:3': 'rds-thumb--ratio-4-3',
  '16:9': 'rds-thumb--ratio-16-9',
};

// A fixed-size image box (object-fit cover). Without an image, the same box shows a placeholder, so the layout does not shift.
export function Thumb({ src, alt, size = 'md', fallback, ratio = '1:1' }: ThumbProps) {
  const [failed, setFailed] = useState(false);
  const classes = `rds-thumb rds-thumb--${size} ${RATIO_CLASS[ratio]}`;

  if (src && !failed) {
    return <img className={classes} src={src} alt={alt} loading="lazy" decoding="async" onError={() => setFailed(true)} />;
  }

  return (
    <span role="img" aria-label={alt} className={`${classes} rds-thumb--empty`}>
      {fallback ?? <ImageIcon size={ICON_SIZE[size]} aria-hidden="true" />}
    </span>
  );
}
