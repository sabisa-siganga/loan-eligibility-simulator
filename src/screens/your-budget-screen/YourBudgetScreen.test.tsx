import { act, cleanup, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Provider } from 'react-redux';
import { afterEach, describe, expect, it, vi } from 'vitest';
import App from '../../App';
import { createAppStore } from '../../store/store';
import { JOURNEY_SCREENS, setCurrentScreen, submitLoanDetails } from '../../store/journeySlice';
import { emptyBudgetFormValues } from '../../types/budget';
import * as eligibilityService from '../../services/eligibility';

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
});

const seedLoanAndOpenBudget = () => {
  const store = createAppStore();
  store.dispatch(
    submitLoanDetails({
      amount: 50_000,
      termMonths: 24,
      purpose: 'homeImprovement',
      annualRateUsed: 12.5,
    }),
  );
  const user = userEvent.setup();
  render(
    <Provider store={store}>
      <App />
    </Provider>,
  );
  return { store, user };
};

const getAgeInput = () => screen.getByRole('spinbutton', { name: /Age \(years\)/i });

const fillRequiredEmployedFields = async (
  user: ReturnType<typeof userEvent.setup>,
  { age = '35' }: { age?: string } = {},
) => {
  await user.type(screen.getByRole('textbox', { name: /Monthly take-home income/i }), '15000');
  await user.type(screen.getByRole('textbox', { name: /Monthly living expenses/i }), '10000');
  await user.type(
    screen.getByRole('textbox', { name: /Existing monthly debt repayments/i }),
    '1800',
  );
  if (age !== '') {
    await user.type(getAgeInput(), age);
  }
  await user.selectOptions(screen.getByLabelText(/Employment status/i), 'employed');
  await user.type(screen.getByRole('textbox', { name: /Employment duration \(months\)/i }), '24');
};

