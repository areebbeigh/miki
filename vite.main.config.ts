import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { defineConfig } from 'vite';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  base: './',
  build: {
    rollupOptions: {
      input: {
        background: path.resolve(__dirname, 'src/background/index.ts'),
        options: path.resolve(__dirname, 'src/options/index.html'),
        popup: path.resolve(__dirname, 'src/popup/index.html'),
        dashboard: path.resolve(__dirname, 'src/dashboard/index.html'),
      },
      output: {
        entryFileNames: '[name].js',
        chunkFileNames: 'chunks/[name]-[hash].js',
        assetFileNames: 'assets/[name][extname]',
      },
    },
    outDir: 'dist',
    emptyOutDir: false,
    minify: false,
    sourcemap: true,
  },
});
