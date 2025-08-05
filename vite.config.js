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
    sourcemap: true,
    rollupOptions: {
      external: [
        'react',
        'react-dom',
        '@solana/wallet-standard-features',
        '@wallet-standard/core',
        '@wallet-standard/features',
        'bs58',
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
