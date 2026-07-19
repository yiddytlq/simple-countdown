const labels = ['day', 'hour', 'minute', 'second'] as const;

export type DurationLabel = (typeof labels)[number];

const durations: Record<DurationLabel, number> = {
  day: 1000 * 60 * 60 * 24,
  hour: 1000 * 60 * 60,
  minute: 1000 * 60,
  second: 1000,
};

// Key insertion order (day → second) matters: Home renders blocks from Object.entries order.
export function describe(a: Date, b: Date): Record<DurationLabel, number> {
  let ms = Math.abs(b.getTime() - a.getTime());
  const result = {} as Record<DurationLabel, number>;

  for (const label of labels) {
    const nb = durations[label];
    result[label] = Math.floor(ms / nb);
    ms -= result[label] * nb;
  }
  return result;
}

function unit(value: number, label: DurationLabel): string {
  return `${value} ${label}${value > 1 ? 's' : ''}`;
}

// Speaks the way a person narrating the countdown would: omits zero-valued
// units (nobody says "0 hours remaining"), and only mentions seconds in the
// final minute — before that they'd be stale between once-a-minute
// announcements, so the minute figure alone is what's meaningful.
export function formatRemaining(parts: Record<DurationLabel, number>): string {
  const { day, hour, minute, second } = parts;
  const segments: string[] = [];
  if (day > 0) segments.push(unit(day, 'day'));
  if (hour > 0) segments.push(unit(hour, 'hour'));
  if (minute > 0) segments.push(unit(minute, 'minute'));
  if (day === 0 && hour === 0 && minute === 0) {
    segments.push(unit(second, 'second'));
  }
  return `${segments.join(', ')} remaining`;
}
