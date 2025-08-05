import { defineConfig } from 'vite';
import dts from 'vite-plugin-dts';
import svgr from 'vite-plugin-svgr';

export default defineConfig({
  build: {
    lib: {
      entry: './src/index.ts',
      name: 'SolanaStandardWallet',
      fileName: 'solana-standard-wallet',
      formats: ['es'],
    },
    rollupOptions: {
      external: ['react', 'react-dom'],
    },
  },
  plugins: [
    // 🧠 SVGR solo se activa cuando NO hay ?url
    svgr({
      exportAsDefault: false,
      include: '**/*.svg',
      exclude: '**/*.svg?url',
    }),
    dts({ insertTypesEntry: true }),
  ],
});
