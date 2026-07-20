import { test, expect, type Page } from '@playwright/test';

interface BlockState {
  label: string;
  value: number;
  valid: boolean;
}

// Reads the four countdown blocks from the *built* DOM. Digits are not text:
// NumberDisplay renders a 0-9 stack and reveals the real digit via an inline
// `transform: translateY(-<digit*100>%)`, so we decode that transform per digit.
// A NaN countdown would yield an unparsable transform (or the wrong digit count),
// which `valid` flags.
async function readBlocks(page: Page): Promise<BlockState[]> {
  return page.evaluate(() => {
    const labelRe = /^(days?|hours?|minutes?|seconds?)$/;
    // A block's full text is all-digits + label, so only the leaf label div
    // matches the unit regex exactly.
    const labels = Array.from(document.querySelectorAll<HTMLDivElement>('div')).filter(
      (el) => el.childElementCount === 0 && labelRe.test(el.textContent.trim()),
    );
    return labels.map((label) => {
      const block = label.parentElement;
      const rollers = block
        ? Array.from(block.querySelectorAll<HTMLDivElement>('div[style*="translateY"]'))
        : [];
      const digits = rollers.map((roller) => {
        const match = /translateY\(-?(\d+(?:\.\d+)?)%\)/.exec(roller.style.transform);
        return match ? Number(match[1]) / 100 : NaN;
      });
      const valid =
        digits.length > 0 &&
        digits.every((digit) => Number.isInteger(digit) && digit >= 0 && digit <= 9);
      return {
        label: label.textContent.trim(),
        value: Number(digits.join('')),
        valid,
      };
    });
  });
}

test.describe('countdown smoke', () => {
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
