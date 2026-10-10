export const LOAN_PURPOSES = [
  'debtConsolidation',
  'homeImprovement',
  'education',
  'medical',
  'other',
] as const;

export type LoanPurpose = (typeof LOAN_PURPOSES)[number];

export const LOAN_PURPOSE_LABELS: Record<LoanPurpose, string> = {
  debtConsolidation: 'Debt consolidation',
  homeImprovement: 'Home improvement',
  education: 'Education',
  medical: 'Medical',
  other: 'Other',
};

export type SubmittedLoanDetails = {
  amount: number;
  termMonths: number;
  purpose: LoanPurpose;
  annualRateUsed: number;
};

export type RepaymentEstimate = {
  monthlyPayment: number;
  totalRepayment: number;
  totalInterest: number;
  annualRate: number;
};
