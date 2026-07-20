import { defineConfig, devices } from '@playwright/test';
import { scenarios } from './tests/scenarios';

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
    // Default target is the "valid" build; scenario specs override baseURL per file.
    baseURL: `http://localhost:${scenarios[0]?.port ?? 4173}`,
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
  // One preview server per scenario, each serving its own pre-built config.
  // The build-e2e/* dirs are produced by `node tests/build-e2e.ts` (run before
  // Playwright via `pnpm test:e2e`), since web servers start before any setup hook.
  webServer: scenarios.map((scenario) => ({
    command: `pnpm exec vite preview --outDir ${scenario.outDir} --port ${scenario.port} --strictPort`,
    url: `http://localhost:${scenario.port}`,
    reuseExistingServer: !process.env.CI,
    timeout: 60_000,
  })),
});
