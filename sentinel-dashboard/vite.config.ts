import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    tailwindcss(),
    react()
  ],
  server: {
    port: 3000,
    proxy: {
      '/api/forensics': {
        target: 'http://localhost:8082',
        changeOrigin: true,
      },
      '/api/admin': {
        target: 'http://localhost:8083',
        changeOrigin: true,
      }
    }
  }
})
