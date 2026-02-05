import { defineConfig } from 'vite'
// reload trigger
import react from '@vitejs/plugin-react'
import path from "path"
import { fileURLToPath } from "url"

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// Function to normalize paths for Windows (replace backslashes with forward slashes)
function normalizePath(p) {
  return p.split(path.sep).join(path.posix.sep);
}

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
      // Normalized absolute paths for aliases
      "@tabler/icons-react": path.resolve(__dirname, "node_modules/@tabler/icons-react/dist/esm/tabler-icons-react.mjs").replace(/\\/g, '/'),
      "react-to-print": path.resolve(__dirname, "node_modules/react-to-print/lib/index.js").replace(/\\/g, '/'),
      "react-draggable": path.resolve(__dirname, "node_modules/react-draggable/build/cjs/cjs.js").replace(/\\/g, '/'),
    },
  },
  server: {
    host: '0.0.0.0', // Makes the server accessible on local network
    port: 5173, // Default Vite port
    watch: {
      usePolling: true, // Enable polling for Docker
      interval: 1000, // Check for changes every 1 second
    },
    hmr: {
      host: '192.168.10.21', // Hot Module Replacement host
    }
  }
})