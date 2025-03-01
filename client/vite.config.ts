import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  build: {
    outDir: 'client/dist', // Ceci force Vite à générer le build dans ce dossier
  },
});
