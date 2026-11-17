import { describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen, within } from '@testing-library/react';
import { PageHeader } from './PageHeader.js';

describe('PageHeader', () => {
  it('minimal props: an h1 title and nothing else', () => {
    const { container } = render(<PageHeader title="Example page" />);
    expect(screen.getByRole('heading', { level: 1, name: 'Example page' })).toBeInTheDocument();
    expect(screen.queryByRole('navigation')).toBeNull();
    expect(screen.queryByRole('button')).toBeNull();
    expect(screen.queryByRole('link')).toBeNull();
    expect(container.querySelector('.rds-page-header__subtitle')).toBeNull();
    expect(container.querySelector('.rds-page-header__meta')).toBeNull();
    expect(container.querySelector('.rds-page-header__actions')).toBeNull();
  });

  it('every prop: breadcrumb, back, subtitle, meta and actions are present', () => {
    render(
      <PageHeader
        title="Example page"
        subtitle="Example subtitle"
        meta="Example meta"
        back={{ label: 'Example back', href: '#back' }}
        breadcrumb={[
          { label: 'Example root', href: '#root' },
          { label: 'Example page', href: '#page' },
        ]}
        actions={<button type="button">Example action</button>}
      />,
    );
    const nav = screen.getByRole('navigation');
    expect(within(nav).getByRole('link', { name: 'Example root' })).toHaveAttribute('href', '#root');
    expect(within(nav).getByRole('link', { name: 'Example page' })).toHaveAttribute('aria-current', 'page');
    expect(screen.getByRole('link', { name: 'Example back' })).toHaveAttribute('href', '#back');
    expect(screen.getByText('Example subtitle')).toBeInTheDocument();
    expect(screen.getByText('Example meta')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Example action' })).toBeInTheDocument();
  });

  it('back with onClick is a button that calls the handler', () => {
    const onClick = vi.fn();
    render(<PageHeader title="Example page" back={{ label: 'Example back', onClick }} />);
    fireEvent.click(screen.getByRole('button', { name: 'Example back' }));
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it('level 2 renders an h2', () => {
    render(<PageHeader title="Example section" level={2} />);
    expect(screen.getByRole('heading', { level: 2, name: 'Example section' })).toBeInTheDocument();
    expect(screen.queryByRole('heading', { level: 1 })).toBeNull();
  });
});
