const day = 1000 * 60 * 60 * 24;
const hour = 1000 * 60 * 60;
const minute = 1000 * 60;
const second = 1000;

const numbers = [
  { nb: day, label: 'day' },
  { nb: hour, label: 'hour' },
  { nb: minute, label: 'minute' },
  { nb: second, label: 'second' },
];

export function describe(a, b) {
  let ms = b.getTime() - a.getTime();
  
  // If the target date is in the past, return negative values
  if (ms < 0) {
    const result = {};
    for (let i = 0; i < numbers.length; i += 1) {
      result[numbers[i].label] = -1;
    }
    return result;
  }
  
  const result = {};

  for (let i = 0; i < numbers.length; i += 1) {
    const field = numbers[i].label;
    const nb = numbers[i].nb;

    result[field] = Math.floor(ms / nb);
    ms -= result[field] * nb;
  }
  return result;
}
