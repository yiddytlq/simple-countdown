import { test, expect } from '@playwright/test';
import { scenarioUrl } from './scenarios';

// Built with TIMER_BACKGROUND pointing at a path that 404s on the preview server
// (broken URL/wrong domain, as distinct from TIMER_BACKGROUND being unset).
// preloadImage() detects the failed load and Home falls back to the gradient
// background instead of leaving the broken image request in place (#148 item 1.5).
test.use({ baseURL: scenarioUrl('background') });

test.describe('countdown with a broken background image', () => {
  test('falls back to the gradient background', async ({ page }) => {
    await page.goto('/');

    const root = page.locator('div.bg-cover').first();

    await expect
      .poll(() => root.evaluate((el) => el.getAttribute('class') ?? ''))
      .toContain('bg-gradient-to-br');
    await expect(root).not.toHaveAttribute('style', /background-image/);
  });
});
