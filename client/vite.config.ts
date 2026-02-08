import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

const isDev = process.env.NODE_ENV !== 'production'
const backendUrl = isDev ? 'http://127.0.0.1:3000' : 'http://115.190.255.89:3000'

export default defineConfig({
  plugins: [react()],
  server: {
    host: '0.0.0.0',
    port: 5173,
    proxy: isDev ? {
      '/exams': {
        target: backendUrl,
        changeOrigin: true
      },
      '/pdf': {
        target: backendUrl,
        changeOrigin: true
      }
    } : undefined
  }
})
