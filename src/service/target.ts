// Validates the runtime-injected countdown target (window.target).
// An unset/unparsable TIMER_TARGET — including the raw '__END__' placeholder when
// variables.sh never ran — yields an Invalid Date, whose getTime() is NaN.
export function resolveTarget(raw: Date): Date | null {
  return Number.isNaN(raw.getTime()) ? null : raw;
}
