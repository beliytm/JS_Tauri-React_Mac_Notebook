import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

const DEV_PORT = 1420;

export default defineConfig({
  plugins: [react()],
  clearScreen: false,
  server: { port: DEV_PORT, strictPort: true },
});
