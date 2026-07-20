// Single source of truth for the E2E scenarios. Each scenario is a distinct
// *build* of the app: the countdown is configured at build time by variables.sh
// substituting TIMER_* env into variables-final.js, so a config-dependent
// behavior (invalid target, done state, countup, redirect) can only be exercised
// end-to-end by building a variant and serving it. global-setup.ts builds each
// into its own dir; playwright.config.ts serves each on its own port.

export interface Scenario {
  /** Stable id used for the output dir and referenced by the matching spec. */
  name: string;
  /** Dedicated preview port so scenarios can run in parallel. */
  port: number;
  /** vite build --outDir target (relative to repo root). */
  outDir: string;
  /** TIMER_* env baked into this build via variables.sh. */
  env: Record<string, string>;
}

// A comfortably-future target so the "valid" build is always mid-countdown (the
// margin must outlast the whole suite, incl. builds + CI browser install), and a
// firmly-past one so the "done"/countup/redirect builds are immediately complete.
const FUTURE_TARGET = new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString();
const PAST_TARGET = '2000-01-01T00:00:00Z';
const TITLE = 'Smoke Test';

export const scenarios: Scenario[] = [
  {
    name: 'valid',
    port: 4173,
    outDir: 'build-e2e/valid',
    env: { TIMER_BACKGROUND: '', TIMER_TARGET: FUTURE_TARGET, TIMER_TITLE: TITLE },
  },
  {
    name: 'invalid',
    port: 4174,
    outDir: 'build-e2e/invalid',
    env: { TIMER_BACKGROUND: '', TIMER_TARGET: 'not-a-real-date', TIMER_TITLE: TITLE },
  },
  {
    name: 'done',
    port: 4175,
    outDir: 'build-e2e/done',
    env: {
      TIMER_BACKGROUND: '',
      TIMER_TARGET: PAST_TARGET,
      TIMER_TITLE: TITLE,
      TIMER_DONE_MESSAGE: 'All finished!',
    },
  },
  {
    name: 'countup',
    port: 4176,
    outDir: 'build-e2e/countup',
    env: {
      TIMER_BACKGROUND: '',
      TIMER_TARGET: PAST_TARGET,
      TIMER_TITLE: TITLE,
      TIMER_DONE_COUNTUP: 'true',
    },
  },
  {
    name: 'redirect',
    port: 4177,
    outDir: 'build-e2e/redirect',
    env: {
      TIMER_BACKGROUND: '',
      TIMER_TARGET: PAST_TARGET,
      TIMER_TITLE: TITLE,
      // Redirect to the "valid" server so the follow-up navigation lands on a
      // real page (no external network, no redirect loop).
      TIMER_DONE_REDIRECT_URL: 'http://localhost:4173/',
      TIMER_DONE_DELAY_MS: '300',
    },
  },
];

export function scenarioUrl(name: string): string {
  const scenario = scenarios.find((candidate) => candidate.name === name);
  if (!scenario) {
    throw new Error(`Unknown E2E scenario: ${name}`);
  }
  return `http://localhost:${scenario.port}`;
}
