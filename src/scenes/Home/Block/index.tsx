import React from 'react';
import cl from 'classnames';
import s from './index.module.css';
import NumberDisplay from '../NumberDisplay';

interface BlockProps {
  className?: string;
  value: string;
  title: string;
}

function Block({ className = '', value, title }: BlockProps) {
  return (
    <div className={cl(s.root, className)}>
      <div className={s.numbers}>
        {value.split('').map((v, k) => <NumberDisplay value={+v} key={k} />)}
      </div>
      <div className={s.title}>{title}</div>
    </div>
  );
}

export default Block;
