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
});
