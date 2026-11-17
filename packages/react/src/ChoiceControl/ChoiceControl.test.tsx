import { describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen, within } from '@testing-library/react';
import { ChoiceControl, type ChoiceOption } from './ChoiceControl.js';

const options: ChoiceOption[] = [
  { id: 'day', label: 'Example day' },
  { id: 'week', label: 'Example week' },
  { id: 'month', label: 'Example month', disabled: true },
];

describe('ChoiceControl', () => {
  it('segmented: a ContentSwitcher named by label; clicking a tab reports its id', () => {
    const onChange = vi.fn();
    const { container } = render(<ChoiceControl variant="segmented" options={options} value="day" onChange={onChange} label="Example period" />);
    expect(screen.getByRole('tablist', { name: 'Example period' })).toBeInTheDocument();
    expect(container.querySelector('.rds-choice--segmented')).not.toBeNull();
    fireEvent.click(screen.getByRole('tab', { name: 'Example week' }));
    expect(onChange).toHaveBeenCalledWith('week');
    expect(screen.getByRole('tab', { name: 'Example month' })).toBeDisabled();
  });

  it('range uses the same segmented control with its own modifier class', () => {
    const { container } = render(<ChoiceControl variant="range" options={options} value="week" onChange={() => {}} label="Example range" />);
    expect(container.querySelector('.rds-choice--range .cds--content-switcher')).not.toBeNull();
    expect(screen.getByRole('tab', { name: 'Example week' })).toHaveAttribute('aria-selected', 'true');
  });

  it('dropdown: shows the selected option and reports a pick; disabled options are left out', () => {
    const onChange = vi.fn();
    render(<ChoiceControl variant="dropdown" options={options} value="day" onChange={onChange} label="Example period" />);
    expect(screen.getByRole('combobox')).toHaveTextContent('Example day');
    fireEvent.click(screen.getByRole('combobox'));
    expect(screen.queryByText('Example month')).toBeNull();
    fireEvent.click(screen.getByText('Example week'));
    expect(onChange).toHaveBeenCalledWith('week');
  });

  it('radio: a RadioButtonGroup; choosing a radio reports its id; disabled radios cannot be chosen', () => {
    const onChange = vi.fn();
    render(<ChoiceControl variant="radio" options={options} value="day" onChange={onChange} label="Example period" />);
    expect(screen.getByRole('group', { name: 'Example period' })).toBeInTheDocument();
    expect(screen.getByLabelText('Example day')).toBeChecked();
    fireEvent.click(screen.getByLabelText('Example week'));
    expect(onChange).toHaveBeenCalledWith('week');
    expect(screen.getByLabelText('Example month')).toBeDisabled();
  });

  it('chips: a group of buttons with aria-pressed on the selected one', () => {
    const onChange = vi.fn();
    render(<ChoiceControl variant="chips" options={options} value="week" onChange={onChange} label="Example period" />);
    const group = screen.getByRole('group', { name: 'Example period' });
    expect(within(group).getByRole('button', { name: 'Example week' })).toHaveAttribute('aria-pressed', 'true');
    expect(within(group).getByRole('button', { name: 'Example day' })).toHaveAttribute('aria-pressed', 'false');
    fireEvent.click(within(group).getByRole('button', { name: 'Example day' }));
    expect(onChange).toHaveBeenCalledWith('day');
  });

  it('readonly: shows the selected label as text and no control', () => {
    const { container } = render(<ChoiceControl variant="segmented" options={options} value="week" onChange={() => {}} label="Example period" readonly />);
    expect(container.querySelector('.rds-choice__readonly')).toHaveTextContent('Example week');
    expect(screen.queryByRole('tablist')).toBeNull();
  });
});
