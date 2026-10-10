import { expect, test } from '@playwright/test';
import { openLoanDetails } from './helpers/journey';

const amountRangeMessage = /Enter an amount from R5[\u00a0 ]?000 to R300[\u00a0 ]?000\./;
const termRangeMessage = /Enter a term from 6 to 60 months\./;

test.describe('Loan details screen', () => {
  test('loads with confirmed defaults and a live estimate at 12.5%', async ({ page }) => {
    await openLoanDetails(page);

    await expect(page.getByRole('textbox', { name: /^Loan amount \(R\)/i })).toHaveValue('5000.00');
    await expect(page.getByRole('textbox', { name: /Repayment term \(months\)/i })).toHaveValue(
      '6',
    );
    await expect(page.getByLabel(/Loan purpose/i)).toHaveValue('');
    await expect(page.getByText('Estimated monthly repayment')).toBeVisible();
    await expect(page.getByText(/Using an example annual rate of 12.5%/i)).toBeVisible();
  });

  test('blocks Continue without a purpose and focuses the purpose field', async ({ page }) => {
    await openLoanDetails(page);

    await page.getByRole('button', { name: /Continue to your budget/i }).click();

    await expect(page.getByText('Select a loan purpose.')).toBeVisible();
    await expect(page.getByText('Purpose does not change this estimate.')).toHaveCount(0);
    await expect(page.getByLabel(/Loan purpose/i)).toBeFocused();
    await expect(page.getByTestId('loan-details-screen')).toBeVisible();
    await expect(page.getByTestId('your-budget-screen')).toHaveCount(0);
  });

  test('shows the placeholder and amount error when the amount is cleared', async ({ page }) => {
    await openLoanDetails(page);

    const amount = page.getByRole('textbox', { name: /^Loan amount \(R\)/i });
    await amount.click();
    await amount.press('ControlOrMeta+A');
    await amount.press('Backspace');
    await amount.blur();
    await page.getByRole('button', { name: /Continue to your budget/i }).click();

    await expect(page.getByText('Enter a loan amount.')).toBeVisible();
    await expect(page.getByText('Enter a valid amount and term to see an estimate.')).toBeVisible();
    await expect(page.getByTestId('loan-details-screen')).toBeVisible();
  });

  test('rejects an amount below the minimum and stays on loan details', async ({ page }) => {
    await openLoanDetails(page);

    const amount = page.getByRole('textbox', { name: /^Loan amount \(R\)/i });
    await amount.fill('4999');
    await amount.blur();
    await page.getByLabel(/Loan purpose/i).selectOption({ label: 'Education' });
    await page.getByRole('button', { name: /Continue to your budget/i }).click();

    await expect(page.getByText(amountRangeMessage)).toBeVisible();
    await expect(page.getByTestId('loan-details-screen')).toBeVisible();
    await expect(page.getByTestId('your-budget-screen')).toHaveCount(0);
  });

  test('rejects an amount above the maximum and stays on loan details', async ({ page }) => {
    await openLoanDetails(page);

    const amount = page.getByRole('textbox', { name: /^Loan amount \(R\)/i });
    await amount.fill('300001');
    await amount.blur();
    await page.getByLabel(/Loan purpose/i).selectOption({ label: 'Medical' });
    await page.getByRole('button', { name: /Continue to your budget/i }).click();

    await expect(page.getByText(amountRangeMessage)).toBeVisible();
    await expect(page.getByTestId('loan-details-screen')).toBeVisible();
  });

  test('rejects a cleared term and an out-of-range term', async ({ page }) => {
    await openLoanDetails(page);

    const term = page.getByRole('textbox', { name: /Repayment term \(months\)/i });
    await term.click();
    await term.press('ControlOrMeta+A');
    await term.press('Backspace');
    await term.blur();
    await page.getByRole('button', { name: /Continue to your budget/i }).click();
    await expect(page.getByText('Enter a repayment term.')).toBeVisible();

    await term.fill('5');
    await term.blur();
    await page.getByRole('button', { name: /Continue to your budget/i }).click();
    await expect(page.getByText(termRangeMessage)).toBeVisible();

    await term.fill('61');
    await term.blur();
    await page.getByRole('button', { name: /Continue to your budget/i }).click();
    await expect(page.getByText(termRangeMessage)).toBeVisible();
    await expect(page.getByTestId('loan-details-screen')).toBeVisible();
  });

  test('continues at max amount and term when purpose is selected', async ({ page }) => {
    await openLoanDetails(page);

    await page.getByRole('slider', { name: /Adjust Loan amount/i }).fill('300000');
    await page.getByRole('slider', { name: /Adjust Repayment term/i }).fill('60');
    await page.getByLabel(/Loan purpose/i).selectOption({ label: 'Home improvement' });
    await page.getByRole('button', { name: /Continue to your budget/i }).click();

    await expect(page.getByTestId('your-budget-screen')).toBeVisible();
  });

  test('updates the estimate when exploring rate and can restore 12.5%', async ({ page }) => {
    await openLoanDetails(page);

    await page.getByRole('button', { name: /Explore interest rate/i }).click();
    await page.getByLabel(/Example annual rate/i).fill('15');

    await expect(page.getByText(/Using an explored example annual rate of 15%/i)).toBeVisible();

    await page.getByRole('button', { name: /Restore 12.5% example rate/i }).click();
    await expect(page.getByText(/Using an example annual rate of 12.5%/i)).toBeVisible();
  });

  test('continues to the budget screen when a purpose is selected', async ({ page }) => {
    await openLoanDetails(page);

    await page.getByLabel(/Loan purpose/i).selectOption({ label: 'Other' });
    await page.getByRole('button', { name: /Continue to your budget/i }).click();

    await expect(page.getByTestId('your-budget-screen')).toBeVisible();
  });
});
