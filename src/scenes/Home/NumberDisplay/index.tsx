import React, { useState, useEffect } from 'react';

interface NumberDisplayProps {
  value: number;
}

const ten = Array.from(Array(10).keys());

function NumberDisplay({ value: v }: NumberDisplayProps) {
  const [fd, setFd] = useState(true);

  useEffect(() => {
    setFd(false);
  }, []);

  const value = fd ? Math.floor(Math.random() * 11) : v;

  return (
    <div className="relative h-24 w-16 overflow-hidden text-8xl">
      <div
        className="relative h-full w-full transition-transform duration-[800ms]"
        style={{ transform: `translateY(-${value * 96}px)` }}
      >
        {ten.map(t => (
          <div
            className="absolute right-0 left-0 h-12 font-bold text-white"
            style={{ top: `${t * 96}px` }}
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
