import { useState, useEffect } from 'react';
import s from './index.module.css';

const ten = Array.from(Array(10).keys());

interface NumberDisplayProps {
  value: number;
}

// Slot-machine intro: each digit mounts on a random position, then rolls to its real value.
function NumberDisplay({ value: v }: NumberDisplayProps) {
  const [intro, setIntro] = useState(() => Math.floor(Math.random() * 11));

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
    <div className={s.value}>
      <div className={s.numbercontainer} style={{ transform: `translateY(-${value * 100}px)` }}>
        {ten.map((t) => (
          <div className={s.number} style={{ top: `${t * 100}px` }} key={t}>
            {t}
          </div>
        ))}
      </div>
    </div>
  );
}

export default NumberDisplay;
