import { describe, expect, it } from 'vitest';
import { roundMoney } from './roundMoney';

describe('roundMoney', () => {
  it('rounds to two decimal places for positive values', () => {
    expect(roundMoney(1.006)).toBe(1.01);
    expect(roundMoney(2.004)).toBe(2);
  });

  it('rounds negative values using absolute magnitude', () => {
    expect(roundMoney(-1.006)).toBe(-1.01);
    expect(roundMoney(-2.004)).toBe(-2);
  });

  it('returns non-finite values unchanged', () => {
    expect(roundMoney(Number.NaN)).toBeNaN();
    expect(roundMoney(Number.POSITIVE_INFINITY)).toBe(Number.POSITIVE_INFINITY);
  });
});
