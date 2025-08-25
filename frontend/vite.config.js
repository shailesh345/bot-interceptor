import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

// API Configuration Constants
const API_BASE_URL = 'http://127.0.0.1:5002'
const FRONTEND_PORT = 3000

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    port: FRONTEND_PORT,
    proxy: {
      '/api': {
        target: API_BASE_URL,
        changeOrigin: true,
      },
      '/auth': {
        target: API_BASE_URL,
        changeOrigin: true,
      },
      '/health': {
        target: API_BASE_URL,
        changeOrigin: true,
      },

      // Traffic interception API endpoints
      '/api/traffic': {
        target: API_BASE_URL,
        changeOrigin: true,
      },
      // Admin API endpoints
      '/admin/api': {
        target: API_BASE_URL,
        changeOrigin: true,
      },
      '/interceptor': {
        target: API_BASE_URL,
        changeOrigin: true,
      },
      '/analytics': {
        target: API_BASE_URL,
        changeOrigin: true,
      },
      '/billing': {
        target: API_BASE_URL,
        changeOrigin: true,
      },
    },
  },
  build: {
    outDir: 'dist',
    sourcemap: true,
  },
})
