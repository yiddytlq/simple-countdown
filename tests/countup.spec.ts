import { test, expect } from '@playwright/test';
import { scenarioUrl } from './scenarios';
import { readBlocks } from './helpers';

// Built with a past TIMER_TARGET and TIMER_DONE_COUNTUP=true. There is no done
// state in countup mode: the timer keeps ticking upward and no message shows.
test.use({ baseURL: scenarioUrl('countup') });

test.describe('countdown completion (countup)', () => {
  test('keeps ticking past zero with no done message', async ({ page }) => {
    await page.goto('/');

    // Title heading stays (no done takeover); the default done message never shows.
    await expect(page.getByText('Smoke Test', { exact: true })).toBeVisible();
    await expect(page.getByText('The wait is over!')).toHaveCount(0);

    await expect
      .poll(async () => (await readBlocks(page)).every((block) => block.valid))
      .toBe(true);

    const blocks = await readBlocks(page);
    expect(blocks).toHaveLength(4);

    // Still running: the seconds value keeps changing past the target.
    const before = await readBlocks(page);
    await page.waitForTimeout(1100);
    const after = await readBlocks(page);
    expect(after[3]?.value).not.toBe(before[3]?.value);
  });
});
