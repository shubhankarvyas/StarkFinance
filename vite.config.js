import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
    proxy: {
      '/api': {
        target: 'http://localhost:5001,https://stark-finance-rc24-r6tbyajb5-shubhankar-vyas-projects.vercel.app/',
        changeOrigin: true,
        secure: false
      }
    }
  }
})