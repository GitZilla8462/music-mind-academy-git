import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],

  // Remove base path for development, add it back for production build
  // base: '/dashboard/',

  build: {
    outDir: 'dist',
    // Increase chunk size warning limit (we're intentionally creating larger vendor chunks)
    chunkSizeWarningLimit: 600,
    rollupOptions: {
      output: {
        entryFileNames: 'assets/[name]-[hash].js',
        chunkFileNames: 'assets/[name]-[hash].js',
        assetFileNames: 'assets/[name]-[hash].[ext]',
        // Manual chunks to split heavy libraries into separate files
        manualChunks: {
          // Core React - loads on every page
          'vendor-react': ['react', 'react-dom', 'react-router-dom'],
          // Firebase - loads when auth/database needed
          'vendor-firebase': ['firebase/app', 'firebase/auth', 'firebase/database'],
          // Audio library - only loads for lessons/compositions
          'vendor-tone': ['tone', '@tonejs/midi'],
          // Graphics library - only loads for compositions
          'vendor-pixi': ['pixi.js'],
          // Music notation - only loads when showing sheet music
          'vendor-music-notation': ['vexflow', 'opensheetmusicdisplay'],
        }
      }
    }
  },
  
  server: {
    // Remove the /dashboard/ path for development
    // open: '/dashboard/',
    
    proxy: {
      '/api': {
        target: 'http://localhost:5000',
        changeOrigin: true,
        secure: false
      }
    }
  }
})