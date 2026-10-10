import { describe, expect, it } from 'vitest';
import { emptyBudgetFormValues } from '../types/budget';
import { budgetDetailsFormSchema } from './budgetDetailsSchema';

const AGE_RANGE_MESSAGE = 'You must be between 18 and 65 years old.';

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

const ageIssueMessage = (age: unknown) => {
  const result = budgetDetailsFormSchema.safeParse({
    ...validBase,
    age,
  });
  expect(result.success).toBe(false);
  if (result.success) {
    return undefined;
  }
  return result.error.issues.find((issue) => issue.path[0] === 'age')?.message;
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

  it('accepts ages at the inclusive 18 and 65 bounds', () => {
    expect(budgetDetailsFormSchema.safeParse({ ...validBase, age: 18 }).success).toBe(true);
    expect(budgetDetailsFormSchema.safeParse({ ...validBase, age: 65 }).success).toBe(true);
  });

  it('rejects ages below 18 and above 65 with the range message', () => {
    expect(ageIssueMessage(17)).toBe(AGE_RANGE_MESSAGE);
    expect(ageIssueMessage(66)).toBe(AGE_RANGE_MESSAGE);
  });

  it('rejects ages that used to pass the old 1 to 120 form window', () => {
    expect(ageIssueMessage(1)).toBe(AGE_RANGE_MESSAGE);
    expect(ageIssueMessage(120)).toBe(AGE_RANGE_MESSAGE);
  });

  it('rejects an empty age with Enter your age', () => {
    expect(ageIssueMessage(null)).toBe('Enter your age.');
  });

  it('rejects a non-integer age with the whole-number message', () => {
    expect(ageIssueMessage(18.5)).toBe('Enter a whole number of years.');
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
