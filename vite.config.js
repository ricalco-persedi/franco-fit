import { defineConfig } from 'vite';

export default defineConfig({
  root: './',
  base: './', // Garantiza rutas relativas para despliegues en Vercel, Netlify o GitHub Pages
  build: {
    outDir: 'dist',
    sourcemap: false,
    emptyOutDir: true
  },
  server: {
    port: 3000,
    open: true
  }
});