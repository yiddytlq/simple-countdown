import { test, expect } from '@playwright/test';
import { scenarioUrl } from './scenarios';
import { readBlocks } from './helpers';

// Built with a past TIMER_TARGET and a custom TIMER_DONE_MESSAGE. Home freezes
// the timer at 00:00:00:00 and shows the message (issue #154, default freeze mode).
test.use({ baseURL: scenarioUrl('done') });

test.describe('countdown completion (freeze)', () => {
  test('shows the done message and freezes at zero', async ({ page }) => {
    await page.goto('/');

    // The configured completion message replaces the title heading.
    await expect(page.getByText('All finished!')).toBeVisible();

    await expect
      .poll(async () => (await readBlocks(page)).every((block) => block.valid))
      .toBe(true);

    const blocks = await readBlocks(page);
    expect(blocks).toHaveLength(4);
    expect(blocks.every((block) => block.value === 0)).toBe(true);

    // Frozen: the seconds value must NOT change (the interval is stopped once done).
    const secondsBefore = blocks[3]?.value;
    await page.waitForTimeout(1100);
    const after = await readBlocks(page);
    expect(after[3]?.value).toBe(secondsBefore);
  });
});
