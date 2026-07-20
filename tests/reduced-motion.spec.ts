import { test, expect } from '@playwright/test';
import { scenarioUrl } from './scenarios';
import { readBlocks } from './helpers';

// Reuses the "valid" build but emulates prefers-reduced-motion: reduce. The
// slot-machine roll is gated behind Tailwind's motion-safe: variant (issue #156),
// so under reduced motion the digit rollers carry no CSS transition.
test.use({ baseURL: scenarioUrl('valid'), contextOptions: { reducedMotion: 'reduce' } });

test.describe('reduced motion', () => {
  test('digit rollers have no transition when motion is reduced', async ({ page }) => {
    await page.goto('/');

    await expect
      .poll(async () => (await readBlocks(page)).every((block) => block.valid))
      .toBe(true);

    const roller = page.locator('div[style*="translateY"]').first();
    const transitionDuration = await roller.evaluate(
      (el) => getComputedStyle(el).transitionDuration,
    );
    expect(transitionDuration).toBe('0s');
  });
});
