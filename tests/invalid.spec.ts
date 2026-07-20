import { test, expect } from '@playwright/test';
import { scenarioUrl } from './scenarios';

// Built with an unparsable TIMER_TARGET. resolveTarget() returns null, so Home
// renders the configuration-error panel instead of a NaN countdown (issue #149).
test.use({ baseURL: scenarioUrl('invalid') });

test.describe('countdown with invalid target', () => {
  test('renders the configuration-error panel, not a countdown', async ({ page }) => {
    await page.goto('/');

    await expect(page.getByText('No valid countdown target configured')).toBeVisible();
    await expect(page.getByText(/Set TIMER_TARGET to an ISO 8601 date/)).toBeVisible();

    // No countdown blocks render in the error state.
    await expect(page.getByText(/^(days?|hours?|minutes?|seconds?)$/)).toHaveCount(0);
  });
});
