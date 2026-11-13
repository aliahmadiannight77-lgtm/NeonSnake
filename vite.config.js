
import { defineConfig } from 'vite';

export default defineConfig({
  base: './',

  publicDir: 'public',

  server: {
    host: true,
    port: 5173,
    strictPort: true,
    open: true
  },

  preview: {
    host: true,
    port: 4173,
    strictPort: true
  },

  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    emptyOutDir: true,
    sourcemap: false,
    minify: 'oxc',
    target: 'es2022',
    cssCodeSplit: true,
    reportCompressedSize: true
  }
});
