import type { SubmittedBudget } from '../types/budget';
import type { SubmittedLoanDetails } from '../types/loan';
import { getAnnualRateForCreditScore } from './creditScoreRate';

export type CreditDisplayMode = 'manual' | 'demo' | 'none';

export type EffectiveCredit = {
  score: number | null;
  annualRate: number;
  mode: CreditDisplayMode;
};

export const resolveEffectiveCredit = ({
  budget,
  loan,
  demoCreditScore,
}: {
  budget: SubmittedBudget;
  loan: SubmittedLoanDetails;
  demoCreditScore: number | null;
}): EffectiveCredit => {
  if (!budget.creditScoreUnknown && budget.creditScore !== null) {
    return {
      score: budget.creditScore,
      annualRate: getAnnualRateForCreditScore(budget.creditScore),
      mode: 'manual',
    };
  }

  if (budget.creditScoreUnknown && budget.requestDemoCreditCheck && demoCreditScore !== null) {
    return {
      score: demoCreditScore,
      annualRate: getAnnualRateForCreditScore(demoCreditScore),
      mode: 'demo',
    };
  }

  return {
    score: null,
    annualRate: loan.annualRateUsed,
    mode: 'none',
  };
};
