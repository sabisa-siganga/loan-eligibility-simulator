import { describe, expect, it } from 'vitest';
import { calculateRepayment } from './calculateRepayment';
import { roundMoney } from './roundMoney';

describe('calculateRepayment', () => {
  it('matches the section 19 checked example for R50,000 over 24 months at 12.5%', () => {
    const estimate = calculateRepayment({
      principal: 50_000,
      termMonths: 24,
      annualRatePercent: 12.5,
    });

    expect(estimate.monthlyPayment).toBe(2365.37);
    expect(estimate.totalRepayment).toBe(56768.77);
    expect(estimate.totalInterest).toBe(6768.77);
  });

  it('divides principal evenly when the annual rate is zero', () => {
    const estimate = calculateRepayment({
      principal: 12_000,
      termMonths: 12,
      annualRatePercent: 0,
    });

    expect(estimate.monthlyPayment).toBe(1000);
    expect(estimate.totalRepayment).toBe(12_000);
    expect(estimate.totalInterest).toBe(0);
  });

  it('builds totals from the unrounded monthly payment instead of rounded display strings', () => {
    const principal = 50_000;
    const termMonths = 24;
    const annualRatePercent = 12.5;
    const monthlyRate = annualRatePercent / 100 / 12;
    const unroundedMonthly = (principal * monthlyRate) / (1 - (1 + monthlyRate) ** -termMonths);

    const estimate = calculateRepayment({
      principal,
      termMonths,
      annualRatePercent,
    });

    expect(estimate.monthlyPayment).toBe(roundMoney(unroundedMonthly));
    expect(estimate.totalRepayment).toBe(roundMoney(unroundedMonthly * termMonths));
    expect(estimate.totalInterest).toBe(roundMoney(unroundedMonthly * termMonths - principal));

    const rebuiltFromRoundedDisplay = roundMoney(estimate.monthlyPayment * termMonths);
    expect(estimate.totalRepayment).not.toBe(rebuiltFromRoundedDisplay);
  });
});
