import React, { useState, useEffect } from 'react';

interface NumberDisplayProps {
  value: number;
}

const ten = Array.from(Array(10).keys());

// Match original CSS dimensions: height: 100px, spacing: 100px
const DIGIT_HEIGHT = 100; // px
const CONTAINER_HEIGHT = 100; // px

function NumberDisplay({ value: v }: NumberDisplayProps) {
  const [fd, setFd] = useState(true);

  useEffect(() => {
    setFd(false);
  }, []);

  const value = fd ? Math.floor(Math.random() * 11) : v;

  return (
    <div
      className="relative w-[70px] overflow-hidden text-[100px]"
      style={{ height: `${CONTAINER_HEIGHT}px` }}
    >
      <div
        className="relative h-full w-full transition-transform duration-[800ms]"
        style={{ transform: `translateY(-${value * DIGIT_HEIGHT}px)` }}
      >
        {ten.map(t => (
          <div
            className="absolute right-0 left-0 h-[50px] font-bold text-white"
            style={{ top: `${t * DIGIT_HEIGHT}px` }}
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
