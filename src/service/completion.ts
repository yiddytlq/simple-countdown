// Resolves the TIMER_DONE_* runtime flags into what should happen when the
// countdown reaches zero. Pure and DOM-free: Home performs the actual side
// effects (interval control, delay timeout, navigation).
//
// Precedence rules:
// 1. countup=true: the timer keeps ticking upward past zero (the historical
//    behavior, made explicit). Every other done flag is ignored — with no
//    discrete "done" moment there is nothing to attach a message, animation,
//    reload or redirect to.
// 2. Otherwise the timer freezes at 00 00 00 00 the instant the target
//    passes; the message is shown (replacing the blocks entirely when
//    hideTimer is set) and the animation plays if enabled.
// 3. If both reload and a valid redirect URL are set, redirect wins. Reload
//    only fires when the redirect URL is unset or invalid.
// 4. If neither is set, the done state stays visible indefinitely.

export const DEFAULT_DONE_MESSAGE = 'The wait is over!';
export const DEFAULT_DONE_DELAY_MS = 3000;

export interface CompletionFlags {
  countup: boolean;
  message: string;
  animate: boolean;
  hideTimer: boolean;
  reload: boolean;
  redirectUrl: string;
  delayMs: number;
}

export type CompletionFollowUp =
  { action: 'reload'; delayMs: number } | { action: 'redirect'; url: string; delayMs: number };

export type CompletionBehavior =
  | { mode: 'countup' }
  | {
      mode: 'freeze';
      message: string;
      animate: boolean;
      hideTimer: boolean;
      followUp: CompletionFollowUp | null;
    };

// An empty value or a raw __PLACEHOLDER__ (variables.sh never ran) counts as unset.
function provided(raw: string): string | null {
  return raw === '' || /^__.*__$/.test(raw) ? null : raw;
}

function resolveRedirectUrl(raw: string): string | null {
  const candidate = provided(raw);
  if (candidate === null) {
    return null;
  }
  let parsed: URL;
  try {
    parsed = new URL(candidate);
  } catch {
    console.warn(`Ignoring invalid TIMER_DONE_REDIRECT_URL "${candidate}": not a valid URL`);
    return null;
  }
  if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') {
    console.warn(`Ignoring invalid TIMER_DONE_REDIRECT_URL "${candidate}": must be http(s)`);
    return null;
  }
  return candidate;
}

export function resolveCompletion(flags: CompletionFlags): CompletionBehavior {
  if (flags.countup) {
    return { mode: 'countup' };
  }

  const delayMs =
    Number.isFinite(flags.delayMs) && flags.delayMs >= 0 ? flags.delayMs : DEFAULT_DONE_DELAY_MS;
  const redirectUrl = resolveRedirectUrl(flags.redirectUrl);
  const followUp: CompletionFollowUp | null =
    redirectUrl !== null
      ? { action: 'redirect', url: redirectUrl, delayMs }
      : flags.reload
        ? { action: 'reload', delayMs }
        : null;

  return {
    mode: 'freeze',
    message: provided(flags.message) ?? DEFAULT_DONE_MESSAGE,
    animate: flags.animate,
    hideTimer: flags.hideTimer,
    followUp,
  };
}
