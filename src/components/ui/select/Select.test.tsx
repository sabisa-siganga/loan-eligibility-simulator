import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { Select } from './Select';

describe('Select', () => {
  it('renders the placeholder and notifies on option change', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();

    render(
      <Select
        label="Purpose"
        value=""
        placeholder="Select a purpose"
        options={[
          { value: 'home', label: 'Home improvements' },
          { value: 'debt', label: 'Debt consolidation' },
        ]}
        onChange={onChange}
      />,
    );

    expect(screen.getByRole('combobox', { name: /Purpose/i })).toHaveDisplayValue(
      'Select a purpose',
    );

    await user.selectOptions(screen.getByRole('combobox'), 'home');
    expect(onChange).toHaveBeenCalledWith('home');
  });

  it('hides helper text when an error is shown', () => {
    const { rerender } = render(
      <Select
        label="Purpose"
        value=""
        placeholder="Select a purpose"
        options={[{ value: 'home', label: 'Home improvements' }]}
        helperText="Purpose does not change this estimate."
        onChange={() => {}}
      />,
    );

    expect(screen.getByText('Purpose does not change this estimate.')).toBeInTheDocument();

    rerender(
      <Select
        label="Purpose"
        value=""
        placeholder="Select a purpose"
        options={[{ value: 'home', label: 'Home improvements' }]}
        helperText="Purpose does not change this estimate."
        error="Select a loan purpose."
        onChange={() => {}}
      />,
    );

    expect(screen.queryByText('Purpose does not change this estimate.')).not.toBeInTheDocument();
    expect(screen.getByText('Select a loan purpose.')).toBeInTheDocument();
  });
});
