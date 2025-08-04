import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  base: './', // ensure correct asset paths when opening dist directly
  plugins: [react()],
  optimizeDeps: {
    exclude: ['lucide-react'],
  },
});
