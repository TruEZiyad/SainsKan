import { defineConfig } from 'vite';

export default defineConfig({
  // Hash routing + aset relatif: aman dideploy di root domain maupun subfolder.
  base: './',
  build: {
    outDir: 'dist',
    target: 'es2022',
    sourcemap: false,
  },
  server: {
    port: 5173,
    host: true,
  },
  test: {
    environment: 'node',
    setupFiles: ['./tests/setup.js'],
    include: ['tests/**/*.test.js'],
  },
});
