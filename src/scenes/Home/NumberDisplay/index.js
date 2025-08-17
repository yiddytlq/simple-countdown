import React, { useState, useEffect } from 'react';
import s from './index.module.css';

const ten = Array.from(Array(10).keys());

function NumberDisplay({ value: v }) {
  const [isFirstRender, setIsFirstRender] = useState(true);

  useEffect(() => {
    setIsFirstRender(false);
  }, []);

  // Always use the prop value for the transform, but show random initially for effect
  const displayValue = isFirstRender ? Math.floor(Math.random() * 10) : v;

  return (
    <div className={s.value}>
      <div className={s.numbercontainer} style={{ transform: `translateY(-${displayValue * 100}px)` }}>
        {ten.map(t => (
          <div className={s.number} style={{ top: `${t * 100}px` }} key={t}>{t}</div>
        ))}
      </div>
    </div>
  );
}

export default NumberDisplay;
