import { describe, expect, it } from 'vitest';
import { loanDetailsFormSchema } from './loanDetailsSchema';
import { PRODUCT_SETTINGS } from './productSettings';

const amountMessage = `Enter an amount from R${PRODUCT_SETTINGS.minAmount.toLocaleString('en-ZA')} to R${PRODUCT_SETTINGS.maxAmount.toLocaleString('en-ZA')}.`;
const termMessage = `Enter a term from ${PRODUCT_SETTINGS.minTermMonths} to ${PRODUCT_SETTINGS.maxTermMonths} months.`;

const validBase = {
  amount: PRODUCT_SETTINGS.defaultAmount,
  termMonths: PRODUCT_SETTINGS.defaultTermMonths,
  purpose: 'debtConsolidation' as const,
};

const fieldMessage = (field: 'amount' | 'termMonths' | 'purpose', value: unknown) => {
  const result = loanDetailsFormSchema.safeParse({
    ...validBase,
    [field]: value,
  });
  expect(result.success).toBe(false);
  if (result.success) {
    return undefined;
  }
  return result.error.issues.find((issue) => issue.path[0] === field)?.message;
};

describe('loanDetailsFormSchema', () => {
  it('accepts a valid amount, term, and purpose', () => {
    const result = loanDetailsFormSchema.safeParse(validBase);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data).toEqual(validBase);
    }
  });

  it('accepts amounts and terms at the inclusive min and max bounds', () => {
    expect(
      loanDetailsFormSchema.safeParse({
        ...validBase,
        amount: PRODUCT_SETTINGS.minAmount,
        termMonths: PRODUCT_SETTINGS.minTermMonths,
      }).success,
    ).toBe(true);
    expect(
      loanDetailsFormSchema.safeParse({
        ...validBase,
        amount: PRODUCT_SETTINGS.maxAmount,
        termMonths: PRODUCT_SETTINGS.maxTermMonths,
      }).success,
    ).toBe(true);
  });

  it('rejects a null amount with Enter a loan amount', () => {
    expect(fieldMessage('amount', null)).toBe('Enter a loan amount.');
  });

  it('rejects a non-integer amount with the whole-rands message', () => {
    expect(fieldMessage('amount', 5000.5)).toBe('Enter whole rands only.');
  });

  it('rejects amounts below the minimum and above the maximum with the range message', () => {
    expect(fieldMessage('amount', PRODUCT_SETTINGS.minAmount - 1)).toBe(amountMessage);
    expect(fieldMessage('amount', PRODUCT_SETTINGS.maxAmount + 1)).toBe(amountMessage);
  });

  it('rejects a null term with Enter a repayment term', () => {
    expect(fieldMessage('termMonths', null)).toBe('Enter a repayment term.');
  });

  it('rejects a non-integer term with the whole-months message', () => {
    expect(fieldMessage('termMonths', 6.5)).toBe('Enter whole months only.');
  });

  it('rejects terms below the minimum and above the maximum with the range message', () => {
    expect(fieldMessage('termMonths', PRODUCT_SETTINGS.minTermMonths - 1)).toBe(termMessage);
    expect(fieldMessage('termMonths', PRODUCT_SETTINGS.maxTermMonths + 1)).toBe(termMessage);
  });

  it('rejects an empty purpose with Select a loan purpose', () => {
    expect(fieldMessage('purpose', '')).toBe('Select a loan purpose.');
  });

  it('rejects an unknown purpose with Select a loan purpose', () => {
    expect(fieldMessage('purpose', 'not-a-purpose')).toBe('Select a loan purpose.');
  });
});
