/// <reference types="vitest/config" />
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  base: './',
  build: { outDir: 'build' },
  server: { port: 3000 },
  test: {
    environment: 'node',
    include: ['src/**/__tests__/**/*.test.ts?(x)'],
  },
});
