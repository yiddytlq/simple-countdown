import React, { useState, useEffect } from 'react';

const ten = Array.from(Array(10).keys());

function NumberDisplay({ value: v, textShadowEnabled = true }) {
  const [fd, setFd] = useState(true);

  useEffect(() => {
    setFd(false);
  }, []);

  const value = fd ? Math.floor(Math.random() * 11) : v;

  const textShadowStyle = textShadowEnabled 
    ? { textShadow: '2px 2px 4px rgba(0,0,0,0.8), 0 0 8px rgba(0,0,0,0.6)' }
    : {};

  return (
    <div className="relative h-16 sm:h-20 lg:h-24 w-10 sm:w-12 lg:w-16 text-4xl sm:text-5xl lg:text-7xl overflow-hidden">
      <div 
        className="relative h-full w-full transition-transform duration-700 ease-out"
        style={{ transform: `translateY(-${value * 100}px)` }}
      >
        {ten.map((t) => (
          <div 
            className="text-white font-bold absolute left-0 right-0 flex items-center justify-center" 
            style={{ 
              top: `${t * 100}px`, 
              height: '64px', // h-16
              ...textShadowStyle
            }} 
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
