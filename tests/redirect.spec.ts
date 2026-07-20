import { test, expect } from '@playwright/test';
import { scenarioUrl } from './scenarios';

// Built with a past TIMER_TARGET and a TIMER_DONE_REDIRECT_URL (pointing at the
// "valid" server) with a short delay. On completion Home navigates there via
// window.location.assign (issues #16/#17, covered by #154's redirect follow-up).
test.use({ baseURL: scenarioUrl('redirect') });

test.describe('countdown completion (redirect)', () => {
  test('navigates to the configured URL after the delay', async ({ page }) => {
    await page.goto('/');

    // The done message shows briefly, then the follow-up redirect fires.
    await expect(page.getByText('The wait is over!')).toBeVisible();

    // The behavior under test is the completion -> redirect navigation. 'commit'
    // resolves as soon as that navigation lands, without waiting on the
    // destination's full load lifecycle (its render is covered by smoke.spec.ts,
    // and the app's Google-Fonts request is reset by the sandbox proxy, which can
    // delay 'load' under parallel load).
    await page.waitForURL(`${scenarioUrl('valid')}/`, { waitUntil: 'commit', timeout: 15_000 });
    expect(page.url()).toBe(`${scenarioUrl('valid')}/`);
  });
});
