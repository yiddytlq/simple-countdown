// Validates the runtime-injected countdown target (window.target).
// An unset/unparsable TIMER_TARGET — including the raw '__END__' placeholder when
// variables.sh never ran — yields an Invalid Date, whose getTime() is NaN.
export function resolveTarget(raw: Date): Date | null {
  return Number.isNaN(raw.getTime()) ? null : raw;
}

// Matches an ISO 8601 datetime with a time component and no UTC offset, e.g.
// '2026-12-31T20:00:00'. A bare date ('2026-12-31') has no 'T' and never matches — it's
// unambiguous, since date-only strings always parse as UTC. A string with a trailing 'Z' or
// a '+HH:MM'/'-HH:MM' offset also never matches, since those trailing characters break the
// '$' anchor.
const OFFSETLESS_DATETIME = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}(:\d{2}(\.\d+)?)?$/;

export function hasAmbiguousTimezone(raw: string): boolean {
  return OFFSETLESS_DATETIME.test(raw.trim());
}

// Warns once when a valid TIMER_TARGET has a time component but no UTC offset: it's parsed in
// each viewer's local timezone, so the same deployment shows different remaining time to
// viewers in different timezones. No-ops for a target that already failed to parse — resolved
// is checked instead of re-testing raw for validity.
export function warnIfAmbiguousTimezone(raw: string, resolved: Date | null): void {
  if (resolved === null || !hasAmbiguousTimezone(raw)) {
    return;
  }
  console.warn(
    `TIMER_TARGET "${raw}" has no UTC offset, so it is parsed in each viewer's local timezone ` +
      'and the same deployment may show different remaining time to viewers in different ' +
      `timezones. Add an explicit offset (e.g. "${raw}+02:00") or use "Z" for UTC.`,
  );
}
