/// <reference types="vitest/config" />
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  plugins: [react(), tailwindcss()],
  base: './',
  build: { outDir: 'build' },
  server: { port: 3000 },
  test: {
    environment: 'jsdom',
    include: ['src/**/__tests__/**/*.test.ts?(x)', '__tests__/**/*.test.ts'],
    setupFiles: ['src/test/setup.ts'],
    coverage: {
      provider: 'v8',
      // 'text'/'text-summary' print to the CI log; 'json-summary' feeds the CI job-summary step.
      reporter: ['text', 'text-summary', 'json-summary'],
      reportsDirectory: './coverage',
      include: ['src/**/*.{ts,tsx}'],
      exclude: ['src/**/__tests__/**', 'src/test/**', 'src/**/*.d.ts', 'src/index.tsx'],
      // Enforced coverage floor: `pnpm test:coverage` (and therefore CI) fails if coverage drops
      // below these. Set below the current baseline (lines/statements ~97%, functions/branches ~90-96%)
      // with headroom so a normal PR that ships its own tests won't trip it, while a real regression
      // will. Ratchet these numbers UP over time as coverage climbs — never down to make a red CI pass.
      thresholds: {
        lines: 90,
        statements: 90,
        functions: 85,
        branches: 85,
      },
    },
  },
});
