import { createRef } from 'react';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
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

  it('shows a paste error for non-digit clipboard content', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();

    render(<MoneyInput label="Monthly income" value={null} onChange={onChange} />);

    await user.click(screen.getByRole('textbox', { name: /Monthly income/i }));
    await user.paste('not-money');

    expect(screen.getByText('Enter whole rands using digits only.')).toBeInTheDocument();
    expect(onChange).not.toHaveBeenCalled();
  });

  it('does not edit when readOnly', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();

    render(<MoneyInput label="Monthly income" value={1200} onChange={onChange} readOnly />);

    await user.click(screen.getByRole('textbox', { name: /Monthly income/i }));
    await user.keyboard('9');

    expect(onChange).not.toHaveBeenCalled();
    expect(screen.getByRole('textbox', { name: /Monthly income/i })).toHaveValue('1200.00');
  });

  it('accepts pasted currency-formatted whole rands', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();

    render(<MoneyInput label="Monthly income" value={null} onChange={onChange} />);

    await user.click(screen.getByRole('textbox', { name: /Monthly income/i }));
    await user.paste('R 1,200.00');

    expect(onChange).toHaveBeenLastCalledWith(1200);
  });

  it('commits the draft amount on blur after typing', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    const onBlur = vi.fn();

    render(
      <MoneyInput label="Monthly income" value={null} onChange={onChange} onBlur={onBlur} />,
    );

    const input = screen.getByRole('textbox', { name: /Monthly income/i });
    await user.type(input, '3400');
    await user.tab();

    expect(onChange).toHaveBeenLastCalledWith(3400);
    expect(onBlur).toHaveBeenCalled();
  });

  it('calls onBlur for readOnly fields without changing the value', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    const onBlur = vi.fn();

    render(
      <MoneyInput
        label="Monthly income"
        value={1200}
        onChange={onChange}
        onBlur={onBlur}
        readOnly
      />,
    );

    await user.click(screen.getByRole('textbox', { name: /Monthly income/i }));
    await user.tab();

    expect(onBlur).toHaveBeenCalled();
    expect(onChange).not.toHaveBeenCalled();
  });

  it('clears the value on blur when the draft is empty', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();

    render(<MoneyInput label="Monthly income" value={1200} onChange={onChange} />);

    const input = screen.getByRole('textbox', { name: /Monthly income/i });
    await user.clear(input);
    fireEvent.blur(input);

    expect(onChange).toHaveBeenLastCalledWith(null);
  });

  it('ignores change and paste events while readOnly', () => {
    const onChange = vi.fn();
    render(<MoneyInput label="Monthly income" value={1200} onChange={onChange} readOnly />);

    const input = screen.getByRole('textbox', { name: /Monthly income/i });
    fireEvent.change(input, { target: { value: '999' } });
    fireEvent.paste(input, {
      clipboardData: { getData: () => '999' },
    });

    expect(onChange).not.toHaveBeenCalled();
  });

  it('ignores non-digit change input and allows shortcut keydowns', () => {
    const onChange = vi.fn();
    render(<MoneyInput label="Monthly income" value={null} onChange={onChange} />);

    const input = screen.getByRole('textbox', { name: /Monthly income/i });
    fireEvent.focus(input);
    fireEvent.change(input, { target: { value: '12a' } });
    expect(onChange).not.toHaveBeenCalled();

    fireEvent.keyDown(input, { key: 'a' });
    fireEvent.keyDown(input, { key: 'Escape' });
    fireEvent.keyDown(input, { key: 'Backspace' });
    fireEvent.keyDown(input, { key: 'c', ctrlKey: true });
    fireEvent.keyDown(input, { key: 'c', metaKey: true });
    fireEvent.keyDown(input, { key: '5' });
  });

  it('returns early from keydown when the field is readOnly', () => {
    render(<MoneyInput label="Monthly income" value={1200} onChange={() => {}} readOnly />);
    const input = screen.getByRole('textbox', { name: /Monthly income/i });
    fireEvent.keyDown(input, { key: '9' });
  });

  it('shows helper text only when there is no error', () => {
    const { rerender } = render(
      <MoneyInput
        label="Monthly income"
        value={null}
        onChange={() => {}}
        helperText="Enter take-home pay."
      />,
    );

    expect(screen.getByText('Enter take-home pay.')).toBeInTheDocument();

    rerender(
      <MoneyInput
        label="Monthly income"
        value={null}
        onChange={() => {}}
        helperText="Enter take-home pay."
        error="Enter a loan amount."
      />,
    );

    expect(screen.queryByText('Enter take-home pay.')).not.toBeInTheDocument();
    expect(screen.getByText('Enter a loan amount.')).toBeInTheDocument();
  });
});
