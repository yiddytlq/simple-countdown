import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import s from './index.module.css';

const ten = Array.from(Array(10).keys());

function NumberDisplay({ value: v }) {
  const [fd, setFd] = useState(true);
  const [value, setValue] = useState(Math.floor(Math.random() * 11));

  useEffect(() => {
    setFd(false);
  }, []);

  useEffect(() => {
    if (!fd) {
      setValue(v);
    }
  }, [v, fd]);

  return (
    <div className={s.value}>
      <div className={s.numbercontainer} style={{ transform: `translateY(-${value * 100}px)` }}>
        {ten.map((t) => (
          <div className={s.number} style={{ top: `${t * 100}px` }} key={t}>{t}</div>
        ))}
      </div>
    </div>
  );
}

NumberDisplay.propTypes = {
  value: PropTypes.number.isRequired,
};

export default NumberDisplay;
