import { defineConfig } from 'vite';
import { viteSingleFile } from 'vite-plugin-singlefile';

// Le build produit un seul fichier dist/index.html, jouable par double-clic.
export default defineConfig({
  base: './',
  plugins: [viteSingleFile()],
  test: { include: ['src/**/*.test.ts'] }
} as never);
