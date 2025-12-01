import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  define: {
    // This allows the app to access process.env.API_KEY without crashing in the browser
    'process.env': process.env
  },
  optimizeDeps: {
    exclude: ['lucide-react'],
  },
});