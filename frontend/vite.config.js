import { fileURLToPath, URL } from 'node:url'
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

// https://vite.dev/config/
export default defineConfig({
  plugins: [vue()],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    }
  },
  server: {
    proxy: {
      // 🌟 必须要有这个，否则前端找不到 Python 后端！
      '/api': {
        target: 'http://localhost:8000',
        changeOrigin: true
      }
    }
  }
})
