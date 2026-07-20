import { useState, useEffect } from 'react';

const ten = Array.from(Array(10).keys());

function prefersReducedMotion(): boolean {
  return (
    typeof window !== 'undefined' &&
    typeof window.matchMedia === 'function' &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches
  );
}

interface NumberDisplayProps {
  value: number;
}

// Slot-machine intro: each digit mounts on a random position, then rolls to its real value.
// Skipped for users who prefer reduced motion — they see the real digit immediately.
function NumberDisplay({ value: v }: NumberDisplayProps) {
  const [intro, setIntro] = useState(() =>
    prefersReducedMotion() ? -1 : Math.floor(Math.random() * 11),
  );

  useEffect(() => {
    const t = setTimeout(() => {
      setIntro(-1);
    }, 0);
    return () => {
      clearTimeout(t);
    };
  }, []);

  const value = intro >= 0 ? intro : v;

  return (
    <div aria-hidden="true" className="relative h-[1em] w-[0.7em] overflow-hidden">
      <div
        className="relative h-full w-full motion-safe:transition-transform motion-safe:duration-[800ms]"
        style={{ transform: `translateY(-${value * 100}%)` }}
      >
        {ten.map((t) => (
          <div
            className="absolute inset-x-0 flex h-full items-center justify-center font-bold leading-none text-white"
            style={{ top: `${t * 100}%` }}
            key={t}
          >
            {t}
          </div>
        ))}
      </div>
    </div>
  );
}

export default NumberDisplay;
