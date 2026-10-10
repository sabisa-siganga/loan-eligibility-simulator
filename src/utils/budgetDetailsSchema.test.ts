import { describe, expect, it } from 'vitest';
import { emptyBudgetFormValues } from '../types/budget';
import { budgetDetailsFormSchema } from './budgetDetailsSchema';

const validBase = {
  ...emptyBudgetFormValues(),
  monthlyIncome: 15_000,
  livingExpenses: 10_000,
  existingDebtRepayments: 1_800,
  age: 35,
  employmentStatus: 'employed' as const,
  employmentDurationMonths: 24,
  creditScore: 650,
};

describe('budgetDetailsFormSchema', () => {
  it('accepts a valid employed submission with a manual credit score', () => {
    const result = budgetDetailsFormSchema.safeParse(validBase);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.employmentDurationMonths).toBe(24);
      expect(result.data.incomeSource).toBeNull();
      expect(result.data.creditScore).toBe(650);
    }
  });

  it('requires employment duration only for employed users', () => {
    const result = budgetDetailsFormSchema.safeParse({
      ...validBase,
      employmentDurationMonths: null,
    });
    expect(result.success).toBe(false);
  });

  it('requires income source for unemployed users and ignores employment duration', () => {
    const result = budgetDetailsFormSchema.safeParse({
      ...validBase,
      employmentStatus: 'unemployed',
      employmentDurationMonths: 99,
      incomeSource: 'pension',
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.employmentDurationMonths).toBeNull();
      expect(result.data.incomeSource).toBe('pension');
      expect(result.data.incomeDurationMonths).toBeNull();
    }
  });

  it('requires income duration for rental income', () => {
    const missing = budgetDetailsFormSchema.safeParse({
      ...validBase,
      employmentStatus: 'retired',
      incomeSource: 'rentalIncome',
      incomeDurationMonths: null,
    });
    expect(missing.success).toBe(false);

    const present = budgetDetailsFormSchema.safeParse({
      ...validBase,
      employmentStatus: 'retired',
      incomeSource: 'rentalIncome',
      incomeDurationMonths: 8,
    });
    expect(present.success).toBe(true);
  });

  it('allows unknown credit score without a manual score', () => {
    const result = budgetDetailsFormSchema.safeParse({
      ...validBase,
      creditScore: null,
      creditScoreUnknown: true,
      requestDemoCreditCheck: true,
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.creditScore).toBeNull();
      expect(result.data.requestDemoCreditCheck).toBe(true);
    }
  });

  it('rejects manual credit scores outside 300 to 850', () => {
    const result = budgetDetailsFormSchema.safeParse({
      ...validBase,
      creditScore: 200,
    });
    expect(result.success).toBe(false);
  });
});
