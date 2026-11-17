import { describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/react';
import { SettingsGroup, type SettingsRow } from './SettingsGroup.js';

describe('SettingsGroup', () => {
  it('minimal props: title and no rows, status, description or footer', () => {
    const { container } = render(<SettingsGroup title="Example group" rows={[]} />);
    expect(screen.getByRole('heading', { level: 2, name: 'Example group' })).toBeInTheDocument();
    expect(container.querySelector('.rds-settings-group__rows')).toBeNull();
    expect(container.querySelector('.rds-settings-group__status')).toBeNull();
    expect(container.querySelector('.rds-settings-group__description')).toBeNull();
    expect(container.querySelector('.rds-settings-group__footer')).toBeNull();
  });

  it('every prop: description, saved status, footer and one row of each kind', () => {
    const rows: SettingsRow[] = [
      { id: 'example-toggle', kind: 'toggle', label: 'Example toggle', description: 'Example toggle help', checked: true, onToggle: () => {} },
      { id: 'example-value', kind: 'labelValue', label: 'Example value row', value: 'Example value' },
      { id: 'example-action', kind: 'action', label: 'Example action row', action: <button type="button">Example action</button> },
    ];
    const { container } = render(
      <SettingsGroup
        title="Example group"
        description="Example description"
        status={{ kind: 'saved' }}
        footer="Example footer"
        rows={rows}
      />,
    );
    expect(screen.getByText('Example description')).toBeInTheDocument();
    expect(screen.getByRole('status')).toHaveTextContent('Saved');
    expect(screen.getByRole('switch', { name: 'Example toggle' })).toBeChecked();
    expect(screen.getByText('Example value')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Example action' })).toBeInTheDocument();
    expect(screen.getByText('Example footer')).toBeInTheDocument();
    expect(container.querySelectorAll('.rds-settings-group__row')).toHaveLength(3);
  });

  it('toggle row: a switch named by its label reports the new state', () => {
    const onToggle = vi.fn();
    render(<SettingsGroup title="Example group" rows={[{ id: 'example-toggle', kind: 'toggle', label: 'Example toggle', checked: false, onToggle }]} />);
    fireEvent.click(screen.getByRole('switch', { name: 'Example toggle' }));
    expect(onToggle).toHaveBeenCalledWith(true);
  });

  it('error status: an error notice with the default text, and no status line', () => {
    const { container } = render(<SettingsGroup title="Example group" rows={[]} status={{ kind: 'error' }} />);
    expect(screen.getByText('Could not save')).toBeInTheDocument();
    expect(container.querySelector('.cds--inline-notification')).not.toBeNull();
    expect(container.querySelector('.rds-settings-group__status')).toBeNull();
  });

  it('saving status shows the default text; text overrides the default', () => {
    const { unmount } = render(<SettingsGroup title="Example group" rows={[]} status={{ kind: 'saving' }} />);
    expect(screen.getByRole('status')).toHaveTextContent('Saving');
    unmount();
    render(<SettingsGroup title="Example group" rows={[]} status={{ kind: 'saved', text: 'Example done' }} />);
    expect(screen.getByRole('status')).toHaveTextContent('Example done');
  });

  it('labels override the default status text', () => {
    render(
      <SettingsGroup
        title="Example group"
        rows={[]}
        status={{ kind: 'saved' }}
        labels={{ saved: 'Example saved' }}
      />,
    );
    expect(screen.getByRole('status')).toHaveTextContent('Example saved');
    expect(screen.queryByText('Saved')).toBeNull();
  });
});
