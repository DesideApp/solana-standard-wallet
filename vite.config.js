import { defineConfig } from 'vite';
import path from 'path';
import dts from 'vite-plugin-dts';
import svgr from 'vite-plugin-svgr';

export default defineConfig({
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  build: {
    lib: {
      entry: './src/index.ts',
      name: 'SolanaStandardWallet',
      fileName: 'solana-standard-wallet',
      formats: ['es'],
    },
    sourcemap: true,
    rollupOptions: {
      external: [
        'react',
        'react-dom',
        'react/jsx-runtime'
      ],
    },
  },
  plugins: [
    svgr({
      exportAsDefault: false,
      include: '**/*.svg',
      exclude: '**/*.svg?url',
    }),
    dts({ insertTypesEntry: true }),
  ],
});
