import { cleanup, fireEvent, render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Provider } from 'react-redux';
import { afterEach, describe, expect, it } from 'vitest';
import App from '../../App';
import { createAppStore } from '../../store/store';
import {
  eligibilitySucceeded,
  JOURNEY_SCREENS,
  setCurrentScreen,
  submitBudgetAndStartCheck,
  submitLoanDetails,
} from '../../store/journeySlice';
import type { SubmittedBudget } from '../../types/budget';

afterEach(() => {
  cleanup();
});

const section19Budget: SubmittedBudget = {
  monthlyIncome: 15_000,
  livingExpenses: 10_000,
  existingDebtRepayments: 1_800,
  age: 35,
  employmentStatus: 'employed',
  employmentDurationMonths: 24,
  businessDurationMonths: null,
  incomeSource: null,
  incomeDurationMonths: null,
  creditScore: 650,
  creditScoreUnknown: false,
  requestDemoCreditCheck: false,
};

const openResult = (
  budget: SubmittedBudget = section19Budget,
  demoCreditScore: number | null = null,
) => {
  const store = createAppStore();
  store.dispatch(
    submitLoanDetails({
      amount: 50_000,
      termMonths: 24,
      purpose: 'homeImprovement',
      annualRateUsed: 12.5,
    }),
  );
  store.dispatch(
    submitBudgetAndStartCheck({
      budget,
      demoCreditScore,
    }),
  );
  const requestId = store.getState().journey.eligibilityRequestId;
  store.dispatch(eligibilitySucceeded({ requestId }));

  const user = userEvent.setup();
  render(
    <Provider store={store}>
      <App />
    </Provider>,
  );
  return { store, user };
};

