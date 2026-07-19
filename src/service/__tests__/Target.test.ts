import { describe, expect, it } from 'vitest';
import { resolveTarget } from '../target';

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
