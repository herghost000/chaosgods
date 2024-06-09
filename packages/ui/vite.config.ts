import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { defineConfig } from 'vite'
import vueJsx from '@vitejs/plugin-vue-jsx'
import vue from '@vitejs/plugin-vue'
import dts from 'vite-plugin-dts'
import viteAlias from '../../scripts/vite-alias'

const baseUrl = fileURLToPath(new URL('./', import.meta.url))

export default defineConfig({
  plugins: [
    dts({
      entryRoot: 'src',
      outDir: ['dist/lib', 'dist/es'],
      exclude: ['**/tests/**', '**/__tests__/**'],
    }),
    vue(),
    vueJsx(),
  ],
  resolve: {
    alias: [...viteAlias, {
      find: /^@(?=\/)/,
      replacement: path.resolve(baseUrl, 'src'),
    }],
  },
  build: {
    lib: {
      entry: 'src/entry-bundler.ts',
    },
    rollupOptions: {
      external: ['vue'],
      output: [
        {
          preserveModules: true,
          preserveModulesRoot: 'src',
          entryFileNames: '[name].js',
          format: 'es',
          dir: 'dist/es',
        },
        {
          preserveModules: true,
          preserveModulesRoot: 'src',
          entryFileNames: '[name].js',
          exports: 'named',
          format: 'cjs',
          dir: 'dist/lib',
        },
      ],
    },
  },
})
