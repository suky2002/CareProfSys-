import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src'),
    },
  },
  server: {
    host: '0.0.0.0',    // ascultă pe toate interfețele, inclusiv localhost
    port: 5173,         // portul implicit
    strictPort: true,   // eșuează dacă portul e deja folosit
    open: false,        // nu deschide automat browserul
  },
});
