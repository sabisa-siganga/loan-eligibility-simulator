import { cleanup, fireEvent, render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Provider } from 'react-redux';
import { afterEach, describe, expect, it } from 'vitest';
import App from '../App';
import { createAppStore } from '../store/store';
import { formatMoneyInputBlur } from '../utils/formatMoney';
import { PRODUCT_SETTINGS } from '../utils/productSettings';

afterEach(() => {
  cleanup();
});

const renderLoanDetails = () => {
  const store = createAppStore();
  const user = userEvent.setup();
  render(
    <Provider store={store}>
      <App />
    </Provider>,
  );
  return { store, user };
};

describe('LoanDetailsScreen', () => {
  it('starts with confirmed loan defaults and purpose unselected', () => {
    renderLoanDetails();

    expect(screen.getByRole('textbox', { name: /^Loan amount \(R\)/i })).toHaveValue(
      formatMoneyInputBlur(PRODUCT_SETTINGS.defaultAmount),
    );
    expect(screen.getByRole('textbox', { name: /Repayment term \(months\)/i })).toHaveValue(
      String(PRODUCT_SETTINGS.defaultTermMonths),
    );
    expect(screen.getByLabelText(/Loan purpose/i)).toHaveValue('');
    expect(screen.getByRole('slider', { name: /Adjust Loan amount/i })).toHaveValue(
      String(PRODUCT_SETTINGS.minAmount),
    );
    expect(screen.getByRole('slider', { name: /Adjust Repayment term/i })).toHaveValue(
      String(PRODUCT_SETTINGS.minTermMonths),
    );
  });

  it('shows a live estimate for the default amount and term', () => {
    renderLoanDetails();

    expect(screen.getByText('Estimated monthly repayment')).toBeInTheDocument();
    expect(screen.getByText(/Using an example annual rate of 12.5%/i)).toBeInTheDocument();
  });

  it('requires a purpose and focuses the purpose field when Continue is clicked', async () => {
    const { user } = renderLoanDetails();

    await user.click(screen.getByRole('button', { name: /Continue to your budget/i }));

    expect(await screen.findByText('Select a loan purpose.')).toBeInTheDocument();
    expect(screen.getByLabelText(/Loan purpose/i)).toHaveFocus();
    expect(screen.getByTestId('loan-details-screen')).toBeInTheDocument();
  });

  it('recalculates the estimate when explore rate changes and can restore 12.5%', async () => {
    const { user } = renderLoanDetails();

    await user.click(screen.getByRole('button', { name: /Explore interest rate/i }));

    const rateSlider = screen.getByRole('slider', { name: /Example annual rate/i });
    fireEvent.change(rateSlider, { target: { value: '15' } });

    expect(screen.getByText(/Using an explored example annual rate of 15%/i)).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: /Restore 12.5% example rate/i }));
    expect(screen.getByText(/Using an example annual rate of 12.5%/i)).toBeInTheDocument();
  });

  it('stores submitted loan details and opens the budget placeholder on valid Continue', async () => {
    const { store, user } = renderLoanDetails();

    await user.selectOptions(screen.getByLabelText(/Loan purpose/i), 'homeImprovement');
    await user.click(screen.getByRole('button', { name: /Continue to your budget/i }));

    expect(await screen.findByTestId('your-budget-screen')).toBeInTheDocument();
    expect(store.getState().journey.submittedLoanDetails).toEqual({
      amount: PRODUCT_SETTINGS.defaultAmount,
      termMonths: PRODUCT_SETTINGS.defaultTermMonths,
      purpose: 'homeImprovement',
      annualRateUsed: PRODUCT_SETTINGS.exampleAnnualRate,
    });
  });

  it('updates the estimate when amount and term change via sliders', () => {
    renderLoanDetails();

    fireEvent.change(screen.getByRole('slider', { name: /Adjust Loan amount/i }), {
      target: { value: '50000' },
    });
    fireEvent.change(screen.getByRole('slider', { name: /Adjust Repayment term/i }), {
      target: { value: '24' },
    });

    const estimate = screen.getByLabelText('Estimated repayment');
    expect(within(estimate).getByText('R2,365.37')).toBeInTheDocument();
    expect(within(estimate).getByText('R6,768.77')).toBeInTheDocument();
    expect(within(estimate).getByText('R56,768.77')).toBeInTheDocument();
  });
});
