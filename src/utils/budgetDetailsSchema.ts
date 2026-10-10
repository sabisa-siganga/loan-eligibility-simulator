import { z } from 'zod';
import {
  EMPLOYMENT_STATUSES,
  INCOME_SOURCES,
  INCOME_SOURCES_REQUIRING_DURATION,
  type BudgetFormInput,
  type EmploymentStatus,
  type IncomeSource,
  type SubmittedBudget,
} from '../types/budget';
import { POLICY_THRESHOLDS } from './policyThresholds';

const AGE_RANGE_MESSAGE = 'You must be between 18 and 65 years old.';

const employmentValues = EMPLOYMENT_STATUSES as unknown as [
  EmploymentStatus,
  ...EmploymentStatus[],
];
const incomeSourceValues = INCOME_SOURCES as unknown as [IncomeSource, ...IncomeSource[]];

const requiredInt = (emptyMessage: string, wholeMessage: string) =>
  z.preprocess(
    (value) => (value === null || value === '' || Number.isNaN(value) ? undefined : value),
    z.number({ required_error: emptyMessage, invalid_type_error: emptyMessage }).int(wholeMessage),
  );

const optionalInt = z.preprocess(
  (value) => (value === null || value === '' || Number.isNaN(value) ? null : value),
  z.number().int().nullable(),
);

const employmentStatusSchema = z.preprocess(
  (value) => (value === '' || value === null || value === undefined ? undefined : value),
  z.enum(employmentValues, {
    errorMap: () => ({ message: 'Select an employment status.' }),
  }),
);

const incomeSourceSchema = z.preprocess(
  (value) => (value === '' || value === null || value === undefined ? null : value),
  z.enum(incomeSourceValues).nullable(),
);

export const budgetDetailsFormSchema = z
  .object({
    monthlyIncome: requiredInt(
      'Enter your monthly take-home income.',
      'Enter whole rands only.',
    ).pipe(z.number().int().min(0, 'Enter your monthly take-home income.')),
    livingExpenses: requiredInt(
      'Enter your monthly living expenses.',
      'Enter whole rands only.',
    ).pipe(z.number().int().min(0, 'Enter your monthly living expenses.')),
    existingDebtRepayments: requiredInt(
      'Enter your existing monthly debt repayments.',
      'Enter whole rands only.',
    ).pipe(z.number().int().min(0, 'Enter your existing monthly debt repayments.')),
    age: requiredInt('Enter your age.', 'Enter a whole number of years.').pipe(
      z
        .number()
        .int()
        .min(POLICY_THRESHOLDS.minAge, AGE_RANGE_MESSAGE)
        .max(POLICY_THRESHOLDS.maxAge, AGE_RANGE_MESSAGE),
    ),
    employmentStatus: employmentStatusSchema,
    employmentDurationMonths: optionalInt,
    businessDurationMonths: optionalInt,
    incomeSource: incomeSourceSchema,
    incomeDurationMonths: optionalInt,
    creditScore: optionalInt,
    creditScoreUnknown: z.boolean(),
    requestDemoCreditCheck: z.boolean(),
  })
  .superRefine((values, context) => {
    const { employmentStatus } = values;

    if (employmentStatus === 'employed') {
      if (values.employmentDurationMonths === null) {
        context.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['employmentDurationMonths'],
          message: 'Enter your employment duration in months.',
        });
      }
    }

    if (employmentStatus === 'selfEmployed') {
      if (values.businessDurationMonths === null) {
        context.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['businessDurationMonths'],
          message: 'Enter how many months you have been running the business.',
        });
      }
    }

    if (employmentStatus === 'unemployed' || employmentStatus === 'retired') {
      if (values.incomeSource === null) {
        context.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['incomeSource'],
          message: 'Select an income source.',
        });
      } else if (
        INCOME_SOURCES_REQUIRING_DURATION.includes(values.incomeSource) &&
        values.incomeDurationMonths === null
      ) {
        context.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['incomeDurationMonths'],
          message: 'Enter how many months you have been receiving this income.',
        });
      }
    }

    if (!values.creditScoreUnknown) {
      if (values.creditScore === null) {
        context.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['creditScore'],
          message: 'Enter your credit score, or select that you do not know it.',
        });
      } else if (values.creditScore < 300 || values.creditScore > 850) {
        context.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['creditScore'],
          message: 'Enter a credit score from 300 to 850.',
        });
      }
    }
  })
  .transform((values): SubmittedBudget => {
    const isEmployed = values.employmentStatus === 'employed';
    const isSelfEmployed = values.employmentStatus === 'selfEmployed';
    const needsIncomeSource =
      values.employmentStatus === 'unemployed' || values.employmentStatus === 'retired';
    const incomeSource = needsIncomeSource ? values.incomeSource : null;
    const needsIncomeDuration =
      incomeSource !== null && INCOME_SOURCES_REQUIRING_DURATION.includes(incomeSource);

    return {
      monthlyIncome: values.monthlyIncome,
      livingExpenses: values.livingExpenses,
      existingDebtRepayments: values.existingDebtRepayments,
      age: values.age,
      employmentStatus: values.employmentStatus,
      employmentDurationMonths: isEmployed ? values.employmentDurationMonths : null,
      businessDurationMonths: isSelfEmployed ? values.businessDurationMonths : null,
      incomeSource,
      incomeDurationMonths: needsIncomeDuration ? values.incomeDurationMonths : null,
      creditScore: values.creditScoreUnknown ? null : values.creditScore,
      creditScoreUnknown: values.creditScoreUnknown,
      requestDemoCreditCheck: values.creditScoreUnknown ? values.requestDemoCreditCheck : false,
    };
  });

export type BudgetDetailsFormValues = z.output<typeof budgetDetailsFormSchema>;

export type BudgetDetailsSchemaInput = BudgetFormInput;
