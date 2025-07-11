import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    port: 3000,
    proxy: {
      '/api': {
        target: 'http://localhost:5000',
        changeOrigin: true,
      },
      '/auth': {
        target: 'http://localhost:5000',
        changeOrigin: true,
      },
      // Only proxy API endpoints, not client-side routes
      '^/admin/api': {
        target: 'http://localhost:5000',
        changeOrigin: true,
      },
      '/interceptor': {
        target: 'http://localhost:5000',
        changeOrigin: true,
      },
      '/analytics': {
        target: 'http://localhost:5000',
        changeOrigin: true,
      },
      '/billing': {
        target: 'http://localhost:5000',
        changeOrigin: true,
      },
    },
  },
  build: {
    outDir: 'dist',
    sourcemap: true,
  },
})
