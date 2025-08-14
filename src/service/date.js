const second = 1000;

// Refactored to remove unused constants and use array iteration
const numbers = [
  { nb: second, label: 'second' },
];

export default function describe(a, b) {
  let ms = Math.abs(b.getTime() - a.getTime());
  const result = {};

  numbers.forEach(({ label: field, nb }) => {
    result[field] = Math.floor(ms / nb);
    ms -= result[field] * nb;
  });

  return result;
}
