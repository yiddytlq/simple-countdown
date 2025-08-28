import React from 'react';
import PropTypes from 'prop-types';
import cl from 'classnames';
import s from './index.module.css';
import NumberDisplay from '../NumberDisplay';

function Block({ className, value, title }) {
  return (
    <div className={cl(s.root, className)}>
      <div className={s.numbers}>
        {/* eslint-disable-next-line react/no-array-index-key */}
        {value.split('').map((v, k) => <NumberDisplay value={+v} key={k} />)}
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
