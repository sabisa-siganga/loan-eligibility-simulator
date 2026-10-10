import { expect, test } from '@playwright/test';
import {
  continueToBudgetWithPurpose,
  enableEligibilityFailureMock,
  fillEmployedBudgetThatPasses,
} from './helpers/journey';

test('shows an error when the eligibility check fails', async ({ page }) => {
  await enableEligibilityFailureMock(page);
  await continueToBudgetWithPurpose(page);
  await fillEmployedBudgetThatPasses(page);
  await page.getByRole('button', { name: /Check estimated eligibility/i }).click();

  await expect(page.getByTestId('your-budget-screen')).toBeVisible();
  await expect(page.getByRole('alert')).toContainText(
    'We could not check eligibility. Please try again.',
  );
  await expect(page.getByTestId('your-result-screen')).toHaveCount(0);
});
