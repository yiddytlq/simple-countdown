import { afterEach, describe, expect, it, vi } from 'vitest';
import {
  DEFAULT_DONE_DELAY_MS,
  DEFAULT_DONE_MESSAGE,
  resolveCompletion,
  type CompletionFlags,
} from '../completion';

// Mirrors public/variables.js defaults when no TIMER_DONE_* env var is set.
function flags(overrides: Partial<CompletionFlags> = {}): CompletionFlags {
  return {
    countup: false,
    message: '',
    animate: false,
    hideTimer: false,
    reload: false,
    redirectUrl: '',
    delayMs: DEFAULT_DONE_DELAY_MS,
    ...overrides,
  };
}

afterEach(() => {
  vi.restoreAllMocks();
});

describe('resolveCompletion', () => {
  it('defaults to freezing with the default message and no follow-up', () => {
    expect(resolveCompletion(flags())).toEqual({
      mode: 'freeze',
      message: DEFAULT_DONE_MESSAGE,
      animate: false,
      hideTimer: false,
      followUp: null,
    });
  });

  it('counts up when countup is set, ignoring every other flag', () => {
    expect(
      resolveCompletion(
        flags({
          countup: true,
          message: 'Ignored',
          animate: true,
          hideTimer: true,
          reload: true,
          redirectUrl: 'https://example.com/',
        }),
      ),
    ).toEqual({ mode: 'countup' });
  });

  it('passes a custom message through', () => {
    expect(resolveCompletion(flags({ message: 'Happy new year!' }))).toMatchObject({
      message: 'Happy new year!',
    });
  });

  it("treats a raw '__DONE_MESSAGE__' placeholder as unset", () => {
    expect(resolveCompletion(flags({ message: '__DONE_MESSAGE__' }))).toMatchObject({
      message: DEFAULT_DONE_MESSAGE,
    });
  });

  it('passes the animate and hideTimer flags through', () => {
    expect(resolveCompletion(flags({ animate: true, hideTimer: true }))).toMatchObject({
      animate: true,
      hideTimer: true,
    });
  });

  it('schedules a reload when only reload is set', () => {
    expect(resolveCompletion(flags({ reload: true }))).toMatchObject({
      followUp: { action: 'reload', delayMs: DEFAULT_DONE_DELAY_MS },
    });
  });

  it('schedules a redirect for a valid URL', () => {
    expect(resolveCompletion(flags({ redirectUrl: 'https://example.com/live' }))).toMatchObject({
      followUp: { action: 'redirect', url: 'https://example.com/live', delayMs: 3000 },
    });
  });

  it('redirect wins when both reload and a valid redirect URL are set', () => {
    expect(
      resolveCompletion(flags({ reload: true, redirectUrl: 'https://example.com/live' })),
    ).toMatchObject({
      followUp: { action: 'redirect', url: 'https://example.com/live' },
    });
  });

  it('ignores an invalid redirect URL with a warning and falls back to reload', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => undefined);

    expect(resolveCompletion(flags({ reload: true, redirectUrl: 'not a url' }))).toMatchObject({
      followUp: { action: 'reload' },
    });
    expect(warn).toHaveBeenCalledOnce();
  });

  it('ignores a non-http(s) redirect URL', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => undefined);

    expect(resolveCompletion(flags({ redirectUrl: 'javascript:alert(1)' }))).toMatchObject({
      followUp: null,
    });
    expect(warn).toHaveBeenCalledOnce();
  });

  it("treats a raw '__DONE_REDIRECT_URL__' placeholder as unset without warning", () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => undefined);

    expect(resolveCompletion(flags({ redirectUrl: '__DONE_REDIRECT_URL__' }))).toMatchObject({
      followUp: null,
    });
    expect(warn).not.toHaveBeenCalled();
  });

  it('respects a custom delay', () => {
    expect(resolveCompletion(flags({ reload: true, delayMs: 250 }))).toMatchObject({
      followUp: { action: 'reload', delayMs: 250 },
    });
  });

  it('falls back to the default delay for NaN or negative values', () => {
    // NaN mirrors public/variables.js when the raw __DONE_DELAY_MS__ placeholder survives.
    expect(resolveCompletion(flags({ reload: true, delayMs: Number.NaN }))).toMatchObject({
      followUp: { action: 'reload', delayMs: DEFAULT_DONE_DELAY_MS },
    });
    expect(resolveCompletion(flags({ reload: true, delayMs: -1 }))).toMatchObject({
      followUp: { action: 'reload', delayMs: DEFAULT_DONE_DELAY_MS },
    });
  });
});
