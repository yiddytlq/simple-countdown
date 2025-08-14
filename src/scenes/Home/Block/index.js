import React from 'react';
import PropTypes from 'prop-types';
import NumberDisplay from '../NumberDisplay';

function Block({ title, value }) {
  return (
    <div className="p-6 sm:p-8 lg:p-12 min-h-[160px] sm:min-h-[180px] lg:min-h-[200px] w-full sm:w-36 lg:w-44 shadow-lg bg-white bg-opacity-25 backdrop-blur-sm flex flex-col justify-center items-center rounded-lg border border-white border-opacity-20">
      <div className="flex items-center justify-center min-h-[80px] sm:min-h-[100px] lg:min-h-[120px] mb-2">
        {value.split('').map((v, k) => (
          <NumberDisplay value={+v} key={`num-${k}-${v}`} />
        ))}
      </div>
      <div className="text-xl sm:text-2xl lg:text-3xl text-white font-bold text-center">
        {title}
      </div>
    </div>
  );
}

Block.propTypes = {
  title: PropTypes.string.isRequired,
  value: PropTypes.string.isRequired,
};

export default Block;
