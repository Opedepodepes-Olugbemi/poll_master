import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  optimizeDeps: {
    exclude: ['better-sqlite3']
  },
  server: {
    port: 5173,
    host: true
  },
  build: {
    commonjsOptions: {
      include: []
    }
  },
  define: {
    'process.env': {},
    'process.versions': {}
  }
});
