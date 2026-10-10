import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { Input } from './Input';

describe('Input', () => {
  it('forwards aria-invalid to the native input', () => {
    render(<Input aria-label="Amount" aria-invalid />);
    expect(screen.getByRole('textbox', { name: 'Amount' })).toHaveAttribute('aria-invalid', 'true');
  });
});
