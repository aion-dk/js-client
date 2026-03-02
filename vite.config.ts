import { defineConfig } from 'vite';
import { resolve } from 'path';

export default defineConfig({
  build: {
    lib: {
      entry: resolve(__dirname, 'lib/av_verifier.ts'),
      name: 'AssemblyVoting',
      formats: ['iife'],
      fileName: () => 'bundle.js',
    },
    outDir: 'public',
    minify: false,
  },
  resolve: {
    alias: {
      // Equivalent to webpack's resolve.fallback.crypto: false
      crypto: resolve(__dirname, 'empty-module.ts'),
    },
  },
});
