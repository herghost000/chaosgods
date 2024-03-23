import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

export default defineConfig({
  plugins: [
    vue(),
  ],
  build: {
    rollupOptions: {
      external: ['vue'],
      output: {
        globals: {
          vue: 'vue',
        },
        exports: 'named',
        dir: 'umd',
      },
    },
    lib: {
      entry: 'src/index.ts',
      formats: ['umd'],
      fileName: () => 'chaosgods-icons.js',
      name: 'chaosgodsIcons',
    },
  },
})
