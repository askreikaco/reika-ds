import type { ReactNode } from 'react';
import { describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/react';
import { Card } from './Card.js';

const TestLink = ({ href, className, children }: { href?: string; className?: string; children?: ReactNode }) => (
  <a data-testid="test-link" href={href} className={className}>
    {children}
  </a>
);

describe('Card', () => {
  it('minimal props: children only, no heading, info button, footer or link', () => {
    const { container } = render(<Card>Example body</Card>);
    expect(screen.getByText('Example body')).toBeInTheDocument();
    expect(screen.queryByRole('heading')).toBeNull();
    expect(screen.queryByRole('button')).toBeNull();
    expect(screen.queryByRole('link')).toBeNull();
    expect(container.querySelector('.rds-card__footer')).toBeNull();
    expect(container.querySelector('.rds-card__tools')).toBeNull();
  });

  it('every prop: title, meta, info, action, footer and body are present', () => {
    render(
      <Card
        title="Example card"
        meta="Example meta"
        info="Example info text"
        action={<button type="button">Example action</button>}
        footer="Example footer"
      >
        Example body
      </Card>,
    );
    expect(screen.getByRole('heading', { level: 2, name: 'Example card' })).toBeInTheDocument();
    expect(screen.getByText('Example meta')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Example action' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'More information' })).toBeInTheDocument();
    expect(screen.getByText('Example footer')).toBeInTheDocument();
    expect(screen.getByText('Example body')).toBeInTheDocument();
  });

  it('meta alone (header shown, no info) renders no info button', () => {
    render(<Card title="Example card" meta="Example meta">Example body</Card>);
    expect(screen.getByText('Example meta')).toBeInTheDocument();
    expect(screen.queryByRole('button')).toBeNull();
  });

  it('info opens its content in a Toggletip', () => {
    render(<Card info="Example info text">Example body</Card>);
    fireEvent.click(screen.getByRole('button', { name: 'More information' }));
    expect(screen.getByText('Example info text')).toBeInTheDocument();
  });

  it('embedded: no tile of its own and an h3 title', () => {
    const { container } = render(<Card title="Example card" embedded>Example body</Card>);
    expect(screen.getByRole('heading', { level: 3, name: 'Example card' })).toBeInTheDocument();
    expect(container.querySelector('.rds-card--embedded')).not.toBeNull();
    expect(container.querySelector('.cds--tile')).toBeNull();
  });

  it('href: the whole card is a link named by its title', () => {
    render(<Card title="Example card" href="#example">Example body</Card>);
    const link = screen.getByRole('link', { name: /Example card/ });
    expect(link).toHaveAttribute('href', '#example');
  });

  it('flush and bare set their modifier classes', () => {
    const { container } = render(
      <>
        <Card flush>Example body</Card>
        <Card bare>Example body</Card>
      </>,
    );
    expect(container.querySelector('.rds-card--flush')).not.toBeNull();
    expect(container.querySelector('.rds-card--bare')).not.toBeNull();
  });

  it('labels.info replaces the default info button name', () => {
    render(<Card info="Example info text" labels={{ info: 'Example info label' }}>Example body</Card>);
    expect(screen.getByRole('button', { name: 'Example info label' })).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'More information' })).toBeNull();
  });

  it('linkAs renders the given element for href with its children', () => {
    render(<Card title="Example card" href="#example" linkAs={TestLink}>Example body</Card>);
    const link = screen.getByTestId('test-link');
    expect(link).toHaveAttribute('href', '#example');
    expect(link).toHaveTextContent('Example body');
    expect(link).toHaveClass('rds-card');
  });

  it('without linkAs the href card is a plain anchor', () => {
    const { container } = render(<Card title="Example card" href="#example">Example body</Card>);
    expect(screen.queryByTestId('test-link')).toBeNull();
    expect(container.querySelector('a.rds-card')?.tagName).toBe('A');
  });
});
