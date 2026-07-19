import { useEffect, useState, useMemo } from 'react';
import { describe } from '../../service/date';
import { resolveTarget } from '../../service/target';
import { resolveCompletion } from '../../service/completion';
import { redirectTo, reloadPage } from '../../service/navigation';
import Block from './Block';

const end = resolveTarget(window.target);
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

  return (
    <div
      className="flex h-dvh items-center justify-center bg-cover bg-center bg-no-repeat"
      style={{ backgroundImage: `url('${window.background}')` }}
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
              <div
                className={`${headingClasses}${doneState.animate ? ' motion-safe:animate-done-pulse' : ''}`}
              >
                {doneState.message}
              </div>
            ) : (
              window.title &&
              window.title.length > 0 && <div className={headingClasses}>{window.title}</div>
            )}
            {!(doneState !== null && doneState.hideTimer) && (
              <div className="flex flex-wrap items-start justify-center gap-3 sm:gap-4">
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
