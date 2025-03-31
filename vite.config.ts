import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  css: {
    preprocessorOptions: {
      less: {
        javascriptEnabled: true, // Включает поддержку LESS в Ant Design
      },
    },
  },
  server: {
    host: true,  // Разрешает доступ извне
    port: 5173,  // Можно изменить при необходимости
    strictPort: true,
    cors: true,
    allowedHosts: ['front.digitalnexus.studio'],  // Разрешаем домен
  },
  build: {
    outDir: 'dist',
    emptyOutDir: true,
    target: 'esnext',
  },
});