describe('YourResultScreen', () => {
  it('shows the section 19 eligible result with a tight budget warning', () => {
    openResult();

    const screenRoot = screen.getByTestId('your-result-screen');
    expect(within(screenRoot).getByText('Estimated eligible')).toBeInTheDocument();
    expect(within(screenRoot).getByText('Tight budget')).toBeInTheDocument();
    expect(within(screenRoot).getByText('R2,365.37')).toBeInTheDocument();
    expect(within(screenRoot).getByText('R56,768.77')).toBeInTheDocument();
    expect(within(screenRoot).getByText('R6,768.77')).toBeInTheDocument();
    expect(within(screenRoot).getByText('R834.63')).toBeInTheDocument();
    expect(within(screenRoot).getByText('27.8%')).toBeInTheDocument();
    expect(within(screenRoot).getByText('Entered by you.')).toBeInTheDocument();
    expect(within(screenRoot).getByText('Below the R1,000 buffer.')).toBeInTheDocument();
  });

  it('shows not eligible and monthly shortfall when the repayment exceeds budget', () => {
    openResult({ ...section19Budget, monthlyIncome: 12_000 });

    expect(screen.getByText('Not eligible')).toBeInTheDocument();
    expect(
      screen.getByText('The monthly repayment is higher than your remaining budget.'),
    ).toBeInTheDocument();
    expect(screen.getByText('Monthly shortfall')).toBeInTheDocument();
  });

  it('lists age and duration failures and notes that adjusting the loan will not fix them', () => {
    openResult({
      ...section19Budget,
      age: 17,
      employmentDurationMonths: 1,
    });

    expect(screen.getByText('You must be between 18 and 65 years old.')).toBeInTheDocument();
    expect(screen.getByText('You need at least 3 months in your current job.')).toBeInTheDocument();
    expect(
      screen.getByText('Changing the loan amount or term will not fix this.'),
    ).toBeInTheDocument();
  });

  it('updates figures when the loan is adjusted to valid values', () => {
    const { store } = openResult();

    fireEvent.change(screen.getByRole('slider', { name: /Adjust Loan amount/i }), {
      target: { value: '5000' },
    });
    fireEvent.change(screen.getByRole('slider', { name: /Adjust Repayment term/i }), {
      target: { value: '6' },
    });

    expect(store.getState().journey.submittedLoanDetails?.amount).toBe(5_000);
    expect(store.getState().journey.submittedLoanDetails?.termMonths).toBe(6);
    expect(screen.getByText('Estimated eligible')).toBeInTheDocument();
    expect(screen.queryByText('R2,365.37')).not.toBeInTheDocument();
  });

  it('hides matched result figures when the adjusted amount is invalid', async () => {
    const { user } = openResult();
    const amountInput = screen.getByRole('textbox', { name: /^Loan amount \(R\)/i });

    await user.clear(amountInput);
    await user.type(amountInput, '100');
    await user.tab();

    expect(screen.getByText(/Enter an amount from/i)).toBeInTheDocument();
    expect(screen.getAllByText('Enter a valid amount and term.').length).toBeGreaterThan(0);
    expect(screen.queryByText('R2,365.37')).not.toBeInTheDocument();
  });

  it('returns to the budget screen with preserved details on Edit your details', async () => {
    const { user } = openResult();

    await user.click(screen.getByRole('button', { name: /Edit your details/i }));

    expect(screen.getByTestId('your-budget-screen')).toBeInTheDocument();
    expect(screen.getByRole('textbox', { name: /Monthly take-home income/i })).toHaveValue(
      '15000.00',
    );
    expect(screen.getByRole('spinbutton', { name: /Age \(years\)/i })).toHaveValue(35);
  });

  it('clears the journey on Start again', async () => {
    const { store, user } = openResult();

    await user.click(screen.getByRole('button', { name: /Start again/i }));

    expect(screen.getByTestId('loan-details-screen')).toBeInTheDocument();
    expect(store.getState().journey.currentScreen).toBe(JOURNEY_SCREENS.loanDetails);
    expect(store.getState().journey.submittedBudget).toBeNull();
    expect(store.getState().journey.demoCreditScore).toBeNull();
  });

  it('shows demo score value without a demo source label', () => {
    openResult(
      {
        ...section19Budget,
        creditScore: null,
        creditScoreUnknown: true,
        requestDemoCreditCheck: true,
      },
      650,
    );

    expect(screen.getByText('650')).toBeInTheDocument();
    expect(screen.queryByText(/Demo/i)).not.toBeInTheDocument();
    expect(screen.queryByText('Entered by you.')).not.toBeInTheDocument();
    expect(screen.getByText('Your score sets the annual rate to 12.5%.')).toBeInTheDocument();
  });

  it('shows budget-only credit copy when no score is used', () => {
    openResult({
      ...section19Budget,
      creditScore: null,
      creditScoreUnknown: true,
      requestDemoCreditCheck: false,
    });

    expect(screen.getByText('No credit score used')).toBeInTheDocument();
    expect(screen.getByText('Using an example annual rate of 12.5%.')).toBeInTheDocument();
  });

  it('shows unavailable copy when result details are missing', async () => {
    const store = createAppStore();
    store.dispatch(setCurrentScreen(JOURNEY_SCREENS.yourResult));
    const user = userEvent.setup();

    render(
      <Provider store={store}>
        <App />
      </Provider>,
    );

    expect(
      screen.getByText('Result details are unavailable. Start again to check a loan.'),
    ).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: /Start again/i }));
    expect(screen.getByTestId('loan-details-screen')).toBeInTheDocument();
  });

  it('shows a term error when the repayment term is cleared', async () => {
    const { user } = openResult();
    const term = screen.getByRole('textbox', { name: /Repayment term \(months\)/i });

    await user.clear(term);
    await user.tab();

    expect(screen.getByText('Enter a repayment term.')).toBeInTheDocument();
  });

  it('shows a term range error when the term is above the maximum', async () => {
    const { user } = openResult();
    const term = screen.getByRole('textbox', { name: /Repayment term \(months\)/i });

    await user.clear(term);
    await user.type(term, '61');
    await user.tab();

    expect(screen.getByText(/Enter a term from 6 to 60 months/i)).toBeInTheDocument();
  });
});
