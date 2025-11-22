
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    sourcemap: false,
  },
  define: {
    // Correctly inject the API_KEY from the build environment
    'process.env.API_KEY': JSON.stringify(process.env.API_KEY)
  }
});
