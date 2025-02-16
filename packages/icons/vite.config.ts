import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import dts from 'vite-plugin-dts'
import viteAlias from '../../scripts/vite-alias'

export default defineConfig({
  plugins: [
    vue(),
    dts({
      entryRoot: 'src',
      outDir: ['es', 'lib'],
    }),
  ],
  resolve: {
    alias: viteAlias,
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
          dir: 'es',
        },
        {
          preserveModules: true,
          preserveModulesRoot: 'src',
          format: 'cjs',
          entryFileNames: '[name].js',
          dir: 'lib',
          exports: 'named',
        },
      ],
    },
    lib: {
      entry: 'src/index.ts',
    },
  },
})
