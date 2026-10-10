import { describe, expect, it } from 'vitest';
import type { SubmittedBudget } from '../types/budget';
import type { SubmittedLoanDetails } from '../types/loan';
import { resolveEffectiveCredit } from './resolveEffectiveCredit';

const loan: SubmittedLoanDetails = {
  amount: 50_000,
  termMonths: 24,
  purpose: 'homeImprovement',
  annualRateUsed: 12.5,
};

const baseBudget = (overrides: Partial<SubmittedBudget> = {}): SubmittedBudget => ({
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
  ...overrides,
});

describe('resolveEffectiveCredit', () => {
  it('uses the manual score rate for a known credit score', () => {
    expect(
      resolveEffectiveCredit({
        budget: baseBudget({ creditScore: 750 }),
        loan,
        demoCreditScore: null,
      }),
    ).toEqual({ score: 750, annualRate: 11.5, mode: 'manual' });
  });

  it('uses the demo score when unknown and a check was requested', () => {
    expect(
      resolveEffectiveCredit({
        budget: baseBudget({
          creditScore: null,
          creditScoreUnknown: true,
          requestDemoCreditCheck: true,
        }),
        loan,
        demoCreditScore: 550,
      }),
    ).toEqual({ score: 550, annualRate: 16.5, mode: 'demo' });
  });

  it('keeps the example rate for a budget-only estimate', () => {
    expect(
      resolveEffectiveCredit({
        budget: baseBudget({
          creditScore: null,
          creditScoreUnknown: true,
          requestDemoCreditCheck: false,
        }),
        loan: { ...loan, annualRateUsed: 14 },
        demoCreditScore: null,
      }),
    ).toEqual({ score: null, annualRate: 14, mode: 'none' });
  });
});
