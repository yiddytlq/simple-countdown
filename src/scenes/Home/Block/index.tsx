import React from 'react';
<<<<<<< HEAD
import PropTypes from 'prop-types';
=======
>>>>>>> 841aef751c0e892a6343935f0d020a4f55afa658
import cl from 'classnames';
import s from './index.module.css';
import NumberDisplay from '../NumberDisplay';

<<<<<<< HEAD
function Block({ className, value, title }) {
  return (
    <div className={cl(s.root, className)}>
      <div className={s.numbers}>
        {/* eslint-disable-next-line react/no-array-index-key */}
        {value.split('').map((v, k) => <NumberDisplay value={+v} key={k} />)}
=======
interface BlockProps {
  className?: string;
  value: string;
  title: string;
}

function Block({ className = '', value, title }: BlockProps) {
  return (
    <div className={cl(s.root, className)}>
      <div className={s.numbers}>
        {value.split('').map((v, k) => (
          <NumberDisplay value={+v} key={k} />
        ))}
>>>>>>> 841aef751c0e892a6343935f0d020a4f55afa658
      </div>
      <div className={s.title}>{title}</div>
    </div>
  );
}

<<<<<<< HEAD
Block.propTypes = {
  className: PropTypes.string,
  value: PropTypes.string.isRequired,
  title: PropTypes.string.isRequired,
};

Block.defaultProps = {
  className: '',
};

=======
>>>>>>> 841aef751c0e892a6343935f0d020a4f55afa658
export default Block;
