import { describe, expect, it } from 'vitest';
import { describe as describeDuration, formatRemaining } from '../date';

const base = new Date('2030-01-01T00:00:00.000Z');

function offset(ms: number): Date {
  return new Date(base.getTime() + ms);
}

const DAY = 24 * 60 * 60 * 1000;
const HOUR = 60 * 60 * 1000;
const MINUTE = 60 * 1000;
const SECOND = 1000;

describe('describe', () => {
  it('splits a duration into days, hours, minutes and seconds', () => {
    const target = offset(1 * DAY + 2 * HOUR + 3 * MINUTE + 4 * SECOND);
    expect(describeDuration(base, target)).toEqual({ day: 1, hour: 2, minute: 3, second: 4 });
  });

  it('returns all zeros for identical dates', () => {
    expect(describeDuration(base, base)).toEqual({ day: 0, hour: 0, minute: 0, second: 0 });
  });

  it('is symmetric in its arguments', () => {
    const target = offset(5 * DAY + 6 * HOUR);
    expect(describeDuration(base, target)).toEqual(describeDuration(target, base));
  });

  it('truncates sub-second remainders', () => {
    expect(describeDuration(base, offset(1500))).toEqual({ day: 0, hour: 0, minute: 0, second: 1 });
  });

  it('handles exact multi-day boundaries', () => {
    expect(describeDuration(base, offset(2 * DAY))).toEqual({
      day: 2,
      hour: 0,
      minute: 0,
      second: 0,
    });
  });

  it('renders keys in display order (day, hour, minute, second)', () => {
    expect(Object.keys(describeDuration(base, offset(DAY)))).toEqual([
      'day',
      'hour',
      'minute',
      'second',
    ]);
  });
});

describe('formatRemaining', () => {
  it('formats a sentence in day → hour → minute → second order', () => {
    expect(formatRemaining({ day: 3, hour: 4, minute: 12, second: 5 })).toBe(
      '3 days, 4 hours, 12 minutes, 5 seconds remaining',
    );
  });

  it('keeps 0 and 1 singular, matching the visual block labels', () => {
    expect(formatRemaining({ day: 0, hour: 1, minute: 0, second: 1 })).toBe(
      '0 day, 1 hour, 0 minute, 1 second remaining',
    );
  });

  it('pluralizes values of two or more', () => {
    expect(formatRemaining({ day: 2, hour: 23, minute: 59, second: 30 })).toBe(
      '2 days, 23 hours, 59 minutes, 30 seconds remaining',
    );
  });
});
