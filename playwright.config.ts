import { defineConfig, devices } from '@playwright/test';

// Local sandboxes ship a pre-installed Chromium whose revision may not match the
// browser @playwright/test would download. Point at it via this env var to reuse
// it instead of fetching a new one; unset in CI, where `playwright install` runs.
const chromiumExecutable = process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE;

export default defineConfig({
  testDir: './tests',
  fullyParallel: true,
  forbidOnly: Boolean(process.env.CI),
  retries: process.env.CI ? 2 : 0,
  reporter: 'list',
  use: {
    baseURL: 'http://localhost:4173',
    trace: 'on-first-retry',
  },
  projects: [
    {
      name: 'chromium',
      use: {
        ...devices['Desktop Chromium'],
        ...(chromiumExecutable ? { launchOptions: { executablePath: chromiumExecutable } } : {}),
      },
    },
  ],
  // Serve the built app (build/) exactly as it ships. The build itself — including
  // variables.sh TIMER_* injection — is the caller's step (CI job / local `pnpm build`).
  webServer: {
    command: 'pnpm exec vite preview --port 4173 --strictPort',
    url: 'http://localhost:4173',
    reuseExistingServer: !process.env.CI,
    timeout: 60_000,
  },
});
