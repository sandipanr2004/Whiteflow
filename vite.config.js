import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from 'tailwindcss'
import autoprefixer from 'autoprefixer'

import { cloudflare } from "@cloudflare/vite-plugin";

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), cloudflare()],
  define: {
    global: 'window',
  },
  server: {
    proxy: {
      '/api/auth': 'http://localhost:8081',
      '/api': 'http://localhost:8080',
      '/ws-board': {
        target: 'http://localhost:8080',
        ws: true
      }
    },
    hmr: {
      overlay: false
    }
  },
  css: {
    postcss: {
      plugins: [
        tailwindcss(),
        autoprefixer(),
      ],
    },
  },
})