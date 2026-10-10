import type { BudgetDraft, SubmittedBudget } from '../types/budget';

export const mapSubmittedBudgetToDraft = (budget: SubmittedBudget): BudgetDraft => ({
  monthlyIncome: budget.monthlyIncome,
  livingExpenses: budget.livingExpenses,
  existingDebtRepayments: budget.existingDebtRepayments,
  age: budget.age,
  employmentStatus: budget.employmentStatus,
  employmentDurationMonths: budget.employmentDurationMonths,
  businessDurationMonths: budget.businessDurationMonths,
  incomeSource: budget.incomeSource ?? '',
  incomeDurationMonths: budget.incomeDurationMonths,
  creditScore: budget.creditScore,
  creditScoreUnknown: budget.creditScoreUnknown,
  requestDemoCreditCheck: budget.requestDemoCreditCheck,
});
