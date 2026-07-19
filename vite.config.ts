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
    environment: 'node',
    include: ['src/**/__tests__/**/*.test.ts?(x)'],
  },
});
