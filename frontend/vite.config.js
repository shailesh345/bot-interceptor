import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

// API Configuration Constants
const API_BASE_URL = 'http://127.0.0.1:5000'
const FRONTEND_PORT = 3000

export default defineConfig({
  plugins: [react()],
  define: {
    // Make sure environment variables are available
    'import.meta.env.VITE_AI_ENABLED': JSON.stringify(process.env.VITE_AI_ENABLED || 'false'),
    'import.meta.env.VITE_WS_URL': JSON.stringify(process.env.VITE_WS_URL || 'ws://127.0.0.1:5000'),
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
        target: 'http://127.0.0.1:5000',
        changeOrigin: true,
      },
      '/auth': {
        target: 'http://127.0.0.1:5000',
        changeOrigin: true,
      },
      '/health': {
        target: 'http://127.0.0.1:5000',
        changeOrigin: true,
      },

      // Traffic interception API endpoints
      '/traffic': {
        target: 'http://127.0.0.1:5000',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/traffic/, '/api/traffic'),
      },
      // Admin API endpoints
      '/admin/api': {
        target: 'http://127.0.0.1:5000',
        changeOrigin: true,
      },
      '/interceptor': {
        target: 'http://127.0.0.1:5000',
        changeOrigin: true,
      },
      '/analytics': {
        target: 'http://127.0.0.1:5000',
        changeOrigin: true,
      },
      '/billing': {
        target: 'http://127.0.0.1:5000',
        changeOrigin: true,
      },
    },
  },
  build: {
    outDir: 'dist',
    sourcemap: true,
  },
})
