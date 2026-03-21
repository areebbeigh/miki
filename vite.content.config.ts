import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { defineConfig } from 'vite';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

/** Single IIFE bundle for MV3 content scripts (no import() in page). */
export default defineConfig({
  build: {
    lib: {
      entry: path.resolve(__dirname, 'src/content/index.ts'),
      name: 'MikiContent',
      formats: ['iife'],
      fileName: () => 'content.js',
    },
    outDir: 'dist',
    emptyOutDir: true,
    minify: false,
    sourcemap: true,
  },
});