describe('YourBudgetScreen', () => {
  it('shows an empty budget form and a loan summary from submitted loan details', () => {
    seedLoanAndOpenBudget();

    expect(screen.getByTestId('your-budget-screen')).toBeInTheDocument();
    expect(screen.getByTestId('loan-summary')).toHaveTextContent(
      'R50,000.00•24 months•Home improvement',
    );
    expect(screen.getByRole('textbox', { name: /Monthly take-home income/i })).toHaveValue('');
    expect(screen.getByLabelText(/Employment status/i)).toHaveValue('');
  });

  it('shows employment duration for employed and income source for unemployed', async () => {
    const { user } = seedLoanAndOpenBudget();

    await user.selectOptions(screen.getByLabelText(/Employment status/i), 'employed');
    expect(
      screen.getByRole('textbox', { name: /Employment duration \(months\)/i }),
    ).toBeInTheDocument();

    await user.selectOptions(screen.getByLabelText(/Employment status/i), 'unemployed');
    expect(screen.queryByRole('textbox', { name: /Employment duration/i })).not.toBeInTheDocument();
    expect(screen.getByLabelText(/Income source/i)).toBeInTheDocument();
  });

  it('locks income at 0.00 when No income is selected', async () => {
    const { user } = seedLoanAndOpenBudget();

    await user.selectOptions(screen.getByLabelText(/Employment status/i), 'retired');
    await user.selectOptions(screen.getByLabelText(/Income source/i), 'noIncome');

    const income = screen.getByRole('textbox', { name: /Monthly take-home income/i });
    expect(income).toHaveAttribute('readonly');
    expect(income).toHaveValue('0.00');
  });

  it('requires a credit score unless the user does not know it', async () => {
    const { user } = seedLoanAndOpenBudget();

    await fillRequiredEmployedFields(user);
    await user.click(screen.getByRole('button', { name: /Check estimated eligibility/i }));

    expect(
      await screen.findByText(/Enter your credit score, or select that you do not know it/i),
    ).toBeInTheDocument();

    await user.click(screen.getByLabelText(/I don't know my credit score/i));
    expect(screen.queryByRole('textbox', { name: /^Credit score/i })).not.toBeInTheDocument();
    expect(screen.getByLabelText(/Check my credit score/i)).toBeInTheDocument();
  });

  it('shows the age range error when age is below 18 and stays on the budget screen', async () => {
    const checkSpy = vi.spyOn(eligibilityService, 'checkEligibility');
    const { user } = seedLoanAndOpenBudget();

    await fillRequiredEmployedFields(user, { age: '17' });
    await user.type(screen.getByRole('textbox', { name: /^Credit score/i }), '650');
    await user.click(screen.getByRole('button', { name: /Check estimated eligibility/i }));

    expect(await screen.findByText('You must be between 18 and 65 years old.')).toBeInTheDocument();
    expect(screen.getByTestId('your-budget-screen')).toBeInTheDocument();
    expect(checkSpy).not.toHaveBeenCalled();
  });

  it('shows the age range error when age is above 65', async () => {
    const { user } = seedLoanAndOpenBudget();

    await fillRequiredEmployedFields(user, { age: '66' });
    await user.type(screen.getByRole('textbox', { name: /^Credit score/i }), '650');
    await user.click(screen.getByRole('button', { name: /Check estimated eligibility/i }));

    expect(await screen.findByText('You must be between 18 and 65 years old.')).toBeInTheDocument();
    expect(screen.getByTestId('your-budget-screen')).toBeInTheDocument();
  });

  it('shows Enter your age when age is left empty on submit', async () => {
    const { user } = seedLoanAndOpenBudget();

    await fillRequiredEmployedFields(user, { age: '' });
    await user.type(screen.getByRole('textbox', { name: /^Credit score/i }), '650');
    await user.click(screen.getByRole('button', { name: /Check estimated eligibility/i }));

    expect(await screen.findByText('Enter your age.')).toBeInTheDocument();
    expect(screen.getByTestId('your-budget-screen')).toBeInTheDocument();
  });

  it('does not show the age range error when age is 18', async () => {
    vi.spyOn(eligibilityService, 'checkEligibility').mockResolvedValue({
      ok: true,
      requestId: 1,
    });
    const { user } = seedLoanAndOpenBudget();

    await fillRequiredEmployedFields(user, { age: '18' });
    await user.type(screen.getByRole('textbox', { name: /^Credit score/i }), '650');
    await user.click(screen.getByRole('button', { name: /Check estimated eligibility/i }));

    expect(screen.queryByText('You must be between 18 and 65 years old.')).not.toBeInTheDocument();
    expect(await screen.findByTestId('your-result-screen')).toBeInTheDocument();
  });

  it('preserves budget draft when going Back and returning', async () => {
    const { user } = seedLoanAndOpenBudget();

    await user.type(getAgeInput(), '35');
    await user.click(screen.getByRole('button', { name: /^Back$/i }));

    expect(screen.getByTestId('loan-details-screen')).toBeInTheDocument();
    expect(screen.getByRole('textbox', { name: /^Loan amount \(R\)/i })).toHaveValue('50000.00');

    await user.click(screen.getByRole('button', { name: /Continue to your budget/i }));
    expect(getAgeInput()).toHaveValue(35);
  });

  it('clears the journey on Cancel and returns to loan defaults', async () => {
    const { store, user } = seedLoanAndOpenBudget();

    await user.type(getAgeInput(), '35');
    await user.click(screen.getByRole('button', { name: /^Cancel$/i }));

    expect(screen.getByTestId('loan-details-screen')).toBeInTheDocument();
    expect(store.getState().journey).toMatchObject({
      currentScreen: JOURNEY_SCREENS.loanDetails,
      submittedLoanDetails: null,
      budgetDraft: null,
      submittedBudget: null,
      demoCreditScore: null,
    });
    expect(screen.getByRole('textbox', { name: /^Loan amount \(R\)/i })).toHaveValue('5000.00');
  });

  it('checks eligibility and opens the result placeholder', async () => {
    vi.spyOn(eligibilityService, 'checkEligibility').mockResolvedValue({
      ok: true,
      requestId: 1,
    });

    const { store, user } = seedLoanAndOpenBudget();

    await fillRequiredEmployedFields(user);
    await user.type(screen.getByRole('textbox', { name: /^Credit score/i }), '650');
    await user.click(screen.getByRole('button', { name: /Check estimated eligibility/i }));

    expect(await screen.findByTestId('your-result-screen')).toBeInTheDocument();
    expect(store.getState().journey.submittedBudget?.creditScore).toBe(650);
    expect(store.getState().journey.demoCreditScore).toBeNull();
  });

  it('keeps a demo credit score stable across Back and a second check', async () => {
    vi.spyOn(eligibilityService, 'checkEligibility').mockImplementation(async ({ requestId }) => ({
      ok: true,
      requestId,
    }));
    vi.spyOn(Math, 'random').mockReturnValue(0.1);

    const { store, user } = seedLoanAndOpenBudget();

    await fillRequiredEmployedFields(user);
    await user.click(screen.getByLabelText(/I don't know my credit score/i));
    await user.click(screen.getByLabelText(/Check my credit score/i));
    await user.click(screen.getByRole('button', { name: /Check estimated eligibility/i }));

    await screen.findByTestId('your-result-screen');
    const firstScore = store.getState().journey.demoCreditScore;
    expect(firstScore).toBe(450);

    act(() => {
      store.dispatch(setCurrentScreen(JOURNEY_SCREENS.yourBudget));
    });

    expect(store.getState().journey.demoCreditScore).toBe(firstScore);
  });

  it('shows Checking… while the mock eligibility request is in flight', async () => {
    let resolveCheck: ((value: eligibilityService.EligibilityCheckResult) => void) | undefined;
    vi.spyOn(eligibilityService, 'checkEligibility').mockImplementation(
      () =>
        new Promise((resolve) => {
          resolveCheck = resolve;
        }),
    );

    const { user } = seedLoanAndOpenBudget();
    await fillRequiredEmployedFields(user);
    await user.type(screen.getByRole('textbox', { name: /^Credit score/i }), '650');
    await user.click(screen.getByRole('button', { name: /Check estimated eligibility/i }));

    expect(screen.getByRole('button', { name: /Checking/i })).toBeDisabled();

    resolveCheck?.({ ok: true, requestId: 1 });
    await waitFor(() => {
      expect(screen.getByTestId('your-result-screen')).toBeInTheDocument();
    });
  });
});

describe('budget draft helpers', () => {
  it('starts with empty personal and financial fields', () => {
    expect(emptyBudgetFormValues().monthlyIncome).toBeNull();
    expect(emptyBudgetFormValues().employmentStatus).toBe('');
    expect(emptyBudgetFormValues().creditScoreUnknown).toBe(false);
  });
});
