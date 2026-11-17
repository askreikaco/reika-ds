import type { ReactNode } from 'react';

// One labelled block on a catalog page: every variant of one prop, side by side (wraps on phones).
export function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="catalog__section">
      <h2 className="catalog__section-title">{title}</h2>
      <div className="catalog__row">{children}</div>
    </section>
  );
}

export function Cell({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="catalog__cell">
      <span className="catalog__cell-label">{label}</span>
      {children}
    </div>
  );
}
