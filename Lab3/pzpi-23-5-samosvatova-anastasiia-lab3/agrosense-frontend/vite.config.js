import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import path from 'path';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    port: 5173,
    proxy: {
      // Проксі для звичайних API запитів
      '/api/v1': {
        target: 'http://localhost:3000', 
        changeOrigin: true,
      },
      // ПРОКСІ ДЛЯ WEBSOCKET
      '/socket.io': {
        target: 'http://localhost:3000',
        ws: true, // Дозволяє WebSocket з'єднання
      },
    },
  },
});