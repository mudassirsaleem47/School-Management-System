import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    host: '0.0.0.0', // Makes the server accessible on local network
    port: 5173, // Default Vite port
    watch: {
      usePolling: true, // Enable polling for Docker
      interval: 1000, // Check for changes every 1 second
    },
    hmr: {
      host: 'localhost', // Hot Module Replacement host
    }
  }
})
