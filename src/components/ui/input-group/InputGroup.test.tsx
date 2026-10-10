import { cleanup, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it } from 'vitest';
import { InputGroup, InputGroupAddon, InputGroupInput, InputGroupText } from './InputGroup';
import styles from './InputGroup.module.scss';

afterEach(() => {
  cleanup();
});

describe('InputGroup', () => {
  it('renders addon text alongside the input control', () => {
    render(
      <InputGroup>
        <InputGroupInput aria-label="Amount" />
        <InputGroupAddon align="inline-start">
          <InputGroupText>R</InputGroupText>
        </InputGroupAddon>
      </InputGroup>,
    );

    expect(screen.getByRole('textbox', { name: 'Amount' })).toBeInTheDocument();
    expect(screen.getByText('R')).toBeInTheDocument();
  });

  it('marks the group invalid when the control has aria-invalid', () => {
    const { container } = render(
      <InputGroup>
        <InputGroupInput aria-label="Amount" aria-invalid />
        <InputGroupAddon align="inline-start">
          <InputGroupText>R</InputGroupText>
        </InputGroupAddon>
      </InputGroup>,
    );

    const group = container.querySelector('[data-slot="input-group"]');
    expect(group).toHaveClass(styles.group);
    expect(screen.getByRole('textbox', { name: 'Amount' })).toHaveAttribute('aria-invalid', 'true');
  });

  it('keeps focus on the input control inside the group', async () => {
    const user = userEvent.setup();

    render(
      <InputGroup>
        <InputGroupInput aria-label="Amount" />
        <InputGroupAddon align="inline-start">
          <InputGroupText>R</InputGroupText>
        </InputGroupAddon>
      </InputGroup>,
    );

    const input = screen.getByRole('textbox', { name: 'Amount' });
    await user.click(input);
    expect(input).toHaveFocus();
  });

  it('supports an inline-end addon alignment', () => {
    const { container } = render(
      <InputGroup>
        <InputGroupInput aria-label="Amount" />
        <InputGroupAddon align="inline-end">
          <InputGroupText>ZAR</InputGroupText>
        </InputGroupAddon>
      </InputGroup>,
    );

    const addon = container.querySelector('[data-slot="input-group-addon"]');
    expect(addon).toHaveClass(styles.addonInlineEnd);
  });
});
