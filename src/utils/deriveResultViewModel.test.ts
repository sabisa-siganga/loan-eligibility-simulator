import { describe, expect, it } from 'vitest';
import type { SubmittedBudget } from '../types/budget';
import type { SubmittedLoanDetails } from '../types/loan';
import { deriveResultViewModel } from './deriveResultViewModel';

const loan: SubmittedLoanDetails = {
  amount: 50_000,
  termMonths: 24,
  purpose: 'homeImprovement',
  annualRateUsed: 12.5,
};

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

describe('deriveResultViewModel', () => {
  it('matches the section 19 checked example', () => {
    const view = deriveResultViewModel({
      loan,
      budget: section19Budget,
      demoCreditScore: null,
    });

    expect(view.isEligible).toBe(true);
    expect(view.statusLabel).toBe('Estimated eligible');
    expect(view.showTightBudgetWarning).toBe(true);
    expect(view.monthlyRepaymentDisplay).toBe('R2,365.37');
    expect(view.totalRepaymentDisplay).toBe('R56,768.77');
    expect(view.totalInterestDisplay).toBe('R6,768.77');
    expect(view.moneyLeftDisplay).toBe('R834.63');
    expect(view.moneyLeftLabel).toBe('Money left each month');
    expect(view.debtShareDisplay).toBe('27.8%');
    expect(view.creditMode).toBe('manual');
    expect(view.creditScoreCaption).toBe('Entered by you.');
    expect(view.rateExplanation).toBe('Your score sets the annual rate to 12.5%.');
  });

  it('shows monthly shortfall when the budget is negative', () => {
    const view = deriveResultViewModel({
      loan,
      budget: { ...section19Budget, monthlyIncome: 12_000 },
      demoCreditScore: null,
    });

    expect(view.isEligible).toBe(false);
    expect(view.moneyLeftLabel).toBe('Monthly shortfall');
    expect(view.moneyLeft).toBeLessThan(0);
  });

  it('omits a demo-score source label and uses budget-only copy without a score', () => {
    const demoView = deriveResultViewModel({
      loan,
      budget: {
        ...section19Budget,
        creditScore: null,
        creditScoreUnknown: true,
        requestDemoCreditCheck: true,
      },
      demoCreditScore: 650,
    });
    expect(demoView.creditMode).toBe('demo');
    expect(demoView.creditScoreDisplay).toBe('650');
    expect(demoView.creditScoreCaption).toBeNull();

    const noneView = deriveResultViewModel({
      loan,
      budget: {
        ...section19Budget,
        creditScore: null,
        creditScoreUnknown: true,
        requestDemoCreditCheck: false,
      },
      demoCreditScore: null,
    });
    expect(noneView.creditMode).toBe('none');
    expect(noneView.creditScoreCaption).toBe('No credit score used');
    expect(noneView.rateExplanation).toBe('Using an example annual rate of 12.5%.');
  });
});
