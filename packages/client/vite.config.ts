import { fileURLToPath } from 'node:url'
import path from 'node:path'
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import dts from 'vite-plugin-dts'
import viteAlias from '../../scripts/vite-alias'

const baseUrl = fileURLToPath(new URL('./', import.meta.url))

export default defineConfig({
  plugins: [
    vue(),
    dts({
      entryRoot: 'src',
      outDir: ['dist/es', 'dist/lib'],
    }),
  ],
  resolve: {
    alias: [...viteAlias, {
      find: /^@\//,
      replacement: path.join(path.resolve(baseUrl, 'src'), '/'),
    }],
  },
  build: {
    rollupOptions: {
      external: ['vue'],
      output: [
        {
          preserveModules: true,
          preserveModulesRoot: 'src',
          format: 'esm',
          entryFileNames: '[name].js',
          dir: 'dist/es',
        },
        {
          preserveModules: true,
          preserveModulesRoot: 'src',
          format: 'cjs',
          entryFileNames: '[name].js',
          dir: 'dist/lib',
          exports: 'named',
        },
      ],
    },
    lib: {
      entry: 'src/index.ts',
    },
  },
})
