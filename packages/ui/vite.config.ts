import { defineConfig } from 'vite'
import vueJsx from '@vitejs/plugin-vue-jsx'
import vue from '@vitejs/plugin-vue'
import dts from 'vite-plugin-dts'

export default defineConfig({
  plugins: [
    dts({
      entryRoot: 'src',
      outDir: ['lib', 'es'],
      exclude: ['**/tests/**'],
    }),
    vue(),
    vueJsx(),
  ],
  build: {
    lib: {
      entry: 'src/index.ts',
    },
    rollupOptions: {
      external: ['@floating-ui/vue', 'vue', 'lodash-es', '@chaosgods/utils'],
      output: [
        {
          preserveModules: true,
          preserveModulesRoot: 'src',
          entryFileNames: '[name].js',
          format: 'es',
          dir: 'es',
        },
        {
          preserveModules: true,
          preserveModulesRoot: 'src',
          entryFileNames: '[name].js',
          exports: 'named',
          format: 'cjs',
          dir: 'lib',
        },
      ],
    },
  },
})
