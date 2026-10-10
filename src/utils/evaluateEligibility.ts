import { INCOME_SOURCES_REQUIRING_DURATION, type SubmittedBudget } from '../types/budget';
import { roundMoney } from './roundMoney';
import { POLICY_THRESHOLDS } from './policyThresholds';

export type EligibilityFailureCode =
  | 'age'
  | 'minIncome'
  | 'noIncome'
  | 'employmentDuration'
  | 'businessDuration'
  | 'incomeDuration'
  | 'budgetShortfall';

export type EligibilityFailure = {
  code: EligibilityFailureCode;
  message: string;
};

export type BudgetOutcome = 'shortfall' | 'tight' | 'comfortable';

export type EligibilityEvaluation = {
  isEligible: boolean;
  failures: EligibilityFailure[];
  budgetOutcome: BudgetOutcome;
  moneyLeft: number;
  cannotFixByAdjustingLoan: boolean;
};

const FAILURE_MESSAGES: Record<EligibilityFailureCode, string> = {
  age: 'You must be between 18 and 65 years old.',
  minIncome: 'Monthly take-home income must be at least R5,000.',
  noIncome: 'A loan estimate is not available with no income.',
  employmentDuration: 'You need at least 3 months in your current job.',
  businessDuration: 'You need at least 3 months running the business.',
  incomeDuration: 'You need at least 6 months receiving this income.',
  budgetShortfall: 'The monthly repayment is higher than your remaining budget.',
};

export const evaluateEligibility = ({
  budget,
  monthlyRepayment,
}: {
  budget: SubmittedBudget;
  monthlyRepayment: number;
}): EligibilityEvaluation => {
  const failures: EligibilityFailure[] = [];

  if (budget.age < POLICY_THRESHOLDS.minAge || budget.age > POLICY_THRESHOLDS.maxAge) {
    failures.push({ code: 'age', message: FAILURE_MESSAGES.age });
  }

  const isNoIncome = budget.incomeSource === 'noIncome';
  if (isNoIncome) {
    failures.push({ code: 'noIncome', message: FAILURE_MESSAGES.noIncome });
  } else if (budget.monthlyIncome < POLICY_THRESHOLDS.minMonthlyIncome) {
    failures.push({ code: 'minIncome', message: FAILURE_MESSAGES.minIncome });
  }

  if (
    budget.employmentStatus === 'employed' &&
    (budget.employmentDurationMonths === null ||
      budget.employmentDurationMonths < POLICY_THRESHOLDS.minEmploymentMonths)
  ) {
    failures.push({
      code: 'employmentDuration',
      message: FAILURE_MESSAGES.employmentDuration,
    });
  }

  if (
    budget.employmentStatus === 'selfEmployed' &&
    (budget.businessDurationMonths === null ||
      budget.businessDurationMonths < POLICY_THRESHOLDS.minBusinessMonths)
  ) {
    failures.push({
      code: 'businessDuration',
      message: FAILURE_MESSAGES.businessDuration,
    });
  }

  if (
    budget.incomeSource !== null &&
    INCOME_SOURCES_REQUIRING_DURATION.includes(budget.incomeSource) &&
    (budget.incomeDurationMonths === null ||
      budget.incomeDurationMonths < POLICY_THRESHOLDS.minOtherIncomeMonths)
  ) {
    failures.push({
      code: 'incomeDuration',
      message: FAILURE_MESSAGES.incomeDuration,
    });
  }

  const moneyLeft = roundMoney(
    budget.monthlyIncome - budget.livingExpenses - budget.existingDebtRepayments - monthlyRepayment,
  );

  let budgetOutcome: BudgetOutcome;
  if (moneyLeft < 0) {
    budgetOutcome = 'shortfall';
    failures.push({
      code: 'budgetShortfall',
      message: FAILURE_MESSAGES.budgetShortfall,
    });
  } else if (moneyLeft < POLICY_THRESHOLDS.moneyLeftBuffer) {
    budgetOutcome = 'tight';
  } else {
    budgetOutcome = 'comfortable';
  }

  const cannotFixByAdjustingLoan = failures.some((failure) =>
    [
      'age',
      'minIncome',
      'noIncome',
      'employmentDuration',
      'businessDuration',
      'incomeDuration',
    ].includes(failure.code),
  );

  return {
    isEligible: failures.length === 0,
    failures,
    budgetOutcome,
    moneyLeft,
    cannotFixByAdjustingLoan,
  };
};
