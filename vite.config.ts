import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  optimizeDeps: {
    exclude: ['react-syntax-highlighter/dist/esm/async-languages/prism'],
  },
  server: {
    proxy: {
      // Proxy para APIs que geralmente têm problemas de CORS
      '/api/anatel': {
        target: 'https://sistemas.anatel.gov.br',
        changeOrigin: true,
        rewrite: path => path.replace(/^\/api\/anatel/, ''),
        secure: true,
      },
      '/api/cors-proxy': {
        target: 'https://cors-anywhere.herokuapp.com',
        changeOrigin: true,
        rewrite: path => path.replace(/^\/api\/cors-proxy/, ''),
        secure: true,
      },
    },
  },
})
