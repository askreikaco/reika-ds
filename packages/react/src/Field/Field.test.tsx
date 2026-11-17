import { describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/react';
import { Field } from './Field.js';

describe('Field', () => {
  it('text: labelled input, typing reports the value, helper text is linked', () => {
    const onChange = vi.fn();
    render(<Field kind="text" label="Example name" value="" onChange={onChange} helper="Example helper" />);
    const input = screen.getByRole('textbox', { name: 'Example name' });
    fireEvent.change(input, { target: { value: 'abc' } });
    expect(onChange).toHaveBeenLastCalledWith('abc');
    expect(input).toHaveAccessibleDescription('Example helper');
  });

  it('email and tel set the input type', () => {
    const { unmount } = render(<Field kind="email" label="Example mail" value="" onChange={() => {}} />);
    expect(screen.getByRole('textbox', { name: 'Example mail' })).toHaveAttribute('type', 'email');
    unmount();
    render(<Field kind="tel" label="Example phone" value="" onChange={() => {}} />);
    expect(screen.getByRole('textbox', { name: 'Example phone' })).toHaveAttribute('type', 'tel');
  });

  it('number: reports a number, or null when the field is emptied', () => {
    const onChange = vi.fn();
    const { rerender } = render(<Field kind="number" label="Example count" value={null} onChange={onChange} min={0} />);
    fireEvent.change(screen.getByRole('spinbutton', { name: 'Example count' }), { target: { value: '7' } });
    expect(onChange).toHaveBeenLastCalledWith(7);
    rerender(<Field kind="number" label="Example count" value={7} onChange={onChange} min={0} />);
    fireEvent.change(screen.getByRole('spinbutton', { name: 'Example count' }), { target: { value: '' } });
    expect(onChange).toHaveBeenLastCalledWith(null);
  });

  it('textarea: reports the text', () => {
    const onChange = vi.fn();
    render(<Field kind="textarea" label="Example note" value="" onChange={onChange} />);
    fireEvent.change(screen.getByRole('textbox', { name: 'Example note' }), { target: { value: 'Example text' } });
    expect(onChange).toHaveBeenCalledWith('Example text');
  });

  it('select: options and placeholder; a pick reports the option id', () => {
    const onChange = vi.fn();
    render(
      <Field
        kind="select"
        label="Example kind"
        value=""
        onChange={onChange}
        placeholder="Example choose"
        options={[
          { id: 'a', label: 'Example A' },
          { id: 'b', label: 'Example B' },
        ]}
      />,
    );
    expect(screen.getByRole('combobox', { name: 'Example kind' })).toBeInTheDocument();
    fireEvent.change(screen.getByRole('combobox', { name: 'Example kind' }), { target: { value: 'b' } });
    expect(onChange).toHaveBeenCalledWith('b');
  });

  it('checkbox: reports the new checked state', () => {
    const onChange = vi.fn();
    render(<Field kind="checkbox" label="Example agree" checked={false} onChange={onChange} />);
    fireEvent.click(screen.getByRole('checkbox', { name: 'Example agree' }));
    expect(onChange).toHaveBeenCalledWith(true);
  });

  it('date: an ISO date input with a yyyy-mm-dd placeholder', () => {
    render(<Field kind="date" label="Example day" value="2026-01-02" onChange={() => {}} />);
    expect(screen.getByRole('textbox', { name: 'Example day' })).toHaveAttribute('placeholder', 'yyyy-mm-dd');
  });

  it('file: a file button with the labels.chooseFile text, reporting the chosen files', () => {
    const onChange = vi.fn();
    const { container } = render(<Field kind="file" label="Example attachment" onChange={onChange} accept=".pdf" labels={{ chooseFile: 'Example pick' }} />);
    expect(screen.getByRole('group', { name: 'Example attachment' })).toBeInTheDocument();
    expect(screen.getAllByText('Example pick').length).toBeGreaterThan(0);
    const input = container.querySelector('input[type="file"]') as HTMLInputElement;
    const file = new File(['x'], 'example.pdf', { type: 'application/pdf' });
    fireEvent.change(input, { target: { files: [file] } });
    expect(onChange).toHaveBeenCalledWith([file]);
  });

  it('optional: adds the labels.optional suffix; labels.optional replaces it', () => {
    const { unmount } = render(<Field kind="text" label="Example name" value="" onChange={() => {}} optional />);
    expect(screen.getByRole('textbox', { name: 'Example name (optional)' })).toBeInTheDocument();
    unmount();
    render(<Field kind="text" label="Example name" value="" onChange={() => {}} optional labels={{ optional: 'Example skip' }} />);
    expect(screen.getByRole('textbox', { name: 'Example name (Example skip)' })).toBeInTheDocument();
  });

  it('error: marks the input invalid and shows the error text; required sets the attribute', () => {
    render(<Field kind="text" label="Example name" value="" onChange={() => {}} error="Example error" required />);
    const input = screen.getByRole('textbox', { name: 'Example name' });
    expect(input).toHaveAttribute('aria-invalid', 'true');
    expect(screen.getByText('Example error')).toBeInTheDocument();
    expect(input).toBeRequired();
  });

  it('checkbox error is shown as an alert below the checkbox', () => {
    render(<Field kind="checkbox" label="Example agree" checked={false} onChange={() => {}} error="Example must agree" />);
    expect(screen.getByRole('alert')).toHaveTextContent('Example must agree');
  });
});
