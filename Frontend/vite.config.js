import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  server: {
    proxy: {
      '/api': 'http://localhost:9001'
    },
    // Optimize dev server performance
    fs: {
      // Optimize file system access
      cachedChecks: false
    },
    hmr: {
      // Optimize Hot Module Replacement
      overlay: false
    }
  },
  // Optimize build performance
  optimizeDeps: {
    include: ['react', 'react-dom', 'react-router-dom', 'axios']
  },
  // Enable faster builds
  esbuild: {
    target: 'esnext'
  },
  plugins: [react({
    // Optimize React plugin
    babel: {
      plugins: [
        // Add any babel plugins if needed
      ]
    }
  })],
})
