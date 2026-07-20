import { type Page } from '@playwright/test';

export interface BlockState {
  label: string;
  value: number;
  valid: boolean;
}

// Reads the four countdown blocks from the *built* DOM. Digits are not text:
// NumberDisplay renders a 0-9 stack and reveals the real digit via an inline
// `transform: translateY(-<digit*100>%)`, so we decode that transform per digit.
// A NaN countdown would yield an unparsable transform (or the wrong digit count),
// which `valid` flags.
export async function readBlocks(page: Page): Promise<BlockState[]> {
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
