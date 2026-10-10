import { describe, expect, it } from 'vitest';
import type { SubmittedBudget } from '../types/budget';
import { evaluateEligibility } from './evaluateEligibility';

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

describe('evaluateEligibility', () => {
  it('marks the section 19 example as eligible with a tight budget', () => {
    const result = evaluateEligibility({
      budget: baseBudget(),
      monthlyRepayment: 2365.37,
    });

    expect(result.isEligible).toBe(true);
    expect(result.budgetOutcome).toBe('tight');
    expect(result.moneyLeft).toBe(834.63);
    expect(result.failures).toHaveLength(0);
  });

  it('rejects a negative money left as a budget shortfall', () => {
    const result = evaluateEligibility({
      budget: baseBudget({ monthlyIncome: 12_000 }),
      monthlyRepayment: 2365.37,
    });

    expect(result.isEligible).toBe(false);
    expect(result.budgetOutcome).toBe('shortfall');
    expect(result.failures.some((failure) => failure.code === 'budgetShortfall')).toBe(true);
  });

  it('treats money left of 0 as tight and 1000 as comfortable', () => {
    const atZero = evaluateEligibility({
      budget: baseBudget({
        monthlyIncome: 10_000,
        livingExpenses: 5_000,
        existingDebtRepayments: 2_500,
      }),
      monthlyRepayment: 2_500,
    });
    expect(atZero.moneyLeft).toBe(0);
    expect(atZero.budgetOutcome).toBe('tight');
    expect(atZero.isEligible).toBe(true);

    const atBuffer = evaluateEligibility({
      budget: baseBudget({
        monthlyIncome: 10_000,
        livingExpenses: 5_000,
        existingDebtRepayments: 2_000,
      }),
      monthlyRepayment: 2_000,
    });
    expect(atBuffer.moneyLeft).toBe(1_000);
    expect(atBuffer.budgetOutcome).toBe('comfortable');
  });

  it('fails age, employment duration, and no-income rules together when applicable', () => {
    const result = evaluateEligibility({
      budget: baseBudget({
        age: 17,
        employmentStatus: 'unemployed',
        employmentDurationMonths: null,
        incomeSource: 'noIncome',
        monthlyIncome: 0,
      }),
      monthlyRepayment: 1000,
    });

    const codes = result.failures.map((failure) => failure.code);
    expect(codes).toContain('age');
    expect(codes).toContain('noIncome');
    expect(codes).not.toContain('minIncome');
    expect(result.cannotFixByAdjustingLoan).toBe(true);
  });

  it('requires six months for other income sources', () => {
    const result = evaluateEligibility({
      budget: baseBudget({
        employmentStatus: 'retired',
        employmentDurationMonths: null,
        incomeSource: 'rentalIncome',
        incomeDurationMonths: 5,
      }),
      monthlyRepayment: 500,
    });

    expect(result.failures.some((failure) => failure.code === 'incomeDuration')).toBe(true);
  });

  it('fails employed users below the minimum employment duration', () => {
    const result = evaluateEligibility({
      budget: baseBudget({ employmentDurationMonths: 2 }),
      monthlyRepayment: 500,
    });

    expect(result.failures.some((failure) => failure.code === 'employmentDuration')).toBe(true);
  });

  it('fails self-employed users below the minimum business duration', () => {
    const result = evaluateEligibility({
      budget: baseBudget({
        employmentStatus: 'selfEmployed',
        employmentDurationMonths: null,
        businessDurationMonths: 1,
      }),
      monthlyRepayment: 500,
    });

    expect(result.failures.some((failure) => failure.code === 'businessDuration')).toBe(true);
  });

  it('fails income below the minimum when the user has some income', () => {
    const result = evaluateEligibility({
      budget: baseBudget({ monthlyIncome: 500 }),
      monthlyRepayment: 100,
    });

    expect(result.failures.some((failure) => failure.code === 'minIncome')).toBe(true);
  });
});
