import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    // Proxy API calls to the Express backend.
    // Any request starting with /transcript, /chapters, /exercises, or /health
    // is forwarded to http://localhost:3000 during development.
    // This means React code uses fetch('/chapters') — no hardcoded port.
    proxy: {
      '/transcript': 'http://localhost:3000',
      '/chapters':   'http://localhost:3000',
      '/exercises':  'http://localhost:3000',
      '/execute':    'http://localhost:3000',
      '/health':     'http://localhost:3000',
    },
  },
})
