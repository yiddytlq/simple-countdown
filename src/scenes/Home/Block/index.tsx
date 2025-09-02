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
        'flex h-44 w-60 flex-col items-center justify-center rounded-md bg-gray-200/35 p-12 shadow-lg',
        className
      )}
    >
      <div className="flex min-h-24 items-center justify-center">
        {value.split('').map((v, k) => (
          <NumberDisplay value={+v} key={k} />
        ))}
      </div>
      <div className="text-3xl text-white">{title}</div>
    </div>
  );
}

export default Block;
