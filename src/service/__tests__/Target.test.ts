import { afterEach, describe, expect, it, vi } from 'vitest';
import { hasAmbiguousTimezone, resolveTarget, warnIfAmbiguousTimezone } from '../target';

describe('resolveTarget', () => {
  it('returns the date for a valid ISO string', () => {
    const target = new Date('2030-01-01T00:00:00.000Z');
    expect(resolveTarget(target)).toBe(target);
  });

  it('returns null for an empty string', () => {
    expect(resolveTarget(new Date(''))).toBeNull();
  });

  it('returns null for a garbage string', () => {
    expect(resolveTarget(new Date('not-a-date'))).toBeNull();
  });

  it("returns null for the raw '__END__' placeholder", () => {
    expect(resolveTarget(new Date('__END__'))).toBeNull();
  });
});

describe('hasAmbiguousTimezone', () => {
  it('returns true for a datetime with no UTC offset', () => {
    expect(hasAmbiguousTimezone('2026-12-31T20:00:00')).toBe(true);
  });

  it('returns true for an offset-less datetime with fractional seconds', () => {
    expect(hasAmbiguousTimezone('2026-12-31T20:00:00.123')).toBe(true);
  });

  it("returns false for a datetime with a trailing 'Z'", () => {
    expect(hasAmbiguousTimezone('2026-12-31T20:00:00Z')).toBe(false);
  });

  it('returns false for a datetime with an explicit offset', () => {
    expect(hasAmbiguousTimezone('2026-12-31T20:00:00+02:00')).toBe(false);
  });

  it('returns false for a bare date-only string', () => {
    expect(hasAmbiguousTimezone('2026-12-31')).toBe(false);
  });

  it('returns false for a non-ISO string', () => {
    expect(hasAmbiguousTimezone('Fri Oct 01 2021 15:33:36 GMT+0200')).toBe(false);
  });
});

describe('warnIfAmbiguousTimezone', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('warns for a valid, offset-less datetime target', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => undefined);
    const raw = '2026-12-31T20:00:00';

    warnIfAmbiguousTimezone(raw, new Date(raw));

    expect(warn).toHaveBeenCalledOnce();
  });

  it('does not warn when the target has an explicit offset', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => undefined);
    const raw = '2026-12-31T20:00:00Z';

    warnIfAmbiguousTimezone(raw, new Date(raw));

    expect(warn).not.toHaveBeenCalled();
  });

  it('does not warn for a bare date-only target', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => undefined);
    const raw = '2026-12-31';

    warnIfAmbiguousTimezone(raw, new Date(raw));

    expect(warn).not.toHaveBeenCalled();
  });

  it('does not warn when the target failed to resolve', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => undefined);

    warnIfAmbiguousTimezone('2026-12-31T20:00:00', null);

    expect(warn).not.toHaveBeenCalled();
  });
});
