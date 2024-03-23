import { fileURLToPath } from 'node:url'
import path from 'node:path'
import { defineConfig } from 'vite'
import { vitepressDemo } from 'vite-plugin-vitepress-demo'
import vueJsx from '@vitejs/plugin-vue-jsx'
import vue from '@vitejs/plugin-vue'

const baseUrl = fileURLToPath(new URL('./', import.meta.url))
// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    vitepressDemo({
      glob: ['**/demos/*.vue'],
    }),
    vue(),
    vueJsx(),
  ],
  resolve: {
    alias: [
      {
        find: /^@chaosgods\/ui/,
        replacement: path.resolve(baseUrl, 'packages/ui/src'),
      },
      {
        find: /^@chaosgods\/utils/,
        replacement: path.resolve(baseUrl, 'packages/utils/src'),
      },
      {
        find: /^@chaosgods\/icons/,
        replacement: path.resolve(baseUrl, 'packages/icons/src'),
      },
    ],
  },
})
