import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';

const ten = Array.from(Array(10).keys());

function NumberDisplay({ value: v }) {
  const [fd, setFd] = useState(true);

  useEffect(() => {
    setFd(false);
  }, []);

  const value = fd ? Math.floor(Math.random() * 11) : v;

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

NumberDisplay.propTypes = {
  value: PropTypes.number.isRequired,
};

export default NumberDisplay;
