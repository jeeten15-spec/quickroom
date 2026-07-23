import { defineConfig } from 'vite';

export default defineConfig({
  server: {
    proxy: {
      '/api': {
        target: process.env.VITE_WORKER_URL || 'http://127.0.0.1:8787',
        changeOrigin: true
      }
    }
  }
});
