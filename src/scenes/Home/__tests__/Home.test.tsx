import { act, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

const base = new Date('2030-01-01T00:00:00.000Z');

const DAY = 24 * 60 * 60 * 1000;
const HOUR = 60 * 60 * 1000;
const MINUTE = 60 * 1000;
const SECOND = 1000;

const LABEL_PATTERN = /^(days?|hours?|minutes?|seconds?)$/;

interface HomeGlobals {
  target: Date;
  title?: string;
  background?: string;
}

// Home resolves window.target at module scope, so the globals must be in place
// before the module is (re-)imported — hence resetModules + dynamic import.
async function renderHome({ target, title = '', background = 'background.jpg' }: HomeGlobals) {
  window.target = target;
  window.title = title;
  window.background = background;
  vi.resetModules();
  const { default: Home } = await import('../index');
  const result = render(<Home />);
  // Settle the NumberDisplay slot-machine intro (random digit → real value via setTimeout 0).
  act(() => {
    vi.advanceTimersByTime(0);
  });
  return result;
}

function labelTexts(): string[] {
  return screen.getAllByText(LABEL_PATTERN).map((el) => el.textContent);
}

// The digit currently shown in a block is the one scrolled into view by the
// strip's translateY(-n·100%) transform — read it back from the rendered style.
function blockDigits(labelText: string): string {
  const block = screen.getByText(labelText).parentElement;
  if (block === null) {
    throw new Error(`No block found for label "${labelText}"`);
  }
  return Array.from(block.querySelectorAll('div'))
    .map((div) => /^translateY\(-(\d+)%\)$/.exec(div.style.transform))
    .filter((match): match is RegExpExecArray => match !== null)
    .map((match) => Number(match[1]) / 100)
    .join('');
}

function tick(ms: number) {
  act(() => {
    vi.advanceTimersByTime(ms);
  });
}

beforeEach(() => {
  vi.useFakeTimers();
  vi.setSystemTime(base);
});

afterEach(() => {
  vi.useRealTimers();
});

describe('Home', () => {
  it('renders four labeled blocks in day → hour → minute → second order for a future target', async () => {
    await renderHome({
      target: new Date(base.getTime() + 2 * DAY + 3 * HOUR + 4 * MINUTE + 5 * SECOND),
    });

    expect(labelTexts()).toEqual(['days', 'hours', 'minutes', 'seconds']);
    expect(blockDigits('days')).toBe('02');
    expect(blockDigits('hours')).toBe('03');
    expect(blockDigits('minutes')).toBe('04');
    expect(blockDigits('seconds')).toBe('05');
  });

  it('advances the countdown by one second per interval tick', async () => {
    await renderHome({ target: new Date(base.getTime() + 2 * SECOND) });

    expect(screen.getByText('seconds')).toBeInTheDocument();
    expect(blockDigits('seconds')).toBe('02');

    tick(1000);

    // 2 → 1 also drops the plural "s" — asserts both the digit and the label.
    expect(screen.queryByText('seconds')).not.toBeInTheDocument();
    expect(screen.getByText('second')).toBeInTheDocument();
    expect(blockDigits('second')).toBe('01');
  });

  it('renders the configuration error panel instead of a NaN countdown for an invalid target', async () => {
    // Mirrors public/variables.js when variables.sh never substituted __END__.
    const { container } = await renderHome({ target: new Date('__END__') });

    expect(screen.getByText('No valid countdown target configured')).toBeInTheDocument();
    expect(
      screen.getByText('Set TIMER_TARGET to an ISO 8601 date, e.g. 2026-12-31T23:59:59'),
    ).toBeInTheDocument();
    expect(screen.queryByText(LABEL_PATTERN)).not.toBeInTheDocument();
    expect(container.textContent).not.toContain('NaN');
  });

  it('shows all zeros with singular labels at the exact target time', async () => {
    await renderHome({ target: new Date(base.getTime()) });

    expect(labelTexts()).toEqual(['day', 'hour', 'minute', 'second']);
    for (const label of labelTexts()) {
      expect(blockDigits(label)).toBe('00');
    }
  });

  it('counts up once the target has passed (current behavior)', async () => {
    await renderHome({ target: new Date(base.getTime() - 2 * SECOND) });

    expect(blockDigits('seconds')).toBe('02');

    tick(1000);

    expect(blockDigits('seconds')).toBe('03');
  });

  it('sets document.title from window.title and renders it as the heading', async () => {
    await renderHome({
      target: new Date(base.getTime() + DAY),
      title: 'Launch party',
    });

    expect(document.title).toBe('Launch party');
    expect(screen.getByText('Launch party')).toBeInTheDocument();
  });

  it('falls back to the default document.title and omits the heading when no title is set', async () => {
    await renderHome({ target: new Date(base.getTime() + DAY), title: '' });

    expect(document.title).toBe('Easy countdown');
    expect(screen.queryByText('Easy countdown')).not.toBeInTheDocument();
  });

  it('announces the remaining time in a visually hidden live region on mount', async () => {
    await renderHome({
      target: new Date(base.getTime() + 2 * DAY + 3 * HOUR + 4 * MINUTE + 5 * SECOND),
    });

    const liveRegion = screen.getByRole('timer');
    expect(liveRegion).toHaveTextContent('2 days, 3 hours, 4 minutes remaining');
    expect(liveRegion).toHaveAttribute('aria-live', 'polite');
    expect(liveRegion).toHaveAttribute('aria-atomic', 'true');
    expect(liveRegion).toHaveClass('sr-only');
  });

  it('narrates the rollover into the final minute like a human would, then updates every second', async () => {
    await renderHome({ target: new Date(base.getTime() + MINUTE + 30 * SECOND) });

    const liveRegion = screen.getByRole('timer');
    expect(liveRegion).toHaveTextContent('1 minute remaining');

    tick(1000);
    tick(1000);

    // Still within the same remaining minute — the announcement stays put rather
    // than showing a now-stale seconds count.
    expect(liveRegion).toHaveTextContent('1 minute remaining');

    tick(29 * 1000);

    // Now inside the final minute — seconds become the meaningful unit.
    expect(liveRegion).toHaveTextContent('59 seconds remaining');

    // ...and, unlike the once-a-minute cadence above, it updates every second
    // from here on, exactly as a human counting down the last moments would.
    tick(1000);
    expect(liveRegion).toHaveTextContent('58 seconds remaining');

    tick(1000);
    expect(liveRegion).toHaveTextContent('57 seconds remaining');
  });

  it('hides the decorative digit blocks from assistive technology but not the live region', async () => {
    await renderHome({ target: new Date(base.getTime() + DAY) });

    expect(screen.getByText('day').closest('[aria-hidden="true"]')).not.toBeNull();
    expect(screen.getByRole('timer').closest('[aria-hidden="true"]')).toBeNull();
  });

  it('renders no timer live region for an invalid target', async () => {
    await renderHome({ target: new Date('__END__') });

    expect(screen.queryByRole('timer')).not.toBeInTheDocument();
  });
});
