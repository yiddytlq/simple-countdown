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

  // Check if countdown has reached zero or gone negative
  const isCountdownComplete = useMemo(() => {
    return Object.values(described).every(value => value <= 0);
  }, [described]);

  // Handle post-countdown actions
  useEffect(() => {
    if (isCountdownComplete && window.postCountdownAction === 'redirect' && window.redirectUrl) {
      const timer = setTimeout(() => {
        window.location.href = window.redirectUrl;
      }, 3000); // Wait 3 seconds before redirect
      return () => clearTimeout(timer);
    }
  }, [isCountdownComplete]);

  const postCountdownMessage = window.postCountdownMessage || 'Event Started!';
  const textShadowEnabled = window.textShadow !== 'false';

  // Dynamic text shadow style based on environment variable
  const textShadowStyle = textShadowEnabled 
    ? { textShadow: '2px 2px 4px rgba(0,0,0,0.8), 0 0 8px rgba(0,0,0,0.6)' }
    : {};

  return (
    <div 
      className="min-h-screen min-h-[100dvh] flex items-center justify-center bg-cover bg-no-repeat bg-center px-4 py-8"
      style={{ backgroundImage: `url('${window.background}')` }}
    >
      <div className="text-center w-full max-w-6xl">
        {(window.title && window.title.length > 0) && (
          <div 
            className="text-white text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-bold mb-8 px-4 leading-tight"
            style={textShadowStyle}
          >
            {window.title}
          </div>
        )}
        
        {isCountdownComplete ? (
          <div className="space-y-4">
            <div 
              className="text-white text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold bg-black bg-opacity-60 backdrop-blur-sm px-6 py-4 rounded-lg mx-auto max-w-2xl"
              style={textShadowStyle}
            >
              {postCountdownMessage}
            </div>
            {window.postCountdownAction === 'redirect' && window.redirectUrl && (
              <div 
                className="text-white text-lg opacity-75"
                style={textShadowStyle}
              >
                Redirecting in a few seconds...
              </div>
            )}
          </div>
        ) : (
          <div className="flex items-start justify-center flex-col md:flex-row gap-4 lg:gap-6">
            {Object.entries(described).map(([key, value]) => (
              <Block
                key={key}
                title={`${key}${value > 1 ? 's' : ''}`}
                value={Math.max(0, value).toString().padStart(2, '0')}
                textShadowEnabled={textShadowEnabled}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default Home;
