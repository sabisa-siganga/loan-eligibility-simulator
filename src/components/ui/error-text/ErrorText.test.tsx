import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { ErrorText } from './ErrorText';

describe('ErrorText', () => {
  it('exposes the message as an alert', () => {
    render(<ErrorText>Amount is required</ErrorText>);
    expect(screen.getByRole('alert')).toHaveTextContent('Amount is required');
  });
});
