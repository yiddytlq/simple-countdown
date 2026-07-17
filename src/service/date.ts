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
