import { cleanup, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useState } from 'react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import WholeNumberInput from './WholeNumberInput';

afterEach(() => {
  cleanup();
});

const StatefulAgeInput = ({ onChange }: { onChange?: (value: number | null) => void }) => {
  const [value, setValue] = useState<number | null>(null);

  return (
    <WholeNumberInput
      label="Age (years)"
      value={value}
      type="number"
      onChange={(next) => {
        setValue(next);
        onChange?.(next);
      }}
    />
  );
};

describe('WholeNumberInput', () => {
  it('renders type number with min, max, and step when configured', () => {
    render(
      <WholeNumberInput
        label="Age (years)"
        value={null}
        type="number"
        min={18}
        max={65}
        step={1}
        onChange={() => {}}
      />,
    );

    const input = screen.getByRole('spinbutton', { name: /Age \(years\)/i });
    expect(input).toHaveAttribute('type', 'number');
    expect(input).toHaveAttribute('min', '18');
    expect(input).toHaveAttribute('max', '65');
    expect(input).toHaveAttribute('step', '1');
  });

  it('defaults to a text input without number constraints', () => {
    render(<WholeNumberInput label="Duration (months)" value={null} onChange={() => {}} />);

    const input = screen.getByRole('textbox', { name: /Duration \(months\)/i });
    expect(input).toHaveAttribute('type', 'text');
    expect(input).not.toHaveAttribute('min');
    expect(input).not.toHaveAttribute('max');
    expect(input).not.toHaveAttribute('step');
  });

  it('ignores non-digit keystrokes', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<StatefulAgeInput onChange={onChange} />);

    const input = screen.getByRole('spinbutton', { name: /Age \(years\)/i });
    await user.type(input, 'a.');
    expect(onChange).not.toHaveBeenCalled();
  });

  it('accepts digit input into the controlled value', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<StatefulAgeInput onChange={onChange} />);

    const input = screen.getByRole('spinbutton', { name: /Age \(years\)/i });
    await user.type(input, '35');
    expect(onChange).toHaveBeenLastCalledWith(35);
    expect(input).toHaveValue(35);
  });

  it('accepts a digits-only paste and ignores invalid pasted text', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<StatefulAgeInput onChange={onChange} />);

    const input = screen.getByRole('spinbutton', { name: /Age \(years\)/i });
    await user.click(input);
    await user.paste('42');
    expect(onChange).toHaveBeenCalledWith(42);
    expect(input).toHaveValue(42);

    onChange.mockClear();
    await user.clear(input);
    onChange.mockClear();
    await user.paste('1a2');
    expect(onChange).not.toHaveBeenCalled();
  });

  it('surfaces the error message as an alert', () => {
    render(
      <WholeNumberInput
        label="Age (years)"
        value={17}
        type="number"
        error="You must be between 18 and 65 years old."
        onChange={() => {}}
      />,
    );

    expect(screen.getByRole('alert')).toHaveTextContent('You must be between 18 and 65 years old.');
  });
});
