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
      // Soft target: 60% line coverage. Intentionally NOT enforced here — Vitest thresholds are a
      // hard gate with no warn-only mode, so CI emits a non-failing warning instead (see ci.yml).
      // Ratchet up later by adding `thresholds: { lines: N }` once coverage is comfortably above it.
    },
  },
});
