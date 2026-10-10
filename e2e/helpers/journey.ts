import type { Page } from '@playwright/test';
import { MOCK_ELIGIBILITY_FAIL_STORAGE_KEY } from '../../src/mocks/constants';

export const continueToBudgetWithPurpose = async (page: Page) => {
  await page.goto('/');
  await page.getByTestId('loan-details-screen').waitFor();
  await page.getByLabel(/Loan purpose/i).selectOption({ label: 'Debt consolidation' });
  await page.getByRole('button', { name: /Continue to your budget/i }).click();
  await page.getByTestId('your-budget-screen').waitFor();
};

export const fillEmployedBudgetThatPasses = async (page: Page) => {
  await page.getByRole('textbox', { name: /Monthly take-home income/i }).fill('15000');
  await page.getByRole('textbox', { name: /Monthly living expenses/i }).fill('10000');
  await page.getByRole('textbox', { name: /Existing monthly debt repayments/i }).fill('1800');
  await page.getByRole('spinbutton', { name: /Age \(years\)/i }).fill('35');
  await page.getByLabel(/Employment status/i).selectOption('employed');
  await page.getByRole('textbox', { name: /Employment duration \(months\)/i }).fill('24');
  await page.getByRole('textbox', { name: /^Credit score$/i }).fill('650');
};

export const enableEligibilityFailureMock = async (page: Page) => {
  await page.addInitScript((storageKey: string) => {
    sessionStorage.setItem(storageKey, '1');
  }, MOCK_ELIGIBILITY_FAIL_STORAGE_KEY);
};
