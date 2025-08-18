import React from 'react';
import cl from 'classnames';
import PropTypes from 'prop-types';
import s from './index.module.css';
import NumberDisplay from '../NumberDisplay';

function Block({ className, value, title }) {
  return (
    <div className={cl(s.root, className)}>
      <div className={s.numbers}>
        {value.split('').map((v) => (
        {value.split('').map((v, index) => (
          <NumberDisplay value={+v} key={`digit-${index}`} />
        ))}
      </div>
      <div className={s.title}>{title}</div>
    </div>
  );
}

Block.propTypes = {
  className: PropTypes.string,
  value: PropTypes.string.isRequired,
  title: PropTypes.string.isRequired,
};

Block.defaultProps = {
  className: '',
};

export default Block;
