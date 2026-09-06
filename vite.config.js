import { defineConfig } from 'vite';
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  root: './',
  base: './',
  plugins: [
    tailwindcss(),
  ],
  build: {
    outDir: 'dist',
    sourcemap: false,
    emptyOutDir: true,
    chunkSizeWarningLimit: 1600,
    rollupOptions: {
      output: {
        manualChunks: undefined
      }
    }
  },
  server: {
    port: 3000
  }
});