import vueJsx from '@vitejs/plugin-vue-jsx'
import Components from 'unplugin-vue-components/vite'
import { defineConfig } from 'vite'
import { vitepressDemo } from 'vite-plugin-vitepress-demo'
import { uiResolver } from './scripts/ui-resolver'
import viteAlias from './scripts/vite-alias'

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
    alias: viteAlias,
  },
})
