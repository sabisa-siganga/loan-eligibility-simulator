import { expect, test } from '@playwright/test';
import { continueToBudgetWithPurpose, fillEmployedBudgetThatPasses } from './helpers/journey';

test('completes the journey to an estimated eligible result', async ({ page }) => {
  await continueToBudgetWithPurpose(page);
  await fillEmployedBudgetThatPasses(page);
  await page.getByRole('button', { name: /Check estimated eligibility/i }).click();

  await expect(page.getByTestId('your-result-screen')).toBeVisible();
  await expect(page.getByText('Estimated eligible')).toBeVisible();
});
