import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  
  // Build configuration to match current Create React App output
  build: {
    outDir: 'build',
    assetsDir: 'static',
    sourcemap: false,
    rollupOptions: {
      output: {
        // Match CRA's output structure
        assetFileNames: 'static/[ext]/[name].[hash].[ext]',
        chunkFileNames: 'static/js/[name].[hash].js',
        entryFileNames: 'static/js/[name].[hash].js',
      }
    }
  },
  
  // Server configuration
  server: {
    port: 3000,
    open: true
  },
  
  // Preview configuration (for built app)
  preview: {
    port: 3000
  },
  
  // Define environment variables prefix - support TIMER_ prefix only
  envPrefix: ['TIMER_'],
  
  // Ensure proper handling of public assets
  publicDir: 'public',
  
  // Test configuration
  test: {
    environment: 'jsdom',
    setupFiles: ['./src/setupTests.ts'],
    globals: true
  }
})