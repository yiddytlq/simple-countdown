import React, { useEffect, useState, useMemo } from 'react';
import describe from '../../service/date';
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
      className="flex h-screen items-center justify-center bg-cover bg-no-repeat"
      style={{ backgroundImage: `url('${window.background}')` }}
    >
      <div>
        {window.title && window.title.length > 0 && (
          <div className="mb-4 text-3xl text-white">{window.title}</div>
        )}
        <div className="flex flex-row items-start justify-center max-lg:flex-col">
          {Object.entries(described).map(([key, value]) => (
            <Block
              className="mr-4 max-lg:mr-0 max-lg:mb-4"
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
