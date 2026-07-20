import { execFileSync } from 'node:child_process';
import { scenarios } from './scenarios.ts';

// Builds every E2E scenario before Playwright starts (run via `pnpm test:e2e`).
// Each build runs the real variables.sh -> variables-final.js substitution — the
// runtime-config path unit tests mock away — then emits into the scenario's own
// dir so playwright.config.ts can serve them side by side. Sequential on purpose:
// variables.sh writes the shared public/variables-final.js, so parallel builds
// would race. Runs as a standalone script (Node strips the types) rather than a
// Playwright globalSetup, which starts after the web servers that need these dirs.
for (const scenario of scenarios) {
  const env = { ...process.env, ...scenario.env };
  console.log(`[e2e] building scenario "${scenario.name}" -> ${scenario.outDir}`);
  execFileSync('bash', ['variables.sh', 'public'], { stdio: 'inherit', env });
  execFileSync('pnpm', ['exec', 'vite', 'build', '--outDir', scenario.outDir], {
    stdio: 'inherit',
    env,
  });
}
