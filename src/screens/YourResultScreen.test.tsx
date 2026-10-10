import { cleanup, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';
import YourResultScreen from './YourResultScreen';

afterEach(() => {
  cleanup();
});

describe('YourResultScreen placeholder', () => {
  it('renders the result placeholder marker used after eligibility succeeds', () => {
    render(<YourResultScreen />);
    expect(screen.getByTestId('your-result-screen')).toBeInTheDocument();
  });
});
