import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// @ts-ignore
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:3000',
        changeOrigin: true,
        // @ts-ignore
        rewrite: (path: string) => path.replace(/^\/api/, ''),
      },
    },
  },
});