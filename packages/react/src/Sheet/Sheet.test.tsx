import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/react';
import { Sheet } from './Sheet.js';
import { setViewport } from '../../test/viewport.js';

const baseProps = { open: true, title: 'Example sheet', onClose: () => {} };

describe('Sheet', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  beforeEach(() => setViewport('desktop'));

  it('open: shows title, children and footer buttons', () => {
    render(
      <Sheet {...baseProps} primary={{ label: 'Example save', onClick: () => {} }} secondary={{ label: 'Example cancel', onClick: () => {} }}>
        Example body
      </Sheet>,
    );
    expect(screen.getByRole('heading', { name: 'Example sheet' })).toBeInTheDocument();
    expect(screen.getByText('Example body')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Example save' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Example cancel' })).toBeInTheDocument();
    expect(document.querySelector('.rds-sheet')).toHaveClass('is-visible');
  });

  it('closed: the dialog is not visible', () => {
    render(<Sheet {...baseProps} open={false}>Example body</Sheet>);
    expect(document.querySelector('.rds-sheet')).not.toHaveClass('is-visible');
  });

  it('Escape closes through onClose (Carbon behaviour)', () => {
    const onClose = vi.fn();
    render(<Sheet {...baseProps} onClose={onClose}>Example body</Sheet>);
    fireEvent.keyDown(document.querySelector('.rds-sheet') as HTMLElement, { key: 'Escape' });
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('header close button calls onClose and has the labels.close name', () => {
    const onClose = vi.fn();
    render(<Sheet {...baseProps} onClose={onClose} labels={{ close: 'Example close' }}>Example body</Sheet>);
    fireEvent.click(screen.getByRole('button', { name: 'Example close' }));
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('primary and secondary call their handlers; danger and disabled apply to the primary button', () => {
    const onPrimary = vi.fn();
    const onSecondary = vi.fn();
    const { unmount } = render(
      <Sheet {...baseProps} primary={{ label: 'Example delete', onClick: onPrimary, danger: true }} secondary={{ label: 'Example keep', onClick: onSecondary }}>
        Example body
      </Sheet>,
    );
    fireEvent.click(screen.getByRole('button', { name: 'Example delete' }));
    fireEvent.click(screen.getByRole('button', { name: 'Example keep' }));
    expect(onPrimary).toHaveBeenCalledTimes(1);
    expect(onSecondary).toHaveBeenCalledTimes(1);
    expect(screen.getByRole('button', { name: 'Example delete' })).toHaveClass('cds--btn--danger');
    unmount();

    render(<Sheet {...baseProps} primary={{ label: 'Example save', onClick: onPrimary, disabled: true }}>Example body</Sheet>);
    expect(screen.getByRole('button', { name: 'Example save' })).toBeDisabled();
  });

  it('confirm lists each label and value', () => {
    render(
      <Sheet {...baseProps} confirm={{ values: [{ label: 'Example amount', value: '100' }, { label: 'Example date', value: '2026-01-02' }] }}>
        Example body
      </Sheet>,
    );
    const terms = Array.from(document.querySelectorAll('.rds-sheet__confirm-label')).map((node) => node.textContent);
    expect(terms).toEqual(['Example amount', 'Example date']);
    expect(screen.getByText('2026-01-02')).toBeInTheDocument();
  });

  it('placement auto: modal on desktop, bottom on phone (grab handle and bottom class)', () => {
    const { unmount } = render(<Sheet {...baseProps}>Example body</Sheet>);
    expect(document.querySelector('.rds-sheet')).toHaveClass('rds-sheet--modal');
    expect(document.querySelector('.rds-sheet__handle')).toBeNull();
    unmount();

    setViewport('phone');
    render(<Sheet {...baseProps}>Example body</Sheet>);
    expect(document.querySelector('.rds-sheet')).toHaveClass('rds-sheet--bottom');
    expect(document.querySelector('.rds-sheet__handle')).not.toBeNull();
    expect(document.querySelector('.rds-sheet__container')).not.toBeNull();
  });

  it('an explicit placement wins over the viewport', () => {
    setViewport('phone');
    render(<Sheet {...baseProps} placement="modal">Example body</Sheet>);
    expect(document.querySelector('.rds-sheet')).toHaveClass('rds-sheet--modal');
  });
});
