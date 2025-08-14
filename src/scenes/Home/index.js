import React, { useEffect, useState, useMemo } from 'react';
import { describe } from '../../service/date';
import Block from './Block';

const end = window.target;

function Home() {
  const [date, setDate] = useState(new Date());

  useEffect(() => {
    document.title = window.title || 'Easy countdown';
    const inter = setInterval(() => setDate(new Date()), 1000);
    return () => clearInterval(inter);
  }, []);

  const described = useMemo(() => describe(date, end), [date]);

  return (
    <div
      className="min-h-screen min-h-[100dvh] flex items-center justify-center bg-cover bg-no-repeat bg-center px-4 py-8"
      style={{ backgroundImage: `url('${window.background}')` }}
    >
      <div className="text-center w-full max-w-6xl">
        {(window.title && window.title.length > 0) && (
          <div className="text-white text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-bold mb-8 px-4 leading-tight">
            {window.title}
          </div>
        )}

        <div className="flex items-start justify-center flex-col md:flex-row gap-4 lg:gap-6">
          {Object.entries(described).map(([key, value]) => (
            <Block
              key={key}
              title={`${key}${value > 1 ? 's' : ''}`}
              value={value.toString().padStart(2, '0')}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

export default Home;
