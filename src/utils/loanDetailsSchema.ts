import { z } from 'zod';
import { LOAN_PURPOSES, type LoanPurpose } from '../types/loan';
import { PRODUCT_SETTINGS } from './productSettings';

const purposeValues = LOAN_PURPOSES as unknown as [LoanPurpose, ...LoanPurpose[]];

const amountMessage = `Enter an amount from R${PRODUCT_SETTINGS.minAmount.toLocaleString('en-ZA')} to R${PRODUCT_SETTINGS.maxAmount.toLocaleString('en-ZA')}.`;
const termMessage = `Enter a term from ${PRODUCT_SETTINGS.minTermMonths} to ${PRODUCT_SETTINGS.maxTermMonths} months.`;

export type LoanDetailsFormInput = {
  amount: number | null;
  termMonths: number | null;
  purpose: '' | LoanPurpose;
};

export const loanDetailsFormSchema: z.ZodType<
  {
    amount: number;
    termMonths: number;
    purpose: LoanPurpose;
  },
  z.ZodTypeDef,
  LoanDetailsFormInput
> = z.object({
  amount: z
    .number({
      required_error: 'Enter a loan amount.',
      invalid_type_error: 'Enter a loan amount.',
    })
    .int('Enter whole rands only.')
    .min(PRODUCT_SETTINGS.minAmount, amountMessage)
    .max(PRODUCT_SETTINGS.maxAmount, amountMessage),
  termMonths: z
    .number({
      required_error: 'Enter a repayment term.',
      invalid_type_error: 'Enter a repayment term.',
    })
    .int('Enter whole months only.')
    .min(PRODUCT_SETTINGS.minTermMonths, termMessage)
    .max(PRODUCT_SETTINGS.maxTermMonths, termMessage),
  purpose: z.enum(purposeValues, {
    errorMap: () => ({ message: 'Select a loan purpose.' }),
  }),
});

export type LoanDetailsFormValues = z.infer<typeof loanDetailsFormSchema>;
