export const EMPLOYMENT_STATUSES = ['employed', 'selfEmployed', 'unemployed', 'retired'] as const;

export type EmploymentStatus = (typeof EMPLOYMENT_STATUSES)[number];

export const EMPLOYMENT_STATUS_LABELS: Record<EmploymentStatus, string> = {
  employed: 'Employed',
  selfEmployed: 'Self-employed',
  unemployed: 'Unemployed',
  retired: 'Retired',
};

export const INCOME_SOURCES = [
  'pension',
  'rentalIncome',
  'investmentPayouts',
  'maintenance',
  'otherIncome',
  'noIncome',
] as const;

export type IncomeSource = (typeof INCOME_SOURCES)[number];

export const INCOME_SOURCE_LABELS: Record<IncomeSource, string> = {
  pension: 'Pension',
  rentalIncome: 'Rental income',
  investmentPayouts: 'Investment payouts',
  maintenance: 'Maintenance',
  otherIncome: 'Other income',
  noIncome: 'No income',
};

export const INCOME_SOURCES_REQUIRING_DURATION: IncomeSource[] = [
  'rentalIncome',
  'investmentPayouts',
  'maintenance',
  'otherIncome',
];

export type BudgetFormInput = {
  monthlyIncome: number | null;
  livingExpenses: number | null;
  existingDebtRepayments: number | null;
  age: number | null;
  employmentStatus: '' | EmploymentStatus;
  employmentDurationMonths: number | null;
  businessDurationMonths: number | null;
  incomeSource: '' | IncomeSource;
  incomeDurationMonths: number | null;
  creditScore: number | null;
  creditScoreUnknown: boolean;
  requestDemoCreditCheck: boolean;
};

export type SubmittedBudget = {
  monthlyIncome: number;
  livingExpenses: number;
  existingDebtRepayments: number;
  age: number;
  employmentStatus: EmploymentStatus;
  employmentDurationMonths: number | null;
  businessDurationMonths: number | null;
  incomeSource: IncomeSource | null;
  incomeDurationMonths: number | null;
  creditScore: number | null;
  creditScoreUnknown: boolean;
  requestDemoCreditCheck: boolean;
};

export type BudgetDraft = BudgetFormInput;

export const emptyBudgetFormValues = (): BudgetFormInput => ({
  monthlyIncome: null,
  livingExpenses: null,
  existingDebtRepayments: null,
  age: null,
  employmentStatus: '',
  employmentDurationMonths: null,
  businessDurationMonths: null,
  incomeSource: '',
  incomeDurationMonths: null,
  creditScore: null,
  creditScoreUnknown: false,
  requestDemoCreditCheck: false,
});

export const DEMO_CREDIT_SCORES = [450, 550, 650, 750, 820] as const;

export type DemoCreditScore = (typeof DEMO_CREDIT_SCORES)[number];
