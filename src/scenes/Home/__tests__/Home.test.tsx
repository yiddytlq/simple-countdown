import { act, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { DEFAULT_DONE_MESSAGE } from '../../../service/completion';

// jsdom's window.location is unforgeable, so Home navigates through this
// module; vi.hoisted keeps the same mock instances across vi.resetModules().
const navigationMock = vi.hoisted(() => ({
  reloadPage: vi.fn(),
  redirectTo: vi.fn(),
}));
vi.mock('../../../service/navigation', () => navigationMock);

// preloadImage is mocked so background-load-failure can be simulated on demand;
// resolveBackground keeps its real behavior since other tests rely on it.
const backgroundMock = vi.hoisted(() => ({
  preloadImage: vi.fn(),
}));
vi.mock('../../../service/background', async (importOriginal) => {
  const actual = await importOriginal<typeof import('../../../service/background')>();
  return { ...actual, preloadImage: backgroundMock.preloadImage };
});

const base = new Date('2030-01-01T00:00:00.000Z');

const DAY = 24 * 60 * 60 * 1000;
const HOUR = 60 * 60 * 1000;
const MINUTE = 60 * 1000;
const SECOND = 1000;

const LABEL_PATTERN = /^(days?|hours?|minutes?|seconds?)$/;

interface HomeGlobals {
  target: Date;
  targetRaw?: string;
  title?: string;
  background?: string;
  doneMessage?: string;
  doneCountup?: boolean;
  doneAnimation?: boolean;
  doneHideTimer?: boolean;
  doneReload?: boolean;
  doneRedirectUrl?: string;
  doneDelayMs?: number;
}

// Home resolves window.target at module scope, so the globals must be in place
// before the module is (re-)imported — hence resetModules + dynamic import.
// Defaults mirror public/variables.js with no TIMER_* env vars set.
async function renderHome({
  target,
  targetRaw = '',
  title = '',
  background = 'background.jpg',
  doneMessage = '',
  doneCountup = false,
  doneAnimation = false,
  doneHideTimer = false,
  doneReload = false,
  doneRedirectUrl = '',
  doneDelayMs = 3000,
}: HomeGlobals) {
  window.target = target;
  window.targetRaw = targetRaw;
  window.title = title;
  window.background = background;
  window.doneMessage = doneMessage;
  window.doneCountup = doneCountup;
  window.doneAnimation = doneAnimation;
  window.doneHideTimer = doneHideTimer;
  window.doneReload = doneReload;
  window.doneRedirectUrl = doneRedirectUrl;
  window.doneDelayMs = doneDelayMs;
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

function rootDiv(container: HTMLElement): HTMLDivElement {
  const root = container.querySelector('div');
  if (root === null) {
    throw new Error('No root div found');
  }
  return root;
}

beforeEach(() => {
  vi.clearAllMocks();
  backgroundMock.preloadImage.mockResolvedValue(true);
  vi.useFakeTimers();
  vi.setSystemTime(base);
});

afterEach(() => {
  vi.useRealTimers();
  vi.restoreAllMocks();
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
    expect(screen.queryByRole('timer')).not.toBeInTheDocument();
    expect(container.textContent).not.toContain('NaN');
  });

  it('shows all zeros with singular labels at the exact target time', async () => {
    await renderHome({ target: new Date(base.getTime()) });

    expect(labelTexts()).toEqual(['day', 'hour', 'minute', 'second']);
    for (const label of labelTexts()) {
      expect(blockDigits(label)).toBe('00');
    }
  });

  it('keeps counting up past the target when TIMER_DONE_COUNTUP is set', async () => {
    await renderHome({ target: new Date(base.getTime() - 2 * SECOND), doneCountup: true });

    expect(blockDigits('seconds')).toBe('02');

    tick(1000);

    expect(blockDigits('seconds')).toBe('03');
    expect(screen.queryByText(DEFAULT_DONE_MESSAGE)).not.toBeInTheDocument();
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

  it('freezes at 00 00 00 00 with the completion message when the target passes', async () => {
    await renderHome({ target: new Date(base.getTime() + SECOND), title: 'T-minus' });

    expect(screen.getByText('T-minus')).toBeInTheDocument();

    tick(1000);

    // The message replaces the title; the interval is stopped, so further
    // ticks must not count back up.
    expect(screen.getByText(DEFAULT_DONE_MESSAGE)).toBeInTheDocument();
    expect(screen.queryByText('T-minus')).not.toBeInTheDocument();
    tick(5000);
    for (const label of labelTexts()) {
      expect(blockDigits(label)).toBe('00');
    }
  });

  it('shows a custom TIMER_DONE_MESSAGE', async () => {
    await renderHome({
      target: new Date(base.getTime() - SECOND),
      doneMessage: 'Happy launch day!',
    });

    expect(screen.getByText('Happy launch day!')).toBeInTheDocument();
  });

  it('hides the blocks in the done state when TIMER_DONE_HIDE_TIMER is set', async () => {
    await renderHome({ target: new Date(base.getTime() - SECOND), doneHideTimer: true });

    expect(screen.getByText(DEFAULT_DONE_MESSAGE)).toBeInTheDocument();
    expect(screen.queryByText(LABEL_PATTERN)).not.toBeInTheDocument();
  });

  it('applies the pulse animation class only when TIMER_DONE_ANIMATION is set', async () => {
    const animated = await renderHome({
      target: new Date(base.getTime() - SECOND),
      doneAnimation: true,
    });
    expect(screen.getByText(DEFAULT_DONE_MESSAGE)).toHaveClass('motion-safe:animate-done-pulse');
    animated.unmount();

    await renderHome({ target: new Date(base.getTime() - SECOND) });
    expect(screen.getByText(DEFAULT_DONE_MESSAGE)).not.toHaveClass(
      'motion-safe:animate-done-pulse',
    );
  });

  it('reloads after the configured delay when TIMER_DONE_RELOAD is set', async () => {
    await renderHome({
      target: new Date(base.getTime() + SECOND),
      doneReload: true,
      doneDelayMs: 2000,
    });

    tick(1000);
    expect(navigationMock.reloadPage).not.toHaveBeenCalled();

    tick(1999);
    expect(navigationMock.reloadPage).not.toHaveBeenCalled();

    tick(1);
    expect(navigationMock.reloadPage).toHaveBeenCalledOnce();
  });

  it('redirects instead of reloading when both are configured', async () => {
    await renderHome({
      target: new Date(base.getTime() + SECOND),
      doneReload: true,
      doneRedirectUrl: 'https://example.com/live',
    });

    tick(1000);
    tick(3000);

    expect(navigationMock.redirectTo).toHaveBeenCalledExactlyOnceWith('https://example.com/live');
    expect(navigationMock.reloadPage).not.toHaveBeenCalled();
  });

  it('falls back to reload when the redirect URL is invalid', async () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => undefined);

    await renderHome({
      target: new Date(base.getTime() + SECOND),
      doneReload: true,
      doneRedirectUrl: 'not a url',
    });

    tick(1000);
    tick(3000);

    expect(warn).toHaveBeenCalled();
    expect(navigationMock.redirectTo).not.toHaveBeenCalled();
    expect(navigationMock.reloadPage).toHaveBeenCalledOnce();
  });

  it('never reloads or redirects in countup mode', async () => {
    await renderHome({
      target: new Date(base.getTime() - SECOND),
      doneCountup: true,
      doneReload: true,
      doneRedirectUrl: 'https://example.com/live',
    });

    tick(10_000);

    expect(navigationMock.reloadPage).not.toHaveBeenCalled();
    expect(navigationMock.redirectTo).not.toHaveBeenCalled();
  });

  it('marks the completion message as its own aria-live region and quiets the countdown one', async () => {
    await renderHome({ target: new Date(base.getTime() + SECOND) });

    const liveRegion = screen.getByRole('timer');
    expect(liveRegion).toHaveTextContent('1 second remaining');

    tick(1000);

    // The countdown live region has nothing left to say once frozen — the
    // completion message is announced through its own aria-live heading.
    expect(liveRegion).toHaveTextContent('');
    const message = screen.getByText(DEFAULT_DONE_MESSAGE);
    expect(message).toHaveAttribute('aria-live', 'polite');
    expect(message).toHaveAttribute('aria-atomic', 'true');
  });

  it('applies the background image inline and omits the gradient fallback for a valid URL', async () => {
    const { container } = await renderHome({ target: new Date(base.getTime() + DAY) });

    const root = rootDiv(container);
    expect(root.style.backgroundImage).toContain('background.jpg');
    expect(root).not.toHaveClass('bg-gradient-to-br');
  });

  it('falls back to the gradient with no inline background style for an empty background', async () => {
    const { container } = await renderHome({
      target: new Date(base.getTime() + DAY),
      background: '',
    });

    const root = rootDiv(container);
    expect(root.style.backgroundImage).toBe('');
    expect(root).toHaveClass('bg-gradient-to-br');
  });

  it("falls back to the gradient for the raw '__BACKGROUND__' placeholder", async () => {
    const { container } = await renderHome({
      target: new Date(base.getTime() + DAY),
      background: '__BACKGROUND__',
    });

    const root = rootDiv(container);
    expect(root.style.backgroundImage).toBe('');
    expect(root).toHaveClass('bg-gradient-to-br');
  });

  it('falls back to the gradient when the background image fails to load', async () => {
    backgroundMock.preloadImage.mockResolvedValue(false);

    const { container } = await renderHome({ target: new Date(base.getTime() + DAY) });
    await act(async () => {
      await Promise.resolve();
    });

    const root = rootDiv(container);
    expect(root.style.backgroundImage).toBe('');
    expect(root).toHaveClass('bg-gradient-to-br');
  });
});
