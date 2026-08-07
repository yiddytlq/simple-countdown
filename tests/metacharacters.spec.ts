import { test, expect } from '@playwright/test';
import { readBlocks } from './helpers';
import { scenarioUrl } from './scenarios';

const TITLE = "Chesky & Ruchy's wedding @ 6pm";

// Unit tests cover variables.sh directly; this is the only layer that proves a
// value carrying sed and JS metacharacters survives a real `vite build` and
// parses in a browser. Under the previous sed implementation this build either
// failed outright (@) or shipped a variables-final.js with a syntax error (').
test.use({ baseURL: scenarioUrl('metacharacters') });

test.describe('TIMER_* values containing metacharacters', () => {
  test('reach the page intact and leave the countdown working', async ({ page }) => {
    await page.goto('/');

    // A syntax error in variables-final.js leaves window.* undefined, so this
    // assertion also covers "the generated file parsed at all".
    expect(await page.evaluate(() => window.title)).toBe(TITLE);
    expect(await page.evaluate(() => window.doneMessage)).toBe("It's done @ last!");
    expect(await page.evaluate(() => window.doneRedirectUrl)).toBe('http://user@localhost:4173/');

    await expect(page).toHaveTitle(TITLE);
    await expect(page.getByText(TITLE, { exact: true })).toBeVisible();

    // No placeholder may survive substitution.
    expect(await page.evaluate(() => document.body.innerHTML)).not.toMatch(/__[A-Z_]+__/);

    // The countdown still renders: the target was substituted correctly too.
    await expect
      .poll(async () => (await readBlocks(page)).every((block) => block.valid))
      .toBe(true);
    expect(await readBlocks(page)).toHaveLength(4);
  });
});
