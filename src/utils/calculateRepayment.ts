import type { RepaymentEstimate } from '../types/loan';
import { roundMoney } from './roundMoney';

type CalculateRepaymentInput = {
  principal: number;
  termMonths: number;
  annualRatePercent: number;
};

/**
 * Fixed-rate monthly amortisation. Totals use the unrounded monthly payment
 * so they are not rebuilt from separately rounded display strings.
 */
export const calculateRepayment = ({
  principal,
  termMonths,
  annualRatePercent,
}: CalculateRepaymentInput): RepaymentEstimate => {
  if (principal <= 0 || termMonths <= 0 || !Number.isFinite(annualRatePercent)) {
    return {
      monthlyPayment: 0,
      totalRepayment: 0,
      totalInterest: 0,
      annualRate: annualRatePercent,
    };
  }

  const monthlyRate = annualRatePercent / 100 / 12;

  const unroundedMonthly =
    monthlyRate === 0
      ? principal / termMonths
      : (principal * monthlyRate) / (1 - (1 + monthlyRate) ** -termMonths);

  const unroundedTotal = unroundedMonthly * termMonths;
  const unroundedInterest = unroundedTotal - principal;

  return {
    monthlyPayment: roundMoney(unroundedMonthly),
    totalRepayment: roundMoney(unroundedTotal),
    totalInterest: roundMoney(unroundedInterest),
    annualRate: annualRatePercent,
  };
};

export const isValidLoanEstimateInput = (
  amount: number,
  termMonths: number,
  minAmount: number,
  maxAmount: number,
  minTerm: number,
  maxTerm: number,
): boolean =>
  Number.isFinite(amount) &&
  Number.isFinite(termMonths) &&
  Number.isInteger(termMonths) &&
  amount >= minAmount &&
  amount <= maxAmount &&
  termMonths >= minTerm &&
  termMonths <= maxTerm;
