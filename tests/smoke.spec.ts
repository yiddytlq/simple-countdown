import { test, expect } from '@playwright/test';
import { readBlocks } from './helpers';

// Uses the default baseURL from playwright.config.ts (the "valid" build).
test.describe('countdown smoke (valid target)', () => {
  test('renders configured countdown and ticks', async ({ page }) => {
    await page.goto('/');

    // The runtime-configured title (from TIMER_TITLE via variables.sh) must reach
    // both the document title and the on-screen heading.
    const configuredTitle = await page.evaluate(() => window.title);
    expect(configuredTitle.length).toBeGreaterThan(0);
    await expect(page).toHaveTitle(configuredTitle);
    await expect(page.getByText(configuredTitle, { exact: true })).toBeVisible();

    // Wait out the slot-machine intro so decoded digits reflect real values.
    await expect
      .poll(async () => (await readBlocks(page)).every((block) => block.valid))
      .toBe(true);

    const blocks = await readBlocks(page);
    expect(blocks).toHaveLength(4);
    // Documented invariant: blocks render in day -> hour -> minute -> second order.
    expect(blocks[0]?.label).toMatch(/^days?$/);
    expect(blocks[1]?.label).toMatch(/^hours?$/);
    expect(blocks[2]?.label).toMatch(/^minutes?$/);
    expect(blocks[3]?.label).toMatch(/^seconds?$/);

    for (const block of blocks) {
      expect(block.valid).toBe(true);
      expect(Number.isFinite(block.value)).toBe(true);
    }

    // Prove the 1 s interval actually ticks (not a static render): the seconds
    // value must change within ~1.1 s.
    const before = await readBlocks(page);
    await page.waitForTimeout(1100);
    const after = await readBlocks(page);
    expect(after[3]?.value).not.toBe(before[3]?.value);
  });
});
