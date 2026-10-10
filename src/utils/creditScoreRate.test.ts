import { describe, expect, it } from 'vitest';
import { getAnnualRateForCreditScore } from './creditScoreRate';

describe('getAnnualRateForCreditScore', () => {
  it('maps each score band to the demo annual rate', () => {
    expect(getAnnualRateForCreditScore(300)).toBe(18.5);
    expect(getAnnualRateForCreditScore(499)).toBe(18.5);
    expect(getAnnualRateForCreditScore(500)).toBe(16.5);
    expect(getAnnualRateForCreditScore(650)).toBe(12.5);
    expect(getAnnualRateForCreditScore(750)).toBe(11.5);
    expect(getAnnualRateForCreditScore(850)).toBe(10.5);
  });

  it('rejects scores outside 300 to 850', () => {
    expect(() => getAnnualRateForCreditScore(299)).toThrow(/300 to 850/);
    expect(() => getAnnualRateForCreditScore(851)).toThrow(/300 to 850/);
  });
});
