import { useEffect, useState, useMemo, useRef } from 'react';
import { describe, formatRemaining } from '../../service/date';
import { resolveTarget } from '../../service/target';
import Block from './Block';

const end = resolveTarget(window.target);

function Home() {
  const [date, setDate] = useState(new Date());
  const [announcement, setAnnouncement] = useState('');
  const lastAnnouncedBucketRef = useRef<number | null>(null);

  useEffect(() => {
    document.title = window.title || 'Easy countdown';
    const inter = setInterval(() => {
      setDate(new Date());
    }, 1000);
    return () => {
      clearInterval(inter);
    };
  }, []);

  const described = useMemo(() => {
    if (end === null) {
      return null;
    }
    return describe(date, end);
  }, [date]);

  // Announce once per minute — a live region updating every second is
  // unusable with a screen reader — except inside the final minute, where
  // seconds are the meaningful unit and updating every second is exactly
  // how a human would narrate a countdown's last moments.
  useEffect(() => {
    if (end === null || described === null) {
      return;
    }
    const remainingMs = Math.abs(end.getTime() - date.getTime());
    const inFinalMinute = described.day === 0 && described.hour === 0 && described.minute === 0;
    const bucket = inFinalMinute ? Math.floor(remainingMs / 1000) : Math.floor(remainingMs / 60000);
    if (bucket !== lastAnnouncedBucketRef.current) {
      lastAnnouncedBucketRef.current = bucket;
      setAnnouncement(formatRemaining(described));
    }
  }, [date, described]);

  return (
    <div
      className="flex h-dvh items-center justify-center bg-cover bg-center bg-no-repeat"
      style={{ backgroundImage: `url('${window.background}')` }}
    >
      <div className="flex flex-col items-center px-4">
        {described === null ? (
          <>
            <div className="mb-4 text-center text-3xl text-white sm:mb-6 sm:text-4xl lg:text-5xl">
              No valid countdown target configured
            </div>
            <div className="text-center text-base text-white opacity-80">
              Set TIMER_TARGET to an ISO 8601 date, e.g. 2026-12-31T23:59:59
            </div>
          </>
        ) : (
          <>
            {window.title && window.title.length > 0 && (
              <div className="mb-4 text-center text-3xl text-white sm:mb-6 sm:text-4xl lg:text-5xl">
                {window.title}
              </div>
            )}
            <div className="sr-only" role="timer" aria-live="polite" aria-atomic="true">
              {announcement}
            </div>
            {/* Redundant with the live region above — hidden so screen readers
                don't read the slot-machine digit stacks. */}
            <div
              aria-hidden="true"
              className="flex flex-wrap items-start justify-center gap-3 sm:gap-4"
            >
              {Object.entries(described).map(([key, value]) => (
                <Block
                  key={key}
                  title={`${key}${value > 1 ? 's' : ''}`}
                  value={value.toString().padStart(2, '0')}
                />
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default Home;
