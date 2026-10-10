import { describe, expect, it } from 'vitest';
import {
  editBudgetDetails,
  eligibilityFailed,
  eligibilitySucceeded,
  goBackToLoanDetails,
  JOURNEY_SCREENS,
  resetJourney,
  submitBudgetAndStartCheck,
  submitLoanDetails,
  updateSubmittedLoanDetails,
} from './journeySlice';
import { emptyBudgetFormValues } from '../types/budget';
import { createAppStore } from './store';

const sampleLoan = {
  amount: 50_000,
  termMonths: 24,
  purpose: 'debtConsolidation' as const,
  annualRateUsed: 12.5,
};

const sampleBudget = {
  monthlyIncome: 15_000,
  livingExpenses: 10_000,
  existingDebtRepayments: 1_800,
  age: 35,
  employmentStatus: 'employed' as const,
  employmentDurationMonths: 24,
  businessDurationMonths: null,
  incomeSource: null,
  incomeDurationMonths: null,
  creditScore: 650,
  creditScoreUnknown: false,
  requestDemoCreditCheck: false,
};

describe('journeySlice', () => {
  it('ignores eligibility success and failure for a stale request id', () => {
    const store = createAppStore();
    store.dispatch(submitLoanDetails(sampleLoan));
    store.dispatch(
      submitBudgetAndStartCheck({
        budget: sampleBudget,
        demoCreditScore: null,
      }),
    );
    const requestId = store.getState().journey.eligibilityRequestId;

    store.dispatch(eligibilitySucceeded({ requestId: requestId + 1 }));
    store.dispatch(eligibilityFailed({ requestId: requestId + 1, message: 'stale failure' }));

    expect(store.getState().journey.eligibilityStatus).toBe('checking');
    expect(store.getState().journey.eligibilityError).toBeNull();
    expect(store.getState().journey.currentScreen).toBe(JOURNEY_SCREENS.yourBudget);
  });

  it('records an eligibility failure for the current request id', () => {
    const store = createAppStore();
    store.dispatch(submitLoanDetails(sampleLoan));
    store.dispatch(
      submitBudgetAndStartCheck({
        budget: sampleBudget,
        demoCreditScore: null,
      }),
    );
    const requestId = store.getState().journey.eligibilityRequestId;

    store.dispatch(
      eligibilityFailed({
        requestId,
        message: 'We could not check eligibility. Please try again.',
      }),
    );

    expect(store.getState().journey.eligibilityStatus).toBe('failed');
    expect(store.getState().journey.eligibilityError).toBe(
      'We could not check eligibility. Please try again.',
    );
  });

  it('updates submitted loan amount and term only when loan details exist', () => {
    const store = createAppStore();

    store.dispatch(updateSubmittedLoanDetails({ amount: 80_000, termMonths: 36 }));
    expect(store.getState().journey.submittedLoanDetails).toBeNull();

    store.dispatch(submitLoanDetails(sampleLoan));
    store.dispatch(updateSubmittedLoanDetails({ amount: 80_000, termMonths: 36 }));

    expect(store.getState().journey.submittedLoanDetails).toMatchObject({
      amount: 80_000,
      termMonths: 36,
    });
  });

  it('stores a demo credit score when the budget requests a demo check', () => {
    const store = createAppStore();
    store.dispatch(submitLoanDetails(sampleLoan));
    store.dispatch(
      submitBudgetAndStartCheck({
        budget: {
          ...sampleBudget,
          creditScore: null,
          creditScoreUnknown: true,
          requestDemoCreditCheck: true,
        },
        demoCreditScore: 620,
      }),
    );

    expect(store.getState().journey.demoCreditScore).toBe(620);

    store.dispatch(resetJourney());
    expect(store.getState().journey.demoCreditScore).toBeNull();
  });

  it('returns to loan details from the budget draft while clearing eligibility state', () => {
    const store = createAppStore();
    store.dispatch(submitLoanDetails(sampleLoan));
    store.dispatch(
      submitBudgetAndStartCheck({
        budget: sampleBudget,
        demoCreditScore: null,
      }),
    );

    store.dispatch(goBackToLoanDetails(emptyBudgetFormValues()));

    expect(store.getState().journey.currentScreen).toBe(JOURNEY_SCREENS.loanDetails);
    expect(store.getState().journey.eligibilityStatus).toBe('idle');
    expect(store.getState().journey.eligibilityError).toBeNull();
    expect(store.getState().journey.budgetDraft).toEqual(emptyBudgetFormValues());
  });

  it('ignores editBudgetDetails when no submitted budget exists', () => {
    const store = createAppStore();
    store.dispatch(editBudgetDetails());
    expect(store.getState().journey.budgetDraft).toBeNull();
    expect(store.getState().journey.currentScreen).toBe(JOURNEY_SCREENS.loanDetails);
  });
});
