import { useEffect, useState, useMemo, useRef } from 'react';
import { describe, formatRemaining } from '../../service/date';
import { resolveTarget, warnIfAmbiguousTimezone } from '../../service/target';
import { resolveCompletion } from '../../service/completion';
import { redirectTo, reloadPage } from '../../service/navigation';
import { resolveBackground, preloadImage } from '../../service/background';
import Block from './Block';

const end = resolveTarget(window.target);
warnIfAmbiguousTimezone(window.targetRaw, end);
const backgroundUrl = resolveBackground(window.background);
const completion = resolveCompletion({
  countup: window.doneCountup,
  message: window.doneMessage,
  animate: window.doneAnimation,
  hideTimer: window.doneHideTimer,
  reload: window.doneReload,
  redirectUrl: window.doneRedirectUrl,
  delayMs: window.doneDelayMs,
});

const headingClasses = 'mb-4 text-center text-3xl text-white sm:mb-6 sm:text-4xl lg:text-5xl';

function Home() {
  const [date, setDate] = useState(new Date());
  const [announcement, setAnnouncement] = useState('');
  const [backgroundFailed, setBackgroundFailed] = useState(false);
  const lastAnnouncedBucketRef = useRef<number | null>(null);

  // In countup mode there is no done state: the timer runs forever.
  const doneState =
    end !== null && completion.mode === 'freeze' && date.getTime() >= end.getTime()
      ? completion
      : null;
  const done = doneState !== null;

  useEffect(() => {
    document.title = window.title || 'Easy countdown';
    if (done) {
      return;
    }
    const inter = setInterval(() => {
      setDate(new Date());
    }, 1000);
    return () => {
      clearInterval(inter);
    };
  }, [done]);

  useEffect(() => {
    if (backgroundUrl === null) {
      return;
    }
    let cancelled = false;
    void preloadImage(backgroundUrl).then((ok) => {
      if (!cancelled && !ok) {
        setBackgroundFailed(true);
      }
    });
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (!done || completion.mode !== 'freeze' || completion.followUp === null) {
      return;
    }
    const { followUp } = completion;
    const timeout = setTimeout(() => {
      if (followUp.action === 'redirect') {
        redirectTo(followUp.url);
      } else {
        reloadPage();
      }
    }, followUp.delayMs);
    return () => {
      clearTimeout(timeout);
    };
  }, [done]);

  const described = useMemo(() => {
    if (end === null) {
      return null;
    }
    // Freeze at exactly 00 00 00 00 once done; describe() otherwise counts
    // back up past the target (countup mode relies on that).
    return describe(done ? end : date, end);
  }, [date, done]);

  // Announce once per minute — a live region updating every second is
  // unusable with a screen reader — except inside the final minute, where
  // seconds are the meaningful unit and updating every second is exactly
  // how a human would narrate a countdown's last moments. Once frozen, the
  // completion message takes over (announced via its own aria-live heading
  // below), so this region goes quiet rather than echoing stale seconds.
  useEffect(() => {
    if (end === null || described === null) {
      return;
    }
    if (doneState !== null) {
      if (lastAnnouncedBucketRef.current !== -1) {
        lastAnnouncedBucketRef.current = -1;
        setAnnouncement('');
      }
      return;
    }
    const remainingMs = Math.abs(end.getTime() - date.getTime());
    const inFinalMinute = described.day === 0 && described.hour === 0 && described.minute === 0;
    const bucket = inFinalMinute ? Math.floor(remainingMs / 1000) : Math.floor(remainingMs / 60000);
    if (bucket !== lastAnnouncedBucketRef.current) {
      lastAnnouncedBucketRef.current = bucket;
      setAnnouncement(formatRemaining(described));
    }
  }, [date, described, doneState]);

  const showBackground = backgroundUrl !== null && !backgroundFailed;

  return (
    <div
      className={`flex h-dvh items-center justify-center bg-cover bg-center bg-no-repeat ${
        showBackground ? '' : 'bg-gradient-to-br from-slate-800 to-slate-950'
      }`}
      style={showBackground ? { backgroundImage: `url('${backgroundUrl}')` } : undefined}
    >
      <div className="flex flex-col items-center px-4">
        {described === null ? (
          <>
            <div className={headingClasses}>No valid countdown target configured</div>
            <div className="text-center text-base text-white opacity-80">
              Set TIMER_TARGET to an ISO 8601 date, e.g. 2026-12-31T23:59:59
            </div>
          </>
        ) : (
          <>
            {doneState !== null ? (
              // aria-live announces the transition from title (or nothing) to
              // this message — the one moment this heading's text changes.
              <div
                aria-live="polite"
                aria-atomic="true"
                className={`${headingClasses}${doneState.animate ? ' motion-safe:animate-done-pulse' : ''}`}
              >
                {doneState.message}
              </div>
            ) : (
              window.title &&
              window.title.length > 0 && <div className={headingClasses}>{window.title}</div>
            )}
            <div className="sr-only" role="timer" aria-live="polite" aria-atomic="true">
              {announcement}
            </div>
            {!(doneState !== null && doneState.hideTimer) && (
              // Redundant with the live region above — hidden so screen readers
              // don't read the slot-machine digit stacks.
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
            )}
          </>
        )}
      </div>
    </div>
  );
}

export default Home;
