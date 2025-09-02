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
    <div className="relative h-[100px] w-[70px] overflow-hidden text-[100px]">
      <div
        className="relative h-full w-full transition-all duration-[800ms]"
        style={{ transform: `translateY(-${value * 100}px)` }}
      >
        {ten.map(t => (
          <div
            className="absolute right-0 left-0 h-[50px] font-bold text-white"
            style={{ top: `${t * 100}px` }}
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
