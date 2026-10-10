import { createRef } from 'react';
import { cleanup, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it, vi } from 'vitest';
import MoneyInput from './MoneyInput';

afterEach(() => {
  cleanup();
});

describe('MoneyInput', () => {
  it('shows a decorative R prefix for rand amounts', () => {
    render(<MoneyInput label="Monthly income" value={null} onChange={() => {}} />);

    const prefix = screen.getByText('R');
    expect(prefix).toBeInTheDocument();
    expect(prefix).toHaveAttribute('aria-hidden', 'true');
  });

  it('accepts digit input and calls onChange with a number', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();

    render(<MoneyInput label="Monthly income" value={null} onChange={onChange} />);

    await user.type(screen.getByRole('textbox', { name: /Monthly income/i }), '2500');

    expect(onChange).toHaveBeenLastCalledWith(2500);
  });

  it('forwards the ref to the underlying input', () => {
    const ref = createRef<HTMLInputElement>();

    render(<MoneyInput ref={ref} label="Monthly income" value={1200} onChange={() => {}} />);

    expect(ref.current).toBeInstanceOf(HTMLInputElement);
    expect(ref.current).toHaveAttribute('id');
  });
});
