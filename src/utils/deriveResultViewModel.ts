import type { SubmittedBudget } from '../types/budget';
import type { SubmittedLoanDetails } from '../types/loan';
import { calculateRepayment } from './calculateRepayment';
import { evaluateEligibility } from './evaluateEligibility';
import { formatMoneyDisplay, formatTermLabel } from './formatMoney';
import { resolveEffectiveCredit } from './resolveEffectiveCredit';
import { roundMoney } from './roundMoney';

export type ResultViewModel = {
  isEligible: boolean;
  statusLabel: 'Estimated eligible' | 'Not eligible';
  statusExplanation: string | null;
  failureMessages: string[];
  showTightBudgetWarning: boolean;
  cannotFixByAdjustingLoan: boolean;
  monthlyRepayment: number;
  monthlyRepaymentDisplay: string;
  annualRate: number;
  annualRateDisplay: string;
  loanAmountDisplay: string;
  termDisplay: string;
  totalInterestDisplay: string;
  totalRepaymentDisplay: string;
  incomeDisplay: string;
  livingExpensesDisplay: string;
  existingDebtDisplay: string;
  newRepaymentDisplay: string;
  moneyLeft: number;
  moneyLeftLabel: 'Money left each month' | 'Monthly shortfall';
  moneyLeftDisplay: string;
  showBufferNote: boolean;
  debtShareDisplay: string | null;
  debtShareUnavailableMessage: string | null;
  creditMode: 'manual' | 'demo' | 'none';
  creditScoreDisplay: string | null;
  creditScoreCaption: string | null;
  rateExplanation: string;
};

export const deriveResultViewModel = ({
  loan,
  budget,
  demoCreditScore,
}: {
  loan: SubmittedLoanDetails;
  budget: SubmittedBudget;
  demoCreditScore: number | null;
}): ResultViewModel => {
  const credit = resolveEffectiveCredit({ budget, loan, demoCreditScore });
  const repayment = calculateRepayment({
    principal: loan.amount,
    termMonths: loan.termMonths,
    annualRatePercent: credit.annualRate,
  });
  const evaluation = evaluateEligibility({
    budget,
    monthlyRepayment: repayment.monthlyPayment,
  });

  const moneyLeftMagnitude = Math.abs(evaluation.moneyLeft);
  const isShortfall = evaluation.moneyLeft < 0;

  let debtShareDisplay: string | null = null;
  let debtShareUnavailableMessage: string | null = null;
  if (budget.monthlyIncome === 0) {
    debtShareUnavailableMessage = 'Cannot calculate without income';
  } else {
    const share =
      ((budget.existingDebtRepayments + repayment.monthlyPayment) / budget.monthlyIncome) * 100;
    debtShareDisplay = `${roundMoney(share).toFixed(1)}%`;
  }

  let creditScoreDisplay: string | null = null;
  let creditScoreCaption: string | null = null;
  if (credit.mode === 'manual' && credit.score !== null) {
    creditScoreDisplay = String(credit.score);
    creditScoreCaption = 'Entered by you.';
  } else if (credit.mode === 'demo' && credit.score !== null) {
    creditScoreDisplay = String(credit.score);
    creditScoreCaption = null;
  } else {
    creditScoreDisplay = null;
    creditScoreCaption = 'No credit score used';
  }

  const rateExplanation =
    credit.mode === 'none'
      ? `Using an example annual rate of ${credit.annualRate}%.`
      : `Your score sets the annual rate to ${credit.annualRate}%.`;

  return {
    isEligible: evaluation.isEligible,
    statusLabel: evaluation.isEligible ? 'Estimated eligible' : 'Not eligible',
    statusExplanation: evaluation.isEligible ? 'Your details meet the eligibility rules.' : null,
    failureMessages: evaluation.failures.map((failure) => failure.message),
    showTightBudgetWarning: evaluation.isEligible && evaluation.budgetOutcome === 'tight',
    cannotFixByAdjustingLoan: evaluation.cannotFixByAdjustingLoan,
    monthlyRepayment: repayment.monthlyPayment,
    monthlyRepaymentDisplay: formatMoneyDisplay(repayment.monthlyPayment),
    annualRate: credit.annualRate,
    annualRateDisplay: `${credit.annualRate}%`,
    loanAmountDisplay: formatMoneyDisplay(loan.amount),
    termDisplay: formatTermLabel(loan.termMonths),
    totalInterestDisplay: formatMoneyDisplay(repayment.totalInterest),
    totalRepaymentDisplay: formatMoneyDisplay(repayment.totalRepayment),
    incomeDisplay: formatMoneyDisplay(budget.monthlyIncome),
    livingExpensesDisplay: formatMoneyDisplay(budget.livingExpenses),
    existingDebtDisplay: formatMoneyDisplay(budget.existingDebtRepayments),
    newRepaymentDisplay: formatMoneyDisplay(repayment.monthlyPayment),
    moneyLeft: evaluation.moneyLeft,
    moneyLeftLabel: isShortfall ? 'Monthly shortfall' : 'Money left each month',
    moneyLeftDisplay: formatMoneyDisplay(moneyLeftMagnitude),
    showBufferNote: evaluation.isEligible && evaluation.budgetOutcome === 'tight',
    debtShareDisplay,
    debtShareUnavailableMessage,
    creditMode: credit.mode,
    creditScoreDisplay,
    creditScoreCaption,
    rateExplanation,
  };
};
