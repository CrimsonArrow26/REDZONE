import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api': 'http://localhost:5000',
      '/nominatim': {
        target: 'https://nominatim.openstreetmap.org',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/nominatim/, ''),
        headers: {
        'User-Agent': 'RouteRiskAnalyzer/1.0 (your-email@example.com)'
        }
     },
    },
  },
  build: {
    outDir: 'dist',
    sourcemap: false,
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
          router: ['react-router-dom'],
          ui: ['lucide-react', '@radix-ui/react-slot', '@radix-ui/react-tabs', '@radix-ui/react-label']
        }
      }
    }
  },
  define: {
    __API_URL__: JSON.stringify(process.env.NODE_ENV === 'production' 
      ? process.env.VITE_API_URL || 'https://your-render-backend-url.onrender.com'
      : 'http://localhost:5000')
  }
})

