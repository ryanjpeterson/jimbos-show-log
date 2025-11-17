import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    proxy: {
      // When the frontend sees a request starting with /api...
      '/api': {
        // ...forward it to the backend server
        target: 'http://localhost:3000',
        changeOrigin: true,
        secure: false,
      },
    },
  },
})