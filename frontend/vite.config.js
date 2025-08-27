import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

// API Configuration Constants
const API_BASE_URL = 'http://127.0.0.1:5002'
const FRONTEND_PORT = 3000

export default defineConfig({
  plugins: [react()],
  define: {
    // Make sure environment variables are available
    'import.meta.env.VITE_AI_ENABLED': JSON.stringify(process.env.VITE_AI_ENABLED || 'false'),
    'import.meta.env.VITE_WS_URL': JSON.stringify(process.env.VITE_WS_URL || 'ws://127.0.0.1:5002'),
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    port: FRONTEND_PORT,
    host: '127.0.0.1',
    hmr: {
      port: 24678, // Use a different port for HMR
      host: '127.0.0.1'
    },
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
      '/traffic': {
        target: API_BASE_URL,
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/traffic/, '/api/traffic'),
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
