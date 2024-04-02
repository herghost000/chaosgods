import path from 'node:path'
import { fileURLToPath } from 'node:url'
import vueJsx from '@vitejs/plugin-vue-jsx'
import Components from 'unplugin-vue-components/vite'
import { defineConfig } from 'vite'
import { vitepressDemo } from 'vite-plugin-vitepress-demo'
import { uiResolver } from './scripts/ui-resolver'

const baseUrl = fileURLToPath(new URL('./', import.meta.url))
// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    Components({
      dts: true,
      resolvers: [
        uiResolver(),
      ],
    }),
    vitepressDemo({
      glob: ['**/demos/*.vue'],
    }),
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
      {
        find: /^@chaosgods\/cli/,
        replacement: path.resolve(baseUrl, 'packages/cli/src'),
      },
    ],
  },
})
