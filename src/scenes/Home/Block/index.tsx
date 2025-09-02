import React from 'react';
import cl from 'classnames';
import NumberDisplay from '../NumberDisplay';

interface BlockProps {
  className?: string;
  value: string;
  title: string;
}

function Block({ className = '', value, title }: BlockProps) {
  return (
    <div
      className={cl(
        'flex h-[70px] w-[140px] flex-col items-center justify-center rounded-md bg-[rgba(211,211,211,0.349)] p-12 shadow-[0px_5px_33px_-13px_rgba(0,0,0,0.5)]',
        className
      )}
    >
      <div className="flex min-h-[100px] items-center justify-center">
        {value.split('').map((v, k) => (
          <NumberDisplay value={+v} key={k} />
        ))}
      </div>
      <div className="text-3xl text-white">{title}</div>
    </div>
  );
}

export default Block;
